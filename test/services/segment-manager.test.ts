import { describe, it, expect, beforeEach } from '@jest/globals';
import { VideoSegmentManager, VideoSegment, TANG_MONK_SCENES } from '../../src/services/segment-manager';

describe('VideoSegmentManager', () => {
  let manager: VideoSegmentManager;

  beforeEach(() => {
    manager = new VideoSegmentManager();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      expect(manager).toBeDefined();
    });

    it('should accept custom config', () => {
      const customManager = new VideoSegmentManager({
        maxConcurrency: 5,
        batchSize: 2,
        retryAttempts: 5,
        retryDelay: 10000
      });
      expect(customManager).toBeDefined();
    });
  });

  describe('createSegments', () => {
    it('should create 6 segments for 60-second video', () => {
      const scenes = Array(6).fill(null).map((_, i) => ({
        prompt: `Scene ${i + 1}`,
        audio: `Audio ${i + 1}`
      }));

      const segments = manager.createSegments(scenes);

      expect(segments).toHaveLength(6);
      expect(segments[0].id).toBe('segment_1');
      expect(segments[0].index).toBe(0);
      expect(segments[0].startTime).toBe(0);
      expect(segments[0].duration).toBe(10);
      expect(segments[0].frames).toBe(241);
      expect(segments[0].status).toBe('pending');
    });

    it('should throw error if not exactly 6 scenes provided', () => {
      const scenes = [{ prompt: 'Scene 1' }, { prompt: 'Scene 2' }];

      expect(() => manager.createSegments(scenes)).toThrow('必须提供6个场景来创建60秒视频');
    });

    it('should set correct timing for each segment', () => {
      const scenes = Array(6).fill(null).map((_, i) => ({
        prompt: `Scene ${i + 1}`
      }));

      const segments = manager.createSegments(scenes);

      segments.forEach((segment, index) => {
        expect(segment.startTime).toBe(index * 10);
        expect(segment.duration).toBe(10);
        expect(segment.frames).toBe(241);
      });
    });
  });

  describe('getNextBatch', () => {
    beforeEach(() => {
      const scenes = Array(6).fill(null).map((_, i) => ({
        prompt: `Scene ${i + 1}`
      }));
      manager.createSegments(scenes);
    });

    it('should return pending segments up to batch size', () => {
      const batch = manager.getNextBatch();

      expect(batch).toHaveLength(3); // Default batch size
      batch.forEach(segment => {
        expect(segment.status).toBe('pending');
      });
    });

    it('should not return generating or completed segments', () => {
      manager.updateSegment('segment_1', { status: 'generating' });
      manager.updateSegment('segment_2', { status: 'completed' });

      const batch = manager.getNextBatch();

      expect(batch.length).toBeLessThanOrEqual(3);
      expect(batch.find(s => s.id === 'segment_1')).toBeUndefined();
      expect(batch.find(s => s.id === 'segment_2')).toBeUndefined();
    });
  });

  describe('updateSegment', () => {
    beforeEach(() => {
      const scenes = Array(6).fill(null).map((_, i) => ({
        prompt: `Scene ${i + 1}`
      }));
      manager.createSegments(scenes);
    });

    it('should update segment properties', () => {
      manager.updateSegment('segment_1', {
        status: 'generating',
        taskId: 'task-123'
      });

      const segments = manager.getAllSegments();
      const updatedSegment = segments.find(s => s.id === 'segment_1');

      expect(updatedSegment?.status).toBe('generating');
      expect(updatedSegment?.taskId).toBe('task-123');
    });

    it('should handle non-existent segment gracefully', () => {
      expect(() => {
        manager.updateSegment('non-existent', { status: 'completed' });
      }).not.toThrow();
    });
  });

  describe('status checking methods', () => {
    beforeEach(() => {
      const scenes = Array(6).fill(null).map((_, i) => ({
        prompt: `Scene ${i + 1}`
      }));
      manager.createSegments(scenes);
    });

    describe('isAllCompleted', () => {
      it('should return false when not all segments are completed', () => {
        manager.updateSegment('segment_1', { status: 'completed' });
        expect(manager.isAllCompleted()).toBe(false);
      });

      it('should return true when all segments are completed', () => {
        for (let i = 1; i <= 6; i++) {
          manager.updateSegment(`segment_${i}`, { status: 'completed' });
        }
        expect(manager.isAllCompleted()).toBe(true);
      });
    });

    describe('hasFailedSegments', () => {
      it('should return false when no segments failed', () => {
        expect(manager.hasFailedSegments()).toBe(false);
      });

      it('should return true when any segment failed', () => {
        manager.updateSegment('segment_3', { status: 'failed', error: 'Test error' });
        expect(manager.hasFailedSegments()).toBe(true);
      });
    });

    describe('getFailedSegments', () => {
      it('should return empty array when no failures', () => {
        expect(manager.getFailedSegments()).toEqual([]);
      });

      it('should return failed segments', () => {
        manager.updateSegment('segment_2', { status: 'failed', error: 'Error 1' });
        manager.updateSegment('segment_4', { status: 'failed', error: 'Error 2' });

        const failed = manager.getFailedSegments();
        expect(failed).toHaveLength(2);
        expect(failed.map(s => s.id)).toEqual(['segment_2', 'segment_4']);
      });
    });
  });

  describe('resetFailedSegments', () => {
    beforeEach(() => {
      const scenes = Array(6).fill(null).map((_, i) => ({
        prompt: `Scene ${i + 1}`
      }));
      manager.createSegments(scenes);
    });

    it('should reset failed segments to pending', () => {
      manager.updateSegment('segment_2', {
        status: 'failed',
        error: 'Test error',
        taskId: 'old-task'
      });

      manager.resetFailedSegments();

      const segment = manager.getAllSegments().find(s => s.id === 'segment_2');
      expect(segment?.status).toBe('pending');
      expect(segment?.error).toBeUndefined();
      expect(segment?.taskId).toBeUndefined();
    });

    it('should not affect non-failed segments', () => {
      manager.updateSegment('segment_1', { status: 'completed' });
      manager.updateSegment('segment_2', { status: 'failed' });
      manager.updateSegment('segment_3', { status: 'generating' });

      manager.resetFailedSegments();

      const segments = manager.getAllSegments();
      expect(segments.find(s => s.id === 'segment_1')?.status).toBe('completed');
      expect(segments.find(s => s.id === 'segment_2')?.status).toBe('pending');
      expect(segments.find(s => s.id === 'segment_3')?.status).toBe('generating');
    });
  });

  describe('getCompletedVideoUrls', () => {
    beforeEach(() => {
      const scenes = Array(6).fill(null).map((_, i) => ({
        prompt: `Scene ${i + 1}`
      }));
      manager.createSegments(scenes);
    });

    it('should return empty array when no videos completed', () => {
      expect(manager.getCompletedVideoUrls()).toEqual([]);
    });

    it('should return completed video URLs in order', () => {
      manager.updateSegment('segment_3', {
        status: 'completed',
        videoUrl: 'video3.mp4'
      });
      manager.updateSegment('segment_1', {
        status: 'completed',
        videoUrl: 'video1.mp4'
      });
      manager.updateSegment('segment_2', {
        status: 'completed',
        videoUrl: 'video2.mp4'
      });

      const urls = manager.getCompletedVideoUrls();
      expect(urls).toEqual(['video1.mp4', 'video2.mp4', 'video3.mp4']);
    });

    it('should filter out segments without URLs', () => {
      manager.updateSegment('segment_1', {
        status: 'completed',
        videoUrl: 'video1.mp4'
      });
      manager.updateSegment('segment_2', {
        status: 'completed'
        // No URL
      });

      const urls = manager.getCompletedVideoUrls();
      expect(urls).toEqual(['video1.mp4']);
    });
  });

  describe('getProgress', () => {
    beforeEach(() => {
      const scenes = Array(6).fill(null).map((_, i) => ({
        prompt: `Scene ${i + 1}`
      }));
      manager.createSegments(scenes);
    });

    it('should return 0 when no segments completed', () => {
      expect(manager.getProgress()).toBe(0);
    });

    it('should calculate progress correctly', () => {
      manager.updateSegment('segment_1', { status: 'completed' });
      expect(manager.getProgress()).toBe(17); // 1/6 ≈ 17%

      manager.updateSegment('segment_2', { status: 'completed' });
      expect(manager.getProgress()).toBe(33); // 2/6 ≈ 33%

      manager.updateSegment('segment_3', { status: 'completed' });
      expect(manager.getProgress()).toBe(50); // 3/6 = 50%
    });

    it('should return 100 when all completed', () => {
      for (let i = 1; i <= 6; i++) {
        manager.updateSegment(`segment_${i}`, { status: 'completed' });
      }
      expect(manager.getProgress()).toBe(100);
    });
  });

  describe('getStatusSummary', () => {
    beforeEach(() => {
      const scenes = Array(6).fill(null).map((_, i) => ({
        prompt: `Scene ${i + 1}`
      }));
      manager.createSegments(scenes);
    });

    it('should return correct initial summary', () => {
      const summary = manager.getStatusSummary();

      expect(summary).toEqual({
        total: 6,
        pending: 6,
        generating: 0,
        completed: 0,
        failed: 0
      });
    });

    it('should track status changes correctly', () => {
      manager.updateSegment('segment_1', { status: 'completed' });
      manager.updateSegment('segment_2', { status: 'completed' });
      manager.updateSegment('segment_3', { status: 'generating' });
      manager.updateSegment('segment_4', { status: 'failed' });

      const summary = manager.getStatusSummary();

      expect(summary).toEqual({
        total: 6,
        pending: 2,
        generating: 1,
        completed: 2,
        failed: 1
      });
    });
  });

  describe('TANG_MONK_SCENES', () => {
    it('should have 6 predefined scenes', () => {
      expect(TANG_MONK_SCENES).toHaveLength(6);
    });

    it('should have prompt and audio for each scene', () => {
      TANG_MONK_SCENES.forEach(scene => {
        expect(scene.prompt).toBeDefined();
        expect(scene.prompt.length).toBeGreaterThan(0);
        expect(scene.audio).toBeDefined();
        expect(scene.audio?.length).toBeGreaterThan(0);
      });
    });

    it('should work with createSegments', () => {
      const segments = manager.createSegments(TANG_MONK_SCENES);

      expect(segments).toHaveLength(6);
      segments.forEach((segment, index) => {
        expect(segment.prompt).toBe(TANG_MONK_SCENES[index].prompt);
        expect(segment.audio).toBe(TANG_MONK_SCENES[index].audio);
      });
    });
  });
});