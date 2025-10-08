/**
 * Sora2 平台适配器
 * OpenAI 的 Sora2 视频生成模型
 *
 * 特点：
 * - 物理准确的模拟
 * - 唇形同步支持
 * - 同步音频生成
 * - 复杂场景理解
 */

import {
  BaseVideoPlatformAdapter,
  PlatformCapabilities,
  StandardVideoPrompt,
  PlatformSpecificPrompt,
  VideoGenerationTask,
  VideoGenerationResult
} from './base-video-adapter';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

/**
 * Sora2平台适配器
 *
 * 注意：这是一个示例实现，因为Sora2的API尚未公开
 * 实际使用时需要根据OpenAI的官方API进行调整
 */
export class Sora2Adapter extends BaseVideoPlatformAdapter {
  private apiKey: string;
  private apiEndpoint: string = 'https://api.openai.com/v1/sora'; // 示例端点

  readonly capabilities: PlatformCapabilities = {
    name: 'Sora2',
    maxDuration: 60, // Sora2支持最长60秒
    aspectRatios: ['16:9', '9:16', '1:1'],
    hasLipSync: true, // Sora2的核心优势
    hasCameraControl: true, // 支持相机描述
    hasFirstLastFrame: false, // 不支持首尾帧控制
    costPerSecond: 30, // 估算，实际价格待确定
    avgGenerationTime: 300, // 约5分钟/60秒
    maxResolution: {
      width: 1920,
      height: 1920
    },
    hasAudioGeneration: true, // 支持同步音频生成
    qualityLevels: ['standard', 'high', 'ultra']
  };

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  /**
   * 将标准提示词转换为Sora2的AI-Optimized格式
   *
   * Sora2格式特点：
   * - 使用多句子结构
   * - 详细的物理描述
   * - 对话时间标记
   * - 音频线索
   */
  async convertPrompt(standardPrompt: StandardVideoPrompt): Promise<PlatformSpecificPrompt> {
    const sentences: string[] = [];

    // === SECTION: VISUAL COMPOSITION ===
    // Sora2偏好清晰的英文描述，分段组织

    // 三层画面结构
    const visualParts: string[] = [];

    if (standardPrompt.visual.fullDescription) {
      visualParts.push(standardPrompt.visual.fullDescription);
    } else {
      // 构建分层描述
      if (standardPrompt.visual.foreground) {
        visualParts.push(`Foreground: ${standardPrompt.visual.foreground}`);
      }

      visualParts.push(`Main subject: ${standardPrompt.visual.midground}`);

      if (standardPrompt.visual.background) {
        visualParts.push(`Background: ${standardPrompt.visual.background}`);
      }
    }

    sentences.push(...visualParts);

    // === SECTION: PHYSICS & MOTION ===
    // Sora2的强项：物理准确描述
    if (standardPrompt.physics) {
      const physicsSentences: string[] = [];

      if (standardPrompt.physics.objectWeight) {
        physicsSentences.push(
          `The object has realistic weight and mass (${standardPrompt.physics.objectWeight}). ` +
          `Hands bend slightly from the weight, wrists angled downward naturally.`
        );
      }

      if (standardPrompt.physics.motion) {
        physicsSentences.push(
          `Motion: ${standardPrompt.physics.motion}. ` +
          `Movement follows realistic physics with appropriate acceleration and momentum.`
        );
      }

      if (standardPrompt.physics.interactions) {
        physicsSentences.push(`Physical interactions: ${standardPrompt.physics.interactions}`);
      }

      sentences.push(...physicsSentences);
    }

    // === SECTION: CAMERA ===
    if (standardPrompt.camera) {
      const cameraSentence: string[] = [];

      if (standardPrompt.camera.shotSize) {
        cameraSentence.push(`Shot: ${this.convertShotSize(standardPrompt.camera.shotSize)}`);
      }

      if (standardPrompt.camera.movement) {
        cameraSentence.push(`Camera ${this.convertCameraMovement(standardPrompt.camera.movement)}`);
      }

      if (cameraSentence.length > 0) {
        sentences.push(cameraSentence.join('. ') + '.');
      }
    }

    // === SECTION: DIALOGUE & LIP-SYNC ===
    // Sora2的核心能力：精确唇形同步
    if (standardPrompt.dialogue && standardPrompt.dialogue.length > 0) {
      for (const d of standardPrompt.dialogue) {
        const dialogueParts: string[] = [];

        if (d.speaker) {
          dialogueParts.push(d.speaker);
        } else {
          dialogueParts.push('Character');
        }

        // Sora2的对话时间标记格式
        const timing = `${d.timing.start.toFixed(2)}`;
        dialogueParts.push(`says "${d.text}" at ${timing}s`);

        if (d.lipSync) {
          dialogueParts.push('lip-synced');
        }

        if (d.emotion) {
          dialogueParts.push(`with ${d.emotion} emotion`);
        }

        sentences.push(dialogueParts.join(', ') + '.');
      }
    }

    // === SECTION: LIGHTING ===
    if (standardPrompt.lighting) {
      const lightingParts: string[] = ['Lighting:'];

      lightingParts.push(standardPrompt.lighting.style);

      if (standardPrompt.lighting.timeOfDay) {
        lightingParts.push(`${standardPrompt.lighting.timeOfDay} light`);
      }

      if (standardPrompt.lighting.mood) {
        lightingParts.push(`creating ${standardPrompt.lighting.mood} mood`);
      }

      sentences.push(lightingParts.join(' ') + '.');
    }

    // === SECTION: COLOR GRADING ===
    if (standardPrompt.colorGrading) {
      const colorParts: string[] = ['Color:'];

      colorParts.push(standardPrompt.colorGrading.style);

      if (standardPrompt.colorGrading.palette && standardPrompt.colorGrading.palette.length > 0) {
        colorParts.push(`palette of ${standardPrompt.colorGrading.palette.join(', ')}`);
      }

      if (standardPrompt.colorGrading.mood) {
        colorParts.push(`${standardPrompt.colorGrading.mood} tone`);
      }

      sentences.push(colorParts.join(' ') + '.');
    }

    // === SECTION: AUDIO CUES ===
    // Sora2支持音频生成
    if (standardPrompt.audio) {
      const audioCues: string[] = [];

      if (standardPrompt.audio.music) {
        const musicParts: string[] = [];
        musicParts.push(`Music: ${standardPrompt.audio.music.style}`);

        if (standardPrompt.audio.music.bpm) {
          musicParts.push(`BPM ${standardPrompt.audio.music.bpm}`);
        }

        if (standardPrompt.audio.music.volume !== undefined) {
          if (standardPrompt.dialogue && standardPrompt.dialogue.length > 0) {
            musicParts.push(`ducks to ${standardPrompt.audio.music.volume}dB during dialogue`);
          } else {
            musicParts.push(`${standardPrompt.audio.music.volume}dB`);
          }
        }

        audioCues.push(musicParts.join(', '));
      }

      if (standardPrompt.audio.soundEffects && standardPrompt.audio.soundEffects.length > 0) {
        for (const sfx of standardPrompt.audio.soundEffects) {
          audioCues.push(
            `SFX: ${sfx.type} at ${sfx.timing}s` +
            (sfx.volume !== undefined ? ` (${sfx.volume}dB)` : '')
          );
        }
      }

      if (audioCues.length > 0) {
        sentences.push(audioCues.join('. ') + '.');
      }
    }

    // === SECTION: CHARACTER CONSISTENCY ===
    if (standardPrompt.characterReferences && standardPrompt.characterReferences.length > 0) {
      for (const charRef of standardPrompt.characterReferences) {
        if (charRef.fixedPrompt) {
          sentences.push(`Character appearance: ${charRef.fixedPrompt}.`);
        }
      }
    }

    // === 组合最终提示词 ===
    const finalPrompt = sentences.join(' ');

    // === 准备平台参数 ===
    const parameters: Record<string, any> = {
      duration: standardPrompt.duration,
      aspect_ratio: this.convertAspectRatio(standardPrompt.aspectRatio),
      quality: 'high', // 默认高质量
      enable_audio: standardPrompt.audio !== undefined, // 是否生成音频
      enable_lip_sync: standardPrompt.dialogue?.some(d => d.lipSync) || false
    };

    // 如果有参考图片
    if (standardPrompt.characterReferences && standardPrompt.characterReferences.length > 0) {
      const refImages = standardPrompt.characterReferences
        .flatMap(ref => ref.referenceImages || [])
        .filter(img => img);

      if (refImages.length > 0) {
        parameters.reference_images = refImages;
      }
    }

    const estimatedCost = this.estimateCost(standardPrompt);
    const estimatedTime = this.estimateTime(standardPrompt);

    return {
      sceneId: standardPrompt.sceneId,
      platform: 'Sora2',
      promptText: finalPrompt,
      parameters,
      estimatedCost,
      estimatedTime
    };
  }

  /**
   * 提交视频生成任务
   */
  async submitTask(platformPrompt: PlatformSpecificPrompt): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/generate`,
        {
          prompt: platformPrompt.promptText,
          ...platformPrompt.parameters
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (!response.data?.task_id) {
        throw new Error('No task_id returned from Sora2 API');
      }

      return response.data.task_id;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Sora2 API error: ${error.response.status} - ${error.response.data?.error || error.message}`
        );
      }
      throw new Error(`Failed to submit task to Sora2: ${error.message}`);
    }
  }

  /**
   * 查询任务状态
   */
  async queryTask(taskId: string): Promise<VideoGenerationTask> {
    try {
      const response = await axios.get(
        `${this.apiEndpoint}/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 10000
        }
      );

      const data = response.data;

      // 映射状态
      let mappedStatus: VideoGenerationTask['status'];
      switch (data.status) {
        case 'completed':
        case 'succeeded':
          mappedStatus = 'completed';
          break;
        case 'processing':
        case 'running':
          mappedStatus = 'processing';
          break;
        case 'failed':
        case 'error':
          mappedStatus = 'failed';
          break;
        case 'cancelled':
        case 'canceled':
          mappedStatus = 'cancelled';
          break;
        default:
          mappedStatus = 'pending';
      }

      return {
        taskId,
        sceneId: data.scene_id || taskId,
        platform: 'Sora2',
        submittedAt: new Date(data.created_at),
        status: mappedStatus,
        progress: data.progress || 0,
        eta: data.eta,
        error: data.error_message,
        retryCount: 0
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Task not found: ${taskId}`);
      }
      throw new Error(`Failed to query task: ${error.message}`);
    }
  }

  /**
   * 下载生成的视频
   */
  async downloadVideo(taskId: string, localPath: string): Promise<VideoGenerationResult> {
    try {
      // 先查询任务获取视频URL
      const task = await this.queryTask(taskId);

      if (task.status !== 'completed') {
        throw new Error(`Task not completed. Current status: ${task.status}`);
      }

      // 获取视频信息
      const response = await axios.get(
        `${this.apiEndpoint}/tasks/${taskId}/result`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const videoUrl = response.data.video_url;
      const audioUrl = response.data.audio_url; // Sora2可能提供独立音频

      if (!videoUrl) {
        throw new Error('No video URL in task result');
      }

      // 下载视频
      const videoResponse = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        timeout: 120000 // 2分钟超时
      });

      // 保存到本地
      await fs.ensureDir(path.dirname(localPath));
      await fs.writeFile(localPath, videoResponse.data);

      // 如果有独立音频，也下载
      if (audioUrl) {
        const audioPath = localPath.replace('.mp4', '_audio.mp3');
        const audioResponse = await axios.get(audioUrl, {
          responseType: 'arraybuffer'
        });
        await fs.writeFile(audioPath, audioResponse.data);
      }

      // 获取文件大小
      const stats = await fs.stat(localPath);

      return {
        taskId,
        sceneId: task.sceneId,
        platform: 'Sora2',
        videoUrl,
        localPath,
        duration: response.data.duration || 10,
        resolution: {
          width: response.data.width || 1920,
          height: response.data.height || 1080
        },
        fileSize: stats.size,
        actualCost: response.data.cost || this.estimateCost({ duration: 10 } as any),
        generationTime: response.data.generation_time || 300,
        qualityScore: response.data.quality_score,
        metadata: {
          hasAudio: !!audioUrl,
          lipSyncEnabled: response.data.lip_sync_enabled,
          model: response.data.model || 'sora-2'
        }
      };
    } catch (error: any) {
      throw new Error(`Failed to download video: ${error.message}`);
    }
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiEndpoint}/tasks/${taskId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
    } catch (error: any) {
      throw new Error(`Failed to cancel task: ${error.message}`);
    }
  }

  /**
   * 转换景别名称
   */
  private convertShotSize(shotSize: string): string {
    const shotSizeMap: Record<string, string> = {
      'EWS': 'extreme wide shot',
      'WS': 'wide shot',
      'FS': 'full shot',
      'MS': 'medium shot',
      'MCU': 'medium close-up',
      'CU': 'close-up',
      'ECU': 'extreme close-up'
    };

    return shotSizeMap[shotSize] || shotSize;
  }

  /**
   * 转换运镜描述
   */
  private convertCameraMovement(movement: string): string {
    const movementMap: Record<string, string> = {
      'fixed': 'remains static',
      'dolly': 'dollies in smoothly',
      'crane': 'cranes up elegantly',
      'pan': 'pans horizontally',
      'tilt': 'tilts vertically',
      'zoom': 'zooms dynamically',
      'tracking': 'tracks the subject smoothly'
    };

    return movementMap[movement] || movement;
  }

  /**
   * 转换宽高比格式
   */
  private convertAspectRatio(ratio: string): string {
    const ratioMap: Record<string, string> = {
      '16:9': '16:9',
      '9:16': '9:16',
      '1:1': '1:1'
    };

    return ratioMap[ratio] || '16:9'; // 默认横屏
  }

  /**
   * 建议替代平台
   */
  protected suggestAlternativePlatform(capability: string): string {
    const suggestions: Record<string, string> = {
      firstLastFrame: '即梦AI (supports first/last frame control)',
      lowCost: '可灵 or 海螺02 (lower cost options)'
    };

    return suggestions[capability] || super.suggestAlternativePlatform(capability);
  }

  /**
   * 设置API端点（用于测试或使用不同的服务器）
   */
  setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint;
  }
}
