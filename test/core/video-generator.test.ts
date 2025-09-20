import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { VideoGenerator, GeneratorConfig, GenerateOptions } from '../../src/core/video-generator';
import { VideoSegmentManager } from '../../src/services/segment-manager';
import { VolcanoEngineClient } from '../../src/services/volcano-engine-client';
import { FFmpegService } from '../../src/services/ffmpeg-service';

// Mock all dependencies
jest.mock('../../src/services/segment-manager');
jest.mock('../../src/services/volcano-engine-client');
jest.mock('../../src/services/ffmpeg-service');
jest.mock('fs-extra', () => ({
  ensureDirSync: jest.fn(),
  remove: jest.fn(),
}));
jest.mock('ora', () => ({
  default: jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    text: ''
  }))
}));

const mockedFs = jest.requireMock('fs-extra') as any;
const MockedSegmentManager = VideoSegmentManager as jest.MockedClass<typeof VideoSegmentManager>;
const MockedVolcanoClient = VolcanoEngineClient as jest.MockedClass<typeof VolcanoEngineClient>;
const MockedFFmpegService = FFmpegService as jest.MockedClass<typeof FFmpegService>;

describe('VideoGenerator', () => {
  let generator: VideoGenerator;
  let config: GeneratorConfig;
  let mockSegmentManager: jest.Mocked<VideoSegmentManager>;
  let mockVolcanoClient: jest.Mocked<VolcanoEngineClient>;
  let mockFFmpegService: jest.Mocked<FFmpegService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup fs mocks
    mockedFs.ensureDirSync.mockReset();
    mockedFs.remove.mockReset();
    mockedFs.remove.mockResolvedValue(undefined);

    // Create mock instances
    mockSegmentManager = {
      createSegments: jest.fn(),
      getNextBatch: jest.fn(),
      isAllCompleted: jest.fn(),
      hasFailedSegments: jest.fn(),
      getFailedSegments: jest.fn(),
      resetFailedSegments: jest.fn(),
      updateSegment: jest.fn(),
      getProgress: jest.fn(),
      getAllSegments: jest.fn(),
      getCompletedVideoUrls: jest.fn(),
      getStatusSummary: jest.fn()
    } as any;

    mockVolcanoClient = {
      submitTextToVideoTask: jest.fn(),
      submitImageToVideoTask: jest.fn(),
      getTaskResult: jest.fn(),
      waitForTask: jest.fn(),
      batchSubmitTasks: jest.fn(),
      batchWaitForTasks: jest.fn(),
      handleErrorCode: jest.fn()
    } as any;

    mockFFmpegService = {
      checkFFmpeg: jest.fn(),
      downloadVideo: jest.fn(),
      mergeVideos: jest.fn(),
      addTransitions: jest.fn(),
      resizeVideo: jest.fn(),
      addBackgroundMusic: jest.fn(),
      cleanup: jest.fn()
    } as any;

    // Setup constructor mocks
    MockedSegmentManager.mockImplementation(() => mockSegmentManager);
    MockedVolcanoClient.mockImplementation(() => mockVolcanoClient);
    MockedFFmpegService.mockImplementation(() => mockFFmpegService);

    config = {
      accessKey: 'test-access',
      secretKey: 'test-secret'
    };

    generator = new VideoGenerator(config);
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(MockedSegmentManager).toHaveBeenCalledWith({
        maxConcurrency: 3,
        batchSize: 3
      });

      expect(MockedVolcanoClient).toHaveBeenCalledWith('test-access', 'test-secret');

      expect(mockedFs.ensureDirSync).toHaveBeenCalledWith('./output');
      expect(mockedFs.ensureDirSync).toHaveBeenCalledWith('./temp');
    });

    it('should use custom config when provided', () => {
      const customConfig: GeneratorConfig = {
        accessKey: 'custom-access',
        secretKey: 'custom-secret',
        outputDir: '/custom/output',
        tempDir: '/custom/temp',
        maxConcurrency: 5,
        aspectRatio: '16:9',
        platform: 'wechat'
      };

      const customGenerator = new VideoGenerator(customConfig);

      expect(MockedSegmentManager).toHaveBeenCalledWith({
        maxConcurrency: 5,
        batchSize: 3
      });

      expect(mockedFs.ensureDirSync).toHaveBeenCalledWith('/custom/output');
      expect(mockedFs.ensureDirSync).toHaveBeenCalledWith('/custom/temp');
    });
  });

  describe('generateVideo', () => {
    const mockSegments = [
      { id: 'seg1', index: 0, prompt: 'Scene 1', frames: 241, status: 'pending' },
      { id: 'seg2', index: 1, prompt: 'Scene 2', frames: 241, status: 'pending' }
    ];

    beforeEach(() => {
      mockSegmentManager.createSegments.mockReturnValue(mockSegments as any);
      mockSegmentManager.getNextBatch
        .mockReturnValueOnce(mockSegments as any)
        .mockReturnValue([]);
      mockSegmentManager.isAllCompleted
        .mockReturnValueOnce(false)
        .mockReturnValue(true);
      mockSegmentManager.hasFailedSegments.mockReturnValue(false);
      mockSegmentManager.getProgress.mockReturnValue(100);

      mockVolcanoClient.submitTextToVideoTask.mockResolvedValue({
        code: 10000,
        data: { task_id: 'task-123' },
        message: 'Success',
        request_id: 'req-123',
        status: 200,
        time_elapsed: '100ms'
      });

      mockVolcanoClient.waitForTask.mockResolvedValue('https://example.com/video.mp4');

      mockFFmpegService.downloadVideo.mockResolvedValue(undefined);
      mockFFmpegService.mergeVideos.mockResolvedValue('./output/final.mp4');
      mockFFmpegService.addBackgroundMusic.mockResolvedValue('./output/final_with_music.mp4');
    });

    it('should generate video with tang-monk template', async () => {
      const options: GenerateOptions = {
        projectName: 'test-project',
        useTemplate: 'tang-monk'
      };

      const result = await generator.generateVideo(options);

      expect(mockSegmentManager.createSegments).toHaveBeenCalled();
      expect(mockVolcanoClient.submitTextToVideoTask).toHaveBeenCalled();
      expect(mockVolcanoClient.waitForTask).toHaveBeenCalled();
      expect(mockFFmpegService.downloadVideo).toHaveBeenCalled();
      expect(mockFFmpegService.mergeVideos).toHaveBeenCalled();
      expect(result).toBe('./output/final.mp4');
    });

    it('should generate video with custom scenes', async () => {
      const customScenes = Array(6).fill(null).map((_, i) => ({
        prompt: `Custom scene ${i + 1}`,
        audio: `Audio ${i + 1}`
      }));

      const options: GenerateOptions = {
        projectName: 'custom-project',
        scenes: customScenes
      };

      const result = await generator.generateVideo(options);

      expect(mockSegmentManager.createSegments).toHaveBeenCalledWith(customScenes);
      expect(result).toBe('./output/final.mp4');
    });

    it('should throw error if not exactly 6 scenes provided', async () => {
      const options: GenerateOptions = {
        projectName: 'bad-project',
        scenes: [{ prompt: 'Scene 1' }, { prompt: 'Scene 2' }]
      };

      await expect(generator.generateVideo(options))
        .rejects.toThrow('必须提供6个场景或使用预设模板');
    });

    it('should add transitions when requested', async () => {
      mockFFmpegService.addTransitions.mockResolvedValue('./output/final_transitions.mp4');

      const options: GenerateOptions = {
        projectName: 'transition-project',
        useTemplate: 'tang-monk',
        addTransition: true
      };

      const result = await generator.generateVideo(options);

      expect(mockFFmpegService.addTransitions).toHaveBeenCalled();
      expect(mockFFmpegService.mergeVideos).not.toHaveBeenCalled();
    });

    it('should add background music when provided', async () => {
      const options: GenerateOptions = {
        projectName: 'music-project',
        useTemplate: 'tang-monk',
        addMusic: './music.mp3'
      };

      const result = await generator.generateVideo(options);

      expect(mockFFmpegService.addBackgroundMusic).toHaveBeenCalledWith(
        './output/final.mp4',
        './music.mp3',
        expect.any(String)
      );
      expect(result).toBe('./output/final_with_music.mp4');
    });

    it('should handle failed segments with retry', async () => {
      // First batch has failures
      mockSegmentManager.hasFailedSegments
        .mockReturnValueOnce(true)
        .mockReturnValue(false);

      mockSegmentManager.getFailedSegments.mockReturnValue([
        { id: 'seg1', status: 'failed', error: 'Test error' }
      ] as any);

      const options: GenerateOptions = {
        projectName: 'retry-project',
        useTemplate: 'tang-monk'
      };

      const result = await generator.generateVideo(options);

      expect(mockSegmentManager.resetFailedSegments).toHaveBeenCalled();
      expect(result).toBe('./output/final.mp4');
    });

    it('should handle task submission errors', async () => {
      mockVolcanoClient.submitTextToVideoTask.mockRejectedValueOnce(new Error('API Error'));

      const options: GenerateOptions = {
        projectName: 'error-project',
        useTemplate: 'tang-monk'
      };

      // Should continue despite individual task failures
      const result = await generator.generateVideo(options);

      expect(mockSegmentManager.updateSegment).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          status: 'failed',
          error: expect.any(String)
        })
      );
    });

    it('should cleanup temporary files', async () => {
      const options: GenerateOptions = {
        projectName: 'cleanup-project',
        useTemplate: 'tang-monk'
      };

      await generator.generateVideo(options);

      expect(mockedFs.remove).toHaveBeenCalled();
    });

    it('should use correct platform resolution', async () => {
      const douyinGenerator = new VideoGenerator({
        ...config,
        platform: 'douyin'
      });

      const options: GenerateOptions = {
        projectName: 'douyin-project',
        useTemplate: 'tang-monk'
      };

      await douyinGenerator.generateVideo(options);

      expect(mockFFmpegService.mergeVideos).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          resolution: '1088x1920'
        })
      );
    });

    it('should handle wechat platform resolution', async () => {
      const wechatGenerator = new VideoGenerator({
        ...config,
        platform: 'wechat'
      });

      const options: GenerateOptions = {
        projectName: 'wechat-project',
        useTemplate: 'tang-monk'
      };

      await wechatGenerator.generateVideo(options);

      expect(mockFFmpegService.mergeVideos).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          resolution: '1080x1080'
        })
      );
    });

    it('should batch process segments correctly', async () => {
      const batch1 = [mockSegments[0]];
      const batch2 = [mockSegments[1]];

      mockSegmentManager.getNextBatch
        .mockReturnValueOnce(batch1 as any)
        .mockReturnValueOnce(batch2 as any)
        .mockReturnValue([]);

      mockSegmentManager.isAllCompleted
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValue(true);

      const options: GenerateOptions = {
        projectName: 'batch-project',
        useTemplate: 'tang-monk'
      };

      await generator.generateVideo(options);

      // Should submit tasks for both batches
      expect(mockVolcanoClient.submitTextToVideoTask).toHaveBeenCalledTimes(2);
    });

    it('should wait for task completion', async () => {
      const options: GenerateOptions = {
        projectName: 'wait-project',
        useTemplate: 'tang-monk'
      };

      await generator.generateVideo(options);

      expect(mockVolcanoClient.waitForTask).toHaveBeenCalledWith('task-123');
      expect(mockSegmentManager.updateSegment).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          status: 'completed',
          videoUrl: 'https://example.com/video.mp4'
        })
      );
    });

    it('should handle download errors gracefully', async () => {
      mockFFmpegService.downloadVideo.mockRejectedValueOnce(new Error('Download failed'));

      const options: GenerateOptions = {
        projectName: 'download-error-project',
        useTemplate: 'tang-monk'
      };

      await expect(generator.generateVideo(options))
        .rejects.toThrow('Download failed');
    });

    it('should handle merge errors', async () => {
      mockFFmpegService.mergeVideos.mockRejectedValueOnce(new Error('Merge failed'));

      const options: GenerateOptions = {
        projectName: 'merge-error-project',
        useTemplate: 'tang-monk'
      };

      await expect(generator.generateVideo(options))
        .rejects.toThrow('Merge failed');
    });
  });
});