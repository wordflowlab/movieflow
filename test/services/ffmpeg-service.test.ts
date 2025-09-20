import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { FFmpegService, MergeOptions } from '../../src/services/ffmpeg-service';
import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';

// Mock modules
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));
jest.mock('util', () => ({
  promisify: jest.fn(() => jest.fn()),
}));
jest.mock('fs-extra', () => ({
  ensureDirSync: jest.fn(),
  pathExists: jest.fn(),
  createWriteStream: jest.fn(),
  writeFile: jest.fn(),
  remove: jest.fn(),
  readdir: jest.fn(),
}));
jest.mock('axios');

const mockedFs = jest.requireMock('fs-extra') as any;
const mockedUtil = jest.requireMock('util') as any;

describe('FFmpegService', () => {
  let service: FFmpegService;
  let mockExecAsync: jest.Mock;

  beforeEach(() => {
    // Create mock exec async
    mockExecAsync = jest.fn();
    mockedUtil.promisify.mockReturnValue(mockExecAsync);
    service = new FFmpegService();

    // Reset and setup fs mocks
    mockedFs.ensureDirSync.mockReset();
    mockedFs.pathExists.mockReset();
    mockedFs.createWriteStream.mockReset();
    mockedFs.writeFile.mockReset();
    mockedFs.remove.mockReset();
    mockedFs.readdir.mockReset();

    // Default mock implementations
    mockedFs.pathExists.mockResolvedValue(true);
    mockedFs.createWriteStream.mockReturnValue({
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
        return { on: jest.fn() };
      })
    });
    mockedFs.writeFile.mockResolvedValue(undefined);
    mockedFs.remove.mockResolvedValue(undefined);
    mockedFs.readdir.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create temp directory', () => {
      const tempDir = path.join(os.tmpdir(), 'movieflow-temp');
      expect(mockedFs.ensureDirSync).toHaveBeenCalledWith(tempDir);
    });
  });

  describe('checkFFmpeg', () => {
    it('should return true when FFmpeg is installed', async () => {
      mockExecAsync.mockResolvedValueOnce({ stdout: 'ffmpeg version 4.4.0', stderr: '' });

      const result = await service.checkFFmpeg();

      expect(result).toBe(true);
      expect(mockExecAsync).toHaveBeenCalledWith('ffmpeg -version');
    });

    it('should return false when FFmpeg is not installed', async () => {
      mockExecAsync.mockRejectedValueOnce(new Error('Command not found'));

      const result = await service.checkFFmpeg();

      expect(result).toBe(false);
    });
  });

  describe('downloadVideo', () => {
    it('should download video from URL', async () => {
      // Mock axios dynamically
      const mockAxios = {
        get: jest.fn().mockResolvedValue({
          data: {
            pipe: jest.fn()
          }
        })
      };

      jest.doMock('axios', () => ({
        default: mockAxios
      }));

      const outputPath = '/tmp/video.mp4';
      const mockWriter = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            setTimeout(callback, 0);
          }
          return mockWriter;
        })
      };

      mockedFs.createWriteStream.mockReturnValue(mockWriter as any);

      await service.downloadVideo('https://example.com/video.mp4', outputPath);

      expect(mockedFs.createWriteStream).toHaveBeenCalledWith(outputPath);
    });

    it('should reject on write error', async () => {
      const mockAxios = {
        get: jest.fn().mockResolvedValue({
          data: {
            pipe: jest.fn()
          }
        })
      };

      jest.doMock('axios', () => ({
        default: mockAxios
      }));

      const outputPath = '/tmp/video.mp4';
      const mockWriter = {
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Write error'));
          }
          return mockWriter;
        })
      };

      mockedFs.createWriteStream.mockReturnValue(mockWriter as any);

      await expect(service.downloadVideo('https://example.com/video.mp4', outputPath))
        .rejects.toThrow('Write error');
    });
  });

  describe('mergeVideos', () => {
    beforeEach(() => {
      mockExecAsync.mockResolvedValue({ stdout: '', stderr: '' });
    });

    it('should throw error when no videos provided', async () => {
      await expect(service.mergeVideos([], { outputPath: '/tmp/output.mp4' }))
        .rejects.toThrow('没有提供要合并的视频');
    });

    it('should throw error when FFmpeg not installed', async () => {
      // First call for checkFFmpeg
      mockExecAsync.mockRejectedValueOnce(new Error('Command not found'));

      await expect(service.mergeVideos(['/tmp/video1.mp4'], { outputPath: '/tmp/output.mp4' }))
        .rejects.toThrow('FFmpeg未安装，请先安装FFmpeg');
    });

    it('should merge videos successfully', async () => {
      const videoPaths = ['/tmp/video1.mp4', '/tmp/video2.mp4'];
      const options: MergeOptions = {
        outputPath: '/tmp/output.mp4',
        resolution: '1920x1080',
        fps: 30
      };

      // First call for checkFFmpeg
      mockExecAsync.mockResolvedValueOnce({ stdout: 'ffmpeg version', stderr: '' });
      // Second call for actual merge
      mockExecAsync.mockResolvedValueOnce({ stdout: '', stderr: 'frame=300' });

      const result = await service.mergeVideos(videoPaths, options);

      expect(result).toBe('/tmp/output.mp4');
      expect(mockedFs.writeFile).toHaveBeenCalled();
      expect(mockedFs.remove).toHaveBeenCalled();
    });

    it('should build correct FFmpeg command', async () => {
      const videoPaths = ['/tmp/video1.mp4'];
      const options: MergeOptions = {
        outputPath: '/tmp/output.mp4',
        resolution: '1088x1920',
        fps: 24
      };

      mockExecAsync.mockResolvedValueOnce({ stdout: 'ffmpeg version', stderr: '' });
      mockExecAsync.mockResolvedValueOnce({ stdout: '', stderr: '' });

      await service.mergeVideos(videoPaths, options);

      // Check that the command contains expected parts
      const callArgs = mockExecAsync.mock.calls[1][0];
      expect(callArgs).toContain('ffmpeg');
      expect(callArgs).toContain('-f concat');
      expect(callArgs).toContain('-s 1088x1920');
      expect(callArgs).toContain('-r 24');
      expect(callArgs).toContain('-c:v libx264');
      expect(callArgs).toContain('/tmp/output.mp4');
    });

    it('should handle FFmpeg warnings', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockExecAsync.mockResolvedValueOnce({ stdout: 'ffmpeg version', stderr: '' });
      mockExecAsync.mockResolvedValueOnce({ stdout: '', stderr: 'Warning: something' });

      await service.mergeVideos(['/tmp/video1.mp4'], { outputPath: '/tmp/output.mp4' });

      expect(consoleSpy).toHaveBeenCalledWith('FFmpeg警告:', 'Warning: something');
      consoleSpy.mockRestore();
    });
  });

  describe('addTransitions', () => {
    it('should use fade transitions when specified', async () => {
      const videoPaths = ['/tmp/video1.mp4', '/tmp/video2.mp4'];
      const options: MergeOptions & { transition: 'fade' } = {
        outputPath: '/tmp/output.mp4',
        transition: 'fade',
        transitionDuration: 0.5
      };

      // Mock for fade transitions (multiple FFmpeg calls)
      mockExecAsync.mockResolvedValue({ stdout: '', stderr: '' });

      // Mock checkFFmpeg
      mockExecAsync.mockResolvedValueOnce({ stdout: 'ffmpeg version', stderr: '' });

      const result = await service.addTransitions(videoPaths, options);

      expect(result).toBe('/tmp/output.mp4');
      // Should call FFmpeg for each video to add fade effect
      expect(mockExecAsync).toHaveBeenCalled();
    });

    it('should use dissolve transitions (fallback to fade)', async () => {
      const videoPaths = ['/tmp/video1.mp4'];
      const options: MergeOptions & { transition: 'dissolve' } = {
        outputPath: '/tmp/output.mp4',
        transition: 'dissolve'
      };

      mockExecAsync.mockResolvedValue({ stdout: '', stderr: '' });
      mockExecAsync.mockResolvedValueOnce({ stdout: 'ffmpeg version', stderr: '' });

      await service.addTransitions(videoPaths, options);

      // Dissolve should fall back to fade
      expect(mockExecAsync).toHaveBeenCalled();
    });

    it('should handle fade for first, middle, and last videos differently', async () => {
      const videoPaths = ['/tmp/video1.mp4', '/tmp/video2.mp4', '/tmp/video3.mp4'];
      const options: MergeOptions & { transition: 'fade' } = {
        outputPath: '/tmp/output.mp4',
        transition: 'fade',
        transitionDuration: 1.0
      };

      mockExecAsync.mockResolvedValue({ stdout: '', stderr: '' });

      await service.addTransitions(videoPaths, options);

      // Should have different fade filters for first, middle, and last
      const calls = mockExecAsync.mock.calls;

      // First video: fade in only
      expect(calls.some(call => call[0].includes('fade=t=in'))).toBe(true);

      // Last video: fade out only
      expect(calls.some(call => call[0].includes('fade=t=out'))).toBe(true);
    });
  });

  describe('resizeVideo', () => {
    it('should resize video to specified resolution', async () => {
      mockExecAsync.mockResolvedValueOnce({ stdout: '', stderr: '' });

      const result = await service.resizeVideo(
        '/tmp/input.mp4',
        '/tmp/output.mp4',
        '1920x1080'
      );

      expect(result).toBe('/tmp/output.mp4');
      expect(mockExecAsync).toHaveBeenCalledWith(expect.stringContaining('-s 1920x1080'));
    });

    it('should use correct FFmpeg command for resizing', async () => {
      mockExecAsync.mockResolvedValueOnce({ stdout: '', stderr: '' });

      await service.resizeVideo('/tmp/input.mp4', '/tmp/output.mp4', '1280x720');

      const command = mockExecAsync.mock.calls[0][0];
      expect(command).toContain('ffmpeg');
      expect(command).toContain('-i "/tmp/input.mp4"');
      expect(command).toContain('-s 1280x720');
      expect(command).toContain('-c:v libx264');
      expect(command).toContain('-preset fast');
      expect(command).toContain('-c:a copy');
      expect(command).toContain('"/tmp/output.mp4"');
    });
  });

  describe('addBackgroundMusic', () => {
    it('should add background music to video', async () => {
      mockExecAsync.mockResolvedValueOnce({ stdout: '', stderr: '' });

      const result = await service.addBackgroundMusic(
        '/tmp/video.mp4',
        '/tmp/music.mp3',
        '/tmp/output.mp4'
      );

      expect(result).toBe('/tmp/output.mp4');
      expect(mockExecAsync).toHaveBeenCalled();
    });

    it('should use correct FFmpeg command for adding music', async () => {
      mockExecAsync.mockResolvedValueOnce({ stdout: '', stderr: '' });

      await service.addBackgroundMusic(
        '/tmp/video.mp4',
        '/tmp/audio.mp3',
        '/tmp/final.mp4'
      );

      const command = mockExecAsync.mock.calls[0][0];
      expect(command).toContain('ffmpeg');
      expect(command).toContain('-i "/tmp/video.mp4"');
      expect(command).toContain('-i "/tmp/audio.mp3"');
      expect(command).toContain('-c:v copy');
      expect(command).toContain('-c:a aac');
      expect(command).toContain('-shortest');
      expect(command).toContain('"/tmp/final.mp4"');
    });
  });

  describe('cleanup', () => {
    it('should remove temp directory', async () => {
      await service.cleanup();

      const tempDir = path.join(os.tmpdir(), 'movieflow-temp');
      expect(mockedFs.remove).toHaveBeenCalledWith(tempDir);
    });

    it('should handle cleanup errors gracefully', async () => {
      mockedFs.remove.mockRejectedValueOnce(new Error('Permission denied'));

      // Should not throw
      await expect(service.cleanup()).resolves.toBeUndefined();
    });
  });
});