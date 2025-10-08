/**
 * 工作流编排器
 * 根据 plan.md 执行多阶段视频生成工作流
 *
 * 工作流阶段:
 * - Phase 0: 主设计图生成 (可选) - Midjourney/FLUX
 * - Phase 1: 置景设计 (可选) - 3D 场景布局
 * - Phase 2: 打光设计 (可选) - 专业光照方案
 * - Phase 3: 视频生成 (必须) - 核心阶段
 * - Phase 4: 4K放大 (可选) - 分辨率增强
 */

import {
  BaseVideoPlatformAdapter,
  StandardVideoPrompt,
  PlatformSpecificPrompt,
  VideoGenerationTask,
  VideoGenerationResult,
  PlatformAdapterFactory
} from '../adapters/platform-adapters';
import { TaskStateManager, TaskSession } from './task-state-manager';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

/**
 * 工作流阶段配置
 */
export interface WorkflowPhaseConfig {
  enabled: boolean;
  platform?: string;
  parameters?: Record<string, any>;
  cost?: number;
  estimatedTime?: number;
}

/**
 * 工作流配置(从 plan.md 解析)
 */
export interface WorkflowConfig {
  projectName: string;
  totalDuration: number;
  segmentCount: number;

  phases: {
    phase0?: WorkflowPhaseConfig; // 主设计图生成
    phase1?: WorkflowPhaseConfig; // 置景设计
    phase2?: WorkflowPhaseConfig; // 打光设计
    phase3: WorkflowPhaseConfig;  // 视频生成 (必须)
    phase4?: WorkflowPhaseConfig; // 4K放大
  };

  // Phase 3 核心配置
  primaryPlatform: string;
  fallbackPlatform?: string;
  promptStrategy: 'layered-structure' | 'film-script' | 'ai-optimized' | 'commercial';

  // 验证策略
  validation: {
    l0: boolean; // 免费验证
    l1: boolean; // 低成本验证
    l2?: boolean; // 中成本验证
  };

  // 成本控制
  costBudget: {
    total: number;
    perScene: number;
  };

  // 场景定义
  scenes: StandardVideoPrompt[];
}

/**
 * 工作流执行结果
 */
export interface WorkflowResult {
  projectName: string;
  phases: {
    phase0?: { outputs: string[]; cost: number; time: number };
    phase1?: { outputs: string[]; cost: number; time: number };
    phase2?: { outputs: string[]; cost: number; time: number };
    phase3: { outputs: VideoGenerationResult[]; cost: number; time: number };
    phase4?: { outputs: string[]; cost: number; time: number };
  };
  totalCost: number;
  totalTime: number;
  outputPath: string;
}

/**
 * 工作流编排器
 */
export class WorkflowOrchestrator {
  private taskStateManager: TaskStateManager;
  private config: WorkflowConfig | null = null;
  private currentSession: TaskSession | null = null;

  constructor(stateDir: string = '.movieflow-state') {
    this.taskStateManager = new TaskStateManager(stateDir);
  }

  /**
   * 从 plan.md 加载配置
   */
  async loadPlanFromFile(planPath: string): Promise<WorkflowConfig> {
    if (!await fs.pathExists(planPath)) {
      throw new Error(`Plan file not found: ${planPath}`);
    }

    const planContent = await fs.readFile(planPath, 'utf-8');
    const config = this.parsePlanMarkdown(planContent);
    this.config = config;

    console.log(chalk.blue('📋 工作流配置加载成功\n'));
    console.log(`  项目: ${config.projectName}`);
    console.log(`  总时长: ${config.totalDuration}s`);
    console.log(`  场景数: ${config.segmentCount}`);
    console.log(`  主平台: ${config.primaryPlatform}`);

    return config;
  }

  /**
   * 解析 plan.md
   */
  private parsePlanMarkdown(content: string): WorkflowConfig {
    // 这是一个简化实现
    // 实际应该使用更复杂的 markdown 解析器
    // 暂时使用正则提取关键信息

    const config: WorkflowConfig = {
      projectName: this.extractValue(content, /Project Name:\s*(.+)/) || 'untitled',
      totalDuration: parseInt(this.extractValue(content, /Total Duration:\s*(\d+)/) || '60'),
      segmentCount: parseInt(this.extractValue(content, /Segment Count:\s*(\d+)/) || '6'),
      phases: {
        phase3: { enabled: true } // Phase 3 必须启用
      },
      primaryPlatform: this.extractValue(content, /Primary Platform:\s*(.+)/) || 'jimeng',
      fallbackPlatform: this.extractValue(content, /Fallback Platform:\s*(.+)/),
      promptStrategy: 'layered-structure',
      validation: {
        l0: content.includes('L0'),
        l1: content.includes('L1'),
        l2: content.includes('L2')
      },
      costBudget: {
        total: parseFloat(this.extractValue(content, /Total Budget:\s*¥?(\d+)/) || '1000'),
        perScene: parseFloat(this.extractValue(content, /Per Scene:\s*¥?(\d+)/) || '170')
      },
      scenes: [] // 需要从 spec.md 或配置中加载
    };

    // 检测启用的阶段
    if (content.includes('### Phase 0') && content.includes('**Enabled**: YES')) {
      config.phases.phase0 = { enabled: true };
    }
    if (content.includes('### Phase 1') && content.includes('**Enabled**: YES')) {
      config.phases.phase1 = { enabled: true };
    }
    if (content.includes('### Phase 2') && content.includes('**Enabled**: YES')) {
      config.phases.phase2 = { enabled: true };
    }
    if (content.includes('### Phase 4') && content.includes('**Enabled**: YES')) {
      config.phases.phase4 = { enabled: true };
    }

    return config;
  }

  /**
   * 从内容中提取值
   */
  private extractValue(content: string, regex: RegExp): string | undefined {
    const match = content.match(regex);
    return match ? match[1].trim() : undefined;
  }

  /**
   * 执行完整工作流
   */
  async executeWorkflow(config?: WorkflowConfig): Promise<WorkflowResult> {
    const workflowConfig = config || this.config;
    if (!workflowConfig) {
      throw new Error('No workflow configuration loaded');
    }

    console.log(chalk.green('\n🎬 开始执行工作流\n'));

    const result: WorkflowResult = {
      projectName: workflowConfig.projectName,
      phases: {
        phase3: { outputs: [], cost: 0, time: 0 }
      },
      totalCost: 0,
      totalTime: 0,
      outputPath: ''
    };

    const startTime = Date.now();

    try {
      // Phase 0: 主设计图生成 (可选)
      if (workflowConfig.phases.phase0?.enabled) {
        result.phases.phase0 = await this.executePhase0(workflowConfig);
      }

      // Phase 1: 置景设计 (可选)
      if (workflowConfig.phases.phase1?.enabled) {
        result.phases.phase1 = await this.executePhase1(workflowConfig);
      }

      // Phase 2: 打光设计 (可选)
      if (workflowConfig.phases.phase2?.enabled) {
        result.phases.phase2 = await this.executePhase2(workflowConfig);
      }

      // Phase 3: 视频生成 (必须)
      result.phases.phase3 = await this.executePhase3(workflowConfig);

      // Phase 4: 4K放大 (可选)
      if (workflowConfig.phases.phase4?.enabled) {
        result.phases.phase4 = await this.executePhase4(
          result.phases.phase3.outputs.map(r => r.localPath || '')
        );
      }

      // 计算总成本和时间
      result.totalTime = Math.round((Date.now() - startTime) / 1000);
      result.totalCost = this.calculateTotalCost(result);

      console.log(chalk.green('\n✅ 工作流执行成功\n'));
      this.printSummary(result);

      return result;
    } catch (error: any) {
      console.error(chalk.red(`\n❌ 工作流执行失败: ${error.message}\n`));
      throw error;
    }
  }

  /**
   * 执行 Phase 0: 主设计图生成
   */
  private async executePhase0(config: WorkflowConfig): Promise<{
    outputs: string[];
    cost: number;
    time: number;
  }> {
    console.log(chalk.blue('\n📐 Phase 0: 主设计图生成\n'));

    const startTime = Date.now();
    const outputs: string[] = [];

    // TODO: 集成 Midjourney/FLUX API
    // 这里是占位实现
    console.log('  [TODO] Midjourney/FLUX 集成开发中...');

    const cost = 18; // 估算 6张 × 3元
    const time = Math.round((Date.now() - startTime) / 1000);

    return { outputs, cost, time };
  }

  /**
   * 执行 Phase 1: 置景设计
   */
  private async executePhase1(config: WorkflowConfig): Promise<{
    outputs: string[];
    cost: number;
    time: number;
  }> {
    console.log(chalk.blue('\n🏗️  Phase 1: 置景设计\n'));

    const startTime = Date.now();
    const outputs: string[] = [];

    // TODO: 集成 3D 场景布局工具
    console.log('  [TODO] 3D 置景工具集成开发中...');

    const cost = 0; // 通常使用免费工具
    const time = Math.round((Date.now() - startTime) / 1000);

    return { outputs, cost, time };
  }

  /**
   * 执行 Phase 2: 打光设计
   */
  private async executePhase2(config: WorkflowConfig): Promise<{
    outputs: string[];
    cost: number;
    time: number;
  }> {
    console.log(chalk.blue('\n💡 Phase 2: 打光设计\n'));

    const startTime = Date.now();
    const outputs: string[] = [];

    // TODO: 集成光照设计工具
    console.log('  [TODO] 光照设计工具集成开发中...');

    const cost = 0;
    const time = Math.round((Date.now() - startTime) / 1000);

    return { outputs, cost, time };
  }

  /**
   * 执行 Phase 3: 视频生成 (核心)
   */
  private async executePhase3(config: WorkflowConfig): Promise<{
    outputs: VideoGenerationResult[];
    cost: number;
    time: number;
  }> {
    console.log(chalk.blue('\n🎥 Phase 3: 视频生成 (核心阶段)\n'));

    const startTime = Date.now();
    const outputs: VideoGenerationResult[] = [];
    let totalCost = 0;

    // 获取主平台适配器
    const adapter = PlatformAdapterFactory.getAdapter(config.primaryPlatform);
    const fallbackAdapter = config.fallbackPlatform ?
      PlatformAdapterFactory.getAdapter(config.fallbackPlatform) :
      undefined;

    console.log(`  主平台: ${adapter.capabilities.name}`);
    if (fallbackAdapter) {
      console.log(`  备用平台: ${fallbackAdapter.capabilities.name}`);
    }

    // 验证场景
    const scenes = config.scenes;
    if (scenes.length === 0) {
      throw new Error('No scenes defined in workflow config');
    }

    // 逐个处理场景
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      console.log(chalk.cyan(`\n  场景 ${i + 1}/${scenes.length}: ${scene.sceneName || scene.sceneId}`));

      try {
        // 验证场景与平台兼容性
        const validation = adapter.validatePrompt(scene);
        if (!validation.isValid) {
          console.warn(chalk.yellow('  ⚠️  警告:'));
          validation.warnings.forEach(w => console.warn(`    - ${w}`));
        }

        // 转换提示词
        const platformPrompt = await adapter.convertPrompt(scene);
        console.log(`  预估成本: ¥${platformPrompt.estimatedCost}`);
        console.log(`  预估时间: ${Math.round(platformPrompt.estimatedTime / 60)}分钟`);

        // 提交任务
        const taskId = await adapter.submitTask(platformPrompt);
        console.log(chalk.green(`  ✓ 任务已提交: ${taskId}`));

        // 轮询任务状态
        const result = await this.pollTask(adapter, taskId, scene.sceneId);

        // 下载视频
        const localPath = path.join('./outputs', `${scene.sceneId}.mp4`);
        const videoResult = await adapter.downloadVideo(taskId, localPath);

        outputs.push(videoResult);
        totalCost += videoResult.actualCost;

        console.log(chalk.green(`  ✓ 场景 ${i + 1} 生成成功`));
      } catch (error: any) {
        console.error(chalk.red(`  ✗ 场景 ${i + 1} 失败: ${error.message}`));

        // 尝试降级到备用平台
        if (fallbackAdapter) {
          console.log(chalk.yellow(`  ⤷ 尝试降级到 ${fallbackAdapter.capabilities.name}`));

          try {
            // 修改 prompt 以适应备用平台
            const modifiedScene = this.adaptSceneForFallback(scene, fallbackAdapter);
            const fallbackPrompt = await fallbackAdapter.convertPrompt(modifiedScene);
            const fallbackTaskId = await fallbackAdapter.submitTask(fallbackPrompt);
            const fallbackResult = await this.pollTask(fallbackAdapter, fallbackTaskId, scene.sceneId);

            const localPath = path.join('./outputs', `${scene.sceneId}.mp4`);
            const videoResult = await fallbackAdapter.downloadVideo(fallbackTaskId, localPath);

            outputs.push(videoResult);
            totalCost += videoResult.actualCost;

            console.log(chalk.green(`  ✓ 场景 ${i + 1} 降级生成成功`));
          } catch (fallbackError: any) {
            console.error(chalk.red(`  ✗ 降级也失败: ${fallbackError.message}`));
            throw new Error(`场景 ${i + 1} 生成失败(主平台和降级都失败)`);
          }
        } else {
          throw error;
        }
      }
    }

    const time = Math.round((Date.now() - startTime) / 1000);

    return { outputs, cost: totalCost, time };
  }

  /**
   * 执行 Phase 4: 4K放大
   */
  private async executePhase4(inputPaths: string[]): Promise<{
    outputs: string[];
    cost: number;
    time: number;
  }> {
    console.log(chalk.blue('\n🔍 Phase 4: 4K 放大\n'));

    const startTime = Date.now();
    const outputs: string[] = [];

    // TODO: 集成 4K 放大工具 (如 Topaz Video AI)
    console.log('  [TODO] 4K 放大工具集成开发中...');

    const cost = 0;
    const time = Math.round((Date.now() - startTime) / 1000);

    return { outputs, cost, time };
  }

  /**
   * 轮询任务直到完成
   */
  private async pollTask(
    adapter: BaseVideoPlatformAdapter,
    taskId: string,
    sceneId: string
  ): Promise<VideoGenerationTask> {
    const spinner = ora(`等待生成...`).start();
    const maxWaitTime = 600000; // 10分钟
    const pollInterval = 10000; // 10秒
    const startTime = Date.now();

    try {
      while (Date.now() - startTime < maxWaitTime) {
        const task = await adapter.queryTask(taskId);

        if (task.status === 'completed') {
          spinner.succeed('生成完成');
          return task;
        } else if (task.status === 'failed') {
          spinner.fail('生成失败');
          throw new Error(task.error || 'Unknown error');
        } else if (task.status === 'cancelled') {
          spinner.fail('任务已取消');
          throw new Error('Task cancelled');
        }

        // 更新进度
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const eta = task.eta || adapter.estimateTime({ duration: 10 } as any);
        spinner.text = `等待生成... (${task.progress}%, ETA: ${Math.round(eta / 60)}分钟)`;

        await this.delay(pollInterval);
      }

      spinner.fail('生成超时');
      throw new Error('Task timeout');
    } catch (error) {
      spinner.fail('生成失败');
      throw error;
    }
  }

  /**
   * 适配场景以匹配降级平台
   */
  private adaptSceneForFallback(
    scene: StandardVideoPrompt,
    fallbackAdapter: BaseVideoPlatformAdapter
  ): StandardVideoPrompt {
    const modifiedScene = { ...scene };

    // 移除不支持的特性
    if (!fallbackAdapter.capabilities.hasLipSync) {
      // 移除 lip-sync 要求
      if (modifiedScene.dialogue) {
        modifiedScene.dialogue = modifiedScene.dialogue.map(d => ({
          ...d,
          lipSync: false
        }));
      }
    }

    if (!fallbackAdapter.capabilities.hasFirstLastFrame) {
      // 移除首尾帧
      delete modifiedScene.firstLastFrame;
    }

    // 检查时长限制
    if (modifiedScene.duration > fallbackAdapter.capabilities.maxDuration) {
      modifiedScene.duration = fallbackAdapter.capabilities.maxDuration;
    }

    return modifiedScene;
  }

  /**
   * 计算总成本
   */
  private calculateTotalCost(result: WorkflowResult): number {
    let total = 0;
    if (result.phases.phase0) total += result.phases.phase0.cost;
    if (result.phases.phase1) total += result.phases.phase1.cost;
    if (result.phases.phase2) total += result.phases.phase2.cost;
    total += result.phases.phase3.cost;
    if (result.phases.phase4) total += result.phases.phase4.cost;
    return total;
  }

  /**
   * 打印执行摘要
   */
  private printSummary(result: WorkflowResult): void {
    console.log(chalk.green('━'.repeat(60)));
    console.log(chalk.green.bold('  工作流执行摘要'));
    console.log(chalk.green('━'.repeat(60)));
    console.log(`  项目: ${result.projectName}`);
    console.log(`  总成本: ¥${result.totalCost.toFixed(2)}`);
    console.log(`  总时长: ${Math.round(result.totalTime / 60)}分钟`);
    console.log('');

    if (result.phases.phase0) {
      console.log(`  Phase 0 (主设计图): ${result.phases.phase0.outputs.length} 张, ¥${result.phases.phase0.cost}`);
    }
    if (result.phases.phase1) {
      console.log(`  Phase 1 (置景): ¥${result.phases.phase1.cost}`);
    }
    if (result.phases.phase2) {
      console.log(`  Phase 2 (打光): ¥${result.phases.phase2.cost}`);
    }
    console.log(`  Phase 3 (视频): ${result.phases.phase3.outputs.length} 个片段, ¥${result.phases.phase3.cost}`);
    if (result.phases.phase4) {
      console.log(`  Phase 4 (4K放大): ${result.phases.phase4.outputs.length} 个, ¥${result.phases.phase4.cost}`);
    }

    console.log(chalk.green('━'.repeat(60)));
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 设置场景
   */
  setScenes(scenes: StandardVideoPrompt[]): void {
    if (!this.config) {
      throw new Error('No workflow configuration loaded');
    }
    this.config.scenes = scenes;
  }

  /**
   * 获取当前配置
   */
  getConfig(): WorkflowConfig | null {
    return this.config;
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.taskStateManager.destroy();
  }
}
