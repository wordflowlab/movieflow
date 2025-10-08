/**
 * 基础视频平台适配器接口
 * 定义所有视频生成平台必须实现的统一接口
 */

/**
 * 平台能力特征
 */
export interface PlatformCapabilities {
  /** 平台名称 */
  name: string;

  /** 最大支持时长（秒） */
  maxDuration: number;

  /** 支持的宽高比 */
  aspectRatios: string[];

  /** 是否支持唇形同步 */
  hasLipSync: boolean;

  /** 是否支持相机控制 */
  hasCameraControl: boolean;

  /** 是否支持首尾帧控制 */
  hasFirstLastFrame: boolean;

  /** 每秒成本（人民币） */
  costPerSecond: number;

  /** 平均生成时间（秒） */
  avgGenerationTime: number;

  /** 支持的最大分辨率 */
  maxResolution: {
    width: number;
    height: number;
  };

  /** 是否支持音频生成 */
  hasAudioGeneration: boolean;

  /** 质量等级 */
  qualityLevels: string[];
}

/**
 * 标准视频提示词格式
 * 这是所有平台适配器的输入格式
 */
export interface StandardVideoPrompt {
  /** 场景ID */
  sceneId: string;

  /** 场景名称 */
  sceneName: string;

  /** 时长（秒） */
  duration: number;

  /** 宽高比 */
  aspectRatio: string;

  /** 视觉描述 */
  visual: {
    /** 前景元素 (20%) */
    foreground?: string;

    /** 中景主体 (60%) */
    midground: string;

    /** 背景环境 (20%) */
    background?: string;

    /** 完整描述（如果不使用三层结构） */
    fullDescription?: string;
  };

  /** 镜头信息 */
  camera?: {
    /** 景别：EWS/WS/FS/MS/MCU/CU/ECU */
    shotSize?: string;

    /** 运镜：fixed/dolly/crane/pan/tilt/zoom/tracking */
    movement?: string;

    /** 运镜参数（如果平台支持数值化控制） */
    movementParams?: {
      horizontal?: number;  // -10 to +10
      vertical?: number;    // -10 to +10
      pan?: number;         // -10 to +10
      tilt?: number;        // -10 to +10
      roll?: number;        // -10 to +10
      zoom?: number;        // -10 to +10
    };
  };

  /** 光照 */
  lighting?: {
    style: string;
    timeOfDay?: string;
    mood?: string;
  };

  /** 色彩调性 */
  colorGrading?: {
    style: string;
    palette?: string[];
    mood?: string;
  };

  /** 对话/旁白 */
  dialogue?: {
    /** 说话者 */
    speaker?: string;

    /** 台词文本 */
    text: string;

    /** 时间码 (秒) */
    timing: {
      start: number;
      end: number;
    };

    /** 是否需要唇形同步 */
    lipSync: boolean;

    /** 情绪/语气 */
    emotion?: string;
  }[];

  /** 音频线索 */
  audio?: {
    /** 背景音乐 */
    music?: {
      style: string;
      bpm?: number;
      volume?: number; // dB
    };

    /** 音效 */
    soundEffects?: {
      type: string;
      timing: number; // 秒
      volume?: number; // dB
    }[];
  };

  /** 角色一致性参考 */
  characterReferences?: {
    characterId: string;
    referenceImages?: string[];
    fixedPrompt?: string;
  }[];

  /** 视觉连贯性 */
  continuity?: {
    previousSceneId?: string;
    transitionType?: 'cut' | 'fade' | 'dissolve' | 'wipe';
    globalStyle?: string;
  };

  /** 首尾帧（如果平台支持） */
  firstLastFrame?: {
    firstFrame?: string;
    lastFrame?: string;
  };

  /** 物理描述（如果平台支持物理模拟） */
  physics?: {
    objectWeight?: string;
    motion?: string;
    interactions?: string;
  };
}

/**
 * 平台特定的提示词格式
 * 每个平台适配器将 StandardVideoPrompt 转换为这个格式
 */
export interface PlatformSpecificPrompt {
  /** 原始场景ID */
  sceneId: string;

  /** 平台名称 */
  platform: string;

  /** 平台特定的提示词文本 */
  promptText: string;

  /** 平台特定的参数 */
  parameters: Record<string, any>;

  /** 预计成本（元） */
  estimatedCost: number;

  /** 预计生成时间（秒） */
  estimatedTime: number;
}

/**
 * 视频生成任务
 */
export interface VideoGenerationTask {
  /** 任务ID */
  taskId: string;

  /** 场景ID */
  sceneId: string;

  /** 平台名称 */
  platform: string;

  /** 提交时间 */
  submittedAt: Date;

  /** 状态 */
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  /** 进度百分比 (0-100) */
  progress: number;

  /** 预计剩余时间（秒） */
  eta?: number;

  /** 错误信息 */
  error?: string;

  /** 重试次数 */
  retryCount: number;
}

/**
 * 视频生成结果
 */
export interface VideoGenerationResult {
  /** 任务ID */
  taskId: string;

  /** 场景ID */
  sceneId: string;

  /** 平台名称 */
  platform: string;

  /** 视频URL */
  videoUrl: string;

  /** 本地文件路径（下载后） */
  localPath?: string;

  /** 时长（秒） */
  duration: number;

  /** 分辨率 */
  resolution: {
    width: number;
    height: number;
  };

  /** 文件大小（字节） */
  fileSize: number;

  /** 实际成本（元） */
  actualCost: number;

  /** 生成时间（秒） */
  generationTime: number;

  /** 质量评分（如果有） */
  qualityScore?: number;

  /** 元数据 */
  metadata: Record<string, any>;
}

/**
 * 基础视频平台适配器抽象类
 * 所有具体平台适配器必须继承此类
 */
export abstract class BaseVideoPlatformAdapter {
  /** 平台能力 */
  abstract readonly capabilities: PlatformCapabilities;

  /**
   * 将标准提示词转换为平台特定格式
   * @param standardPrompt 标准提示词
   * @returns 平台特定提示词
   */
  abstract convertPrompt(standardPrompt: StandardVideoPrompt): Promise<PlatformSpecificPrompt>;

  /**
   * 提交视频生成任务
   * @param platformPrompt 平台特定提示词
   * @returns 任务ID
   */
  abstract submitTask(platformPrompt: PlatformSpecificPrompt): Promise<string>;

  /**
   * 查询任务状态
   * @param taskId 任务ID
   * @returns 任务状态
   */
  abstract queryTask(taskId: string): Promise<VideoGenerationTask>;

  /**
   * 下载生成的视频
   * @param taskId 任务ID
   * @param localPath 本地保存路径
   * @returns 生成结果
   */
  abstract downloadVideo(taskId: string, localPath: string): Promise<VideoGenerationResult>;

  /**
   * 取消任务
   * @param taskId 任务ID
   */
  abstract cancelTask(taskId: string): Promise<void>;

  /**
   * 估算成本
   * @param standardPrompt 标准提示词
   * @returns 预计成本（元）
   */
  estimateCost(standardPrompt: StandardVideoPrompt): number {
    return standardPrompt.duration * this.capabilities.costPerSecond;
  }

  /**
   * 估算生成时间
   * @param standardPrompt 标准提示词
   * @returns 预计时间（秒）
   */
  estimateTime(standardPrompt: StandardVideoPrompt): number {
    // 默认假设生成时间与视频时长成正比
    return standardPrompt.duration * (this.capabilities.avgGenerationTime / 10);
  }

  /**
   * 验证提示词是否适合此平台
   * @param standardPrompt 标准提示词
   * @returns 验证结果和建议
   */
  validatePrompt(standardPrompt: StandardVideoPrompt): {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 检查时长
    if (standardPrompt.duration > this.capabilities.maxDuration) {
      warnings.push(
        `Duration ${standardPrompt.duration}s exceeds platform max ${this.capabilities.maxDuration}s`
      );
    }

    // 检查宽高比
    if (!this.capabilities.aspectRatios.includes(standardPrompt.aspectRatio)) {
      warnings.push(
        `Aspect ratio ${standardPrompt.aspectRatio} not supported. ` +
        `Supported: ${this.capabilities.aspectRatios.join(', ')}`
      );
    }

    // 检查唇形同步
    if (standardPrompt.dialogue?.some(d => d.lipSync) && !this.capabilities.hasLipSync) {
      warnings.push(
        `Lip sync requested but not supported by platform. Consider using ${this.suggestAlternativePlatform('lipSync')}`
      );
    }

    // 检查相机控制
    if (standardPrompt.camera?.movementParams && !this.capabilities.hasCameraControl) {
      warnings.push(
        `Camera control params provided but not supported. Consider using ${this.suggestAlternativePlatform('cameraControl')}`
      );
    }

    // 检查首尾帧
    if (standardPrompt.firstLastFrame && !this.capabilities.hasFirstLastFrame) {
      suggestions.push(
        `First/last frame control not supported. Consider using ${this.suggestAlternativePlatform('firstLastFrame')}`
      );
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions
    };
  }

  /**
   * 根据能力需求建议替代平台
   * @param capability 需要的能力
   * @returns 建议的平台名称
   */
  protected suggestAlternativePlatform(capability: string): string {
    // 子类可以override此方法提供更具体的建议
    const suggestions: Record<string, string> = {
      lipSync: 'Sora2 (has excellent lip-sync)',
      cameraControl: 'Runway Gen-4 (numerical camera control)',
      firstLastFrame: '即梦AI (first/last frame control)'
    };

    return suggestions[capability] || 'a platform with this capability';
  }

  /**
   * 获取平台信息摘要
   */
  getPlatformSummary(): string {
    const caps = this.capabilities;
    return `
Platform: ${caps.name}
Max Duration: ${caps.maxDuration}s
Aspect Ratios: ${caps.aspectRatios.join(', ')}
Cost: ¥${caps.costPerSecond}/sec
Avg Generation Time: ${caps.avgGenerationTime}s/10s
Capabilities:
  - Lip Sync: ${caps.hasLipSync ? '✓' : '✗'}
  - Camera Control: ${caps.hasCameraControl ? '✓' : '✗'}
  - First/Last Frame: ${caps.hasFirstLastFrame ? '✓' : '✗'}
  - Audio Generation: ${caps.hasAudioGeneration ? '✓' : '✗'}
`.trim();
  }
}

/**
 * 平台适配器工厂
 * 用于根据平台名称获取适配器实例
 */
export class PlatformAdapterFactory {
  private static adapters: Map<string, BaseVideoPlatformAdapter> = new Map();

  /**
   * 注册平台适配器
   */
  static register(platformName: string, adapter: BaseVideoPlatformAdapter): void {
    this.adapters.set(platformName.toLowerCase(), adapter);
  }

  /**
   * 获取平台适配器
   */
  static getAdapter(platformName: string): BaseVideoPlatformAdapter {
    const adapter = this.adapters.get(platformName.toLowerCase());
    if (!adapter) {
      throw new Error(
        `Platform adapter not found: ${platformName}. ` +
        `Available platforms: ${Array.from(this.adapters.keys()).join(', ')}`
      );
    }
    return adapter;
  }

  /**
   * 获取所有可用平台
   */
  static getAvailablePlatforms(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * 获取所有平台能力
   */
  static getAllPlatformCapabilities(): PlatformCapabilities[] {
    return Array.from(this.adapters.values()).map(adapter => adapter.capabilities);
  }

  /**
   * 根据需求推荐最佳平台
   */
  static recommendPlatform(requirements: {
    needsLipSync?: boolean;
    needsCameraControl?: boolean;
    needsFirstLastFrame?: boolean;
    maxBudget?: number;
    duration?: number;
    prioritizeCost?: boolean;
    prioritizeQuality?: boolean;
  }): {
    recommended: string;
    alternatives: string[];
    rationale: string;
  } {
    const candidates = Array.from(this.adapters.entries()).filter(([name, adapter]) => {
      const caps = adapter.capabilities;

      // 过滤掉不满足硬性要求的平台
      if (requirements.needsLipSync && !caps.hasLipSync) return false;
      if (requirements.needsCameraControl && !caps.hasCameraControl) return false;
      if (requirements.needsFirstLastFrame && !caps.hasFirstLastFrame) return false;

      // 检查预算
      if (requirements.maxBudget && requirements.duration) {
        const estimatedCost = requirements.duration * caps.costPerSecond;
        if (estimatedCost > requirements.maxBudget) return false;
      }

      return true;
    });

    if (candidates.length === 0) {
      throw new Error('No platform meets the requirements');
    }

    // 排序候选平台
    candidates.sort((a, b) => {
      if (requirements.prioritizeCost) {
        return a[1].capabilities.costPerSecond - b[1].capabilities.costPerSecond;
      }
      if (requirements.prioritizeQuality) {
        // 质量优先：有更多能力的平台排前面
        const scoreA = this.calculateQualityScore(a[1].capabilities);
        const scoreB = this.calculateQualityScore(b[1].capabilities);
        return scoreB - scoreA;
      }
      // 平衡：综合考虑成本和质量
      return this.calculateBalanceScore(a[1].capabilities) -
             this.calculateBalanceScore(b[1].capabilities);
    });

    const recommended = candidates[0][0];
    const alternatives = candidates.slice(1, 3).map(c => c[0]);

    const rationale = this.generateRationale(
      candidates[0][1].capabilities,
      requirements
    );

    return {
      recommended,
      alternatives,
      rationale
    };
  }

  private static calculateQualityScore(caps: PlatformCapabilities): number {
    let score = 0;
    if (caps.hasLipSync) score += 3;
    if (caps.hasCameraControl) score += 2;
    if (caps.hasFirstLastFrame) score += 2;
    if (caps.hasAudioGeneration) score += 1;
    score += caps.maxDuration / 10; // 支持更长时长加分
    return score;
  }

  private static calculateBalanceScore(caps: PlatformCapabilities): number {
    const qualityScore = this.calculateQualityScore(caps);
    const costScore = caps.costPerSecond;
    // 质量/成本比，越高越好
    return qualityScore / costScore;
  }

  private static generateRationale(
    caps: PlatformCapabilities,
    requirements: any
  ): string {
    const reasons: string[] = [];

    if (requirements.prioritizeCost) {
      reasons.push(`Lowest cost at ¥${caps.costPerSecond}/sec`);
    }

    if (requirements.prioritizeQuality) {
      reasons.push(`Highest quality score with comprehensive capabilities`);
    }

    if (requirements.needsLipSync && caps.hasLipSync) {
      reasons.push(`Supports required lip-sync capability`);
    }

    if (requirements.needsCameraControl && caps.hasCameraControl) {
      reasons.push(`Supports required camera control`);
    }

    if (requirements.needsFirstLastFrame && caps.hasFirstLastFrame) {
      reasons.push(`Supports required first/last frame control`);
    }

    if (!requirements.prioritizeCost && !requirements.prioritizeQuality) {
      reasons.push(`Best balance of quality (score: ${this.calculateQualityScore(caps)}) and cost (¥${caps.costPerSecond}/sec)`);
    }

    return reasons.join('; ');
  }
}
