/**
 * MovieFlow 主入口文件
 * 导出所有公开的类和接口
 */

// 核心类
export { VideoGenerator } from './core/video-generator';
export type { GeneratorConfig, GenerateOptions, SceneDefinition } from './core/video-generator';

// 服务类
export { VideoSegmentManager, TANG_MONK_SCENES } from './services/segment-manager';
export type { VideoSegment, BatchConfig } from './services/segment-manager';

export { VolcanoEngineClient } from './services/volcano-engine-client';
export type { SubmitTaskRequest, TaskResponse } from './services/volcano-engine-client';

export { FFmpegService } from './services/ffmpeg-service';
export type { MergeOptions, AudioMergeOptions } from './services/ffmpeg-service';

export { AudioService } from './services/audio-service';
export type { TTSOptions, AudioSegment, TTSEngine } from './services/audio-service';

export { SubtitleService } from './services/subtitle-service';
export type { SubtitleSegment, SubtitleStyle, SubtitleOptions } from './services/subtitle-service';

export { TemplateManager } from './services/template-manager';
export type { VideoTemplate } from './services/template-manager';

export { VolcanoTTSService } from './services/volcano-tts-service';
export type { VolcanoTTSConfig, TTSRequest, TTSResponse } from './services/volcano-tts-service';

// 版本信息
export const VERSION = '0.1.0';

// 默认配置
export const DEFAULT_CONFIG = {
  maxConcurrency: 3,
  batchSize: 3,
  defaultFrames: 241,  // 10秒
  defaultDuration: 10,
  aspectRatio: '9:16' as const,
  platform: 'douyin' as const
};