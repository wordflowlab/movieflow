/**
 * UniAPI 客户端
 * 用于调用 UniAPI 的图像生成服务（L1级预览）
 * 支持 FLUX、DALL-E 3、MidJourney 等模型
 */

import axios, { AxiosInstance } from 'axios';
import { SceneConfig } from './preview-service';

export interface UniAPIConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  aspect_ratio?: string;
  quality?: string;
  style?: string;
}

export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url: string;
  }>;
}

export class UniAPIClient {
  private client: AxiosInstance;
  private model: string;
  private apiKey: string;

  constructor(apiKey?: string, config?: Partial<UniAPIConfig>) {
    this.apiKey = apiKey || process.env.UNIAPI_KEY || '';
    this.model = config?.model || 'flux-kontext-pro';

    this.client = axios.create({
      baseURL: config?.baseUrl || 'https://api.uniapi.io/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60秒超时
    });
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== '';
  }

  /**
   * 生成关键帧图像
   */
  async generateKeyframes(scenes: SceneConfig[]): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('UniAPI未配置，请设置UNIAPI_KEY环境变量');
    }

    console.log(`  🎨 使用UniAPI ${this.model} 模型生成图像...`);
    const imageUrls: string[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      console.log(`    生成场景 ${i + 1}/${scenes.length}: ${scene.id}`);

      try {
        const imageUrl = await this.generateImage({
          prompt: scene.prompt,
          aspect_ratio: '9:16' // 抖音竖屏格式
        });
        imageUrls.push(imageUrl);
        console.log(`    ✅ 场景 ${scene.id} 生成成功`);
      } catch (error) {
        console.error(`    ❌ 场景 ${scene.id} 生成失败:`, error);
        throw error;
      }

      // 避免请求过快
      if (i < scenes.length - 1) {
        await this.delay(1000); // 延迟1秒
      }
    }

    return imageUrls;
  }

  /**
   * 生成单张图像
   */
  async generateImage(params: {
    prompt: string;
    model?: string;
    aspect_ratio?: string;
    style?: string;
    quality?: string;
  }): Promise<string> {
    const request: ImageGenerationRequest = {
      model: params.model || this.model,
      prompt: this.enhancePrompt(params.prompt),
      n: 1,
      aspect_ratio: params.aspect_ratio || '9:16',
      style: params.style || 'vivid',
      quality: params.quality || 'standard'
    };

    try {
      const response = await this.client.post<ImageGenerationResponse>(
        '/images/generations',
        request
      );

      if (response.data?.data?.[0]?.url) {
        return response.data.data[0].url;
      } else {
        throw new Error('UniAPI返回格式错误');
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || '未知错误';

        if (status === 401) {
          throw new Error('UniAPI认证失败，请检查API密钥');
        } else if (status === 429) {
          throw new Error('UniAPI请求频率限制，请稍后重试');
        } else if (status === 400) {
          throw new Error(`UniAPI请求参数错误: ${message}`);
        } else {
          throw new Error(`UniAPI错误 [${status}]: ${message}`);
        }
      } else if (error.request) {
        throw new Error('UniAPI网络请求失败，请检查网络连接');
      } else {
        throw error;
      }
    }
  }

  /**
   * 增强提示词（为图像生成优化）
   */
  private enhancePrompt(prompt: string): string {
    // 如果提示词太短，添加一些通用的质量描述
    if (prompt.length < 50) {
      prompt += ', high quality, detailed, professional';
    }

    // 如果是中文提示词，保持原样（UniAPI支持中文）
    // 但可以添加一些质量标记
    if (!/[a-zA-Z]/.test(prompt)) {
      prompt += '，高质量，细节丰富';
    }

    return prompt;
  }

  /**
   * 获取模型列表
   */
  async getModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/models');
      const models = response.data?.data || [];

      // 筛选出图像生成模型
      const imageModels = models
        .filter((m: any) => m.id.includes('flux') ||
                           m.id.includes('dall-e') ||
                           m.id.includes('midjourney'))
        .map((m: any) => m.id);

      return imageModels;
    } catch (error) {
      console.error('获取模型列表失败:', error);
      return ['flux-kontext-pro', 'dall-e-3', 'midjourney']; // 返回默认列表
    }
  }

  /**
   * 切换模型
   */
  setModel(model: string): void {
    this.model = model;
    console.log(`  切换到模型: ${model}`);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 批量生成图像（带重试机制）
   */
  async batchGenerate(
    prompts: string[],
    options: {
      maxRetries?: number;
      retryDelay?: number;
      concurrency?: number;
    } = {}
  ): Promise<string[]> {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 2000;
    const concurrency = options.concurrency || 2; // 同时请求数

    const results: string[] = [];

    // 分批处理
    for (let i = 0; i < prompts.length; i += concurrency) {
      const batch = prompts.slice(i, i + concurrency);
      const batchPromises = batch.map(async (prompt) => {
        let lastError: Error | null = null;

        for (let retry = 0; retry < maxRetries; retry++) {
          try {
            return await this.generateImage({ prompt });
          } catch (error: any) {
            lastError = error;
            console.log(`    重试 ${retry + 1}/${maxRetries}...`);
            await this.delay(retryDelay * (retry + 1)); // 指数退避
          }
        }

        throw lastError;
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }
}

export default UniAPIClient;