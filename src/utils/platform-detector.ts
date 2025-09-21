/**
 * AI 助手平台检测器
 * 自动检测当前运行环境的 AI 助手平台
 */

import { AIAssistantAdapter } from '../adapters/base-adapter';
import { ClaudeAdapter } from '../adapters/claude-adapter';
import { CursorAdapter } from '../adapters/cursor-adapter';
import { WindsurfAdapter } from '../adapters/windsurf-adapter';
import { GeminiAdapter } from '../adapters/gemini-adapter';

export type AIPlatform = 'claude' | 'cursor' | 'windsurf' | 'gemini' | 'unknown';

export class PlatformDetector {
  private static instance: PlatformDetector;
  private detectedPlatform: AIPlatform = 'unknown';
  private adapter: AIAssistantAdapter | null = null;

  private constructor() {
    this.detectPlatform();
  }

  static getInstance(): PlatformDetector {
    if (!PlatformDetector.instance) {
      PlatformDetector.instance = new PlatformDetector();
    }
    return PlatformDetector.instance;
  }

  /**
   * 检测当前平台
   */
  private detectPlatform(): void {
    // 检查环境变量
    const env = process.env;
    
    // 1. 优先检查显式设置的平台
    if (env.MOVIEFLOW_AI_PLATFORM) {
      this.detectedPlatform = env.MOVIEFLOW_AI_PLATFORM.toLowerCase() as AIPlatform;
      return;
    }

    // 2. Claude Code 检测
    if (env.CLAUDE_CODE || env.ANTHROPIC_API_KEY || 
        env.USER?.includes('claude') || 
        env.TERM_PROGRAM?.toLowerCase().includes('claude')) {
      this.detectedPlatform = 'claude';
      return;
    }

    // 3. Cursor 检测
    if (env.CURSOR_AI || env.CURSOR_API_KEY ||
        env.TERM_PROGRAM?.toLowerCase().includes('cursor') ||
        env.VSCODE_PID && env.CURSOR_WORKSPACE) {
      this.detectedPlatform = 'cursor';
      return;
    }

    // 4. Windsurf 检测
    if (env.WINDSURF_AI || env.WINDSURF_API_KEY ||
        env.TERM_PROGRAM?.toLowerCase().includes('windsurf') ||
        env.WINDSURF_WORKSPACE) {
      this.detectedPlatform = 'windsurf';
      return;
    }

    // 5. Gemini 检测
    if (env.GEMINI_AI || env.GOOGLE_API_KEY ||
        env.TERM_PROGRAM?.toLowerCase().includes('gemini') ||
        env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.detectedPlatform = 'gemini';
      return;
    }

    // 6. 检查命令行参数
    const args = process.argv.join(' ').toLowerCase();
    if (args.includes('claude')) {
      this.detectedPlatform = 'claude';
    } else if (args.includes('cursor')) {
      this.detectedPlatform = 'cursor';
    } else if (args.includes('windsurf')) {
      this.detectedPlatform = 'windsurf';
    } else if (args.includes('gemini')) {
      this.detectedPlatform = 'gemini';
    }

    // 7. 检查特定文件的存在
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Claude Code 特征文件
      if (fs.existsSync(path.join(process.cwd(), '.claude')) ||
          fs.existsSync(path.join(process.cwd(), 'CLAUDE.md'))) {
        this.detectedPlatform = 'claude';
        return;
      }
      
      // Cursor 特征文件
      if (fs.existsSync(path.join(process.cwd(), '.cursor')) ||
          fs.existsSync(path.join(process.cwd(), 'cursor.json'))) {
        this.detectedPlatform = 'cursor';
        return;
      }
      
      // Windsurf 特征文件
      if (fs.existsSync(path.join(process.cwd(), '.windsurf')) ||
          fs.existsSync(path.join(process.cwd(), 'windsurf.config.js'))) {
        this.detectedPlatform = 'windsurf';
        return;
      }
    } catch (error) {
      // 忽略文件系统错误
    }

    // 默认为 unknown
    this.detectedPlatform = 'unknown';
  }

  /**
   * 获取检测到的平台
   */
  getPlatform(): AIPlatform {
    return this.detectedPlatform;
  }

  /**
   * 手动设置平台
   */
  setPlatform(platform: AIPlatform): void {
    this.detectedPlatform = platform;
    this.adapter = null;  // 重置适配器
  }

  /**
   * 获取对应平台的适配器
   */
  getAdapter(): AIAssistantAdapter {
    if (this.adapter) {
      return this.adapter;
    }

    switch (this.detectedPlatform) {
      case 'claude':
        this.adapter = new ClaudeAdapter();
        break;
      case 'cursor':
        this.adapter = new CursorAdapter();
        break;
      case 'windsurf':
        this.adapter = new WindsurfAdapter();
        break;
      case 'gemini':
        this.adapter = new GeminiAdapter();
        break;
      default:
        // 默认使用 Claude 适配器(最全面)
        console.log('⚠️  未检测到特定 AI 平台,使用默认适配器');
        this.adapter = new ClaudeAdapter();
    }

    console.log(`🤖 检测到 AI 平台: ${this.adapter.getPlatform()}`);
    return this.adapter;
  }

  /**
   * 显示平台信息
   */
  showPlatformInfo(): void {
    const adapter = this.getAdapter();
    const options = adapter.getFormatOptions();
    
    console.log('\n' + '='.repeat(50));
    console.log('🤖 AI 平台信息');
    console.log('='.repeat(50));
    console.log(`平台: ${adapter.getPlatform()}`);
    console.log(`交互模式: ${adapter.getIsInteractive() ? '是' : '否'}`);
    console.log(`支持颜色: ${options.useColors ? '是' : '否'}`);
    console.log(`支持 Emoji: ${options.useEmojis ? '是' : '否'}`);
    console.log(`支持进度条: ${options.useProgress ? '是' : '否'}`);
    console.log(`支持动画: ${options.useSpinner ? '是' : '否'}`);
    console.log('='.repeat(50) + '\n');
  }

  /**
   * 获取平台特定的配置建议
   */
  getRecommendedConfig(): {
    maxConcurrency: number;
    heartbeatInterval: number;
    progressInterval: number;
    useDetailedLogs: boolean;
  } {
    switch (this.detectedPlatform) {
      case 'claude':
        return {
          maxConcurrency: 3,
          heartbeatInterval: 10000,  // Claude 需要频繁心跳
          progressInterval: 2000,
          useDetailedLogs: true
        };
      
      case 'cursor':
        return {
          maxConcurrency: 2,
          heartbeatInterval: 15000,
          progressInterval: 3000,
          useDetailedLogs: false  // Cursor 喜欢简洁
        };
      
      case 'windsurf':
        return {
          maxConcurrency: 3,
          heartbeatInterval: 12000,
          progressInterval: 2500,
          useDetailedLogs: true
        };
      
      case 'gemini':
        return {
          maxConcurrency: 2,
          heartbeatInterval: 20000,
          progressInterval: 5000,
          useDetailedLogs: true
        };
      
      default:
        return {
          maxConcurrency: 2,
          heartbeatInterval: 15000,
          progressInterval: 3000,
          useDetailedLogs: true
        };
    }
  }
}