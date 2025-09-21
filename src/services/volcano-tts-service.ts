/**
 * 火山引擎TTS服务
 * 豆包语音合成大模型API
 */

import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

export interface VolcanoTTSConfig {
  appId: string;
  accessToken: string;
  secretKey?: string;
  apiUrl?: string;
  wsUrl?: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;        // 音色ID
  speed?: number;        // 语速 0.5-2.0
  volume?: number;       // 音量 0-1
  pitch?: number;        // 音调
  emotion?: string;      // 情绪
  format?: 'mp3' | 'wav' | 'pcm';  // 音频格式
}

export interface TTSResponse {
  code: number;
  message: string;
  data?: {
    audioUrl?: string;
    audioBase64?: string;
    duration?: number;
  };
}

export class VolcanoTTSService {
  private config: VolcanoTTSConfig;
  private httpClient: AxiosInstance;
  private tempDir: string;

  constructor(config: VolcanoTTSConfig) {
    this.config = {
      ...config,
      apiUrl: config.apiUrl || 'https://openspeech.bytedance.com/api/v1/tts',
      wsUrl: config.wsUrl || 'wss://openspeech.bytedance.com/api/v1/tts/ws_binary'
    };

    this.tempDir = path.join(process.cwd(), 'temp', 'volcano-tts');
    fs.ensureDirSync(this.tempDir);

    this.httpClient = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer; ${this.config.accessToken}`
      }
    });
  }

  /**
   * 生成语音（HTTP接口）
   */
  async synthesize(request: TTSRequest): Promise<string> {
    const outputPath = path.join(this.tempDir, `tts_${Date.now()}.${request.format || 'mp3'}`);

    try {
      const payload = {
        app: {
          appid: this.config.appId,
          token: this.config.accessToken,
          cluster: 'volcano_tts'
        },
        user: {
          uid: 'movieflow_user'
        },
        audio: {
          voice_type: request.voice || 'BV700',  // 默认使用通用女声
          encoding: request.format || 'mp3',
          speed_ratio: request.speed || 1.0,
          volume_ratio: request.volume || 1.0,
          pitch_ratio: request.pitch || 1.0,
          emotion: request.emotion
        },
        request: {
          reqid: this.generateRequestId(),
          text: request.text,
          text_type: 'plain',
          operation: 'query'
        }
      };

      const response = await this.httpClient.post('', payload);

      if (response.data.code === 0 && response.data.data) {
        // 如果返回的是base64音频数据
        if (response.data.data.audio) {
          const audioBuffer = Buffer.from(response.data.data.audio, 'base64');
          await fs.writeFile(outputPath, audioBuffer);
          return outputPath;
        }
        // 如果返回的是音频URL
        else if (response.data.data.audio_url) {
          // 下载音频文件
          const audioResponse = await axios.get(response.data.data.audio_url, {
            responseType: 'arraybuffer'
          });
          await fs.writeFile(outputPath, audioResponse.data);
          return outputPath;
        }
      }

      throw new Error(`TTS合成失败: ${response.data.message || '未知错误'}`);

    } catch (error: any) {
      console.error('火山引擎TTS错误:', error.message);
      throw error;
    }
  }

  /**
   * 流式生成语音（WebSocket接口）
   */
  async synthesizeStream(request: TTSRequest): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(this.tempDir, `tts_stream_${Date.now()}.${request.format || 'mp3'}`);
      const writeStream = fs.createWriteStream(outputPath);

      const ws = new WebSocket(this.config.wsUrl!, {
        headers: {
          'Authorization': `Bearer; ${this.config.accessToken}`
        }
      });

      const payload = {
        app: {
          appid: this.config.appId,
          token: this.config.accessToken,
          cluster: 'volcano_tts'
        },
        user: {
          uid: 'movieflow_user'
        },
        audio: {
          voice_type: request.voice || 'BV700',
          encoding: request.format || 'mp3',
          speed_ratio: request.speed || 1.0,
          volume_ratio: request.volume || 1.0,
          pitch_ratio: request.pitch || 1.0
        },
        request: {
          reqid: this.generateRequestId(),
          text: request.text,
          text_type: 'plain',
          operation: 'submit'
        }
      };

      ws.on('open', () => {
        // 发送请求
        ws.send(JSON.stringify(payload));
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.code === 0 && message.data?.audio) {
            // 写入音频数据
            const audioBuffer = Buffer.from(message.data.audio, 'base64');
            writeStream.write(audioBuffer);
          } else if (message.code !== 0) {
            reject(new Error(`TTS错误: ${message.message}`));
            ws.close();
          }

          // 检查是否结束
          if (message.data?.is_end) {
            writeStream.end();
            ws.close();
            resolve(outputPath);
          }
        } catch (error) {
          // 如果不是JSON，可能是二进制音频数据
          writeStream.write(data);
        }
      });

      ws.on('error', (error) => {
        writeStream.end();
        reject(error);
      });

      ws.on('close', () => {
        writeStream.end();
      });
    });
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
          voice,
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
      // 通用音色
      { id: 'BV700', name: '通用女声', description: '温柔自然的女声' },
      { id: 'BV701', name: '通用男声', description: '稳重大气的男声' },
      { id: 'BV702', name: '活泼女声', description: '年轻活泼的女声' },
      { id: 'BV703', name: '新闻男声', description: '专业的新闻播音男声' },

      // 情感音色
      { id: 'BV704', name: '温柔女声', description: '温柔甜美的女声' },
      { id: 'BV705', name: '激情男声', description: '充满激情的男声' },
      { id: 'BV706', name: '童声', description: '可爱的童声' },

      // 方言音色
      { id: 'BV707', name: '粤语女声', description: '标准粤语女声' },
      { id: 'BV708', name: '四川话男声', description: '四川方言男声' },

      // 英文音色
      { id: 'BV709', name: '英文女声', description: '流利的英文女声' },
      { id: 'BV710', name: '英文男声', description: '标准的英文男声' }
    ];
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `movieflow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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

  /**
   * 生成签名（如果需要）
   */
  private generateSignature(payload: any): string {
    if (!this.config.secretKey) {
      return '';
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.random().toString(36).substring(2, 15);
    const message = `${this.config.appId}${timestamp}${nonce}${JSON.stringify(payload)}`;

    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(message)
      .digest('hex');
  }
}

export default VolcanoTTSService;