/**
 * 模拟火山引擎服务 - 用于本地调试，零成本
 */

import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

export interface MockConfig {
  enabled: boolean;
  mockDelay?: number;  // 模拟延迟
  mockVideos?: string[]; // 使用预制视频
  logPrompts?: boolean; // 记录提示词
}

export class MockVolcanoService {
  private config: MockConfig;
  private promptsLog: string;

  constructor(config: MockConfig = { enabled: true }) {
    this.config = config;
    this.promptsLog = path.join(process.cwd(), 'prompts-debug.log');

    if (this.config.enabled) {
      console.log('🎭 MockVolcano服务已启用 - 零成本调试模式');
    }
  }

  /**
   * 模拟提交任务
   */
  async submitTask(request: any): Promise<any> {
    // 记录提示词
    if (this.config.logPrompts) {
      await this.logPrompt(request);
    }

    // 分析提示词质量
    const analysis = this.analyzePrompt(request.prompt);
    console.log('\n📝 提示词分析：');
    console.log(`  - 长度: ${analysis.length} 字符`);
    console.log(`  - 场景描述: ${analysis.hasSceneDesc ? '✅' : '❌'}`);
    console.log(`  - 人物描述: ${analysis.hasCharacter ? '✅' : '❌'}`);
    console.log(`  - 动作描述: ${analysis.hasAction ? '✅' : '❌'}`);
    console.log(`  - 风格指定: ${analysis.hasStyle ? '✅' : '❌'}`);
    console.log(`  - 质量评分: ${analysis.score}/100`);

    if (analysis.suggestions.length > 0) {
      console.log('\n💡 优化建议：');
      analysis.suggestions.forEach((s: string) => console.log(`  - ${s}`));
    }

    // 模拟延迟
    if (this.config.mockDelay) {
      await this.delay(this.config.mockDelay);
    }

    // 返回模拟任务ID
    return {
      code: 10000,
      message: 'success',
      data: {
        task_id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };
  }

  /**
   * 模拟查询任务状态
   */
  async getTaskResult(taskId: string): Promise<any> {
    // 模拟进度
    const progress = Math.min(100, Math.floor(Math.random() * 30) + 70);

    // 如果有预制视频，返回预制视频
    if (this.config.mockVideos && this.config.mockVideos.length > 0) {
      const videoPath = this.config.mockVideos[0];
      return {
        code: 10000,
        message: 'success',
        data: {
          status: 'SUCCESS',
          progress: 100,
          video_url: `file://${path.resolve(videoPath)}`
        }
      };
    }

    // 返回占位视频URL
    return {
      code: 10000,
      message: 'success',
      data: {
        status: progress === 100 ? 'SUCCESS' : 'PROCESSING',
        progress: progress,
        video_url: progress === 100 ? 'https://example.com/mock-video.mp4' : null
      }
    };
  }

  /**
   * 分析提示词质量
   */
  private analyzePrompt(prompt: string): any {
    const analysis = {
      length: prompt.length,
      hasSceneDesc: false,
      hasCharacter: false,
      hasAction: false,
      hasStyle: false,
      score: 0,
      suggestions: [] as string[]
    };

    // 检查场景描述
    const sceneKeywords = ['场景', '背景', '环境', '室内', '室外', '房间', '街道'];
    analysis.hasSceneDesc = sceneKeywords.some(k => prompt.includes(k));
    if (!analysis.hasSceneDesc) {
      analysis.suggestions.push('添加具体场景描述（如：现代办公室、古代寺庙）');
    }

    // 检查人物描述
    const characterKeywords = ['人', '男', '女', '和尚', '穿', '戴', '身着'];
    analysis.hasCharacter = characterKeywords.some(k => prompt.includes(k));
    if (!analysis.hasCharacter) {
      analysis.suggestions.push('添加人物外貌和服装描述');
    }

    // 检查动作描述
    const actionKeywords = ['走', '跑', '坐', '站', '说', '做', '动作', '表情'];
    analysis.hasAction = actionKeywords.some(k => prompt.includes(k));
    if (!analysis.hasAction) {
      analysis.suggestions.push('添加具体动作或表情描述');
    }

    // 检查风格指定
    const styleKeywords = ['风格', '画风', '写实', '卡通', '动漫', '电影感', '质感'];
    analysis.hasStyle = styleKeywords.some(k => prompt.includes(k));
    if (!analysis.hasStyle) {
      analysis.suggestions.push('指定视觉风格（如：电影质感、动漫风格）');
    }

    // 长度建议
    if (prompt.length < 50) {
      analysis.suggestions.push('提示词过短，建议增加到100-200字');
    } else if (prompt.length > 500) {
      analysis.suggestions.push('提示词过长，建议精简到200-300字');
    }

    // 计算得分
    let score = 25;
    if (analysis.hasSceneDesc) score += 25;
    if (analysis.hasCharacter) score += 25;
    if (analysis.hasAction) score += 15;
    if (analysis.hasStyle) score += 10;

    // 长度得分
    if (prompt.length >= 100 && prompt.length <= 300) {
      score = Math.min(100, score + 10);
    }

    analysis.score = score;

    return analysis;
  }

  /**
   * 记录提示词到文件
   */
  private async logPrompt(request: any): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      prompt: request.prompt,
      params: {
        model_version: request.model_version,
        frames: request.frames,
        aspect_ratio: request.aspect_ratio
      }
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(this.promptsLog, logLine);
  }

  /**
   * 生成最优提示词建议
   */
  generateOptimalPrompt(scene: any): string {
    const templates = {
      interview: '现代简约办公室，落地窗透入柔和阳光。{character}坐在人体工学椅上，{action}。背景虚化的城市天际线，专业摄影，电影质感，4K画质。',
      outdoor: '繁华都市街道，{time}的光线。{character}在人群中{action}。霓虹灯光斑驳，景深效果，电影级调色，超现实细节。',
      fantasy: '古风寺庙大殿，香烟缭绕。{character}身着{costume}，{action}。金色佛像庄严，光影交错，史诗级画面，8K渲染。'
    };

    // 根据场景选择模板
    let template = templates.interview; // 默认模板

    // 替换变量
    const optimizedPrompt = template
      .replace('{character}', scene.character || '一位穿着袈裟的和尚')
      .replace('{action}', scene.action || '双手合十，表情平和')
      .replace('{costume}', scene.costume || '橙色袈裟')
      .replace('{time}', scene.time || '黄昏时分');

    return optimizedPrompt;
  }

  /**
   * 批量测试提示词
   */
  async batchTestPrompts(prompts: string[]): Promise<void> {
    console.log('\n🧪 批量测试提示词（零成本）\n');

    const results = [];
    for (let i = 0; i < prompts.length; i++) {
      console.log(`测试 ${i + 1}/${prompts.length}:`);
      const analysis = this.analyzePrompt(prompts[i]);
      results.push({
        prompt: prompts[i].substring(0, 50) + '...',
        score: analysis.score,
        issues: analysis.suggestions
      });
    }

    // 输出测试报告
    console.log('\n📊 测试报告：');
    results.sort((a, b) => b.score - a.score);
    results.forEach((r, i) => {
      console.log(`\n${i + 1}. 得分: ${r.score}/100`);
      console.log(`   提示词: ${r.prompt}`);
      if (r.issues.length > 0) {
        console.log(`   问题: ${r.issues.join('; ')}`);
      }
    });

    // 保存报告
    await fs.writeJson(
      path.join(process.cwd(), 'prompt-test-report.json'),
      results,
      { spaces: 2 }
    );
    console.log('\n✅ 报告已保存到 prompt-test-report.json');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MockVolcanoService;