/**
 * 提示词质量验证器
 * 用于L0级验证，分析和优化视频生成提示词
 */

export interface PromptAnalysis {
  score: number;
  hasSceneDesc: boolean;
  hasCharacter: boolean;
  hasAction: boolean;
  hasStyle: boolean;
  hasDetail: boolean;
  length: number;
  suggestions: string[];
}

export class PromptValidator {
  private sceneKeywords = [
    '场景', '背景', '环境', '室内', '室外', '房间', '街道', '山', '水', '天空',
    '寺庙', '花园', '办公室', '教室', '商场', '公园', '森林', '海边', '城市'
  ];

  private characterKeywords = [
    '人', '男', '女', '孩子', '老人', '和尚', '僧人', '唐僧', '角色',
    '穿', '戴', '身着', '服装', '衣服', '表情', '面部', '头发', '眼睛'
  ];

  private actionKeywords = [
    '走', '跑', '坐', '站', '说', '做', '动作', '表情', '微笑', '哭泣',
    '跳', '飞', '打', '推', '拉', '举', '放', '拿', '看', '听', '想'
  ];

  private styleKeywords = [
    '风格', '画风', '写实', '卡通', 'Q版', '动漫', '电影感', '质感',
    '色调', '明亮', '暗淡', '温暖', '冷色', '高对比', '柔和', '梦幻'
  ];

  private detailKeywords = [
    '细节', '纹理', '光影', '阴影', '反射', '透明', '质地', '材质',
    '金属', '木质', '布料', '皮肤', '头发', '水面', '云层', '烟雾'
  ];

  /**
   * 分析提示词质量
   */
  analyze(prompt: string): PromptAnalysis {
    const analysis: PromptAnalysis = {
      score: 25, // 基础分
      hasSceneDesc: false,
      hasCharacter: false,
      hasAction: false,
      hasStyle: false,
      hasDetail: false,
      length: prompt.length,
      suggestions: []
    };

    // 检查场景描述
    analysis.hasSceneDesc = this.sceneKeywords.some(k => prompt.includes(k));
    if (analysis.hasSceneDesc) {
      analysis.score += 20;
    } else {
      analysis.suggestions.push('添加具体场景描述（如：古色古香的寺庙、现代办公室）');
    }

    // 检查人物描述
    analysis.hasCharacter = this.characterKeywords.some(k => prompt.includes(k));
    if (analysis.hasCharacter) {
      analysis.score += 20;
    } else {
      analysis.suggestions.push('添加人物外貌和服装描述');
    }

    // 检查动作描述
    analysis.hasAction = this.actionKeywords.some(k => prompt.includes(k));
    if (analysis.hasAction) {
      analysis.score += 15;
    } else {
      analysis.suggestions.push('添加具体动作或表情描述');
    }

    // 检查风格指定
    analysis.hasStyle = this.styleKeywords.some(k => prompt.includes(k));
    if (analysis.hasStyle) {
      analysis.score += 10;
    } else {
      analysis.suggestions.push('指定视觉风格（如：Q版卡通、电影质感）');
    }

    // 检查细节描述
    analysis.hasDetail = this.detailKeywords.some(k => prompt.includes(k));
    if (analysis.hasDetail) {
      analysis.score += 10;
    }

    // 长度评估
    if (prompt.length < 50) {
      analysis.suggestions.push('提示词过短，建议增加到100-200字');
      analysis.score = Math.max(0, analysis.score - 10);
    } else if (prompt.length > 500) {
      analysis.suggestions.push('提示词过长，建议精简到200-300字');
      analysis.score = Math.max(0, analysis.score - 5);
    } else if (prompt.length >= 100 && prompt.length <= 300) {
      // 理想长度
      analysis.score = Math.min(100, analysis.score + 10);
    }

    // 确保分数在0-100范围内
    analysis.score = Math.max(0, Math.min(100, analysis.score));

    return analysis;
  }

  /**
   * 优化提示词
   */
  optimize(prompt: string): string {
    const analysis = this.analyze(prompt);
    let optimizedPrompt = prompt;

    // 如果缺少场景描述，添加通用场景
    if (!analysis.hasSceneDesc) {
      optimizedPrompt = `温馨明亮的室内环境，${optimizedPrompt}`;
    }

    // 如果缺少风格，添加默认风格
    if (!analysis.hasStyle) {
      optimizedPrompt += '，高清画质，电影级质感';
    }

    // 如果太短，添加更多细节
    if (analysis.length < 100) {
      optimizedPrompt += '，细节丰富，光影效果出色，画面生动';
    }

    return optimizedPrompt;
  }

  /**
   * 生成优化建议
   */
  getSuggestions(prompt: string): string[] {
    const analysis = this.analyze(prompt);
    return analysis.suggestions;
  }

  /**
   * 批量验证提示词
   */
  batchValidate(prompts: string[]): {
    results: PromptAnalysis[];
    avgScore: number;
    commonIssues: string[];
  } {
    const results = prompts.map(p => this.analyze(p));
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    // 统计常见问题
    const issueCount = new Map<string, number>();
    results.forEach(r => {
      r.suggestions.forEach(s => {
        issueCount.set(s, (issueCount.get(s) || 0) + 1);
      });
    });

    // 按出现频率排序
    const commonIssues = Array.from(issueCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([issue]) => issue)
      .slice(0, 5); // 取前5个最常见的问题

    return { results, avgScore, commonIssues };
  }

  /**
   * 生成提示词模板
   */
  generateTemplate(style: 'cartoon' | 'realistic' | 'artistic' = 'cartoon'): string {
    const templates = {
      cartoon: 'Q版卡通风格，{character}在{scene}，{action}，色彩鲜艳，画面温馨可爱，细节丰富',
      realistic: '写实风格，{character}在{scene}，{action}，自然光线，真实质感，4K超清画质',
      artistic: '艺术风格，{character}在{scene}，{action}，独特视角，创意构图，视觉冲击力强'
    };

    return templates[style];
  }

  /**
   * 针对视频生成的特殊优化
   */
  optimizeForVideo(prompt: string, duration: number = 10): string {
    let videoPrompt = prompt;

    // 根据时长添加节奏描述
    if (duration <= 5) {
      videoPrompt += '，快节奏，动作流畅';
    } else if (duration <= 10) {
      videoPrompt += '，节奏适中，动作连贯自然';
    } else {
      videoPrompt += '，慢节奏，画面稳定，细节展现充分';
    }

    // 添加视频特定的要求
    if (!prompt.includes('镜头') && !prompt.includes('视角')) {
      videoPrompt += '，正面视角';
    }

    if (!prompt.includes('动') && !prompt.includes('静')) {
      videoPrompt += '，轻微动态效果';
    }

    return videoPrompt;
  }
}

export default PromptValidator;