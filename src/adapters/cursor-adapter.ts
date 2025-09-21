/**
 * Cursor AI 助手适配器
 * 优化 Cursor 的输出格式
 */

import { AIAssistantAdapter, ProgressData } from './base-adapter';

export class CursorAdapter extends AIAssistantAdapter {
  private progressSymbols = ['▶', '▷', '▶', '▷'];
  private symbolIndex = 0;

  constructor() {
    super('Cursor', true);
  }

  outputProgress(data: ProgressData): void {
    this.throttleOutput(() => {
      let output = '';

      switch (data.type) {
        case 'task_start':
          // Cursor 喜欢简洁的输出
          output = `\n[开始] ${data.taskName || '任务'}`;
          if (data.detail) {
            output += ` - ${data.detail}`;
          }
          output += '\n';
          this.startHeartbeat(data.taskName);
          break;

        case 'task_progress':
          // Cursor 使用简单的文本进度
          const symbol = this.progressSymbols[this.symbolIndex++ % this.progressSymbols.length];
          output = `${symbol} ${data.taskName}: ${data.progress || 0}%`;
          
          if (data.current && data.total) {
            output += ` [${data.current}/${data.total}]`;
          }
          
          if (data.message) {
            output += ` - ${data.message}`;
          }
          
          output += '\n';
          break;

        case 'task_complete':
          this.stopHeartbeat();
          output = `[完成] ${data.taskName || '任务'}`;
          if (data.message) {
            output += `: ${data.message}`;
          }
          output += '\n';
          break;

        case 'task_error':
          this.stopHeartbeat();
          output = `[错误] ${data.taskName || '任务'}`;
          if (data.message) {
            output += `: ${data.message}`;
          }
          output += '\n';
          break;

        case 'heartbeat':
          // Cursor 心跳:简单的状态更新
          output = `[Cursor] 处理中: ${data.message || '请稍候...'}\n`;
          break;
      }

      if (output) {
        process.stdout.write(output);
      }
    });
  }

  outputStructured(data: any): void {
    // Cursor 使用简单的 JSON 输出
    console.log('--- DATA START ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('--- DATA END ---');
  }

  outputMessage(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const prefixes = {
      info: '[INFO]',
      success: '[SUCCESS]',
      warning: '[WARNING]',
      error: '[ERROR]'
    };

    console.log(`${prefixes[level]} ${message}`);
  }

  clearPreviousOutput(): void {
    // Cursor 不支持清除,直接输出新内容
  }

  getFormatOptions() {
    return {
      useColors: false,  // Cursor 不依赖颜色
      useEmojis: false,  // 不使用 emoji
      useProgress: true,
      useSpinner: false  // 使用简单符号
    };
  }

  /**
   * Cursor 特有:输出任务列表
   */
  outputTaskList(tasks: Array<{name: string, status: string}>): void {
    console.log('\n=== 任务列表 ===');
    tasks.forEach((task, index) => {
      const statusText = {
        pending: '[ ]',
        running: '[>]',
        completed: '[x]',
        failed: '[!]'
      }[task.status] || '[?]';
      
      console.log(`  ${index + 1}. ${statusText} ${task.name}`);
    });
    console.log('================\n');
  }
}