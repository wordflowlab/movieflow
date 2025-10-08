/**
 * 即梦AI (Jimeng AI) 平台适配器
 * 基于火山引擎的视频生成服务
 */

import {
  BaseVideoPlatformAdapter,
  PlatformCapabilities,
  StandardVideoPrompt,
  PlatformSpecificPrompt,
  VideoGenerationTask,
  VideoGenerationResult
} from './base-video-adapter';
import { VolcanoEngineClient } from '../../services/volcano-engine-client';
import axios from 'axios';
import fs from 'fs-extra';

/**
 * 即梦AI平台适配器
 */
export class JimengAdapter extends BaseVideoPlatformAdapter {
  private volcanoClient: VolcanoEngineClient;

  readonly capabilities: PlatformCapabilities = {
    name: '即梦AI v3.0 Pro',
    maxDuration: 10, // 单次最大10秒
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
    hasLipSync: false, // 即梦AI 不支持直接唇形同步
    hasCameraControl: false, // 不支持数值化相机控制
    hasFirstLastFrame: true, // 支持首尾帧控制
    costPerSecond: 17, // 约170元/10秒 = 17元/秒
    avgGenerationTime: 180, // 平均3分钟/10秒
    maxResolution: {
      width: 1920,
      height: 1920
    },
    hasAudioGeneration: false, // 需要单独处理音频
    qualityLevels: ['v30', 'v30_1080p', 'v30_pro']
  };

  constructor(accessKey: string, secretKey: string) {
    super();
    this.volcanoClient = new VolcanoEngineClient(accessKey, secretKey);
  }

  /**
   * 将标准提示词转换为即梦AI格式
   */
  async convertPrompt(standardPrompt: StandardVideoPrompt): Promise<PlatformSpecificPrompt> {
    const promptParts: string[] = [];

    // === 主体描述 ===
    // 即梦AI偏好详细的中文描述
    if (standardPrompt.visual.fullDescription) {
      promptParts.push(standardPrompt.visual.fullDescription);
    } else {
      // 构建三层结构描述
      const layers: string[] = [];

      if (standardPrompt.visual.foreground) {
        layers.push(`前景: ${standardPrompt.visual.foreground}`);
      }

      layers.push(`主体: ${standardPrompt.visual.midground}`);

      if (standardPrompt.visual.background) {
        layers.push(`背景: ${standardPrompt.visual.background}`);
      }

      promptParts.push(layers.join('，'));
    }

    // === 角色一致性 ===
    if (standardPrompt.characterReferences && standardPrompt.characterReferences.length > 0) {
      for (const charRef of standardPrompt.characterReferences) {
        if (charRef.fixedPrompt) {
          promptParts.push(`角色特征: ${charRef.fixedPrompt}`);
        }
      }
    }

    // === 镜头描述 ===
    if (standardPrompt.camera) {
      const cameraDesc: string[] = [];

      if (standardPrompt.camera.shotSize) {
        const shotSizeMap: Record<string, string> = {
          'EWS': '超远景',
          'WS': '远景',
          'FS': '全景',
          'MS': '中景',
          'MCU': '中近景',
          'CU': '近景',
          'ECU': '特写'
        };
        cameraDesc.push(`景别: ${shotSizeMap[standardPrompt.camera.shotSize] || standardPrompt.camera.shotSize}`);
      }

      if (standardPrompt.camera.movement) {
        const movementMap: Record<string, string> = {
          'fixed': '固定镜头',
          'dolly': '推拉镜头',
          'crane': '升降镜头',
          'pan': '横摇镜头',
          'tilt': '俯仰镜头',
          'zoom': '变焦镜头',
          'tracking': '跟踪镜头'
        };
        cameraDesc.push(`运镜: ${movementMap[standardPrompt.camera.movement] || standardPrompt.camera.movement}`);
      }

      if (cameraDesc.length > 0) {
        promptParts.push(cameraDesc.join('，'));
      }
    }

    // === 光照描述 ===
    if (standardPrompt.lighting) {
      const lightingDesc: string[] = [];
      lightingDesc.push(`光照: ${standardPrompt.lighting.style}`);

      if (standardPrompt.lighting.timeOfDay) {
        lightingDesc.push(`时间: ${standardPrompt.lighting.timeOfDay}`);
      }

      if (standardPrompt.lighting.mood) {
        lightingDesc.push(`氛围: ${standardPrompt.lighting.mood}`);
      }

      promptParts.push(lightingDesc.join('，'));
    }

    // === 色彩调性 ===
    if (standardPrompt.colorGrading) {
      const colorDesc: string[] = [];
      colorDesc.push(`色调: ${standardPrompt.colorGrading.style}`);

      if (standardPrompt.colorGrading.palette && standardPrompt.colorGrading.palette.length > 0) {
        colorDesc.push(`配色: ${standardPrompt.colorGrading.palette.join('、')}`);
      }

      promptParts.push(colorDesc.join('，'));
    }

    // === 动作和物理（即梦AI对物理描述理解较好） ===
    if (standardPrompt.physics) {
      const physicsDesc: string[] = [];

      if (standardPrompt.physics.objectWeight) {
        physicsDesc.push(`重量: ${standardPrompt.physics.objectWeight}`);
      }

      if (standardPrompt.physics.motion) {
        physicsDesc.push(`动作: ${standardPrompt.physics.motion}`);
      }

      if (physicsDesc.length > 0) {
        promptParts.push(physicsDesc.join('，'));
      }
    }

    // === 首尾帧控制（即梦AI特色功能） ===
    let firstFrameDesc = '';
    let lastFrameDesc = '';

    if (standardPrompt.firstLastFrame) {
      if (standardPrompt.firstLastFrame.firstFrame) {
        firstFrameDesc = `首帧: ${standardPrompt.firstLastFrame.firstFrame}`;
      }

      if (standardPrompt.firstLastFrame.lastFrame) {
        lastFrameDesc = `尾帧: ${standardPrompt.firstLastFrame.lastFrame}`;
      }
    }

    // === 对话处理（注意：即梦AI不支持lip-sync，这里仅作为动作指导） ===
    if (standardPrompt.dialogue && standardPrompt.dialogue.length > 0) {
      const dialogueDesc = standardPrompt.dialogue.map(d => {
        const parts: string[] = [];
        if (d.speaker) {
          parts.push(`${d.speaker}`);
        }
        parts.push(`说"${d.text}"`);
        if (d.emotion) {
          parts.push(`情绪: ${d.emotion}`);
        }
        return parts.join('，');
      });

      promptParts.push(`对话动作: ${dialogueDesc.join('；')}`);
    }

    // === 组合最终提示词 ===
    let finalPrompt = promptParts.filter(p => p.trim()).join('。') + '。';

    // 如果有首尾帧，添加到提示词中
    if (firstFrameDesc || lastFrameDesc) {
      const frameControl: string[] = [];
      if (firstFrameDesc) frameControl.push(firstFrameDesc);
      if (lastFrameDesc) frameControl.push(lastFrameDesc);
      finalPrompt = `${frameControl.join('；')}。${finalPrompt}`;
    }

    // === 准备平台参数 ===
    const parameters: Record<string, any> = {
      version: 'v30_pro', // 默认使用Pro版本
      frames: Math.round(standardPrompt.duration * 24), // 24fps
      aspect_ratio: this.convertAspectRatio(standardPrompt.aspectRatio)
    };

    // 如果有参考图片（角色一致性），添加到参数中
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
      platform: '即梦AI',
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
      const response = await this.volcanoClient.submitTextToVideoTask({
        prompt: platformPrompt.promptText,
        version: platformPrompt.parameters.version as 'v30' | 'v30_1080p' | 'v30_pro',
        frames: platformPrompt.parameters.frames,
        aspect_ratio: platformPrompt.parameters.aspect_ratio
      });

      if (!response.data?.task_id) {
        throw new Error('No task_id returned from Jimeng API');
      }

      return response.data.task_id;
    } catch (error: any) {
      throw new Error(`Failed to submit task to Jimeng: ${error.message}`);
    }
  }

  /**
   * 查询任务状态
   */
  async queryTask(taskId: string): Promise<VideoGenerationTask> {
    try {
      const result = await this.volcanoClient.getTaskResult(taskId, 'v30_pro');

      if (result.code !== 10000) {
        throw new Error(`API error: ${result.message}`);
      }

      const status = result.data?.status as string | undefined;
      const videoUrl = result.data?.video_url;

      // 映射状态
      let mappedStatus: VideoGenerationTask['status'];
      switch (status) {
        case 'done':
          mappedStatus = 'completed';
          break;
        case 'processing':
        case 'pending':
        case 'generating':
        case 'in_queue':
          mappedStatus = 'processing';
          break;
        case 'failed':
          mappedStatus = 'failed';
          break;
        case 'not_found':
        case 'expired':
          mappedStatus = 'cancelled';
          break;
        default:
          mappedStatus = 'pending';
      }

      // 估算进度（简单估算，实际可能需要更复杂的逻辑）
      let progress = 0;
      if (mappedStatus === 'completed') {
        progress = 100;
      } else if (mappedStatus === 'processing') {
        progress = 50; // 简化估算
      }

      return {
        taskId,
        sceneId: taskId, // 如果没有额外存储，使用taskId
        platform: '即梦AI',
        submittedAt: new Date(), // 实际应该从存储中获取
        status: mappedStatus,
        progress,
        eta: mappedStatus === 'processing' ? 120 : undefined, // 估算2分钟
        error: mappedStatus === 'failed' ? result.message : undefined,
        retryCount: 0
      };
    } catch (error: any) {
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

      // 从API获取视频URL
      const result = await this.volcanoClient.getTaskResult(taskId, 'v30_pro');
      const videoUrl = result.data?.video_url;

      if (!videoUrl) {
        throw new Error('No video URL in task result');
      }

      // 下载视频
      const response = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        timeout: 60000 // 60秒超时
      });

      // 保存到本地
      await fs.ensureDir(path.dirname(localPath));
      await fs.writeFile(localPath, response.data);

      // 获取文件大小
      const stats = await fs.stat(localPath);

      return {
        taskId,
        sceneId: task.sceneId,
        platform: '即梦AI',
        videoUrl,
        localPath,
        duration: 10, // 即梦AI单次生成10秒
        resolution: {
          width: 1088,
          height: 1920
        },
        fileSize: stats.size,
        actualCost: 170 / 6, // 约28元/个片段
        generationTime: 180, // 3分钟
        metadata: {
          apiVersion: 'v30_pro',
          taskId
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
    // 火山引擎API可能不支持取消，这里仅做标记
    console.warn(`Cancel task not fully supported by Jimeng API. TaskId: ${taskId}`);
    // 可以在本地数据库中标记为cancelled
  }

  /**
   * 转换宽高比格式
   */
  private convertAspectRatio(ratio: string): string {
    const ratioMap: Record<string, string> = {
      '16:9': '16:9',
      '9:16': '9:16',
      '1:1': '1:1',
      '4:3': '4:3',
      '3:4': '3:4',
      '21:9': '21:9'
    };

    return ratioMap[ratio] || '9:16'; // 默认竖屏
  }

  /**
   * 建议替代平台
   */
  protected suggestAlternativePlatform(capability: string): string {
    const suggestions: Record<string, string> = {
      lipSync: 'Sora2 (excellent lip-sync support)',
      cameraControl: 'Runway Gen-4 (numerical camera control)',
      audioGeneration: 'Sora2 (synchronized audio generation)'
    };

    return suggestions[capability] || super.suggestAlternativePlatform(capability);
  }
}

// 导入path模块（在实际使用中需要）
import path from 'path';
