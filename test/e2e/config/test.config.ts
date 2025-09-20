/**
 * E2E测试配置
 * 从环境变量加载API密钥和测试参数
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';

// 加载测试环境变量
const envPath = path.join(process.cwd(), '.env.test');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  .env.test 文件不存在，请参考 .env.test.example 创建');
}

export interface E2ETestConfig {
  volcano: {
    accessKey: string;
    secretKey: string;
  };
  test: {
    apiTimeout: number;
    maxRetries: number;
    maxConcurrency: number;
    videoFrames: number;
    aspectRatio: string;
    skipExpensiveTests: boolean;
    outputDir: string;
    tempDir: string;
  };
  prompts: {
    simple: string[];
    complex: string[];
    image: string[];
  };
}

/**
 * 获取E2E测试配置
 */
export function getE2EConfig(): E2ETestConfig {
  const config: E2ETestConfig = {
    volcano: {
      accessKey: process.env.VOLCANO_ACCESS_KEY || '',
      secretKey: process.env.VOLCANO_SECRET_KEY || ''
    },
    test: {
      apiTimeout: parseInt(process.env.TEST_API_TIMEOUT || '300000'),
      maxRetries: parseInt(process.env.TEST_MAX_RETRIES || '3'),
      maxConcurrency: parseInt(process.env.TEST_MAX_CONCURRENCY || '2'),
      videoFrames: parseInt(process.env.TEST_VIDEO_FRAMES || '121'),
      aspectRatio: process.env.TEST_ASPECT_RATIO || '9:16',
      skipExpensiveTests: process.env.SKIP_EXPENSIVE_TESTS === 'true',
      outputDir: process.env.TEST_OUTPUT_DIR || './test-output',
      tempDir: process.env.TEST_TEMP_DIR || './test-temp'
    },
    prompts: {
      simple: [
        '一只可爱的小猫在花园里玩耍',
        '夕阳下的宁静海滩',
        '繁忙的城市街道'
      ],
      complex: [
        '宇航员在太空站内漂浮，透过窗户可以看到地球',
        '古代武士在樱花飘落的庭院中练剑',
        '未来城市的霓虹灯夜景，飞车穿梭于高楼之间'
      ],
      image: [
        '让这张图片动起来，增加自然的动态效果',
        '为图片添加电影般的运镜效果',
        '让画面中的元素产生微妙的动态变化'
      ]
    }
  };

  return config;
}

/**
 * 检查API密钥是否已配置
 */
export function checkApiKeys(config: E2ETestConfig): boolean {
  if (!config.volcano.accessKey || !config.volcano.secretKey) {
    console.error('❌ API密钥未配置，请设置以下环境变量：');
    console.error('   VOLCANO_ACCESS_KEY - 火山引擎访问密钥');
    console.error('   VOLCANO_SECRET_KEY - 火山引擎密钥');
    console.error('\n💡 提示：复制 .env.test.example 为 .env.test 并填入您的API密钥');
    return false;
  }
  return true;
}

/**
 * 初始化测试目录
 */
export async function initTestDirectories(config: E2ETestConfig): Promise<void> {
  await fs.ensureDir(config.test.outputDir);
  await fs.ensureDir(config.test.tempDir);
}

/**
 * 清理测试文件
 */
export async function cleanupTestFiles(config: E2ETestConfig): Promise<void> {
  try {
    await fs.emptyDir(config.test.tempDir);
  } catch (error) {
    console.warn('清理临时文件失败:', error);
  }
}

/**
 * 生成唯一的测试ID
 */
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * 测试装饰器：跳过昂贵的测试
 */
export function skipIfExpensive(testFn: any): any {
  const config = getE2EConfig();
  if (config.test.skipExpensiveTests) {
    return testFn.skip;
  }
  return testFn;
}

/**
 * 等待延迟（避免触发API限流）
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 获取测试提示词
 */
export function getTestPrompt(type: 'simple' | 'complex' | 'image' = 'simple', index: number = 0): string {
  const config = getE2EConfig();
  const prompts = config.prompts[type];
  return prompts[index % prompts.length];
}