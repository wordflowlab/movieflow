/**
 * Claude Code AI 助手适配器
 * 优化 Claude Code 的输出格式,保持长时间任务的连接
 */

import { AIAssistantAdapter, ProgressData } from './base-adapter';
import chalk from 'chalk';

export class ClaudeAdapter extends AIAssistantAdapter {
  private spinnerChars = ['⋯', '⋯⋯', '⋯⋯⋯', '⋯⋯', '⋯'];
  private spinnerIndex = 0;
  private lastTaskName = '';

  constructor() {
    super('Claude Code', true);
  }

  outputProgress(data: ProgressData): void {
    this.throttleOutput(() => {
      let output = '';

      switch (data.type) {
        case 'task_start':
          this.lastTaskName = data.taskName || '任务';
          output = `\n🚀 开始${data.taskName || '任务'}\n`;
          if (data.detail) {
            output += `   → ${data.detail}\n`;
          }
          this.startHeartbeat(data.taskName);
          break;

        case 'task_progress':
          const progressBar = this.createProgressBar(data.progress || 0, 25);
          const percentage = `${data.progress || 0}%`;
          const spinner = this.spinnerChars[this.spinnerIndex++ % this.spinnerChars.length];
          
          // Claude Code 适合的格式:清晰的进度显示
          output = `\r${spinner} ${data.taskName || this.lastTaskName} ${progressBar} ${percentage}`;
          
          if (data.current && data.total) {
            output += ` (${data.current}/${data.total})`;
          }
          
          if (data.eta) {
            output += ` | 预计剩余: ${this.formatTime(data.eta)}`;
          }
          
          if (data.message) {
            output += `\n   → ${data.message}`;
          }
          break;

        case 'task_complete':
          this.stopHeartbeat();
          output = `\n✅ ${data.taskName || this.lastTaskName} 完成`;
          if (data.message) {
            output += `\n   ✔ ${data.message}`;
          }
          break;

        case 'task_error':
          this.stopHeartbeat();
          output = `\n❌ ${data.taskName || this.lastTaskName} 失败`;
          if (data.message) {
            output += `\n   ✗ ${chalk.red(data.message)}`;
          }
          break;

        case 'heartbeat':
          // Claude Code 心跳:显示正在处理信息
          output = `\r📍 [Claude Code] ${data.message || '正在处理,请稍候...'}`;
          break;
      }

      if (output) {
        // 使用 process.stdout.write 避免自动换行
        process.stdout.write(output);
      }
    });
  }

  outputStructured(data: any): void {
    // Claude Code 支持结构化输出,使用特殊标记
    console.log('\n<!-- STRUCTURED_DATA_START -->');
    console.log(JSON.stringify(data, null, 2));
    console.log('<!-- STRUCTURED_DATA_END -->\n');
  }

  outputMessage(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const icons = {
      info: 'ℹ️ ',
      success: '✅',
      warning: '⚠️ ',
      error: '❌'
    };

    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };

    const icon = icons[level];
    const color = colors[level];
    
    console.log(`\n${icon} ${color(message)}`);
  }

  clearPreviousOutput(): void {
    // Claude Code 不需要清除输出,但可以使用 \r 覆盖当前行
    process.stdout.write('\r' + ' '.repeat(80) + '\r');
  }

  getFormatOptions() {
    return {
      useColors: true,
      useEmojis: true,
      useProgress: true,
      useSpinner: true
    };
  }

  /**
   * Claude Code 特有:输出任务树状结构
   */
  outputTaskTree(tasks: Array<{name: string, status: string, children?: any[]}>, indent: number = 0): void {
    tasks.forEach((task, index) => {
      const isLast = index === tasks.length - 1;
      const prefix = ' '.repeat(indent) + (isLast ? '└─' : '├─');
      
      const statusIcon = {
        pending: '⏳',
        running: '🔄',
        completed: '✅',
        failed: '❌'
      }[task.status] || '❓';
      
      console.log(`${prefix} ${statusIcon} ${task.name}`);
      
      if (task.children && task.children.length > 0) {
        this.outputTaskTree(task.children, indent + 2);
      }
    });
  }

  /**
   * Claude Code 特有:输出命令行提示
   */
  outputCommand(command: string, description?: string): void {
    console.log('\n' + chalk.gray('┌─────────────────────────'));
    if (description) {
      console.log(chalk.gray('│ ') + chalk.yellow(description));
    }
    console.log(chalk.gray('│ $') + ' ' + chalk.cyan(command));
    console.log(chalk.gray('└─────────────────────────'));
  }
}