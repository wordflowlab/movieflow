/**
 * Windsurf AI 助手适配器
 * 优化 Windsurf 的输出格式
 */

import { AIAssistantAdapter, ProgressData } from './base-adapter';
import chalk from 'chalk';

export class WindsurfAdapter extends AIAssistantAdapter {
  private waveChars = ['≈', '∽', '≋', '∽', '≈'];
  private waveIndex = 0;

  constructor() {
    super('Windsurf', true);
  }

  outputProgress(data: ProgressData): void {
    this.throttleOutput(() => {
      let output = '';

      switch (data.type) {
        case 'task_start':
          // Windsurf 风格:海洋主题
          output = `\n🌊 启动: ${data.taskName || '任务'}\n`;
          if (data.detail) {
            output += `  🎯 ${data.detail}\n`;
          }
          this.startHeartbeat(data.taskName);
          break;

        case 'task_progress':
          const wave = this.waveChars[this.waveIndex++ % this.waveChars.length];
          const progressBar = this.createProgressBar(data.progress || 0, 20);
          
          // Windsurf 风格的进度显示
          output = `${wave} ${data.taskName} ${progressBar} ${data.progress || 0}%`;
          
          if (data.current && data.total) {
            output += ` (${data.current}/${data.total})`;
          }
          
          if (data.eta) {
            output += ` | ETA: ${this.formatTime(data.eta)}`;
          }
          
          output += '\n';
          
          if (data.message) {
            output += `  ↳ ${chalk.cyan(data.message)}\n`;
          }
          break;

        case 'task_complete':
          this.stopHeartbeat();
          output = `🎉 完成: ${data.taskName || '任务'}`;
          if (data.message) {
            output += `\n  ✓ ${chalk.green(data.message)}`;
          }
          output += '\n';
          break;

        case 'task_error':
          this.stopHeartbeat();
          output = `🌊⚠️  失败: ${data.taskName || '任务'}`;
          if (data.message) {
            output += `\n  ✗ ${chalk.red(data.message)}`;
          }
          output += '\n';
          break;

        case 'heartbeat':
          // Windsurf 心跳:海浪动画
          const waveAnimation = this.waveChars.join('');
          output = `\r${waveAnimation} [Windsurf] ${data.message || '处理中,请稍候...'}`;
          break;
      }

      if (output) {
        process.stdout.write(output);
      }
    });
  }

  outputStructured(data: any): void {
    // Windsurf 使用特殊的海洋主题分隔符
    console.log('\n🌊'.repeat(10));
    console.log(JSON.stringify(data, null, 2));
    console.log('🌊'.repeat(10) + '\n');
  }

  outputMessage(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const icons = {
      info: '🌊',
      success: '🎉',
      warning: '⚠️ ',
      error: '🌀'
    };

    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };

    const icon = icons[level];
    const color = colors[level];
    
    console.log(`${icon} ${color(message)}`);
  }

  clearPreviousOutput(): void {
    // Windsurf 支持清除输出
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
   * Windsurf 特有:输出任务流程图
   */
  outputWorkflow(stages: Array<{name: string, status: 'pending' | 'active' | 'done'}>): void {
    console.log('\n🌊 Workflow Progress:');
    
    const flow = stages.map((stage, index) => {
      const icon = {
        pending: '○',
        active: '🌊',
        done: '✓'
      }[stage.status];
      
      const color = {
        pending: chalk.gray,
        active: chalk.cyan,
        done: chalk.green
      }[stage.status];
      
      return color(`${icon} ${stage.name}`);
    }).join(' → ');
    
    console.log(`  ${flow}`);
    console.log('');
  }

  /**
   * Windsurf 特有:输出波浪分隔线
   */
  outputWaveSeparator(): void {
    console.log(chalk.cyan('∽'.repeat(50)));
  }
}