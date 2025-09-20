import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios from 'axios';
import { VolcanoEngineClient, SubmitTaskRequest, TaskResponse } from '../../src/services/volcano-engine-client';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VolcanoEngineClient', () => {
  let client: VolcanoEngineClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn()
        }
      }
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create = jest.fn(() => mockAxiosInstance) as any;

    // Create client
    client = new VolcanoEngineClient('test-access-key', 'test-secret-key');
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://visual.volcengineapi.com',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    });

    it('should set up request interceptor', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });
  });

  describe('submitTextToVideoTask', () => {
    it('should submit text to video task with default parameters', async () => {
      const mockResponse: TaskResponse = {
        code: 10000,
        data: {
          task_id: 'task-123',
          status: 'in_queue'
        },
        message: 'Success',
        request_id: 'req-123',
        status: 200,
        time_elapsed: '100ms'
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

      const request: SubmitTaskRequest = {
        prompt: 'A beautiful sunset'
      };

      const result = await client.submitTextToVideoTask(request);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31',
        {
          req_key: 'jimeng_ti2v_v30_pro',
          prompt: 'A beautiful sunset',
          frames: 241,
          aspect_ratio: '9:16',
          seed: -1
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should submit with custom parameters', async () => {
      const mockResponse: TaskResponse = {
        code: 10000,
        data: {
          task_id: 'task-456'
        },
        message: 'Success',
        request_id: 'req-456',
        status: 200,
        time_elapsed: '120ms'
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

      const request: SubmitTaskRequest = {
        prompt: 'A dancing robot',
        frames: 121,
        aspect_ratio: '16:9',
        seed: 42
      };

      const result = await client.submitTextToVideoTask(request);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31',
        {
          req_key: 'jimeng_ti2v_v30_pro',
          prompt: 'A dancing robot',
          frames: 121,
          aspect_ratio: '16:9',
          seed: 42
        }
      );
    });

    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      mockAxiosInstance.post.mockRejectedValueOnce(new Error(errorMessage));

      const request: SubmitTaskRequest = {
        prompt: 'Test prompt'
      };

      await expect(client.submitTextToVideoTask(request)).rejects.toThrow(errorMessage);
    });
  });

  describe('submitImageToVideoTask', () => {
    it('should submit image to video task with image URLs', async () => {
      const mockResponse: TaskResponse = {
        code: 10000,
        data: {
          task_id: 'img-task-123'
        },
        message: 'Success',
        request_id: 'req-789',
        status: 200,
        time_elapsed: '150ms'
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

      const request: SubmitTaskRequest = {
        prompt: 'Animate this image',
        image_urls: ['https://example.com/image1.jpg']
      };

      const result = await client.submitImageToVideoTask(request);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31',
        {
          req_key: 'jimeng_ti2v_v30_pro',
          prompt: 'Animate this image',
          frames: 241,
          aspect_ratio: '9:16',
          seed: -1,
          image_urls: ['https://example.com/image1.jpg']
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should submit with base64 image data', async () => {
      const mockResponse: TaskResponse = {
        code: 10000,
        data: {
          task_id: 'base64-task-123'
        },
        message: 'Success',
        request_id: 'req-base64',
        status: 200,
        time_elapsed: '200ms'
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

      const request: SubmitTaskRequest = {
        prompt: 'Animate this base64 image',
        binary_data_base64: ['data:image/png;base64,iVBORw0KGgo...']
      };

      const result = await client.submitImageToVideoTask(request);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/?Action=CVSync2AsyncSubmitTask&Version=2022-08-31',
        expect.objectContaining({
          binary_data_base64: ['data:image/png;base64,iVBORw0KGgo...']
        })
      );
    });
  });

  describe('getTaskResult', () => {
    it('should query task status', async () => {
      const mockResponse: TaskResponse = {
        code: 10000,
        data: {
          task_id: 'task-123',
          status: 'generating'
        },
        message: 'Success',
        request_id: 'req-status',
        status: 200,
        time_elapsed: '50ms'
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await client.getTaskResult('task-123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/?Action=CVSync2AsyncGetResult&Version=2022-08-31',
        {
          req_key: 'jimeng_ti2v_v30_pro',
          task_id: 'task-123'
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('waitForTask', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should wait for task completion and return video URL', async () => {
      // Mock responses: first generating, then done
      mockAxiosInstance.post
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: { status: 'generating' }
          }
        })
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: { status: 'generating' }
          }
        })
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: {
              status: 'done',
              video_url: 'https://example.com/video.mp4'
            }
          }
        });

      const promise = client.waitForTask('task-123', 60000, 100);

      // Fast-forward time
      for (let i = 0; i < 3; i++) {
        await jest.runOnlyPendingTimersAsync();
        await Promise.resolve(); // Allow promises to resolve
      }

      const result = await promise;
      expect(result).toBe('https://example.com/video.mp4');
    });

    it('should throw error when task not found', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          code: 10000,
          data: { status: 'not_found' }
        }
      });

      await expect(client.waitForTask('task-404')).rejects.toThrow('任务未找到');
    });

    it('should throw error when task expired', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          code: 10000,
          data: { status: 'expired' }
        }
      });

      await expect(client.waitForTask('task-expired')).rejects.toThrow('任务已过期');
    });

    it('should throw error on API error code', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          code: 50500,
          message: 'Internal Error'
        }
      });

      await expect(client.waitForTask('task-error')).rejects.toThrow('API错误: Internal Error');
    });

    it('should throw error when task completes without video URL', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          code: 10000,
          data: { status: 'done' }
          // No video_url
        }
      });

      await expect(client.waitForTask('task-no-url')).rejects.toThrow('任务完成但没有返回视频URL');
    });

    it('should timeout after max wait time', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          code: 10000,
          data: { status: 'generating' }
        }
      });

      const promise = client.waitForTask('task-timeout', 1000, 100);

      // Fast-forward past timeout
      await jest.advanceTimersByTimeAsync(1500);

      await expect(promise).rejects.toThrow('任务超时');
    });
  });

  describe('batchSubmitTasks', () => {
    it('should submit multiple tasks with delay', async () => {
      jest.useFakeTimers();

      const tasks: SubmitTaskRequest[] = [
        { prompt: 'Task 1' },
        { prompt: 'Task 2' },
        { prompt: 'Task 3' }
      ];

      mockAxiosInstance.post
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: { task_id: 'task-1' }
          }
        })
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: { task_id: 'task-2' }
          }
        })
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: { task_id: 'task-3' }
          }
        });

      const promise = client.batchSubmitTasks(tasks);

      // Process all timers
      for (let i = 0; i < tasks.length; i++) {
        await jest.runOnlyPendingTimersAsync();
      }

      const result = await promise;

      expect(result).toEqual(['task-1', 'task-2', 'task-3']);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });

    it('should throw error if task submission fails', async () => {
      jest.useFakeTimers();

      const tasks: SubmitTaskRequest[] = [
        { prompt: 'Task 1' }
      ];

      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          code: 10000,
          // No task_id
        }
      });

      const promise = client.batchSubmitTasks(tasks);
      await jest.runOnlyPendingTimersAsync();

      await expect(promise).rejects.toThrow('提交任务失败：未返回task_id');

      jest.useRealTimers();
    });
  });

  describe('batchWaitForTasks', () => {
    it('should wait for multiple tasks in parallel', async () => {
      jest.useFakeTimers();

      const taskIds = ['task-1', 'task-2', 'task-3'];

      // Mock successful completions for all tasks
      mockAxiosInstance.post
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: {
              status: 'done',
              video_url: 'video1.mp4'
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: {
              status: 'done',
              video_url: 'video2.mp4'
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: {
              status: 'done',
              video_url: 'video3.mp4'
            }
          }
        });

      const promise = client.batchWaitForTasks(taskIds);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result).toEqual(['video1.mp4', 'video2.mp4', 'video3.mp4']);

      jest.useRealTimers();
    });

    it('should handle partial failures', async () => {
      jest.useFakeTimers();

      const taskIds = ['task-1', 'task-2'];

      mockAxiosInstance.post
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: {
              status: 'done',
              video_url: 'video1.mp4'
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            code: 10000,
            data: {
              status: 'not_found'
            }
          }
        });

      const promise = client.batchWaitForTasks(taskIds);
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result).toEqual(['video1.mp4', '']);

      jest.useRealTimers();
    });
  });

  describe('handleErrorCode', () => {
    it('should return correct error messages for known codes', () => {
      expect(client.handleErrorCode(10000)).toBe('请求成功');
      expect(client.handleErrorCode(50411)).toBe('输入图片前审核未通过');
      expect(client.handleErrorCode(50412)).toBe('输入文本前审核未通过');
      expect(client.handleErrorCode(50429)).toBe('QPS超限，请稍后重试');
      expect(client.handleErrorCode(50500)).toBe('内部错误');
    });

    it('should return unknown error for unrecognized codes', () => {
      expect(client.handleErrorCode(99999)).toBe('未知错误: 99999');
    });
  });
});