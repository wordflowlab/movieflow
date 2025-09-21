/**
 * 音频服务
 * 负责视频音频的生成，包括 TTS 语音合成和背景音乐处理
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { VolcanoTTSService } from './volcano-tts-service';
import { AliyunTTSService } from './aliyun-tts-service';

const execAsync = promisify(exec);

export interface TTSOptions {
  voice?: string;      // 语音选择
  speed?: number;      // 语速 (0.5-2.0)
  pitch?: number;      // 音调 (-50 to +50)
  volume?: number;     // 音量 (0-100)
  emotion?: string;    // 情绪（用于选择合适的语音风格）
  engine?: 'edge-tts' | 'macos-say' | 'volcano' | 'aliyun' | 'auto';  // TTS 引擎
}

export interface AudioSegment {
  text: string;
  start: number;    // 开始时间（秒）
  end: number;      // 结束时间（秒）
  options?: TTSOptions;
}

export interface TTSEngine {
  name: string;
  available: boolean;
  voices?: string[];
}

export class AudioService {
  private tempDir: string;
  private availableEngines: Map<string, TTSEngine> = new Map();
  private volcanoTTS?: VolcanoTTSService;
  private aliyunTTS?: AliyunTTSService;

  constructor() {
    // 创建临时目录用于存储音频文件
    this.tempDir = path.join(os.tmpdir(), 'movieflow-audio');
    fs.ensureDirSync(this.tempDir);

    // 初始化时检测可用的 TTS 引擎
    this.detectAvailableEngines();
  }

  /**
   * 检测可用的 TTS 引擎
   */
  async detectAvailableEngines(): Promise<Map<string, TTSEngine>> {
    // 检测 edge-tts
    try {
      await execAsync('which edge-tts');
      this.availableEngines.set('edge-tts', {
        name: 'Microsoft Edge TTS',
        available: true,
        voices: [
          'zh-CN-XiaoxiaoNeural',  // 女声-晓晓
          'zh-CN-YunxiNeural',     // 男声-云希
          'zh-CN-XiaoyiNeural',    // 女声-晓伊
          'zh-CN-YunjianNeural'    // 男声-云健
        ]
      });
    } catch {
      this.availableEngines.set('edge-tts', {
        name: 'Microsoft Edge TTS',
        available: false
      });
    }

    // 检测 macOS say 命令
    try {
      await execAsync('which say');
      const { stdout } = await execAsync('say -v ?');
      const chineseVoices = stdout.split('\n')
        .filter(line => line.includes('zh'))
        .map(line => line.split(/\s+/)[0]);

      this.availableEngines.set('macos-say', {
        name: 'macOS Text to Speech',
        available: true,
        voices: chineseVoices
      });
    } catch {
      this.availableEngines.set('macos-say', {
        name: 'macOS Text to Speech',
        available: false
      });
    }

    // 检测阿里云 TTS
    const aliyunAppKey = process.env.ALIYUN_TTS_APP_KEY;
    const aliyunToken = process.env.ALIYUN_TTS_TOKEN;
    if (aliyunAppKey && aliyunToken) {
      this.availableEngines.set('aliyun', {
        name: 'Aliyun TTS (阿里云语音合成)',
        available: true,
        voices: [
          'xiaoyun', // 标准女声
          'xiaogang', // 标准男声
          'aiyue', // 温柔女声
          'aixia', // 活泼女声
        ]
      });

      // 初始化阿里云 TTS 服务
      this.aliyunTTS = new AliyunTTSService({
        appKey: aliyunAppKey,
        token: aliyunToken
      });
    } else {
      this.availableEngines.set('aliyun', {
        name: 'Aliyun TTS (阿里云语音合成)',
        available: false
      });
    }

    // 检测火山引擎 TTS
    const volcanoAppId = process.env.VOLCANO_TTS_APP_ID;
    const volcanoToken = process.env.VOLCANO_TTS_TOKEN;
    if (volcanoAppId && volcanoToken) {
      this.availableEngines.set('volcano', {
        name: 'Volcano Engine TTS (豆包语音)',
        available: true,
        voices: [
          'zh_female_cancan_mars_bigtts', // 大模型女声
          'zh_male_M392_conversation_wvae_bigtts', // 大模型男声
          'BV700_streaming', // 通用女声
          'BV001_streaming', // 通用男声
        ]
      });

      // 初始化火山引擎 TTS 服务
      this.volcanoTTS = new VolcanoTTSService({
        appId: volcanoAppId,
        accessToken: volcanoToken,
        secretKey: process.env.VOLCANO_TTS_SECRET
      });
    } else {
      this.availableEngines.set('volcano', {
        name: 'Volcano Engine TTS (豆包语音)',
        available: false
      });
    }

    return this.availableEngines;
  }

  /**
   * 生成单个语音片段
   */
  async generateSpeech(
    text: string,
    options: TTSOptions = {}
  ): Promise<string> {
    const engine = await this.selectEngine(options.engine);
    const outputPath = path.join(
      this.tempDir,
      `speech_${Date.now()}.mp3`
    );

    // 尝试使用选定的引擎，失败时自动降级
    let enginesAttempted = new Set<string>();
    let currentEngine = engine;

    while (currentEngine !== 'silent') {
      try {
        if (currentEngine === 'aliyun' && this.aliyunTTS) {
          // 使用阿里云TTS
          console.log(`☁️ 尝试使用阿里云TTS...`);
          const audioPath = await this.aliyunTTS.synthesize({
            text,
            voice: options.voice || 'xiaoyun',  // 默认使用小云女声
            speed: options.speed ? (options.speed - 1) * 500 : 0,  // 转换为阿里云的范围 -500~500
            volume: options.volume || 50,
            pitch: options.pitch || 0,
            format: 'mp3'
          });
          // 将生成的文件移动到目标位置
          await fs.move(audioPath, outputPath, { overwrite: true });
          console.log(`✅ 阿里云TTS成功`);
          return outputPath;
        } else if (currentEngine === 'volcano' && this.volcanoTTS) {
          // 使用火山引擎TTS
          console.log(`🌋 尝试使用火山引擎TTS...`);
          const audioPath = await this.volcanoTTS.synthesize({
            text,
            voice: options.voice || 'zh_female_cancan_mars_bigtts',  // 默认使用大模型女声
            speed: options.speed,
            volume: options.volume ? options.volume / 100 : undefined,
            pitch: options.pitch,
            emotion: options.emotion,
            format: 'mp3'
          });
          // 将生成的文件移动到目标位置
          await fs.move(audioPath, outputPath, { overwrite: true });
          console.log(`✅ 火山引擎TTS成功`);
          return outputPath;
        } else if (currentEngine === 'edge-tts') {
          console.log(`🌐 尝试使用Edge-TTS...`);
          await this.generateWithEdgeTTS(text, outputPath, options);
          console.log(`✅ Edge-TTS成功`);
          return outputPath;
        } else if (currentEngine === 'macos-say') {
          console.log(`🍎 尝试使用macOS Say...`);
          await this.generateWithMacOSSay(text, outputPath, options);
          console.log(`✅ macOS Say成功`);
          return outputPath;
        }
      } catch (error: any) {
        console.error(`⚠️  ${currentEngine} 失败: ${error.message}`);
        enginesAttempted.add(currentEngine);

        // 获取下一个可用引擎
        currentEngine = await this.getNextAvailableEngine(enginesAttempted);
        if (currentEngine !== 'silent') {
          console.log(`🔄 降级到: ${currentEngine}`);
        }
      }
    }

    // 如果所有引擎都失败，生成静音音频
    console.warn(`🔇 所有TTS引擎都失败，生成静音音频`);
    await this.generateSilentAudio(outputPath, 10);
    return outputPath;
  }

  /**
   * 使用 edge-tts 生成语音
   */
  private async generateWithEdgeTTS(
    text: string,
    outputPath: string,
    options: TTSOptions
  ): Promise<void> {
    const voice = options.voice || 'zh-CN-YunxiNeural';
    const rate = options.speed ? `${Math.round((options.speed - 1) * 100)}%` : '+0%';
    const pitch = options.pitch ? `${options.pitch}Hz` : '+0Hz';
    const volume = options.volume ? `${options.volume}` : '100';

    const command = `edge-tts --voice "${voice}" --rate "${rate}" --pitch "${pitch}" --volume "${volume}" --text "${text}" --write-media "${outputPath}"`;

    await execAsync(command);
  }

  /**
   * 使用 macOS say 命令生成语音
   */
  private async generateWithMacOSSay(
    text: string,
    outputPath: string,
    options: TTSOptions
  ): Promise<void> {
    const voice = options.voice || 'Tingting';
    const rate = options.speed ? Math.round(options.speed * 200) : 200;

    // macOS say 先生成 AIFF，然后转换为 MP3
    const tempAiff = outputPath.replace('.mp3', '.aiff');
    const sayCommand = `say -v "${voice}" -r ${rate} "${text}" -o "${tempAiff}"`;
    const convertCommand = `ffmpeg -i "${tempAiff}" -acodec mp3 -ab 192k "${outputPath}" -y && rm "${tempAiff}"`;

    await execAsync(sayCommand);
    await execAsync(convertCommand);
  }

  /**
   * 生成静音音频（作为后备方案）
   */
  private async generateSilentAudio(
    outputPath: string,
    duration: number
  ): Promise<void> {
    const command = `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${duration} -acodec mp3 "${outputPath}" -y`;
    await execAsync(command);
  }

  /**
   * 选择合适的 TTS 引擎
   */
  private async selectEngine(
    preferredEngine?: string
  ): Promise<string> {
    if (preferredEngine && preferredEngine !== 'auto') {
      const engine = this.availableEngines.get(preferredEngine);
      if (engine?.available) {
        return preferredEngine;
      }
    }

    // 自动选择：优先阿里云TTS，其次火山引擎TTS，然后 edge-tts，最后 macOS say
    if (this.availableEngines.get('aliyun')?.available) {
      return 'aliyun';
    }
    if (this.availableEngines.get('volcano')?.available) {
      return 'volcano';
    }
    if (this.availableEngines.get('edge-tts')?.available) {
      return 'edge-tts';
    }
    if (this.availableEngines.get('macos-say')?.available) {
      return 'macos-say';
    }

    return 'silent';
  }

  /**
   * 获取下一个可用的TTS引擎（用于降级）
   */
  private async getNextAvailableEngine(
    attempted: Set<string>
  ): Promise<string> {
    const enginePriority = ['aliyun', 'volcano', 'edge-tts', 'macos-say'];

    for (const engine of enginePriority) {
      if (!attempted.has(engine) && this.availableEngines.get(engine)?.available) {
        return engine;
      }
    }

    return 'silent';
  }

  /**
   * 根据场景段落生成音频
   */
  async generateFromSegments(
    segments: AudioSegment[]
  ): Promise<string> {
    const audioFiles: string[] = [];

    // 为每个片段生成音频
    for (const segment of segments) {
      const audioPath = await this.generateSpeech(
        segment.text,
        segment.options
      );

      // 调整音频时长以匹配场景时长
      const duration = segment.end - segment.start;
      const adjustedPath = await this.adjustAudioDuration(
        audioPath,
        duration
      );

      audioFiles.push(adjustedPath);
    }

    // 合并所有音频文件
    return await this.mergeAudioFiles(audioFiles);
  }

  /**
   * 调整音频时长
   */
  private async adjustAudioDuration(
    audioPath: string,
    targetDuration: number
  ): Promise<string> {
    const outputPath = audioPath.replace('.mp3', '_adjusted.mp3');

    // 获取原始音频时长
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`
    );
    const originalDuration = parseFloat(stdout.trim());

    if (Math.abs(originalDuration - targetDuration) < 0.5) {
      // 如果时长差异小于 0.5 秒，直接使用原始文件
      return audioPath;
    }

    // atempo 的有效范围是 0.5 到 100
    // 如果需要的速度变化超出这个范围，需要链式使用多个 atempo
    let tempo = originalDuration / targetDuration;
    let filterChain = '';

    if (tempo < 0.5) {
      // 音频太短，需要减速（拉长）
      // 使用多个 atempo=0.5 链式处理
      while (tempo < 0.5) {
        filterChain += 'atempo=0.5,';
        tempo *= 2;
      }
      filterChain += `atempo=${tempo}`;
    } else if (tempo > 100) {
      // 音频太长，需要加速（缩短）
      // 使用多个 atempo=100 链式处理
      while (tempo > 100) {
        filterChain += 'atempo=100,';
        tempo /= 100;
      }
      filterChain += `atempo=${tempo}`;
    } else {
      // 在正常范围内
      filterChain = `atempo=${tempo}`;
    }

    // 如果音频太短，可以选择填充静音而不是拉伸
    if (originalDuration < targetDuration * 0.3) {
      // 音频小于目标时长的30%，使用填充静音的方式
      const silenceDuration = targetDuration - originalDuration;
      const command = `ffmpeg -i "${audioPath}" -f lavfi -i anullsrc=r=44100:cl=mono -t ${silenceDuration} -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1" "${outputPath}" -y`;
      await execAsync(command);
    } else {
      // 使用 atempo 调整速度
      const command = `ffmpeg -i "${audioPath}" -filter:a "${filterChain}" "${outputPath}" -y`;
      await execAsync(command);
    }

    return outputPath;
  }

  /**
   * 合并多个音频文件
   */
  async mergeAudioFiles(
    audioFiles: string[]
  ): Promise<string> {
    if (audioFiles.length === 0) {
      throw new Error('没有提供要合并的音频文件');
    }

    if (audioFiles.length === 1) {
      return audioFiles[0];
    }

    const outputPath = path.join(
      this.tempDir,
      `merged_${Date.now()}.mp3`
    );

    // 创建文件列表
    const listPath = path.join(this.tempDir, `merge_list_${Date.now()}.txt`);
    const fileList = audioFiles
      .map(file => `file '${file}'`)
      .join('\n');
    await fs.writeFile(listPath, fileList);

    // 使用 FFmpeg 合并音频
    const command = `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}" -y`;
    await execAsync(command);

    // 清理临时文件
    await fs.remove(listPath);

    return outputPath;
  }

  /**
   * 添加背景音乐
   */
  async addBackgroundMusic(
    voicePath: string,
    musicPath: string,
    options: {
      musicVolume?: number;  // 背景音乐音量 (0-1)
      fadeIn?: number;       // 淡入时长（秒）
      fadeOut?: number;      // 淡出时长（秒）
    } = {}
  ): Promise<string> {
    const outputPath = path.join(
      this.tempDir,
      `with_music_${Date.now()}.mp3`
    );

    const musicVolume = options.musicVolume || 0.3;
    const fadeIn = options.fadeIn || 2;
    const fadeOut = options.fadeOut || 2;

    // 获取语音时长
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${voicePath}"`
    );
    const duration = parseFloat(stdout.trim());

    // 混合语音和背景音乐
    const command = `ffmpeg -i "${voicePath}" -i "${musicPath}" \
      -filter_complex "[1:a]volume=${musicVolume},afade=in:st=0:d=${fadeIn},afade=out:st=${duration - fadeOut}:d=${fadeOut}[music]; \
      [0:a][music]amix=inputs=2:duration=shortest[out]" \
      -map "[out]" "${outputPath}" -y`;

    await execAsync(command);
    return outputPath;
  }

  /**
   * 根据情绪选择背景音乐
   */
  selectBackgroundMusic(
    emotion: string,
    duration: number
  ): string {
    // 这里应该有一个音乐库的映射
    // 暂时返回占位路径
    const musicLibrary: Record<string, string> = {
      happy: 'assets/music/happy.mp3',
      sad: 'assets/music/sad.mp3',
      exciting: 'assets/music/exciting.mp3',
      calm: 'assets/music/calm.mp3',
      serious: 'assets/music/serious.mp3'
    };

    return musicLibrary[emotion] || musicLibrary.calm;
  }

  /**
   * 清理临时文件
   */
  async cleanup(): Promise<void> {
    await fs.emptyDir(this.tempDir);
  }

  /**
   * 获取可用的语音列表
   */
  getAvailableVoices(engine?: string): string[] {
    if (engine) {
      return this.availableEngines.get(engine)?.voices || [];
    }

    const voices: string[] = [];
    for (const [, engineInfo] of this.availableEngines) {
      if (engineInfo.available && engineInfo.voices) {
        voices.push(...engineInfo.voices);
      }
    }
    return voices;
  }
}