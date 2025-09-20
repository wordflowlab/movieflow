/**
 * 火山引擎即梦AI API客户端
 * 实现视频生成的异步任务提交和状态查询
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface SubmitTaskRequest {
  prompt: string;
  frames?: number;           // 帧数：121(5秒) 或 241(10秒)
  aspect_ratio?: string;      // 宽高比：16:9, 4:3, 1:1, 3:4, 9:16, 21:9
  seed?: number;              // 随机种子，-1为随机
  binary_data_base64?: string[]; // base64编码的图片（图生视频）
  image_urls?: string[];      // 图片URL（图生视频）
}

export interface TaskResponse {
  code: number;
  data?: {
    task_id?: string;
    status?: 'in_queue' | 'generating' | 'done' | 'not_found' | 'expired';
    video_url?: string;
  };
  message: string;
  request_id: string;
  status: number;
  time_elapsed: string;
}

export class VolcanoEngineClient {
  private client: AxiosInstance;
  private accessKey: string;
  private secretKey: string;
  private region: string = 'cn-north-1';
  private service: string = 'cv';
  private baseUrl: string = 'https://visual.volcengineapi.com';

  constructor(accessKey: string, secretKey: string) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // 添加请求拦截器来签名请求
    this.client.interceptors.request.use((config) => {
      // 添加火山引擎签名（简化版，实际需要完整的签名算法）
      config.headers['Region'] = this.region;
      config.headers['Service'] = this.service;
      // TODO: 实现完整的火山引擎签名算法
      return config;
    });
  }

  /**
   * 提交文本生成视频任务
   */
  async submitTextToVideoTask(request: SubmitTaskRequest): Promise<TaskResponse> {
    const body = {
      req_key: 'jimeng_ti2v_v30_pro',  // 固定值
      prompt: request.prompt,
      frames: request.frames || 241,    // 默认10秒
      aspect_ratio: request.aspect_ratio || '9:16',  // 默认抖音竖屏
      seed: request.seed || -1
    };

    try {
      const response = await this.client.post(
        '/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31',
        body
      );
      return response.data;
    } catch (error) {
      console.error('提交任务失败:', error);
      throw error;
    }
  }

  /**
   * 提交图片生成视频任务（首帧）
   */
  async submitImageToVideoTask(request: SubmitTaskRequest): Promise<TaskResponse> {
    const body = {
      req_key: 'jimeng_ti2v_v30_pro',
      prompt: request.prompt,
      frames: request.frames || 241,
      aspect_ratio: request.aspect_ratio || '9:16',
      seed: request.seed || -1,
      ...(request.binary_data_base64 && { binary_data_base64: request.binary_data_base64 }),
      ...(request.image_urls && { image_urls: request.image_urls })
    };

    try {
      const response = await this.client.post(
        '/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31',
        body
      );
      return response.data;
    } catch (error) {
      console.error('提交图生视频任务失败:', error);
      throw error;
    }
  }

  /**
   * 查询任务状态
   */
  async getTaskResult(taskId: string): Promise<TaskResponse> {
    const body = {
      req_key: 'jimeng_ti2v_v30_pro',
      task_id: taskId
    };

    try {
      const response = await this.client.post(
        '/?Action=CVSync2AsyncGetResult&Version=2022-08-31',
        body
      );
      return response.data;
    } catch (error) {
      console.error('查询任务状态失败:', error);
      throw error;
    }
  }

  /**
   * 等待任务完成（带轮询）
   */
  async waitForTask(
    taskId: string,
    maxWaitTime: number = 300000,  // 最长等待5分钟
    pollInterval: number = 5000     // 每5秒查询一次
  ): Promise<string> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.getTaskResult(taskId);

      if (result.code !== 10000) {
        throw new Error(`API错误: ${result.message}`);
      }

      const status = result.data?.status;

      if (status === 'done') {
        if (result.data?.video_url) {
          return result.data.video_url;
        } else {
          throw new Error('任务完成但没有返回视频URL');
        }
      } else if (status === 'not_found' || status === 'expired') {
        throw new Error(`任务${status === 'not_found' ? '未找到' : '已过期'}`);
      }

      // 等待后继续轮询
      await this.delay(pollInterval);
    }

    throw new Error('任务超时');
  }

  /**
   * 批量提交任务
   */
  async batchSubmitTasks(requests: SubmitTaskRequest[]): Promise<string[]> {
    const taskIds: string[] = [];

    for (const request of requests) {
      const response = await this.submitTextToVideoTask(request);
      if (response.data?.task_id) {
        taskIds.push(response.data.task_id);
      } else {
        throw new Error('提交任务失败：未返回task_id');
      }

      // 避免触发限流，延迟一下
      await this.delay(1000);
    }

    return taskIds;
  }

  /**
   * 批量等待任务完成
   */
  async batchWaitForTasks(taskIds: string[]): Promise<string[]> {
    const videoUrls: string[] = [];

    // 并行等待所有任务
    const promises = taskIds.map(taskId => this.waitForTask(taskId));
    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        videoUrls.push(result.value);
      } else {
        console.error('任务失败:', result.reason);
        videoUrls.push(''); // 占位，保持顺序
      }
    }

    return videoUrls;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 处理API错误码
   */
  handleErrorCode(code: number): string {
    const errorMap: Record<number, string> = {
      10000: '请求成功',
      50411: '输入图片前审核未通过',
      50412: '输入文本前审核未通过',
      50413: '输入文本含敏感词、版权词等审核不通过',
      50429: 'QPS超限，请稍后重试',
      50430: '并发超限，请稍后重试',
      50500: '内部错误',
      50501: '内部算法错误',
      50511: '输出图片后审核未通过',
      50512: '输出文本后审核未通过'
    };

    return errorMap[code] || `未知错误: ${code}`;
  }
}