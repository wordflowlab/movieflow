/**
 * AI 助手适配器基类
 * 为不同 AI 编程助手提供统一的进度输出接口
 */

export interface ProgressData {
  type: 'task_start' | 'task_progress' | 'task_complete' | 'task_error' | 'heartbeat';
  taskId?: string;
  taskName?: string;
  progress?: number;  // 0-100
  total?: number;
  current?: number;
  message?: string;
  detail?: string;
  eta?: number;  // 预计剩余时间(秒)
  timestamp?: number;
}

export interface TaskState {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
  retryCount?: number;
  data?: any;  // 任务相关数据,用于断点续传
}

export abstract class AIAssistantAdapter {
  protected platform: string;
  protected isInteractive: boolean;
  protected heartbeatInterval: NodeJS.Timeout | null = null;
  protected lastOutput: number = Date.now();
  protected minOutputInterval: number = 2000;  // 最小输出间隔 2 秒
  protected maxSilentDuration: number = 10000; // 最大静默时间 10 秒

  constructor(platform: string, isInteractive: boolean = true) {
    this.platform = platform;
    this.isInteractive = isInteractive;
  }

  /**
   * 输出进度信息
   */
  abstract outputProgress(data: ProgressData): void;

  /**
   * 输出结构化数据(供 AI 解析)
   */
  abstract outputStructured(data: any): void;

  /**
   * 输出用户可读信息
   */
  abstract outputMessage(message: string, level?: 'info' | 'success' | 'warning' | 'error'): void;

  /**
   * 清理或更新之前的输出
   */
  abstract clearPreviousOutput(): void;

  /**
   * 获取平台特定的格式化选项
   */
  abstract getFormatOptions(): {
    useColors: boolean;
    useEmojis: boolean;
    useProgress: boolean;
    useSpinner: boolean;
  };

  /**
   * 开始心跳机制
   */
  startHeartbeat(taskName: string = '处理中'): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      const silentDuration = Date.now() - this.lastOutput;
      
      // 如果超过最大静默时间,输出心跳信息
      if (silentDuration > this.maxSilentDuration) {
        this.outputProgress({
          type: 'heartbeat',
          message: `${taskName}...请稍候`,
          timestamp: Date.now()
        });
        this.lastOutput = Date.now();
      }
    }, 5000);  // 每 5 秒检查一次
  }

  /**
   * 停止心跳机制
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 限流输出(避免输出过于频繁)
   */
  protected throttleOutput(callback: () => void): void {
    const now = Date.now();
    if (now - this.lastOutput >= this.minOutputInterval) {
      callback();
      this.lastOutput = now;
    }
  }

  /**
   * 格式化时间
   */
  protected formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}秒`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return `${minutes}分${secs}秒`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}小时${minutes}分`;
    }
  }

  /**
   * 创建进度条字符串
   */
  protected createProgressBar(progress: number, width: number = 20): string {
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }

  /**
   * 获取平台名称
   */
  getPlatform(): string {
    return this.platform;
  }

  /**
   * 是否为交互模式
   */
  getIsInteractive(): boolean {
    return this.isInteractive;
  }
}