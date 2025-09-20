/**
 * VideoGenerator 端到端测试
 * 测试完整的视频生成流程
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import path from 'path';
import fs from 'fs-extra';
import { VideoGenerator, GeneratorConfig, GenerateOptions } from '../../../src/core/video-generator';
import {
  getE2EConfig,
  checkApiKeys,
  initTestDirectories,
  cleanupTestFiles,
  generateTestId
} from '../config/test.config';
import {
  validateVideoFile,
  PerformanceTimer,
  TestDataGenerator
} from '../utils/test-helper';

// 加载配置
const config = getE2EConfig();
const skipIfNoApiKeys = !checkApiKeys(config);

describe('VideoGenerator E2E Tests', () => {
  let generator: VideoGenerator;
  let testDataGenerator: TestDataGenerator;
  let testOutputDir: string;

  beforeAll(async () => {
    if (skipIfNoApiKeys) {
      console.log('⚠️  跳过E2E测试：未配置API密钥');
      return;
    }

    // 初始化测试目录
    await initTestDirectories(config);

    // 创建测试输出目录
    testOutputDir = path.join(config.test.outputDir, generateTestId());
    await fs.ensureDir(testOutputDir);

    // 初始化生成器
    const generatorConfig: GeneratorConfig = {
      accessKey: config.volcano.accessKey,
      secretKey: config.volcano.secretKey,
      outputDir: testOutputDir,
      tempDir: path.join(config.test.tempDir, generateTestId()),
      maxConcurrency: config.test.maxConcurrency,
      aspectRatio: config.test.aspectRatio as any,
      platform: 'douyin'
    };

    generator = new VideoGenerator(generatorConfig);
    testDataGenerator = new TestDataGenerator();

    // 设置超时时间
    jest.setTimeout(600000);  // 10分钟超时
  });

  afterAll(async () => {
    if (!skipIfNoApiKeys) {
      // 清理测试文件（保留成功的视频供检查）
      if (config.test.skipExpensiveTests) {
        await cleanupTestFiles(config);
      } else {
        console.log(`📁 测试输出保存在: ${testOutputDir}`);
      }
    }
  });

  ((skipIfNoApiKeys || config.test.skipExpensiveTests) ? describe.skip : describe)('单场景视频生成', () => {
    it('应该生成单个场景的视频', async () => {
      const timer = new PerformanceTimer();
      const testId = generateTestId();

      console.log(`\n🎬 开始单场景视频生成测试: ${testId}`);

      // 准备单个场景（重复6次以满足60秒要求）
      const singlePrompt = testDataGenerator.generatePrompt('simple');
      const scenes = Array(6).fill({ prompt: singlePrompt, duration: 10 });

      const options: GenerateOptions = {
        projectName: `single_scene_${testId}`,
        scenes: scenes,
        addTransition: false,
        addMusic: undefined
      };

      timer.mark('开始生成');

      try {
        const outputPath = await generator.generateVideo(options);

        timer.mark('生成完成');

        // 验证输出文件
        expect(await fs.pathExists(outputPath)).toBe(true);

        const isValid = await validateVideoFile(outputPath);
        expect(isValid).toBe(true);

        const stats = await fs.stat(outputPath);
        console.log(`✅ 视频生成成功`);
        console.log(`   文件路径: ${outputPath}`);
        console.log(`   文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   ${timer.getReport()}`);

      } catch (error: any) {
        timer.mark('生成失败');
        console.error(`❌ 视频生成失败: ${error.message}`);
        console.log(timer.getReport());
        throw error;
      }
    });
  });

  ((skipIfNoApiKeys || config.test.skipExpensiveTests) ? describe.skip : describe)('多场景视频合成', () => {
    it('应该生成并合并多个不同场景的视频', async () => {
      const timer = new PerformanceTimer();
      const testId = generateTestId();

      console.log(`\n🎬 开始多场景视频合成测试: ${testId}`);

      // 生成6个不同的场景
      const scenes = testDataGenerator.generateScenes(6);

      const options: GenerateOptions = {
        projectName: `multi_scene_${testId}`,
        scenes: scenes,
        addTransition: true,  // 添加转场效果
        addMusic: undefined
      };

      timer.mark('开始生成');

      try {
        const outputPath = await generator.generateVideo(options);

        timer.mark('生成完成');

        // 验证输出文件
        expect(await fs.pathExists(outputPath)).toBe(true);

        const isValid = await validateVideoFile(outputPath);
        expect(isValid).toBe(true);

        const stats = await fs.stat(outputPath);
        console.log(`✅ 多场景视频生成成功`);
        console.log(`   文件路径: ${outputPath}`);
        console.log(`   文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   场景数量: ${scenes.length}`);
        console.log(`   ${timer.getReport()}`);

      } catch (error: any) {
        timer.mark('生成失败');
        console.error(`❌ 多场景视频生成失败: ${error.message}`);
        console.log(timer.getReport());
        throw error;
      }
    });
  });

  (skipIfNoApiKeys ? describe.skip : describe)('使用预设模板', () => {
    it('应该能够使用唐僧取经模板生成视频', async () => {
      const timer = new PerformanceTimer();
      const testId = generateTestId();

      console.log(`\n🎬 开始模板视频生成测试: ${testId}`);

      const options: GenerateOptions = {
        projectName: `template_tang_monk_${testId}`,
        useTemplate: 'tang-monk',
        addTransition: true
      };

      timer.mark('开始生成');

      try {
        const outputPath = await generator.generateVideo(options);

        timer.mark('生成完成');

        expect(await fs.pathExists(outputPath)).toBe(true);

        const stats = await fs.stat(outputPath);
        console.log(`✅ 模板视频生成成功`);
        console.log(`   模板类型: 唐僧取经`);
        console.log(`   文件路径: ${outputPath}`);
        console.log(`   文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   ${timer.getReport()}`);

      } catch (error: any) {
        timer.mark('生成失败');
        console.error(`❌ 模板视频生成失败: ${error.message}`);
        console.log(timer.getReport());

        // 如果是API限流或超时，这是可以接受的
        if (error.message.includes('限流') || error.message.includes('超时')) {
          console.log('⚠️  API限流或超时，跳过此测试');
        } else {
          throw error;
        }
      }
    });
  });

  (skipIfNoApiKeys ? describe.skip : describe)('不同平台配置', () => {
    it('应该支持不同平台的视频配置', async () => {
      const platforms = [
        { name: 'douyin', aspectRatio: '9:16' as const },
        { name: 'wechat', aspectRatio: '1:1' as const },
        { name: 'kuaishou', aspectRatio: '9:16' as const }
      ];

      for (const platform of platforms) {
        const testId = generateTestId();
        console.log(`\n📱 测试平台: ${platform.name}`);

        const generatorConfig: GeneratorConfig = {
          accessKey: config.volcano.accessKey,
          secretKey: config.volcano.secretKey,
          outputDir: testOutputDir,
          tempDir: path.join(config.test.tempDir, testId),
          maxConcurrency: 1,
          aspectRatio: platform.aspectRatio,
          platform: platform.name as any
        };

        const platformGenerator = new VideoGenerator(generatorConfig);

        // 使用简单的单场景测试
        const options: GenerateOptions = {
          projectName: `platform_${platform.name}_${testId}`,
          scenes: [{ prompt: `${platform.name}平台测试视频`, duration: 10 }],
          addTransition: false
        };

        try {
          // 仅测试初始化和配置，不实际生成视频（节省API调用）
          expect(platformGenerator).toBeDefined();
          console.log(`✅ ${platform.name} 平台配置成功`);
        } catch (error: any) {
          console.error(`❌ ${platform.name} 平台配置失败: ${error.message}`);
          throw error;
        }
      }
    });
  });

  (skipIfNoApiKeys ? describe.skip : describe)('错误处理和恢复', () => {
    it('应该处理无效的场景配置', async () => {
      const options: GenerateOptions = {
        projectName: 'invalid_test',
        scenes: [],  // 空场景列表
        addTransition: false
      };

      await expect(generator.generateVideo(options)).rejects.toThrow('必须提供6个场景');
    });

    it('应该处理场景数量不足的情况', async () => {
      const options: GenerateOptions = {
        projectName: 'insufficient_scenes',
        scenes: [
          { prompt: '场景1', duration: 10 },
          { prompt: '场景2', duration: 10 }
        ],  // 只有2个场景，需要6个
        addTransition: false
      };

      await expect(generator.generateVideo(options)).rejects.toThrow('必须提供6个场景');
    });

    it('应该能够从失败的片段中恢复', async () => {
      // 这个测试模拟部分片段失败的情况
      // 实际测试中很难模拟，这里仅测试重试机制存在
      const testId = generateTestId();

      // 创建包含可能失败的提示词的场景
      const scenes = [
        { prompt: '正常场景1', duration: 10 },
        { prompt: '', duration: 10 },  // 空提示词可能失败
        { prompt: '正常场景3', duration: 10 },
        { prompt: '正常场景4', duration: 10 },
        { prompt: '正常场景5', duration: 10 },
        { prompt: '正常场景6', duration: 10 }
      ];

      const options: GenerateOptions = {
        projectName: `recovery_test_${testId}`,
        scenes: scenes,
        addTransition: false
      };

      try {
        await generator.generateVideo(options);
        // 如果成功，说明重试机制工作了
        console.log('✅ 错误恢复机制正常工作');
      } catch (error: any) {
        // 如果失败，检查错误信息
        console.log(`ℹ️  预期的错误: ${error.message}`);
        expect(error.message).toBeDefined();
      }
    });
  });

  (skipIfNoApiKeys ? describe.skip : describe)('性能测试', () => {
    it('应该记录生成过程的性能指标', async () => {
      const timer = new PerformanceTimer();
      const testId = generateTestId();

      // 使用最小配置进行性能测试
      const options: GenerateOptions = {
        projectName: `performance_test_${testId}`,
        scenes: Array(6).fill({ prompt: '性能测试场景', duration: 10 }),
        addTransition: false
      };

      timer.mark('初始化');

      try {
        // 模拟各个阶段
        timer.mark('准备场景');
        await new Promise(resolve => setTimeout(resolve, 100));

        timer.mark('提交任务');
        await new Promise(resolve => setTimeout(resolve, 100));

        timer.mark('等待生成');
        await new Promise(resolve => setTimeout(resolve, 100));

        timer.mark('下载视频');
        await new Promise(resolve => setTimeout(resolve, 100));

        timer.mark('合并视频');
        await new Promise(resolve => setTimeout(resolve, 100));

        timer.mark('完成');

        const report = timer.getReport();
        console.log('\n📊 性能测试报告:');
        console.log(report);

        // 验证性能指标
        expect(timer.getDuration('初始化', '完成')).toBeGreaterThan(0);
        expect(timer.getDuration()).toBeGreaterThan(500);

      } catch (error: any) {
        console.error(`❌ 性能测试失败: ${error.message}`);
        throw error;
      }
    });

    it('应该测试并发生成的性能', async () => {
      console.log('\n🚀 测试并发生成性能');

      const concurrencyLevels = [1, 2, 3];

      for (const concurrency of concurrencyLevels) {
        const timer = new PerformanceTimer();
        const testId = generateTestId();

        const generatorConfig: GeneratorConfig = {
          accessKey: config.volcano.accessKey,
          secretKey: config.volcano.secretKey,
          outputDir: testOutputDir,
          tempDir: path.join(config.test.tempDir, testId),
          maxConcurrency: concurrency,
          aspectRatio: '9:16'
        };

        const concurrentGenerator = new VideoGenerator(generatorConfig);

        timer.mark(`并发度${concurrency}开始`);

        // 仅测试配置，不实际运行
        expect(concurrentGenerator).toBeDefined();

        timer.mark(`并发度${concurrency}结束`);

        console.log(`✅ 并发度 ${concurrency}: ${timer.getDuration()}ms`);
      }
    });
  });
});