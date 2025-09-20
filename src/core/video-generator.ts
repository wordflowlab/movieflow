/**
 * 视频生成器核心类
 * 协调各个服务完成60秒视频的生成
 */

import { VideoSegmentManager, VideoSegment, TANG_MONK_SCENES } from '../services/segment-manager';
import { VolcanoEngineClient } from '../services/volcano-engine-client';
import { FFmpegService } from '../services/ffmpeg-service';
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

export interface GeneratorConfig {
  accessKey: string;
  secretKey: string;
  outputDir?: string;
  tempDir?: string;
  maxConcurrency?: number;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | '21:9';
  platform?: 'douyin' | 'wechat' | 'kuaishou';
}

export interface GenerateOptions {
  projectName: string;
  scenes?: Array<{ prompt: string; audio?: string }>;
  useTemplate?: 'tang-monk' | 'custom';
  addTransition?: boolean;
  addMusic?: string;  // 背景音乐路径
}

export class VideoGenerator {
  private segmentManager: VideoSegmentManager;
  private volcanoClient: VolcanoEngineClient;
  private ffmpegService: FFmpegService;
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = {
      ...config,
      outputDir: config.outputDir || './output',
      tempDir: config.tempDir || './temp',
      maxConcurrency: config.maxConcurrency || 3,
      aspectRatio: config.aspectRatio || '9:16',
      platform: config.platform || 'douyin'
    };

    this.segmentManager = new VideoSegmentManager({
      maxConcurrency: this.config.maxConcurrency,
      batchSize: 3
    });

    this.volcanoClient = new VolcanoEngineClient(
      config.accessKey,
      config.secretKey
    );

    this.ffmpegService = new FFmpegService();

    // 确保目录存在
    fs.ensureDirSync(this.config.outputDir!);
    fs.ensureDirSync(this.config.tempDir!);
  }

  /**
   * 生成60秒视频
   */
  async generateVideo(options: GenerateOptions): Promise<string> {
    console.log(chalk.cyan('\n🎬 开始生成60秒短视频\n'));

    // 1. 准备场景
    const scenes = this.prepareScenes(options);
    const segments = this.segmentManager.createSegments(scenes);

    console.log(chalk.green(`✓ 已创建 ${segments.length} 个视频片段\n`));

    // 2. 分批生成视频片段
    const videoUrls = await this.generateSegments(segments);

    // 3. 下载视频到本地
    const localPaths = await this.downloadVideos(videoUrls, options.projectName);

    // 4. 合并视频
    const outputPath = await this.mergeVideos(
      localPaths,
      options.projectName,
      options.addTransition
    );

    // 5. 添加背景音乐（如果提供）
    let finalPath = outputPath;
    if (options.addMusic) {
      finalPath = await this.addBackgroundMusic(
        outputPath,
        options.addMusic,
        options.projectName
      );
    }

    // 6. 清理临时文件
    await this.cleanup(localPaths);

    console.log(chalk.green(`\n✅ 视频生成完成: ${finalPath}\n`));

    return finalPath;
  }

  /**
   * 准备场景
   */
  private prepareScenes(options: GenerateOptions): Array<{ prompt: string; audio?: string }> {
    if (options.useTemplate === 'tang-monk') {
      return TANG_MONK_SCENES;
    } else if (options.scenes && options.scenes.length === 6) {
      return options.scenes;
    } else {
      throw new Error('必须提供6个场景或使用预设模板');
    }
  }

  /**
   * 分批生成视频片段
   */
  private async generateSegments(segments: VideoSegment[]): Promise<string[]> {
    const videoUrls: string[] = new Array(segments.length);
    let batch = 1;

    while (!this.segmentManager.isAllCompleted()) {
      const batchSegments = this.segmentManager.getNextBatch();
      if (batchSegments.length === 0) break;

      console.log(chalk.blue(`\n📦 处理第 ${batch} 批（共 ${batchSegments.length} 个片段）\n`));

      // 提交批次任务
      const taskIds = await this.submitBatchTasks(batchSegments);

      // 等待批次完成
      await this.waitForBatchCompletion(batchSegments, taskIds);

      // 获取视频URL
      for (const segment of batchSegments) {
        if (segment.videoUrl) {
          videoUrls[segment.index] = segment.videoUrl;
        }
      }

      batch++;
    }

    // 检查是否有失败的片段
    if (this.segmentManager.hasFailedSegments()) {
      const failed = this.segmentManager.getFailedSegments();
      console.warn(chalk.yellow(`\n⚠️  ${failed.length} 个片段生成失败，尝试重试...\n`));

      // 重试失败的片段
      this.segmentManager.resetFailedSegments();
      return this.generateSegments(segments);
    }

    return videoUrls;
  }

  /**
   * 提交批次任务
   */
  private async submitBatchTasks(segments: VideoSegment[]): Promise<string[]> {
    const taskIds: string[] = [];

    for (const segment of segments) {
      const spinner = ora(`提交片段 ${segment.index + 1}: ${segment.id}`).start();

      try {
        const response = await this.volcanoClient.submitTextToVideoTask({
          prompt: segment.prompt,
          frames: segment.frames,
          aspect_ratio: this.config.aspectRatio
        });

        if (response.data?.task_id) {
          taskIds.push(response.data.task_id);
          this.segmentManager.updateSegment(segment.id, {
            taskId: response.data.task_id,
            status: 'generating'
          });
          spinner.succeed(`片段 ${segment.index + 1} 任务已提交`);
        } else {
          throw new Error('未返回task_id');
        }
      } catch (error: any) {
        spinner.fail(`片段 ${segment.index + 1} 提交失败: ${error.message}`);
        this.segmentManager.updateSegment(segment.id, {
          status: 'failed',
          error: error.message
        });
      }

      // 避免触发限流
      await this.delay(1000);
    }

    return taskIds;
  }

  /**
   * 等待批次完成
   */
  private async waitForBatchCompletion(segments: VideoSegment[], taskIds: string[]): Promise<void> {
    console.log(chalk.blue('\n⏳ 等待视频生成...\n'));

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const taskId = taskIds[i];

      if (!taskId) continue;

      const spinner = ora(`等待片段 ${segment.index + 1} 完成`).start();

      try {
        const videoUrl = await this.volcanoClient.waitForTask(taskId);
        this.segmentManager.updateSegment(segment.id, {
          status: 'completed',
          videoUrl: videoUrl
        });
        spinner.succeed(`片段 ${segment.index + 1} 生成成功`);
      } catch (error: any) {
        spinner.fail(`片段 ${segment.index + 1} 生成失败: ${error.message}`);
        this.segmentManager.updateSegment(segment.id, {
          status: 'failed',
          error: error.message
        });
      }
    }

    // 显示进度
    const progress = this.segmentManager.getProgress();
    console.log(chalk.green(`\n📊 总进度: ${progress}%\n`));
  }

  /**
   * 下载视频到本地
   */
  private async downloadVideos(videoUrls: string[], projectName: string): Promise<string[]> {
    console.log(chalk.blue('\n📥 下载视频片段...\n'));

    const localPaths: string[] = [];

    for (let i = 0; i < videoUrls.length; i++) {
      const url = videoUrls[i];
      if (!url) continue;

      const localPath = path.join(
        this.config.tempDir!,
        `${projectName}_segment_${i + 1}.mp4`
      );

      const spinner = ora(`下载片段 ${i + 1}`).start();

      try {
        await this.ffmpegService.downloadVideo(url, localPath);
        localPaths.push(localPath);
        spinner.succeed(`片段 ${i + 1} 下载完成`);
      } catch (error: any) {
        spinner.fail(`片段 ${i + 1} 下载失败: ${error.message}`);
        throw error;
      }
    }

    return localPaths;
  }

  /**
   * 合并视频
   */
  private async mergeVideos(
    videoPaths: string[],
    projectName: string,
    addTransition?: boolean
  ): Promise<string> {
    console.log(chalk.blue('\n🎬 合并视频片段...\n'));

    const outputPath = path.join(
      this.config.outputDir!,
      `${projectName}_${Date.now()}.mp4`
    );

    const spinner = ora('正在合并视频...').start();

    try {
      // 根据平台调整分辨率
      const resolution = this.getPlatformResolution();

      if (addTransition) {
        await this.ffmpegService.addTransitions(videoPaths, {
          outputPath,
          resolution,
          transition: 'fade',
          transitionDuration: 0.5
        });
      } else {
        await this.ffmpegService.mergeVideos(videoPaths, {
          outputPath,
          resolution
        });
      }

      spinner.succeed('视频合并完成');
      return outputPath;
    } catch (error: any) {
      spinner.fail(`视频合并失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 添加背景音乐
   */
  private async addBackgroundMusic(
    videoPath: string,
    audioPath: string,
    projectName: string
  ): Promise<string> {
    console.log(chalk.blue('\n🎵 添加背景音乐...\n'));

    const outputPath = path.join(
      this.config.outputDir!,
      `${projectName}_with_music_${Date.now()}.mp4`
    );

    const spinner = ora('正在添加背景音乐...').start();

    try {
      await this.ffmpegService.addBackgroundMusic(videoPath, audioPath, outputPath);
      spinner.succeed('背景音乐添加完成');
      return outputPath;
    } catch (error: any) {
      spinner.fail(`添加背景音乐失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取平台对应的分辨率
   */
  private getPlatformResolution(): string {
    const resolutionMap: Record<string, string> = {
      'douyin': '1088x1920',   // 抖音竖屏
      'wechat': '1080x1080',   // 微信视频号正方形
      'kuaishou': '1088x1920'  // 快手竖屏
    };

    return resolutionMap[this.config.platform!] || '1088x1920';
  }

  /**
   * 清理临时文件
   */
  private async cleanup(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        await fs.remove(filePath);
      } catch (error) {
        console.warn(`清理文件失败: ${filePath}`);
      }
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}