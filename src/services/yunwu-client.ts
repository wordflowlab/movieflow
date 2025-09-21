/**
 * 云雾API 客户端
 * 用于调用云雾API的图像生成服务（L1级预览备选方案）
 * 支持 FLUX、豆包、Stable Diffusion 等模型
 */

import axios, { AxiosInstance } from 'axios';
import { SceneConfig } from './preview-service';

export interface YunwuAPIConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface YunwuImageRequest {
  model: string;
  prompt: string;
  n?: number;
  aspect_ratio?: string;
  response_format?: string;
  user?: string;
}

export interface YunwuImageResponse {
  created: number;
  data: Array<{
    url: string;
  }>;
}

export class YunwuAPIClient {
  private client: AxiosInstance;
  private model: string;
  private apiKey: string;

  constructor(apiKey?: string, config?: Partial<YunwuAPIConfig>) {
    this.apiKey = apiKey || process.env.YUNWU_API_KEY || '';
    this.model = config?.model || 'flux-pro'; // 默认使用FLUX Pro

    this.client = axios.create({
      baseURL: config?.baseUrl || 'https://yunwu.ai/v1',
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
      throw new Error('云雾API未配置，请设置YUNWU_API_KEY环境变量');
    }

    console.log(`  🎨 使用云雾API ${this.model} 模型生成图像...`);
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
  }): Promise<string> {
    const request: YunwuImageRequest = {
      model: params.model || this.model,
      prompt: this.enhancePrompt(params.prompt, params.style),
      n: 1,
      aspect_ratio: params.aspect_ratio || '9:16',
      response_format: 'url'
    };

    try {
      const response = await this.client.post<YunwuImageResponse>(
        '/images/generations',
        request
      );

      if (response.data?.data?.[0]?.url) {
        return response.data.data[0].url;
      } else {
        throw new Error('云雾API返回格式错误');
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || '未知错误';

        if (status === 401) {
          throw new Error('云雾API认证失败，请检查API密钥');
        } else if (status === 429) {
          throw new Error('云雾API请求频率限制，请稍后重试');
        } else if (status === 400) {
          throw new Error(`云雾API请求参数错误: ${message}`);
        } else if (status === 402) {
          throw new Error('云雾API余额不足，请充值');
        } else {
          throw new Error(`云雾API错误 [${status}]: ${message}`);
        }
      } else if (error.request) {
        throw new Error('云雾API网络请求失败，请检查网络连接');
      } else {
        throw error;
      }
    }
  }

  /**
   * 增强提示词（针对云雾API优化）
   */
  private enhancePrompt(prompt: string, style?: string): string {
    // 云雾API对中文支持较好，保持原始语言
    let enhancedPrompt = prompt;

    // 根据风格添加特定标签
    if (style === 'cartoon') {
      enhancedPrompt += '，Q版卡通风格，可爱画风';
    } else if (style === 'realistic') {
      enhancedPrompt += '，超写实风格，照片级真实感';
    } else if (style === 'artistic') {
      enhancedPrompt += '，艺术风格，创意构图';
    }

    // 如果没有明确的质量描述，添加默认质量标记
    if (!prompt.includes('质量') && !prompt.includes('画质')) {
      enhancedPrompt += '，高清画质，细节丰富';
    }

    return enhancedPrompt;
  }

  /**
   * 获取可用模型列表
   */
  async getAvailableModels(): Promise<string[]> {
    // 云雾API支持的图像生成模型
    return [
      'flux-pro',           // FLUX Pro
      'flux-dev',           // FLUX Dev
      'flux-schnell',       // FLUX Schnell
      'doubao-pro',         // 豆包Pro
      'doubao-standard',    // 豆包标准
      'sd-xl',              // Stable Diffusion XL
      'midjourney-v6',      // MidJourney V6
      'dall-e-3'            // DALL-E 3
    ];
  }

  /**
   * 切换模型
   */
  setModel(model: string): void {
    this.model = model;
    console.log(`  切换到模型: ${model}`);
  }

  /**
   * 获取账户余额
   */
  async getBalance(): Promise<number> {
    try {
      const response = await this.client.get('/user/balance');
      return response.data?.balance || 0;
    } catch (error) {
      console.error('获取余额失败:', error);
      return 0;
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 批量生成图像（优化版）
   */
  async batchGenerate(
    prompts: string[],
    options: {
      maxRetries?: number;
      retryDelay?: number;
      concurrency?: number;
      checkBalance?: boolean;
    } = {}
  ): Promise<string[]> {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 2000;
    const concurrency = options.concurrency || 2;

    // 检查余额（可选）
    if (options.checkBalance) {
      const balance = await this.getBalance();
      const estimatedCost = prompts.length * 0.5; // 估计每张0.5元
      if (balance < estimatedCost) {
        throw new Error(`余额不足：当前余额 ${balance} 元，预计需要 ${estimatedCost} 元`);
      }
    }

    const results: string[] = [];

    // 分批处理
    for (let i = 0; i < prompts.length; i += concurrency) {
      const batch = prompts.slice(i, i + concurrency);
      const batchPromises = batch.map(async (prompt, index) => {
        let lastError: Error | null = null;

        for (let retry = 0; retry < maxRetries; retry++) {
          try {
            return await this.generateImage({ prompt });
          } catch (error: any) {
            lastError = error;

            // 如果是余额不足，直接退出
            if (error.message?.includes('余额不足')) {
              throw error;
            }

            console.log(`    批次${i / concurrency + 1}-项${index + 1} 重试 ${retry + 1}/${maxRetries}...`);
            await this.delay(retryDelay * Math.pow(2, retry)); // 指数退避
          }
        }

        throw lastError;
      });

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        console.log(`    ✅ 批次 ${i / concurrency + 1} 完成，已生成 ${results.length}/${prompts.length} 张图像`);
      } catch (error) {
        console.error(`    ❌ 批次 ${i / concurrency + 1} 失败:`, error);
        throw error;
      }

      // 批次间延迟，避免触发频率限制
      if (i + concurrency < prompts.length) {
        await this.delay(2000);
      }
    }

    return results;
  }

  /**
   * 图像编辑（云雾API特有功能）
   */
  async editImage(params: {
    image_url: string;
    prompt: string;
    mask_url?: string;
  }): Promise<string> {
    try {
      const response = await this.client.post('/images/edit', {
        image: params.image_url,
        prompt: params.prompt,
        mask: params.mask_url,
        n: 1
      });

      if (response.data?.data?.[0]?.url) {
        return response.data.data[0].url;
      } else {
        throw new Error('云雾API编辑返回格式错误');
      }
    } catch (error) {
      console.error('图像编辑失败:', error);
      throw error;
    }
  }
}

export default YunwuAPIClient;