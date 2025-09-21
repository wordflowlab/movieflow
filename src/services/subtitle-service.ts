/**
 * 字幕服务
 * 负责生成 SRT 和 ASS 格式的字幕文件
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export interface SubtitleSegment {
  index: number;
  text: string;
  start: number;    // 开始时间（秒）
  end: number;      // 结束时间（秒）
  style?: string;   // 样式名称（用于 ASS）
}

export interface SubtitleStyle {
  name?: string;
  fontName?: string;
  fontSize?: number;
  primaryColor?: string;   // &H00BBGGRR (ASS 格式)
  secondaryColor?: string;
  outlineColor?: string;
  backColor?: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: number;      // 1-9 (ASS 对齐方式)
  marginL?: number;
  marginR?: number;
  marginV?: number;
}

export interface SubtitleOptions {
  format: 'srt' | 'ass';
  styles?: SubtitleStyle[];
  playResX?: number;  // ASS 视频分辨率
  playResY?: number;
  title?: string;
  encoding?: string;
}

export class SubtitleService {
  private tempDir: string;
  private defaultStyles: Map<string, SubtitleStyle>;

  constructor() {
    // 创建临时目录用于存储字幕文件
    this.tempDir = path.join(os.tmpdir(), 'movieflow-subtitles');
    fs.ensureDirSync(this.tempDir);

    // 初始化默认样式
    this.defaultStyles = this.initializeDefaultStyles();
  }

  /**
   * 初始化默认字幕样式
   */
  private initializeDefaultStyles(): Map<string, SubtitleStyle> {
    const styles = new Map<string, SubtitleStyle>();

    // 默认样式
    styles.set('Default', {
      name: 'Default',
      fontName: '微软雅黑',
      fontSize: 60,
      primaryColor: '&H00FFFFFF',  // 白色
      secondaryColor: '&H000000FF',
      outlineColor: '&H00000000',  // 黑色边框
      backColor: '&H80000000',
      bold: false,
      italic: false,
      alignment: 2,  // 底部居中
      marginL: 10,
      marginR: 10,
      marginV: 50
    });

    // 问题样式（黄色）
    styles.set('Question', {
      name: 'Question',
      fontName: '微软雅黑',
      fontSize: 55,
      primaryColor: '&H00FFFF00',  // 黄色
      secondaryColor: '&H000000FF',
      outlineColor: '&H00000000',
      backColor: '&H80000000',
      bold: true,
      italic: false,
      alignment: 2,
      marginL: 10,
      marginR: 10,
      marginV: 100
    });

    // 标题样式（大字体）
    styles.set('Title', {
      name: 'Title',
      fontName: '微软雅黑',
      fontSize: 80,
      primaryColor: '&H00FFFFFF',
      secondaryColor: '&H000000FF',
      outlineColor: '&H00000000',
      backColor: '&H80000000',
      bold: true,
      italic: false,
      alignment: 5,  // 屏幕中央
      marginL: 10,
      marginR: 10,
      marginV: 0
    });

    // 旁白样式（斜体）
    styles.set('Narration', {
      name: 'Narration',
      fontName: '微软雅黑',
      fontSize: 50,
      primaryColor: '&H00E0E0E0',  // 浅灰色
      secondaryColor: '&H000000FF',
      outlineColor: '&H00000000',
      backColor: '&H80000000',
      bold: false,
      italic: true,
      alignment: 2,
      marginL: 10,
      marginR: 10,
      marginV: 50
    });

    return styles;
  }

  /**
   * 生成字幕文件
   */
  async generateSubtitles(
    segments: SubtitleSegment[],
    options: SubtitleOptions
  ): Promise<string> {
    const filename = `subtitle_${Date.now()}.${options.format}`;
    const outputPath = path.join(this.tempDir, filename);

    let content: string;
    if (options.format === 'srt') {
      content = this.generateSRT(segments);
    } else {
      content = this.generateASS(segments, options);
    }

    await fs.writeFile(outputPath, content, 'utf-8');
    return outputPath;
  }

  /**
   * 生成 SRT 格式字幕
   */
  generateSRT(segments: SubtitleSegment[]): string {
    return segments.map((segment, index) => {
      const startTime = this.formatSRTTime(segment.start);
      const endTime = this.formatSRTTime(segment.end);

      return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
    }).join('\n');
  }

  /**
   * 生成 ASS 格式字幕
   */
  generateASS(
    segments: SubtitleSegment[],
    options: Partial<SubtitleOptions> = {}
  ): string {
    const styles = this.mergeStyles(options.styles);

    let ass = this.generateASSHeader(options);
    ass += this.generateASSStyles(styles);
    ass += this.generateASSEvents(segments);

    return ass;
  }

  /**
   * 生成 ASS 文件头
   */
  private generateASSHeader(options: Partial<SubtitleOptions>): string {
    return `[Script Info]
Title: ${options.title || 'MovieFlow Subtitles'}
ScriptType: v4.00+
PlayResX: ${options.playResX || 1080}
PlayResY: ${options.playResY || 1920}
WrapStyle: 2

`;
  }

  /**
   * 生成 ASS 样式部分
   */
  private generateASSStyles(styles: SubtitleStyle[]): string {
    let styleSection = `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
`;

    for (const style of styles) {
      styleSection += this.formatASSStyle(style) + '\n';
    }

    return styleSection + '\n';
  }

  /**
   * 格式化单个 ASS 样式
   */
  private formatASSStyle(style: SubtitleStyle): string {
    return `Style: ${style.name || 'Default'},${style.fontName || '微软雅黑'},${
      style.fontSize || 60
    },${style.primaryColor || '&H00FFFFFF'},${
      style.secondaryColor || '&H000000FF'
    },${style.outlineColor || '&H00000000'},${
      style.backColor || '&H80000000'
    },${style.bold ? 1 : 0},${style.italic ? 1 : 0},0,0,100,100,0,0,1,2,1,${
      style.alignment || 2
    },${style.marginL || 10},${style.marginR || 10},${
      style.marginV || 50
    },1`;
  }

  /**
   * 生成 ASS 事件（字幕内容）部分
   */
  private generateASSEvents(segments: SubtitleSegment[]): string {
    let eventSection = `[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    for (const segment of segments) {
      const startTime = this.formatASSTime(segment.start);
      const endTime = this.formatASSTime(segment.end);
      const style = segment.style || 'Default';

      // 处理多行文本
      const text = segment.text.replace(/\n/g, '\\N');

      eventSection += `Dialogue: 0,${startTime},${endTime},${style},,0,0,0,,${text}\n`;
    }

    return eventSection;
  }

  /**
   * 合并用户样式和默认样式
   */
  private mergeStyles(userStyles?: SubtitleStyle[]): SubtitleStyle[] {
    const styles: SubtitleStyle[] = [];

    // 添加默认样式
    for (const [, style] of this.defaultStyles) {
      styles.push(style);
    }

    // 添加或覆盖用户样式
    if (userStyles) {
      for (const userStyle of userStyles) {
        const existingIndex = styles.findIndex(
          s => s.name === userStyle.name
        );
        if (existingIndex >= 0) {
          styles[existingIndex] = { ...styles[existingIndex], ...userStyle };
        } else {
          styles.push(userStyle);
        }
      }
    }

    return styles;
  }

  /**
   * 格式化 SRT 时间格式
   */
  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds
      .toString()
      .padStart(3, '0')}`;
  }

  /**
   * 格式化 ASS 时间格式
   */
  private formatASSTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);

    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }

  /**
   * 根据场景内容生成字幕片段
   */
  generateFromScenes(
    scenes: Array<{
      index: number;
      duration: number;
      dialogue?: {
        question?: string;
        answer?: string;
        text?: string;
      };
    }>
  ): SubtitleSegment[] {
    const segments: SubtitleSegment[] = [];
    let currentTime = 0;

    for (const scene of scenes) {
      if (scene.dialogue) {
        // 处理问答格式
        if (scene.dialogue.question && scene.dialogue.answer) {
          // 问题部分（前半段时间）
          segments.push({
            index: segments.length + 1,
            text: scene.dialogue.question,
            start: currentTime,
            end: currentTime + scene.duration / 2,
            style: 'Question'
          });

          // 回答部分（后半段时间）
          segments.push({
            index: segments.length + 1,
            text: scene.dialogue.answer,
            start: currentTime + scene.duration / 2,
            end: currentTime + scene.duration,
            style: 'Default'
          });
        } else if (scene.dialogue.text) {
          // 单一文本
          segments.push({
            index: segments.length + 1,
            text: scene.dialogue.text,
            start: currentTime,
            end: currentTime + scene.duration,
            style: 'Default'
          });
        }
      }

      currentTime += scene.duration;
    }

    return segments;
  }

  /**
   * 智能选择字幕样式
   */
  selectStyle(
    contentType: string,
    emotion?: string
  ): string {
    // 根据内容类型和情绪选择合适的样式
    const styleMap: Record<string, string> = {
      question: 'Question',
      title: 'Title',
      narration: 'Narration',
      dialogue: 'Default',
      // 根据情绪
      exciting: 'Title',
      calm: 'Narration',
      serious: 'Default'
    };

    return styleMap[contentType] || styleMap[emotion || ''] || 'Default';
  }

  /**
   * 导出字幕文件到指定路径
   */
  async exportSubtitle(
    content: string,
    outputPath: string
  ): Promise<void> {
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content, 'utf-8');
  }

  /**
   * 清理临时文件
   */
  async cleanup(): Promise<void> {
    await fs.emptyDir(this.tempDir);
  }

  /**
   * 验证字幕时间轴
   */
  validateTimeline(segments: SubtitleSegment[]): boolean {
    for (let i = 0; i < segments.length - 1; i++) {
      // 检查时间重叠
      if (segments[i].end > segments[i + 1].start) {
        console.warn(
          `字幕时间重叠: 片段 ${i + 1} 结束时间 ${segments[i].end} > 片段 ${
            i + 2
          } 开始时间 ${segments[i + 1].start}`
        );
        return false;
      }

      // 检查时间有效性
      if (segments[i].start >= segments[i].end) {
        console.warn(
          `无效的字幕时间: 片段 ${i + 1} 开始时间 ${
            segments[i].start
          } >= 结束时间 ${segments[i].end}`
        );
        return false;
      }
    }

    return true;
  }
}