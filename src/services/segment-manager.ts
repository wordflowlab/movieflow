/**
 * 视频分段管理器
 * 负责将60秒视频分成6个10秒片段并管理生成过程
 */

export type SegmentStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface VideoSegment {
  id: string;
  index: number;
  startTime: number;  // 开始时间（秒）
  duration: number;   // 持续时间（秒）
  frames: number;     // 帧数
  prompt: string;     // 生成提示词
  audioPath?: string; // 音频文件路径（可选）
  audio?: string;     // 音频文本（可选）
  status: SegmentStatus;
  taskId?: string;    // 任务ID
  videoUrl?: string;  // 生成的视频URL
  error?: string;     // 错误信息
  retryCount?: number; // 重试次数
}

export interface BatchConfig {
  maxConcurrency: number;  // 最大并发数
  batchSize: number;       // 批次大小
  retryAttempts: number;   // 重试次数
  retryDelay: number;      // 重试延迟（毫秒）
}

export class VideoSegmentManager {
  private segments: VideoSegment[] = [];
  private config: BatchConfig;

  constructor(config?: Partial<BatchConfig>) {
    this.config = {
      maxConcurrency: 3,    // 默认并发3个任务
      batchSize: 3,         // 每批3个片段
      retryAttempts: 3,     // 重试3次
      retryDelay: 5000,     // 5秒延迟
      ...config
    };
  }

  /**
   * 创建60秒视频的6个片段
   */
  createSegments(scenes: Array<{prompt: string, audio?: string, duration?: number}>): VideoSegment[] {
    // 允许任意数量的场景用于测试
    if (scenes.length === 0) {
      throw new Error('至少需要提供1个场景');
    }

    this.segments = scenes.map((scene, index) => ({
      id: `segment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      index: index,
      startTime: index * 10,     // 每段10秒
      duration: scene.duration || 10, // 默认10秒
      frames: scene.duration === 5 ? 121 : 241, // 5秒=121帧, 10秒=241帧
      prompt: scene.prompt,
      audio: scene.audio,
      audioPath: scene.audio, // 兼容audioPath
      status: 'pending' as const,
      retryCount: 0
    }));

    return this.segments;
  }

  /**
   * 获取下一批待处理的片段
   */
  getNextBatch(): VideoSegment[] {
    // 考虑并发限制
    const generating = this.segments.filter(s => s.status === 'generating').length;
    const availableSlots = this.config.maxConcurrency - generating;

    if (availableSlots <= 0) {
      return [];
    }

    const pendingSegments = this.segments.filter(s => s.status === 'pending');
    const batchLimit = Math.min(this.config.batchSize, availableSlots);
    return pendingSegments.slice(0, batchLimit);
  }

  /**
   * 更新片段状态
   */
  updateSegment(id: string, updates: Partial<VideoSegment>): void {
    const segment = this.segments.find(s => s.id === id);
    if (segment) {
      Object.assign(segment, updates);
    }
  }

  /**
   * 获取所有片段
   */
  getAllSegments(): VideoSegment[] {
    return this.segments;
  }

  /**
   * 获取所有片段（别名）
   */
  getSegments(): VideoSegment[] {
    return this.segments;
  }

  /**
   * 获取待处理的片段
   */
  getPendingSegments(): VideoSegment[] {
    return this.segments.filter(s => s.status === 'pending');
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    total: number;
    completed: number;
    failed: number;
    generating: number;
    pending: number;
  } {
    const stats = {
      total: this.segments.length,
      completed: 0,
      failed: 0,
      generating: 0,
      pending: 0
    };

    this.segments.forEach(segment => {
      switch (segment.status) {
        case 'completed':
          stats.completed++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'generating':
          stats.generating++;
          break;
        case 'pending':
          stats.pending++;
          break;
      }
    });

    return stats;
  }

  /**
   * 检查是否所有片段都已完成
   */
  isAllCompleted(): boolean {
    return this.segments.every(s => s.status === 'completed');
  }

  /**
   * 检查是否有失败的片段
   */
  hasFailedSegments(): boolean {
    return this.segments.some(s => s.status === 'failed');
  }

  /**
   * 获取失败的片段
   */
  getFailedSegments(): VideoSegment[] {
    return this.segments.filter(s => s.status === 'failed');
  }

  /**
   * 重置失败片段的状态
   */
  resetFailedSegments(): void {
    this.segments.forEach(segment => {
      if (segment.status === 'failed') {
        segment.status = 'pending';
        segment.error = undefined;
        segment.taskId = undefined;
        // 保留重试次数
        segment.retryCount = (segment.retryCount || 0) + 1;
      }
    });
  }

  /**
   * 获取完成的视频URL列表（按顺序）
   */
  getCompletedVideoUrls(): string[] {
    return this.segments
      .sort((a, b) => a.index - b.index)
      .map(s => s.videoUrl)
      .filter((url): url is string => url !== undefined);
  }

  /**
   * 获取进度百分比
   */
  getProgress(): number {
    const completed = this.segments.filter(s => s.status === 'completed').length;
    return Math.round((completed / this.segments.length) * 100);
  }

  /**
   * 获取状态摘要
   */
  getStatusSummary(): {
    total: number;
    pending: number;
    generating: number;
    completed: number;
    failed: number;
  } {
    const summary = {
      total: this.segments.length,
      pending: 0,
      generating: 0,
      completed: 0,
      failed: 0
    };

    this.segments.forEach(segment => {
      summary[segment.status]++;
    });

    return summary;
  }
}

/**
 * 唐僧说媒场景预设
 */
export const TANG_MONK_SCENES = [
  {
    prompt: "Q版唐僧站在古色古香的寺庙前，背景青山绿水，阳光温暖，卡通风格，可爱形象",
    audio: "你是做什么工作的？贫僧刚从西天取经回来，正在找工作"
  },
  {
    prompt: "Q版唐僧展示经书，背景是西天取经路线图，冒险地图风格，色彩鲜艳",
    audio: "那你有什么工作经验？贫僧走了十四年，管理过三个问题员工"
  },
  {
    prompt: "Q版唐僧与女儿国国王的可爱形象，花园背景，粉色浪漫氛围，少女心风格",
    audio: "谈过恋爱吗？女儿国国王曾经追求过贫僧，但贫僧志在事业"
  },
  {
    prompt: "Q版唐僧念经，妖怪抱头痛苦的搞笑场景，金光闪闪效果，动作夸张",
    audio: "你有什么特长？贫僧念经功力深厚，能让妖怪头痛欲裂"
  },
  {
    prompt: "Q版师徒四人站在一起，孙悟空挥棒、猪八戒吃东西、沙僧扛担，团队形象",
    audio: "遇到困难怎么办？贫僧有专业团队，悟空能打，八戒能吃，沙僧能扛"
  },
  {
    prompt: "白龙马变身豪华跑车的魔法转换场景，闪光特效，搞笑风格，现代元素",
    audio: "有车有房吗？贫僧有一匹能变豪车的白龙马，大雷音寺还分配了禅房"
  }
];