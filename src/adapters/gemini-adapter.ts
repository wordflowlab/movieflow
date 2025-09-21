/**
 * Gemini AI 助手适配器
 * 优化 Gemini 的输出格式
 */

import { AIAssistantAdapter, ProgressData } from './base-adapter';

export class GeminiAdapter extends AIAssistantAdapter {
  private starChars = ['✶', '✷', '✸', '✹'];
  private starIndex = 0;

  constructor() {
    super('Gemini', true);
  }

  outputProgress(data: ProgressData): void {
    this.throttleOutput(() => {
      let output = '';

      switch (data.type) {
        case 'task_start':
          // Gemini 风格:星空主题
          output = `\n✨ Starting: ${data.taskName || 'Task'}\n`;
          if (data.detail) {
            output += `  ❯ ${data.detail}\n`;
          }
          this.startHeartbeat(data.taskName);
          break;

        case 'task_progress':
          const star = this.starChars[this.starIndex++ % this.starChars.length];
          const percentage = data.progress || 0;
          
          // Gemini 喜欢结构化的输出
          output = `${star} Progress: ${data.taskName}\n`;
          output += `  [进度] ${percentage}%`;
          
          if (data.current && data.total) {
            output += ` | 步骤: ${data.current}/${data.total}`;
          }
          
          if (data.eta) {
            output += ` | 预计: ${this.formatTime(data.eta)}`;
          }
          
          if (data.message) {
            output += `\n  [状态] ${data.message}`;
          }
          
          output += '\n';
          break;

        case 'task_complete':
          this.stopHeartbeat();
          output = `✅ Complete: ${data.taskName || 'Task'}`;
          if (data.message) {
            output += `\n  → ${data.message}`;
          }
          output += '\n';
          break;

        case 'task_error':
          this.stopHeartbeat();
          output = `⛔ Error: ${data.taskName || 'Task'}`;
          if (data.message) {
            output += `\n  → ${data.message}`;
          }
          output += '\n';
          break;

        case 'heartbeat':
          // Gemini 心跳:星星动画
          const stars = this.starChars.join(' ');
          output = `\r${stars} [Gemini] ${data.message || 'Processing...'}`;
          break;
      }

      if (output) {
        process.stdout.write(output);
      }
    });
  }

  outputStructured(data: any): void {
    // Gemini 喜欢明确的结构化数据
    console.log('\n```json');
    console.log(JSON.stringify(data, null, 2));
    console.log('```\n');
  }

  outputMessage(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const icons = {
      info: '📌',
      success: '✨',
      warning: '⚠️',
      error: '⛔'
    };

    const labels = {
      info: 'INFO',
      success: 'SUCCESS',
      warning: 'WARNING',
      error: 'ERROR'
    };

    console.log(`${icons[level]} [${labels[level]}] ${message}`);
  }

  clearPreviousOutput(): void {
    // Gemini 不清除输出,保持完整日志
  }

  getFormatOptions() {
    return {
      useColors: false,  // Gemini 使用纯文本
      useEmojis: true,
      useProgress: true,
      useSpinner: true
    };
  }

  /**
   * Gemini 特有:输出任务摘要
   */
  outputSummary(summary: {
    totalTasks: number;
    completed: number;
    failed: number;
    duration: number;
    details?: string[];
  }): void {
    console.log('\n' + '='.repeat(40));
    console.log('✨ Task Summary:');
    console.log(`  Total Tasks: ${summary.totalTasks}`);
    console.log(`  Completed: ${summary.completed}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log(`  Duration: ${this.formatTime(summary.duration)}`);
    
    if (summary.details && summary.details.length > 0) {
      console.log('\n  Details:');
      summary.details.forEach((detail, index) => {
        console.log(`    ${index + 1}. ${detail}`);
      });
    }
    
    console.log('='.repeat(40) + '\n');
  }

  /**
   * Gemini 特有:输出步骤指导
   */
  outputSteps(steps: string[]): void {
    console.log('\n📋 Steps to follow:');
    steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    console.log('');
  }
}