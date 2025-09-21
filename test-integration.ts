/**
 * MovieFlow 集成测试脚本
 * 测试多平台 AI 助手适配器和断点续传功能
 */

import * as dotenv from 'dotenv';
import { PlatformDetector } from './src/utils/platform-detector';
import { TaskStateManager } from './src/core/task-state-manager';
import { VideoGenerator } from './src/core/video-generator';
import chalk from 'chalk';

// 加载环境变量
dotenv.config();

async function testPlatformDetection() {
  console.log(chalk.cyan('\n=== 测试平台检测 ===\n'));

  const detector = PlatformDetector.getInstance();
  detector.showPlatformInfo();

  // 测试不同平台适配器
  const platforms = ['claude', 'cursor', 'windsurf', 'gemini'] as const;
  
  for (const platform of platforms) {
    console.log(chalk.yellow(`\n测试 ${platform} 适配器:`));
    detector.setPlatform(platform);
    const adapter = detector.getAdapter();
    
    // 测试进度输出
    adapter.outputProgress({
      type: 'task_start',
      taskName: '测试任务',
      detail: `测试 ${platform} 平台输出`
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    adapter.outputProgress({
      type: 'task_progress',
      taskName: '测试任务',
      progress: 50,
      current: 1,
      total: 2,
      message: '处理中...'
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    adapter.outputProgress({
      type: 'task_complete',
      taskName: '测试任务',
      message: '完成'
    });
  }
}

async function testTaskStateManager() {
  console.log(chalk.cyan('\n=== 测试任务状态管理 ===\n'));

  const stateManager = new TaskStateManager('.test-state');

  // 创建测试会话
  const session = await stateManager.createSession(
    'test-project',
    [
      { prompt: '测试片段1' },
      { prompt: '测试片段2' },
      { prompt: '测试片段3' }
    ],
    {
      apiVersion: 'v30_pro',
      aspectRatio: '9:16'
    }
  );

  console.log(chalk.green(`✅ 创建会话: ${session.id}`));

  // 模拟更新片段状态
  await stateManager.updateSegmentStatus(0, 'submitted', { taskId: 'test-task-1' });
  await stateManager.updateSegmentStatus(0, 'completed', { videoUrl: 'http://test.mp4' });

  // 生成报告
  const report = stateManager.generateReport();
  console.log(report);

  // 测试会话恢复
  const resumed = await stateManager.resumeSession(session.id);
  if (resumed) {
    console.log(chalk.green('✅ 会话恢复成功'));
  }

  // 清理
  stateManager.destroy();
}

async function testHeartbeat() {
  console.log(chalk.cyan('\n=== 测试心跳机制 ===\n'));

  const detector = PlatformDetector.getInstance();
  const adapter = detector.getAdapter();

  console.log('模拟长时间任务，测试心跳输出...');
  
  adapter.startHeartbeat('视频生成');
  
  // 模拟20秒的长时间任务
  for (let i = 0; i <= 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (i % 5 === 0 && i > 0) {
      adapter.outputProgress({
        type: 'task_progress',
        taskName: '视频生成',
        progress: (i / 20) * 100,
        message: `已处理 ${i} 秒`,
        eta: 20 - i
      });
    }
  }
  
  adapter.stopHeartbeat();
  adapter.outputMessage('心跳测试完成', 'success');
}

async function main() {
  console.log(chalk.blue.bold('\n🚀 MovieFlow 集成测试\n'));

  try {
    // 测试平台检测
    await testPlatformDetection();
    
    // 测试任务状态管理
    await testTaskStateManager();
    
    // 测试心跳机制
    await testHeartbeat();
    
    console.log(chalk.green.bold('\n✅ 所有测试完成\n'));

    // 提示下一步
    console.log(chalk.yellow('💡 下一步:'));
    console.log('1. 复制 .env.example 为 .env');
    console.log('2. 填入您的火山引擎 API 密钥');
    console.log('3. 运行: movieflow generate test-video --template tang-monk');
    console.log('4. 如果中断，可以使用: movieflow sessions --list 查看会话');
    console.log('5. 然后: movieflow generate test-video --resume <session-id>');
    
  } catch (error: any) {
    console.error(chalk.red(`\n❌ 测试失败: ${error.message}`));
    process.exit(1);
  }
}

// 运行测试
main();