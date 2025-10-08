/**
 * 平台适配器模块
 * 统一导出所有视频平台适配器
 */

export * from './base-video-adapter';
export * from './jimeng-adapter';
export * from './sora2-adapter';

// 导出适配器工厂的便捷方法
import { PlatformAdapterFactory } from './base-video-adapter';
import { JimengAdapter } from './jimeng-adapter';
import { Sora2Adapter } from './sora2-adapter';

/**
 * 初始化所有平台适配器
 * 在应用启动时调用此函数来注册所有可用的平台
 */
export function initializePlatformAdapters(): void {
  // 注册即梦AI适配器
  const jimengAccessKey = process.env.VOLCANO_ACCESS_KEY;
  const jimengSecretKey = process.env.VOLCANO_SECRET_KEY;

  if (jimengAccessKey && jimengSecretKey) {
    const jimengAdapter = new JimengAdapter(jimengAccessKey, jimengSecretKey);
    PlatformAdapterFactory.register('jimeng', jimengAdapter);
    PlatformAdapterFactory.register('即梦ai', jimengAdapter);
    PlatformAdapterFactory.register('即梦', jimengAdapter);
    console.log('✓ 即梦AI adapter registered');
  } else {
    console.warn('⚠ Jimeng AI credentials not found. Set VOLCANO_ACCESS_KEY and VOLCANO_SECRET_KEY.');
  }

  // 注册Sora2适配器
  const sora2ApiKey = process.env.SORA2_API_KEY;

  if (sora2ApiKey) {
    const sora2Adapter = new Sora2Adapter(sora2ApiKey);
    PlatformAdapterFactory.register('sora2', sora2Adapter);
    PlatformAdapterFactory.register('sora', sora2Adapter);
    console.log('✓ Sora2 adapter registered');
  } else {
    console.warn('⚠ Sora2 API key not found. Set SORA2_API_KEY.');
  }

  // TODO: 添加更多平台适配器
  // - Runway Gen-4
  // - 海螺02
  // - 可灵
  // - Veo3
  // - Vidu Q2

  console.log(`\n📦 Total ${PlatformAdapterFactory.getAvailablePlatforms().length} platforms available`);
}

/**
 * 获取推荐平台
 * 根据项目需求自动推荐最适合的平台
 */
export function getRecommendedPlatform(requirements: {
  needsLipSync?: boolean;
  needsCameraControl?: boolean;
  needsFirstLastFrame?: boolean;
  maxBudget?: number;
  duration?: number;
  prioritizeCost?: boolean;
  prioritizeQuality?: boolean;
}): {
  recommended: string;
  alternatives: string[];
  rationale: string;
} {
  return PlatformAdapterFactory.recommendPlatform(requirements);
}

/**
 * 列出所有可用平台及其能力
 */
export function listAllPlatforms(): void {
  const platforms = PlatformAdapterFactory.getAllPlatformCapabilities();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Available Video Generation Platforms');
  console.log('═══════════════════════════════════════════════════════════\n');

  platforms.forEach((caps, index) => {
    console.log(`${index + 1}. ${caps.name}`);
    console.log(`   Max Duration: ${caps.maxDuration}s`);
    console.log(`   Cost: ¥${caps.costPerSecond}/sec`);
    console.log(`   Aspect Ratios: ${caps.aspectRatios.join(', ')}`);
    console.log(`   Capabilities:`);
    console.log(`     - Lip Sync: ${caps.hasLipSync ? '✓' : '✗'}`);
    console.log(`     - Camera Control: ${caps.hasCameraControl ? '✓' : '✗'}`);
    console.log(`     - First/Last Frame: ${caps.hasFirstLastFrame ? '✓' : '✗'}`);
    console.log(`     - Audio Generation: ${caps.hasAudioGeneration ? '✓' : '✗'}`);
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════\n');
}
