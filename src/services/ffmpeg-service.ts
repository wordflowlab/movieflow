/**
 * FFmpeg视频合成服务
 * 负责将多个视频片段合并成完整视频
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export interface MergeOptions {
  outputPath: string;          // 输出文件路径
  resolution?: string;         // 输出分辨率（如 "1088x1920"）
  fps?: number;                // 帧率
  codec?: string;              // 视频编码
  audioCodec?: string;         // 音频编码
  transition?: 'fade' | 'dissolve' | 'none';  // 转场效果
  transitionDuration?: number; // 转场时长（秒）
}

export class FFmpegService {
  private tempDir: string;

  constructor() {
    // 创建临时目录用于存储中间文件
    this.tempDir = path.join(os.tmpdir(), 'movieflow-temp');
    fs.ensureDirSync(this.tempDir);
  }

  /**
   * 检查FFmpeg是否已安装
   */
  async checkFFmpeg(): Promise<boolean> {
    try {
      await execAsync('ffmpeg -version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 下载视频到本地
   */
  async downloadVideo(url: string, outputPath: string): Promise<void> {
    // 使用axios或其他库下载视频
    const axios = (await import('axios')).default;
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(outputPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  /**
   * 合并视频片段
   */
  async mergeVideos(
    videoPaths: string[],
    options: MergeOptions
  ): Promise<string> {
    if (videoPaths.length === 0) {
      throw new Error('没有提供要合并的视频');
    }

    // 检查FFmpeg
    const ffmpegInstalled = await this.checkFFmpeg();
    if (!ffmpegInstalled) {
      throw new Error('FFmpeg未安装，请先安装FFmpeg');
    }

    // 创建文件列表
    const listPath = path.join(this.tempDir, `merge_list_${Date.now()}.txt`);
    const fileList = videoPaths.map(p => `file '${p}'`).join('\n');
    await fs.writeFile(listPath, fileList);

    try {
      // 构建FFmpeg命令
      const command = this.buildMergeCommand(listPath, options);

      console.log('执行FFmpeg命令:', command);
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stderr.includes('frame=')) {
        console.warn('FFmpeg警告:', stderr);
      }

      // 清理临时文件
      await fs.remove(listPath);

      return options.outputPath;
    } catch (error) {
      console.error('视频合并失败:', error);
      throw error;
    }
  }

  /**
   * 构建FFmpeg合并命令
   */
  private buildMergeCommand(listPath: string, options: MergeOptions): string {
    const parts = [
      'ffmpeg',
      '-f concat',
      '-safe 0',
      `-i "${listPath}"`,
      '-c:v libx264',  // H.264编码
      '-preset fast',  // 快速编码
      '-crf 23',       // 质量控制
    ];

    // 添加分辨率设置
    if (options.resolution) {
      parts.push(`-s ${options.resolution}`);
    }

    // 添加帧率设置
    if (options.fps) {
      parts.push(`-r ${options.fps}`);
    }

    // 添加音频编码
    parts.push('-c:a aac');
    parts.push('-b:a 128k');

    // 像素格式
    parts.push('-pix_fmt yuv420p');

    // 覆盖输出文件
    parts.push('-y');

    // 输出路径
    parts.push(`"${options.outputPath}"`);

    return parts.join(' ');
  }

  /**
   * 添加转场效果（高级功能）
   */
  async addTransitions(
    videoPaths: string[],
    options: MergeOptions & { transition: 'fade' | 'dissolve' }
  ): Promise<string> {
    if (options.transition === 'fade') {
      return this.addFadeTransitions(videoPaths, options);
    } else if (options.transition === 'dissolve') {
      return this.addDissolveTransitions(videoPaths, options);
    } else {
      return this.mergeVideos(videoPaths, options);
    }
  }

  /**
   * 添加淡入淡出转场
   */
  private async addFadeTransitions(
    videoPaths: string[],
    options: MergeOptions
  ): Promise<string> {
    const duration = options.transitionDuration || 0.5;
    const tempFiles: string[] = [];

    // 为每个视频添加淡入淡出效果
    for (let i = 0; i < videoPaths.length; i++) {
      const inputPath = videoPaths[i];
      const tempPath = path.join(this.tempDir, `fade_${i}_${Date.now()}.mp4`);

      let fadeFilter = '';
      if (i === 0) {
        // 第一个视频：淡入
        fadeFilter = `fade=t=in:st=0:d=${duration}`;
      } else if (i === videoPaths.length - 1) {
        // 最后一个视频：淡出
        fadeFilter = `fade=t=out:st=9.5:d=${duration}`;
      } else {
        // 中间视频：淡入淡出
        fadeFilter = `fade=t=in:st=0:d=${duration},fade=t=out:st=9.5:d=${duration}`;
      }

      const command = `ffmpeg -i "${inputPath}" -vf "${fadeFilter}" -c:a copy "${tempPath}" -y`;
      await execAsync(command);
      tempFiles.push(tempPath);
    }

    // 合并处理后的视频
    const result = await this.mergeVideos(tempFiles, options);

    // 清理临时文件
    for (const file of tempFiles) {
      await fs.remove(file);
    }

    return result;
  }

  /**
   * 添加溶解转场（简化版）
   */
  private async addDissolveTransitions(
    videoPaths: string[],
    options: MergeOptions
  ): Promise<string> {
    // 这需要更复杂的FFmpeg滤镜图
    // 暂时使用淡入淡出代替
    return this.addFadeTransitions(videoPaths, options);
  }

  /**
   * 调整视频尺寸
   */
  async resizeVideo(
    inputPath: string,
    outputPath: string,
    resolution: string
  ): Promise<string> {
    const command = [
      'ffmpeg',
      `-i "${inputPath}"`,
      `-s ${resolution}`,
      '-c:v libx264',
      '-preset fast',
      '-c:a copy',
      '-y',
      `"${outputPath}"`
    ].join(' ');

    await execAsync(command);
    return outputPath;
  }

  /**
   * 添加背景音乐
   */
  async addBackgroundMusic(
    videoPath: string,
    audioPath: string,
    outputPath: string
  ): Promise<string> {
    const command = [
      'ffmpeg',
      `-i "${videoPath}"`,
      `-i "${audioPath}"`,
      '-c:v copy',
      '-c:a aac',
      '-shortest',  // 以较短的为准
      '-y',
      `"${outputPath}"`
    ].join(' ');

    await execAsync(command);
    return outputPath;
  }

  /**
   * 清理临时文件
   */
  async cleanup(): Promise<void> {
    await fs.remove(this.tempDir);
  }
}