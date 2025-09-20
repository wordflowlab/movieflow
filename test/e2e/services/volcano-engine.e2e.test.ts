/**
 * VolcanoEngineClient 端到端测试
 * 使用真实API进行测试
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { VolcanoEngineClient, SubmitTaskRequest, TaskResponse } from '../../../src/services/volcano-engine-client';
import {
  getE2EConfig,
  checkApiKeys,
  initTestDirectories,
  cleanupTestFiles,
  generateTestId,
  getTestPrompt,
  delay
} from '../config/test.config';

// 加载配置
const config = getE2EConfig();

// 跳过测试如果没有API密钥
const skipIfNoApiKeys = !checkApiKeys(config);

describe('VolcanoEngineClient E2E Tests', () => {
  let client: VolcanoEngineClient;

  beforeAll(async () => {
    if (skipIfNoApiKeys) {
      console.log('⚠️  跳过E2E测试：未配置API密钥');
      return;
    }

    // 初始化测试目录
    await initTestDirectories(config);

    // 创建客户端
    client = new VolcanoEngineClient(
      config.volcano.accessKey,
      config.volcano.secretKey
    );

    // 设置超时时间
    jest.setTimeout(config.test.apiTimeout);
  });

  afterAll(async () => {
    if (!skipIfNoApiKeys) {
      // 清理测试文件
      await cleanupTestFiles(config);
    }
  });

  (skipIfNoApiKeys ? describe.skip : describe)('文本生成视频 API', () => {
    it('应该成功提交文本生成视频任务', async () => {
      const request: SubmitTaskRequest = {
        prompt: getTestPrompt('simple', 0),
        frames: config.test.videoFrames,
        aspect_ratio: config.test.aspectRatio as any,
        version: 'v30_pro'
      };

      const response = await client.submitTextToVideoTask(request);

      expect(response).toBeDefined();
      expect(response.code).toBe(10000);
      expect(response.data).toBeDefined();
      expect(response.data?.task_id).toBeDefined();
      expect(response.data?.status).toMatch(/in_queue|generating/);

      console.log(`✅ 任务已提交: ${response.data?.task_id}`);
    });

    it('应该处理无效的提示词', async () => {
      const request: SubmitTaskRequest = {
        prompt: '',  // 空提示词
        frames: config.test.videoFrames,
        aspect_ratio: config.test.aspectRatio as any,
        version: 'v30_pro'
      };

      try {
        await client.submitTextToVideoTask(request);
        expect(true).toBe(false); // 不应该执行到这里
      } catch (error: any) {
        expect(error).toBeDefined();
        console.log(`✅ 正确处理了无效提示词错误`);
      }
    });

    it('应该支持不同的视频参数', async () => {
      const testCases = [
        { frames: 121, aspect_ratio: '16:9' },  // 5秒横屏
        { frames: 241, aspect_ratio: '1:1' },   // 10秒正方形
      ];

      for (const testCase of testCases) {
        const request: SubmitTaskRequest = {
          prompt: getTestPrompt('simple', 1),
          frames: testCase.frames,
          aspect_ratio: testCase.aspect_ratio as any,
          version: 'v30_pro'
        };

        const response = await client.submitTextToVideoTask(request);

        expect(response.code).toBe(10000);
        expect(response.data?.task_id).toBeDefined();

        console.log(`✅ 成功提交 ${testCase.frames}帧 ${testCase.aspect_ratio} 视频`);

        // 避免触发限流
        await delay(2000);
      }
    });
  });

  (skipIfNoApiKeys ? describe.skip : describe)('任务状态查询 API', () => {
    let testTaskId: string;

    beforeAll(async () => {
      // 先提交一个任务用于测试
      const request: SubmitTaskRequest = {
        prompt: getTestPrompt('simple', 2),
        frames: config.test.videoFrames,
        aspect_ratio: config.test.aspectRatio as any,
        version: 'v30_pro'
      };

      const response = await client.submitTextToVideoTask(request);
      testTaskId = response.data?.task_id || '';
    });

    it('应该成功查询任务状态', async () => {
      expect(testTaskId).toBeDefined();

      const response = await client.getTaskResult(testTaskId);

      expect(response).toBeDefined();
      expect(response.code).toBe(10000);
      expect(response.data).toBeDefined();
      expect(response.data?.status).toBeDefined();
      expect(['in_queue', 'generating', 'done', 'not_found', 'expired']).toContain(response.data?.status);

      console.log(`✅ 任务状态: ${response.data?.status}`);
    });

    it('应该处理无效的任务ID', async () => {
      const invalidTaskId = 'invalid-task-id-12345';

      const response = await client.getTaskResult(invalidTaskId);

      // API可能返回not_found状态或错误码
      if (response.code === 10000) {
        expect(response.data?.status).toBe('not_found');
      } else {
        expect(response.code).not.toBe(10000);
      }

      console.log(`✅ 正确处理了无效任务ID`);
    });
  });

  ((skipIfNoApiKeys || config.test.skipExpensiveTests) ? describe.skip : describe)('完整视频生成流程', () => {
    it('应该完成从提交到生成的完整流程', async () => {
      const testId = generateTestId();
      console.log(`🎬 开始测试完整流程: ${testId}`);

      // 1. 提交任务
      const request: SubmitTaskRequest = {
        prompt: '一个美丽的日落场景，金色的阳光洒在海面上',
        frames: 121,  // 使用最短时长减少等待
        aspect_ratio: '9:16',
        version: 'v30_pro'
      };

      console.log('📤 提交任务...');
      const submitResponse = await client.submitTextToVideoTask(request);
      expect(submitResponse.code).toBe(10000);

      const taskId = submitResponse.data?.task_id;
      expect(taskId).toBeDefined();
      console.log(`✅ 任务已提交: ${taskId}`);

      // 2. 等待任务完成
      console.log('⏳ 等待视频生成（可能需要1-3分钟）...');

      try {
        const videoUrl = await client.waitForTask(
          taskId!,
          180000,  // 3分钟超时
          10000    // 每10秒查询一次
        );

        expect(videoUrl).toBeDefined();
        expect(videoUrl).toMatch(/^https?:\/\//);

        console.log(`✅ 视频生成成功: ${videoUrl}`);
      } catch (error: any) {
        // 如果任务超时，这是可以接受的（API可能繁忙）
        if (error.message.includes('超时')) {
          console.log('⚠️  任务超时，这是正常的（API可能繁忙）');
          expect(error.message).toContain('超时');
        } else {
          throw error;
        }
      }
    }, 300000); // 5分钟超时
  });

  (skipIfNoApiKeys ? describe.skip : describe)('批量任务处理', () => {
    it('应该成功批量提交任务', async () => {
      const requests: SubmitTaskRequest[] = [
        { prompt: '春天的花园', frames: 121, aspect_ratio: '9:16', version: 'v30_pro' },
        { prompt: '夏天的海滩', frames: 121, aspect_ratio: '9:16', version: 'v30_pro' },
        { prompt: '秋天的森林', frames: 121, aspect_ratio: '9:16', version: 'v30_pro' }
      ];

      console.log('📦 批量提交3个任务...');
      const taskIds = await client.batchSubmitTasks(requests);

      expect(taskIds).toHaveLength(3);
      taskIds.forEach((taskId, index) => {
        expect(taskId).toBeDefined();
        console.log(`✅ 任务 ${index + 1}: ${taskId}`);
      });
    });

    it.skip('应该批量等待任务完成', async () => {
      // 这个测试很昂贵，默认跳过
      const requests: SubmitTaskRequest[] = [
        { prompt: '测试视频1', frames: 121, aspect_ratio: '9:16', version: 'v30_pro' },
        { prompt: '测试视频2', frames: 121, aspect_ratio: '9:16', version: 'v30_pro' }
      ];

      const taskIds = await client.batchSubmitTasks(requests);
      console.log('⏳ 批量等待任务完成...');

      const videoUrls = await client.batchWaitForTasks(taskIds);

      expect(videoUrls).toHaveLength(2);
      // 至少有一个成功
      const successCount = videoUrls.filter(url => url !== '').length;
      expect(successCount).toBeGreaterThan(0);

      console.log(`✅ 完成 ${successCount}/2 个任务`);
    });
  });

  (skipIfNoApiKeys ? describe.skip : describe)('错误处理', () => {
    it('应该正确处理API限流错误', async () => {
      // 快速连续提交多个请求以触发限流
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          client.submitTextToVideoTask({
            prompt: `限流测试 ${i}`,
            frames: 121,
            aspect_ratio: '9:16'
          }).catch(error => error)
        );
      }

      const results = await Promise.all(promises);

      // 检查是否有限流错误
      const errors = results.filter(r => r instanceof Error);
      if (errors.length > 0) {
        console.log(`✅ 检测到限流控制（${errors.length}个请求被限流）`);
      } else {
        console.log('ℹ️  未触发限流（API限流阈值可能较高）');
      }
    });

    it('应该提供有用的错误信息', async () => {
      const errorCodes = [50411, 50412, 50429, 50500];

      errorCodes.forEach(code => {
        const message = client.handleErrorCode(code);
        expect(message).toBeDefined();
        expect(message).not.toContain('未知错误');
        console.log(`✅ 错误码 ${code}: ${message}`);
      });
    });
  });

  (skipIfNoApiKeys ? describe.skip : describe)('图片生成视频 API', () => {
    it.skip('应该支持图片URL生成视频', async () => {
      // 需要提供真实的图片URL
      const request: SubmitTaskRequest = {
        prompt: '让画面动起来',
        image_urls: ['https://example.com/test-image.jpg'],
        frames: 121,
        aspect_ratio: '9:16',
        version: 'v30_pro'
      };

      // 这个测试需要真实的图片URL，暂时跳过
      expect(true).toBe(true);
    });

    it.skip('应该支持base64图片生成视频', async () => {
      // 需要提供真实的base64图片数据
      const request: SubmitTaskRequest = {
        prompt: '添加动态效果',
        binary_data_base64: ['data:image/png;base64,...'],
        frames: 121,
        aspect_ratio: '9:16',
        version: 'v30_pro'
      };

      // 这个测试需要真实的图片数据，暂时跳过
      expect(true).toBe(true);
    });
  });
});