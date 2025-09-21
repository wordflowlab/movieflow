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
        'Authorization': `Bearer;${this.config.accessToken}`
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
          token: 'fake_token',  // 文档说明：无实际鉴权作用的Fake token，可传任意非空字符串
          cluster: 'volcano_tts'
        },
        user: {
          uid: 'movieflow_user'
        },
        audio: {
          voice_type: request.voice || 'zh_female_cancan_mars_bigtts',  // 使用大模型音色
          encoding: request.format || 'mp3',
          speed_ratio: request.speed || 1.0,
          volume_ratio: request.volume || 1.0
          // 注意：pitch_ratio不支持，emotion需要enable_emotion=true
        },
        request: {
          reqid: this.generateRequestId(),
          text: request.text,
          operation: 'query'  // HTTP只能使用query
        }
      };

      const response = await this.httpClient.post('', payload);

      if (response.data.code === 3000 && response.data.data) {  // 成功码是3000
        // 如果返回的是base64音频数据
        if (response.data.data) {
          const audioBuffer = Buffer.from(response.data.data, 'base64');
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
          'Authorization': `Bearer;${this.config.accessToken}`
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
          voice_type: request.voice || 'zh_female_cancan_mars_bigtts',
          encoding: request.format || 'mp3',
          speed_ratio: request.speed || 1.0,
          volume_ratio: request.volume || 1.0
        },
        request: {
          reqid: this.generateRequestId(),
          text: request.text,
          operation: 'submit'  // WebSocket使用submit流式返回
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
      // 大模型音色（推荐）
      { id: 'zh_female_cancan_mars_bigtts', name: '灿灿-女声', description: '温柔自然的女声' },
      { id: 'zh_male_M392_conversation_wvae_bigtts', name: '男声-对话', description: '自然对话男声' },
      { id: 'zh_female_shuangkuaisisi_moon_bigtts', name: '思思-女声', description: '活泼可爱的女声' },
      { id: 'zh_male_chunhou_moon_bigtts', name: '醇厚男声', description: '醇厚磁性的男声' },

      // 传统音色（兼容）
      { id: 'BV700_streaming', name: '通用女声', description: '温柔自然的女声' },
      { id: 'BV001_streaming', name: '通用男声', description: '稳重大气的男声' },
      { id: 'BV002_streaming', name: '活泼女声', description: '年轻活泼的女声' },

      // 多语种音色
      { id: 'zh_female_qingxin_moon_bigtts', name: '清新女声', description: '清新甜美的女声' },
      { id: 'zh_male_wennuan_moon_bigtts', name: '温暖男声', description: '温暖亲切的男声' }
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