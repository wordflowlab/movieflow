/**
 * E2E测试辅助函数
 */

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { getE2EConfig } from '../config/test.config';

/**
 * 下载文件到本地
 */
export async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * 验证视频文件
 */
export async function validateVideoFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);

    // 检查文件大小（视频文件应该大于100KB）
    if (stats.size < 100 * 1024) {
      return false;
    }

    // 检查文件头（MP4文件的魔术字节）
    const buffer = Buffer.alloc(8);
    const fd = await fs.open(filePath, 'r');
    await fd.read(buffer, 0, 8, 4);
    await fd.close();

    // MP4文件的ftyp box
    const ftypSignature = buffer.toString('ascii', 0, 4);
    return ['ftyp', 'mdat', 'moov'].includes(ftypSignature);
  } catch (error) {
    console.error('验证视频文件失败:', error);
    return false;
  }
}

/**
 * 获取视频时长（秒）
 * 注意：这是一个简化版本，实际需要使用ffprobe或类似工具
 */
export async function getVideoDuration(filePath: string): Promise<number> {
  // 简化实现：基于文件大小估算
  // 实际应该使用 ffprobe
  const stats = await fs.stat(filePath);
  // 假设比特率为 1Mbps
  const estimatedDuration = (stats.size * 8) / (1000 * 1000);
  return Math.round(estimatedDuration);
}

/**
 * 创建测试图片（纯色图片）
 */
export async function createTestImage(
  outputPath: string,
  width: number = 1080,
  height: number = 1920,
  color: string = '#FF0000'
): Promise<string> {
  // 创建一个简单的BMP文件（未压缩）
  // 这是一个极简的实现，实际应该使用图片处理库

  const bmpHeader = Buffer.alloc(54);

  // BMP文件头
  bmpHeader.write('BM');  // 签名
  bmpHeader.writeInt32LE(54 + width * height * 3, 2);  // 文件大小
  bmpHeader.writeInt32LE(0, 6);  // 保留
  bmpHeader.writeInt32LE(54, 10);  // 数据偏移

  // DIB头
  bmpHeader.writeInt32LE(40, 14);  // DIB头大小
  bmpHeader.writeInt32LE(width, 18);  // 宽度
  bmpHeader.writeInt32LE(height, 22);  // 高度
  bmpHeader.writeInt16LE(1, 26);  // 颜色平面
  bmpHeader.writeInt16LE(24, 28);  // 每像素位数
  bmpHeader.writeInt32LE(0, 30);  // 压缩方式
  bmpHeader.writeInt32LE(width * height * 3, 34);  // 图像大小

  // 解析颜色
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  // 创建像素数据
  const pixelData = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    pixelData[i * 3] = b;      // BMP使用BGR顺序
    pixelData[i * 3 + 1] = g;
    pixelData[i * 3 + 2] = r;
  }

  // 写入文件
  await fs.writeFile(outputPath, Buffer.concat([bmpHeader, pixelData]));

  return outputPath;
}

/**
 * 测试重试包装器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      console.log(`重试 ${i + 1}/${maxRetries}: ${error.message}`);

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * 性能计时器
 */
export class PerformanceTimer {
  private startTime: number;
  private marks: Map<string, number>;

  constructor() {
    this.startTime = Date.now();
    this.marks = new Map();
  }

  mark(name: string): void {
    this.marks.set(name, Date.now());
  }

  getDuration(from?: string, to?: string): number {
    const fromTime = from ? this.marks.get(from) || this.startTime : this.startTime;
    const toTime = to ? this.marks.get(to) || Date.now() : Date.now();
    return toTime - fromTime;
  }

  getReport(): string {
    const lines: string[] = ['性能报告:'];
    let prevTime = this.startTime;

    for (const [name, time] of this.marks) {
      const duration = time - prevTime;
      const total = time - this.startTime;
      lines.push(`  ${name}: +${duration}ms (总计: ${total}ms)`);
      prevTime = time;
    }

    const totalDuration = Date.now() - this.startTime;
    lines.push(`总耗时: ${totalDuration}ms`);

    return lines.join('\n');
  }
}

/**
 * 测试数据生成器
 */
export class TestDataGenerator {
  private config = getE2EConfig();

  /**
   * 生成随机提示词
   */
  generatePrompt(style: 'simple' | 'complex' = 'simple'): string {
    const templates = {
      simple: [
        '{subject}在{location}{action}',
        '{time}的{location}，{weather}',
        '{color}的{object}在{environment}'
      ],
      complex: [
        '{character}在{setting}中{action}，{detail}，{mood}氛围',
        '{time}，{location}的{scene}，{camera}拍摄，{style}风格',
        '{subject}的{emotion}瞬间，{environment}背景，{lighting}光线'
      ]
    };

    const data = {
      subject: ['小猫', '小狗', '鸟儿', '蝴蝶', '鱼群'],
      location: ['花园里', '森林中', '海边', '山顶上', '城市里'],
      action: ['玩耍', '奔跑', '飞翔', '休息', '觅食'],
      time: ['清晨', '正午', '黄昏', '夜晚', '日出时分'],
      weather: ['阳光明媚', '细雨绵绵', '雾气缭绕', '雪花飘落'],
      color: ['金色', '蓝色', '绿色', '紫色', '橙色'],
      object: ['花朵', '树叶', '云彩', '湖水', '山峰'],
      environment: ['大自然中', '都市里', '乡村中', '海洋上'],
      character: ['勇敢的骑士', '智慧的法师', '敏捷的刺客', '坚韧的战士'],
      setting: ['古老城堡', '神秘森林', '未来都市', '外星球'],
      detail: ['装备闪闪发光', '魔法能量环绕', '动作流畅自然'],
      mood: ['史诗', '神秘', '欢快', '紧张'],
      scene: ['壮丽景色', '激烈战斗', '宁静时刻', '欢庆场面'],
      camera: ['航拍', '特写', '广角', '慢动作'],
      style: ['电影', '动画', '写实', '梦幻'],
      emotion: ['快乐', '激动', '平静', '专注'],
      lighting: ['柔和', '强烈', '斑驳', '梦幻']
    };

    const template = templates[style][Math.floor(Math.random() * templates[style].length)];

    return template.replace(/{(\w+)}/g, (match, key) => {
      const values = data[key as keyof typeof data];
      return values ? values[Math.floor(Math.random() * values.length)] : match;
    });
  }

  /**
   * 生成测试场景列表
   */
  generateScenes(count: number = 6): Array<{ prompt: string; duration: number }> {
    const scenes = [];

    for (let i = 0; i < count; i++) {
      scenes.push({
        prompt: this.generatePrompt(i % 2 === 0 ? 'simple' : 'complex'),
        duration: 10  // 每个场景10秒
      });
    }

    return scenes;
  }
}