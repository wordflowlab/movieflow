/**
 * 视频生成器核心类
 * 协调各个服务完成60秒视频的生成
 */

import { VideoSegmentManager, VideoSegment, TANG_MONK_SCENES } from '../services/segment-manager';
import { VolcanoEngineClient } from '../services/volcano-engine-client';
import { FFmpegService, AudioMergeOptions } from '../services/ffmpeg-service';
import { AudioService, AudioSegment, TTSOptions } from '../services/audio-service';
import { SubtitleService, SubtitleSegment, SubtitleOptions } from '../services/subtitle-service';
import { PlatformDetector } from '../utils/platform-detector';
import { TaskStateManager } from './task-state-manager';
import { AIAssistantAdapter } from '../adapters/base-adapter';
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
  apiVersion?: 'v30' | 'v30_1080p' | 'v30_pro';  // API版本，默认v30_pro
  enableProgressTracking?: boolean;  // 启用进度跟踪
  resumeSession?: string;  // 恢复会话 ID
}

export interface SceneDefinition {
  prompt: string;           // 视觉提示词
  dialogue?: {              // 对话内容
    question?: string;      // 问题部分
    answer?: string;        // 回答部分
    text?: string;          // 单一文本
  };
  emotion?: string;         // 情绪类型
  ttsOptions?: TTSOptions;  // TTS配置
}

export interface GenerateOptions {
  projectName: string;
  scenes?: SceneDefinition[];
  useTemplate?: 'tang-monk' | 'custom';
  addTransition?: boolean;
  addMusic?: string;         // 背景音乐路径
  enableAudio?: boolean;      // 是否生成音频
  enableSubtitle?: boolean;   // 是否生成字幕
  subtitleFormat?: 'srt' | 'ass';  // 字幕格式
  ttsEngine?: 'edge-tts' | 'macos-say' | 'auto';  // TTS引擎
  ttsVoice?: string;          // TTS语音
  resumeFromSession?: string;  // 从会话恢复
}

export class VideoGenerator {
  private segmentManager: VideoSegmentManager;
  private volcanoClient: VolcanoEngineClient;
  private ffmpegService: FFmpegService;
  private audioService: AudioService;
  private subtitleService: SubtitleService;
  private config: GeneratorConfig;
  private aiAdapter: AIAssistantAdapter;
  private taskStateManager: TaskStateManager;
  private platformDetector: PlatformDetector;

  constructor(config: GeneratorConfig) {
    this.config = {
      ...config,
      outputDir: config.outputDir || './output',
      tempDir: config.tempDir || './temp',
      maxConcurrency: config.maxConcurrency || 3,
      aspectRatio: config.aspectRatio || '9:16',
      platform: config.platform || 'douyin',
      apiVersion: config.apiVersion || 'v30_pro'  // 默认使用Pro版本
    };

    this.segmentManager = new VideoSegmentManager({
      maxConcurrency: this.config.maxConcurrency,
      batchSize: this.config.maxConcurrency || 1  // 批次大小与并发数一致
    });

    this.volcanoClient = new VolcanoEngineClient(
      config.accessKey,
      config.secretKey
    );

    this.ffmpegService = new FFmpegService();
    this.audioService = new AudioService();
    this.subtitleService = new SubtitleService();

    // 初始化平台检测和适配器
    this.platformDetector = PlatformDetector.getInstance();
    this.aiAdapter = this.platformDetector.getAdapter();

    // 初始化任务状态管理器
    this.taskStateManager = new TaskStateManager(
      path.join(this.config.tempDir!, '.state')
    );

    // 确保目录存在
    fs.ensureDirSync(this.config.outputDir!);
    fs.ensureDirSync(this.config.tempDir!);
  }

  /**
   * 生成60秒视频
   */
  async generateVideo(options: GenerateOptions): Promise<string> {
    // 显示平台信息
    this.platformDetector.showPlatformInfo();
    this.aiAdapter.outputMessage('开始生成60秒短视频（含音频和字幕）', 'info');

    // 检查是否需要恢复会话
    let segments: VideoSegment[];
    let scenes: SceneDefinition[];

    if (options.resumeFromSession) {
      const session = await this.taskStateManager.resumeSession(options.resumeFromSession);
      if (session) {
        this.aiAdapter.outputMessage(`恢复会话: ${session.projectName}`, 'success');
        // 从会话恢复片段
        segments = this.segmentManager.createSegments(
          session.segments.map(s => ({ prompt: s.prompt }))
        );
        // 更新状态
        session.segments.forEach((s, i) => {
          if (segments[i]) {
            segments[i].taskId = s.taskId;
            segments[i].status = s.status as any;
            segments[i].videoUrl = s.videoUrl;
            segments[i].retryCount = s.retryCount;
          }
        });
        scenes = this.prepareScenes(options);
      } else {
        this.aiAdapter.outputMessage('未找到会话，创建新任务', 'warning');
        scenes = this.prepareScenes(options);
        segments = this.segmentManager.createSegments(
          scenes.map(s => ({ prompt: s.prompt }))
        );
        await this.taskStateManager.createSession(
          options.projectName,
          segments.map(s => ({ prompt: s.prompt })),
          {
            apiVersion: this.config.apiVersion,
            aspectRatio: this.config.aspectRatio,
            outputPath: path.join(this.config.outputDir!, `${options.projectName}.mp4`)
          }
        );
      }
    } else {
      // 1. 准备场景
      scenes = this.prepareScenes(options);
      segments = this.segmentManager.createSegments(
        scenes.map(s => ({ prompt: s.prompt }))
      );

      // 创建新会话
      await this.taskStateManager.createSession(
        options.projectName,
        segments.map(s => ({ prompt: s.prompt })),
        {
          apiVersion: this.config.apiVersion,
          aspectRatio: this.config.aspectRatio,
          outputPath: path.join(this.config.outputDir!, `${options.projectName}.mp4`)
        }
      );
    }

    console.log(chalk.green(`✓ 已创建 ${segments.length} 个视频片段\n`));

    // 2. 并行处理三个流程
    const [videoUrls, audioPath, subtitlePath] = await Promise.all([
      // 分批生成视频片段
      this.generateSegments(segments),
      // 生成音频（如果启用）
      options.enableAudio !== false ?
        this.generateAudioTrack(scenes, options) :
        Promise.resolve(undefined),
      // 生成字幕（如果启用）
      options.enableSubtitle !== false ?
        this.generateSubtitle(scenes, options) :
        Promise.resolve(undefined)
    ]);

    // 3. 下载视频到本地
    const localPaths = await this.downloadVideos(videoUrls, options.projectName);

    // 4. 合并视频片段
    const mergedVideoPath = await this.mergeVideos(
      localPaths,
      options.projectName,
      options.addTransition
    );

    // 5. 合成最终视频（添加音频和字幕）
    const finalPath = await this.synthesizeFinalVideo(
      mergedVideoPath,
      audioPath,
      subtitlePath,
      options
    );

    // 6. 清理临时文件
    await this.cleanup([...localPaths, mergedVideoPath]);
    if (audioPath) await this.audioService.cleanup();
    if (subtitlePath) await this.subtitleService.cleanup();

    console.log(chalk.green(`\n✅ 完整视频生成成功: ${finalPath}\n`));

    return finalPath;
  }

  /**
   * 准备场景
   */
  private prepareScenes(options: GenerateOptions): SceneDefinition[] {
    if (options.useTemplate === 'tang-monk') {
      // 使用唐僧模板，包含对话内容
      return TANG_MONK_SCENES.map((scene, index) => ({
        ...scene,
        dialogue: this.getTangMonkDialogue(index)
      }));
    } else if (options.scenes && options.scenes.length === 6) {
      return options.scenes;
    } else {
      throw new Error('必须提供6个场景或使用预设模板');
    }
  }

  /**
   * 获取唐僧找工作的对话内容
   */
  private getTangMonkDialogue(index: number): any {
    const dialogues = [
      { text: '我是唐僧，刚从西天取经回来，正在找工作' },
      { question: '您有什么工作经验？', answer: '我带过团队，去西天取过经' },
      { question: '遇到困难怎么办？', answer: '念经，找徒弟帮忙' },
      { text: '我的徒弟们都很优秀，悟空会七十二变' },
      { text: '八戒虽然贪吃，但是很忠诚' },
      { text: '请给我一个机会，阿弥陀佛' }
    ];
    return dialogues[index];
  }

  /**
   * 分批生成视频片段
   */
  private async generateSegments(segments: VideoSegment[]): Promise<string[]> {
    const videoUrls: string[] = new Array(segments.length);
    let batch = 1;

    // 开始任务追踪
    this.aiAdapter.outputProgress({
      type: 'task_start',
      taskName: '视频片段生成',
      detail: `共 ${segments.length} 个片段，分批处理`,
      total: segments.length
    });

    while (!this.segmentManager.isAllCompleted()) {
      const batchSegments = this.segmentManager.getNextBatch();
      if (batchSegments.length === 0) break;

      this.aiAdapter.outputMessage(`处理第 ${batch} 批（共 ${batchSegments.length} 个片段）`, 'info');

      // 提交批次任务
      const taskIds = await this.submitBatchTasks(batchSegments);

      // 等待批次完成
      await this.waitForBatchCompletion(batchSegments, taskIds);

      // 获取视频URL并更新状态管理器
      for (const segment of batchSegments) {
        if (segment.videoUrl) {
          videoUrls[segment.index] = segment.videoUrl;
          await this.taskStateManager.updateSegmentStatus(
            segment.index,
            'completed',
            { videoUrl: segment.videoUrl }
          );
        }
      }

      // 更新总体进度
      const completedCount = videoUrls.filter(url => url).length;
      this.aiAdapter.outputProgress({
        type: 'task_progress',
        taskName: '视频片段生成',
        progress: Math.round((completedCount / segments.length) * 100),
        current: completedCount,
        total: segments.length,
        message: `已完成 ${completedCount}/${segments.length} 个片段`
      });

      batch++;
    }

    // 检查是否有失败的片段
    if (this.segmentManager.hasFailedSegments()) {
      const failed = this.segmentManager.getFailedSegments();
      this.aiAdapter.outputMessage(`${failed.length} 个片段生成失败，尝试重试...`, 'warning');

      // 重试失败的片段
      this.segmentManager.resetFailedSegments();
      return this.generateSegments(segments);
    }

    // 任务完成
    this.aiAdapter.outputProgress({
      type: 'task_complete',
      taskName: '视频片段生成',
      message: `所有 ${segments.length} 个片段生成成功`
    });

    // 生成任务报告
    const report = this.taskStateManager.generateReport();
    this.aiAdapter.outputStructured({ report });

    return videoUrls;
  }

  /**
   * 提交批次任务
   */
  private async submitBatchTasks(segments: VideoSegment[]): Promise<string[]> {
    const taskIds: string[] = [];

    for (const segment of segments) {
      // 使用适配器输出进度
      this.aiAdapter.outputProgress({
        type: 'task_progress',
        taskName: `提交片段 ${segment.index + 1}`,
        message: segment.prompt.substring(0, 50) + '...'
      });

      try {
        const response = await this.volcanoClient.submitTextToVideoTask({
          prompt: segment.prompt,
          frames: segment.frames,
          aspect_ratio: this.config.aspectRatio,
          version: this.config.apiVersion
        });

        if (response.data?.task_id) {
          taskIds.push(response.data.task_id);
          this.segmentManager.updateSegment(segment.id, {
            taskId: response.data.task_id,
            status: 'generating'
          });

          // 更新任务状态管理器
          await this.taskStateManager.updateSegmentStatus(
            segment.index,
            'submitted',
            { taskId: response.data.task_id }
          );

          this.aiAdapter.outputMessage(`片段 ${segment.index + 1} 任务已提交`, 'success');
        } else {
          throw new Error('未返回task_id');
        }
      } catch (error: any) {
        this.aiAdapter.outputMessage(`片段 ${segment.index + 1} 提交失败: ${error.message}`, 'error');
        this.segmentManager.updateSegment(segment.id, {
          status: 'failed',
          error: error.message
        });

        await this.taskStateManager.updateSegmentStatus(
          segment.index,
          'failed',
          { error: error.message }
        );
      }

      // 避免触发限流（QPS限制为1，每秒最多1个请求）
      await this.delay(2000);  // 2秒延迟确保不超过QPS限制
    }

    return taskIds;
  }

  /**
   * 等待批次完成
   */
  private async waitForBatchCompletion(segments: VideoSegment[], taskIds: string[]): Promise<void> {
    this.aiAdapter.outputMessage('等待视频生成...', 'info');

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const taskId = taskIds[i];

      if (!taskId) continue;

      // 开始心跳机制，防止超时
      this.aiAdapter.startHeartbeat(`等待片段 ${segment.index + 1}`);

      try {
        // 轮询任务状态
        const startTime = Date.now();
        const maxWaitTime = 300000;  // 5分钟
        const pollInterval = 5000;   // 5秒
        let videoUrl: string | null = null;

        while (Date.now() - startTime < maxWaitTime) {
          const result = await this.volcanoClient.getTaskResult(taskId, this.config.apiVersion);

          if (result.code !== 10000) {
            throw new Error(`API错误: ${result.message}`);
          }

          const status = result.data?.status;
          const elapsedTime = Math.round((Date.now() - startTime) / 1000);
          const eta = Math.max(0, 180 - elapsedTime);  // 预计3分钟

          // 更新进度
          this.aiAdapter.outputProgress({
            type: 'task_progress',
            taskId: taskId,
            taskName: `片段 ${segment.index + 1}`,
            message: `状态: ${status}`,
            eta: eta
          });

          if (status === 'done') {
            videoUrl = result.data?.video_url || null;
            break;
          } else if (status === 'not_found' || status === 'expired') {
            throw new Error(`任务${status === 'not_found' ? '未找到' : '已过期'}`);
          }

          await this.delay(pollInterval);
        }

        if (!videoUrl) {
          throw new Error('任务超时');
        }

        this.segmentManager.updateSegment(segment.id, {
          status: 'completed',
          videoUrl: videoUrl
        });

        await this.taskStateManager.updateSegmentStatus(
          segment.index,
          'completed',
          { videoUrl: videoUrl }
        );

        this.aiAdapter.outputMessage(`片段 ${segment.index + 1} 生成成功`, 'success');
      } catch (error: any) {
        this.aiAdapter.outputMessage(`片段 ${segment.index + 1} 生成失败: ${error.message}`, 'error');
        this.segmentManager.updateSegment(segment.id, {
          status: 'failed',
          error: error.message
        });

        await this.taskStateManager.updateSegmentStatus(
          segment.index,
          'failed',
          { error: error.message }
        );
      } finally {
        // 停止心跳
        this.aiAdapter.stopHeartbeat();
      }
    }

    // 显示进度
    const progress = this.segmentManager.getProgress();
    this.aiAdapter.outputProgress({
      type: 'task_progress',
      taskName: '批次完成',
      progress: progress,
      message: `总进度: ${progress}%`
    });
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
   * 生成音频轨道
   */
  private async generateAudioTrack(
    scenes: SceneDefinition[],
    options: GenerateOptions
  ): Promise<string | undefined> {
    console.log(chalk.blue('\n🎤 生成音频轨道...\n'));

    const audioSegments: AudioSegment[] = [];
    let currentTime = 0;

    for (const scene of scenes) {
      if (scene.dialogue) {
        const text = scene.dialogue.text ||
                    `${scene.dialogue.question || ''} ${scene.dialogue.answer || ''}`;

        if (text.trim()) {
          audioSegments.push({
            text: text.trim(),
            start: currentTime,
            end: currentTime + 10,  // 每个场景10秒
            options: {
              ...scene.ttsOptions,
              engine: options.ttsEngine,
              voice: options.ttsVoice,
              emotion: scene.emotion
            }
          });
        }
      }
      currentTime += 10;
    }

    if (audioSegments.length === 0) {
      console.log(chalk.yellow('没有对话内容，跳过音频生成'));
      return undefined;
    }

    try {
      const audioPath = await this.audioService.generateFromSegments(audioSegments);

      // 如果有背景音乐，添加背景音乐
      if (options.addMusic) {
        const finalAudioPath = await this.audioService.addBackgroundMusic(
          audioPath,
          options.addMusic,
          { musicVolume: 0.3 }
        );
        return finalAudioPath;
      }

      return audioPath;
    } catch (error: any) {
      console.error(chalk.red(`音频生成失败: ${error.message}`));
      return undefined;
    }
  }

  /**
   * 生成字幕
   */
  private async generateSubtitle(
    scenes: SceneDefinition[],
    options: GenerateOptions
  ): Promise<string | undefined> {
    console.log(chalk.blue('\n📝 生成字幕文件...\n'));

    // 转换场景为字幕格式
    const sceneData = scenes.map((scene, index) => ({
      index,
      duration: 10,  // 每个场景10秒
      dialogue: scene.dialogue
    }));

    const segments = this.subtitleService.generateFromScenes(sceneData);

    if (segments.length === 0) {
      console.log(chalk.yellow('没有字幕内容'));
      return undefined;
    }

    try {
      const subtitleOptions: SubtitleOptions = {
        format: options.subtitleFormat || 'ass',
        title: options.projectName,
        playResX: 1088,
        playResY: 1920
      };

      const subtitlePath = await this.subtitleService.generateSubtitles(
        segments,
        subtitleOptions
      );

      console.log(chalk.green(`✓ 字幕生成完成: ${path.basename(subtitlePath)}`));
      return subtitlePath;
    } catch (error: any) {
      console.error(chalk.red(`字幕生成失败: ${error.message}`));
      return undefined;
    }
  }

  /**
   * 合成最终视频
   */
  private async synthesizeFinalVideo(
    videoPath: string,
    audioPath: string | undefined,
    subtitlePath: string | undefined,
    options: GenerateOptions
  ): Promise<string> {
    console.log(chalk.blue('\n🎬 合成最终视频...\n'));

    const outputPath = path.join(
      this.config.outputDir!,
      `${options.projectName}_complete_${Date.now()}.mp4`
    );

    const mergeOptions: AudioMergeOptions = {
      videoPath,
      audioPath,
      subtitlePath,
      outputPath,
      subtitleStyle: 'burn'  // 默认硬字幕
    };

    const spinner = ora('正在合成视频、音频和字幕...').start();

    try {
      await this.ffmpegService.mergeVideoAudioSubtitle(mergeOptions);
      spinner.succeed('视频合成完成');
      return outputPath;
    } catch (error: any) {
      spinner.fail(`视频合成失败: ${error.message}`);
      // 如果合成失败，至少返回原视频
      console.warn(chalk.yellow('返回无音频/字幕的视频'));
      return videoPath;
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}