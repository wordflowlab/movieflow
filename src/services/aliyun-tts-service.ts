/**
 * 阿里云TTS服务
 * 智能语音交互 - 语音合成API
 */

import axios, { AxiosInstance } from 'axios';
import fs from 'fs-extra';
import path from 'path';

export interface AliyunTTSConfig {
  appKey: string;
  token: string;
  apiUrl?: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;        // 发音人
  speed?: number;        // 语速 -500~500
  volume?: number;       // 音量 0~100
  pitch?: number;        // 音调 -500~500
  format?: 'mp3' | 'wav' | 'pcm';  // 音频格式
  sampleRate?: number;   // 采样率
}

export class AliyunTTSService {
  private config: AliyunTTSConfig;
  private httpClient: AxiosInstance;
  private tempDir: string;

  constructor(config: AliyunTTSConfig) {
    this.config = {
      ...config,
      apiUrl: config.apiUrl || 'https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/tts'
    };

    this.tempDir = path.join(process.cwd(), 'temp', 'aliyun-tts');
    fs.ensureDirSync(this.tempDir);

    this.httpClient = axios.create({
      timeout: 30000,
      responseType: 'arraybuffer'  // 重要：音频数据是二进制
    });
  }

  /**
   * 生成语音（HTTP GET接口）
   */
  async synthesize(request: TTSRequest): Promise<string> {
    const outputPath = path.join(
      this.tempDir,
      `tts_${Date.now()}.${request.format || 'mp3'}`
    );

    try {
      // URL编码文本
      const encodedText = encodeURIComponent(request.text)
        .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

      // 构建请求URL
      let url = `${this.config.apiUrl}?appkey=${this.config.appKey}`;
      url += `&token=${this.config.token}`;
      url += `&text=${encodedText}`;
      url += `&format=${request.format || 'mp3'}`;
      url += `&sample_rate=${request.sampleRate || 16000}`;

      // 可选参数
      if (request.voice) {
        url += `&voice=${request.voice}`;
      }
      if (request.volume !== undefined) {
        url += `&volume=${Math.round(request.volume)}`;
      }
      if (request.speed !== undefined) {
        // 阿里云语速范围是-500~500
        url += `&speech_rate=${Math.round(request.speed)}`;
      }
      if (request.pitch !== undefined) {
        url += `&pitch_rate=${Math.round(request.pitch)}`;
      }

      console.log(`🎯 调用阿里云TTS: ${request.text.substring(0, 30)}...`);

      // 发送GET请求
      const response = await this.httpClient.get(url, {
        headers: {
          'Accept': 'audio/mpeg'
        }
      });

      // 检查响应类型
      const contentType = response.headers['content-type'];
      if (contentType && (contentType.includes('audio') || contentType.includes('octet-stream'))) {
        // 保存音频文件
        await fs.writeFile(outputPath, response.data);
        console.log(`✅ 阿里云TTS成功生成: ${outputPath}`);
        return outputPath;
      } else {
        // 如果不是音频，可能是错误信息
        const errorText = Buffer.from(response.data).toString('utf-8');
        throw new Error(`TTS失败: ${errorText}`);
      }

    } catch (error: any) {
      console.error('阿里云TTS错误:', error.message);

      if (error.response) {
        const errorData = Buffer.from(error.response.data).toString('utf-8');
        console.error('错误详情:', errorData);
      }

      throw error;
    }
  }

  /**
   * 生成语音（HTTP POST接口）- 支持更多参数
   */
  async synthesizePost(request: TTSRequest): Promise<string> {
    const outputPath = path.join(
      this.tempDir,
      `tts_${Date.now()}.${request.format || 'mp3'}`
    );

    try {
      // 构建请求体
      const payload = {
        appkey: this.config.appKey,
        token: this.config.token,
        text: request.text,
        format: request.format || 'mp3',
        sample_rate: request.sampleRate || 16000,
        voice: request.voice || 'xiaoyun',
        volume: request.volume || 50,
        speech_rate: request.speed || 0,
        pitch_rate: request.pitch || 0
      };

      console.log(`🎯 调用阿里云TTS (POST): ${request.text.substring(0, 30)}...`);

      // 发送POST请求
      const response = await this.httpClient.post(this.config.apiUrl!, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      });

      // 检查响应类型
      const contentType = response.headers['content-type'];
      if (contentType && (contentType.includes('audio') || contentType.includes('octet-stream'))) {
        // 保存音频文件
        await fs.writeFile(outputPath, response.data);
        console.log(`✅ 阿里云TTS成功生成: ${outputPath}`);
        return outputPath;
      } else {
        // 如果不是音频，可能是错误信息
        const errorText = Buffer.from(response.data).toString('utf-8');
        throw new Error(`TTS失败: ${errorText}`);
      }

    } catch (error: any) {
      console.error('阿里云TTS错误:', error.message);

      if (error.response) {
        const errorData = Buffer.from(error.response.data).toString('utf-8');
        console.error('错误详情:', errorData);
      }

      throw error;
    }
  }

  /**
   * 批量生成语音
   */
  async batchSynthesize(texts: string[], voice?: string): Promise<string[]> {
    const results: string[] = [];

    for (const text of texts) {
      try {
        const audioPath = await this.synthesize({
          text,
          voice: voice || 'xiaoyun',
          format: 'mp3'
        });
        results.push(audioPath);

        // 避免请求过快
        await this.delay(500);
      } catch (error) {
        console.error(`生成失败: ${text.substring(0, 30)}...`);
        results.push('');
      }
    }

    return results;
  }

  /**
   * 获取可用音色列表
   */
  getAvailableVoices(): Array<{id: string, name: string, description: string}> {
    return [
      // 标准音色
      { id: 'xiaoyun', name: '小云', description: '标准女声，默认音色' },
      { id: 'xiaogang', name: '小刚', description: '标准男声' },
      { id: 'xiaomeng', name: '小梦', description: '甜美女声' },
      { id: 'xiaowei', name: '小威', description: '磁性男声' },

      // 精品音色
      { id: 'aiyue', name: '艾悦', description: '温柔女声' },
      { id: 'aixia', name: '艾夏', description: '活泼女声' },
      { id: 'aida', name: '艾达', description: '标准男声' },
      { id: 'aijia', name: '艾佳', description: '标准女声' },
      { id: 'aimei', name: '艾美', description: '甜美女声' },
      { id: 'aiyu', name: '艾雨', description: '自然女声' },

      // 方言音色
      { id: 'xiaoxue', name: '小雪', description: '粤语女声' },
      { id: 'dahu', name: '大虎', description: '东北话男声' },
      { id: 'erya', name: '儿雅', description: '儿童音' },

      // 英文音色
      { id: 'harry', name: 'Harry', description: '英音男声' },
      { id: 'abby', name: 'Abby', description: '美音女声' },
      { id: 'andy', name: 'Andy', description: '美音男声' },
      { id: 'eric', name: 'Eric', description: '英音男声' },
      { id: 'emily', name: 'Emily', description: '英音女声' }
    ];
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清理临时文件
   */
  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);

        // 删除超过1小时的文件
        if (now - stats.mtimeMs > 3600000) {
          await fs.remove(filePath);
        }
      }
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }
}

export default AliyunTTSService;