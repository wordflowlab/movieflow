/**
 * WorkflowOrchestrator 使用示例
 *
 * 这个示例展示如何使用 WorkflowOrchestrator 执行多阶段视频生成工作流
 */

import { WorkflowOrchestrator, WorkflowConfig } from '../src/core/workflow-orchestrator';
import { StandardVideoPrompt } from '../src/adapters/platform-adapters';
import { initializePlatformAdapters } from '../src/adapters/platform-adapters';

async function main() {
  console.log('🎬 WorkflowOrchestrator 示例\n');

  // 1. 初始化平台适配器
  console.log('初始化平台适配器...');
  initializePlatformAdapters();

  // 2. 创建工作流编排器
  const orchestrator = new WorkflowOrchestrator('./temp/.state');

  // 3a. 方式1: 从 plan.md 加载配置
  // await orchestrator.loadPlanFromFile('./docs/plan.md');

  // 3b. 方式2: 手动创建配置
  const config: WorkflowConfig = {
    projectName: 'example-video',
    totalDuration: 60,
    segmentCount: 6,

    phases: {
      // Phase 0: 可选 - 主设计图生成
      phase0: {
        enabled: false, // 关闭以节省成本
        platform: 'midjourney',
        cost: 18
      },

      // Phase 3: 必须 - 视频生成
      phase3: {
        enabled: true,
        platform: 'jimeng',
        parameters: {
          version: 'v30_pro',
          aspect_ratio: '9:16'
        }
      },

      // Phase 4: 可选 - 4K放大
      phase4: {
        enabled: false
      }
    },

    primaryPlatform: 'jimeng',
    fallbackPlatform: 'sora2', // 如果即梦失败,降级到Sora2
    promptStrategy: 'layered-structure',

    validation: {
      l0: true, // 启用免费验证
      l1: true  // 启用低成本验证
    },

    costBudget: {
      total: 1020, // 6片段 × ¥170
      perScene: 170
    },

    // 定义6个场景 (6×10秒)
    scenes: [
      {
        sceneId: 'scene-01',
        sceneName: '开场场景',
        duration: 10,
        aspectRatio: '9:16',

        visual: {
          foreground: '飘落的樱花花瓣',
          midground: '一位28岁的女性,身穿古典旗袍,站在园林中',
          background: '古典园林,亭台楼阁,夕阳西下'
        },

        camera: {
          shotSize: 'MS',
          movement: 'dolly'
        },

        lighting: {
          style: '黄昏柔光',
          timeOfDay: '傍晚',
          mood: '怀旧'
        },

        colorGrading: {
          style: '复古暖色调',
          palette: ['金黄', '粉红', '浅绿'],
          mood: '怀旧'
        },

        firstLastFrame: {
          firstFrame: '女性站立,面向镜头',
          lastFrame: '女性转身,准备离开'
        }
      },

      {
        sceneId: 'scene-02',
        sceneName: '行走场景',
        duration: 10,
        aspectRatio: '9:16',

        visual: {
          foreground: '飘落的树叶',
          midground: '女性缓步行走在石板路上',
          background: '古典园林,竹林摇曳'
        },

        camera: {
          shotSize: 'FS',
          movement: 'tracking'
        },

        lighting: {
          style: '自然光',
          timeOfDay: '傍晚',
          mood: '宁静'
        },

        firstLastFrame: {
          firstFrame: '女性开始迈步',
          lastFrame: '女性走到石桥边'
        }
      },

      {
        sceneId: 'scene-03',
        sceneName: '回忆场景',
        duration: 10,
        aspectRatio: '9:16',

        visual: {
          midground: '女性站在石桥上,凝视湖面',
          background: '平静的湖面倒映着夕阳'
        },

        camera: {
          shotSize: 'CU',
          movement: 'fixed'
        },

        lighting: {
          style: '逆光',
          timeOfDay: '傍晚',
          mood: '忧郁'
        },

        colorGrading: {
          style: '低饱和',
          mood: '怀旧'
        },

        firstLastFrame: {
          firstFrame: '女性凝视湖面',
          lastFrame: '女性闭眼回忆'
        }
      },

      {
        sceneId: 'scene-04',
        sceneName: '转折场景',
        duration: 10,
        aspectRatio: '9:16',

        visual: {
          midground: '女性睁眼,表情从忧郁转为释然',
          background: '夕阳渐落,天色渐暗'
        },

        camera: {
          shotSize: 'MCU',
          movement: 'fixed'
        },

        lighting: {
          style: '侧光',
          timeOfDay: '傍晚',
          mood: '转折'
        },

        firstLastFrame: {
          firstFrame: '女性闭眼,忧郁',
          lastFrame: '女性睁眼,微笑'
        }
      },

      {
        sceneId: 'scene-05',
        sceneName: '离开场景',
        duration: 10,
        aspectRatio: '9:16',

        visual: {
          foreground: '石桥栏杆',
          midground: '女性转身离开石桥',
          background: '园林小径,夜幕降临'
        },

        camera: {
          shotSize: 'WS',
          movement: 'crane'
        },

        lighting: {
          style: '蓝调时分',
          timeOfDay: '黄昏',
          mood: '希望'
        },

        firstLastFrame: {
          firstFrame: '女性站在石桥上',
          lastFrame: '女性走下石桥,背影'
        }
      },

      {
        sceneId: 'scene-06',
        sceneName: '结尾场景',
        duration: 10,
        aspectRatio: '9:16',

        visual: {
          foreground: '园林门扉',
          midground: '女性走出园林,步入城市灯火',
          background: '现代城市夜景'
        },

        camera: {
          shotSize: 'EWS',
          movement: 'dolly'
        },

        lighting: {
          style: '城市灯光',
          timeOfDay: '夜晚',
          mood: '新生'
        },

        colorGrading: {
          style: '冷暖对比',
          palette: ['暖黄城市灯', '冷蓝天空'],
          mood: '对比'
        },

        firstLastFrame: {
          firstFrame: '女性在园林门口',
          lastFrame: '女性融入城市,远去'
        }
      }
    ]
  };

  // 4. 执行工作流
  console.log('\n开始执行工作流...\n');

  try {
    const result = await orchestrator.executeWorkflow(config);

    console.log('\n✅ 工作流执行成功!\n');
    console.log('输出结果:');
    console.log(`  - 项目名称: ${result.projectName}`);
    console.log(`  - 生成片段: ${result.phases.phase3.outputs.length} 个`);
    console.log(`  - 总成本: ¥${result.totalCost}`);
    console.log(`  - 总时长: ${Math.round(result.totalTime / 60)} 分钟`);

    // 5. 查看生成的视频
    result.phases.phase3.outputs.forEach((output, index) => {
      console.log(`\n  场景 ${index + 1}:`);
      console.log(`    - 本地路径: ${output.localPath}`);
      console.log(`    - 时长: ${output.duration}s`);
      console.log(`    - 分辨率: ${output.resolution.width}x${output.resolution.height}`);
      console.log(`    - 成本: ¥${output.actualCost}`);
      console.log(`    - 生成时间: ${Math.round(output.generationTime / 60)}分钟`);
    });

  } catch (error: any) {
    console.error('\n❌ 工作流执行失败:', error.message);
    process.exit(1);
  } finally {
    // 6. 清理
    orchestrator.destroy();
  }
}

// ============ 其他使用示例 ============

/**
 * 示例2: 从 plan.md 加载并执行
 */
async function exampleLoadFromPlan() {
  const orchestrator = new WorkflowOrchestrator();

  // 从 plan.md 加载配置
  await orchestrator.loadPlanFromFile('./docs/plan.md');

  // 设置场景 (可以从 spec.md 解析或手动定义)
  const scenes: StandardVideoPrompt[] = [
    // ... 场景定义
  ];
  orchestrator.setScenes(scenes);

  // 执行
  const result = await orchestrator.executeWorkflow();

  orchestrator.destroy();
}

/**
 * 示例3: 多平台混合策略
 */
async function exampleMultiPlatformStrategy() {
  initializePlatformAdapters();
  const orchestrator = new WorkflowOrchestrator();

  const config: WorkflowConfig = {
    projectName: 'multi-platform-video',
    totalDuration: 60,
    segmentCount: 6,

    phases: {
      phase3: { enabled: true }
    },

    // 对话场景用 Sora2,静态场景用即梦AI
    primaryPlatform: 'sora2', // 默认Sora2
    fallbackPlatform: 'jimeng',
    promptStrategy: 'ai-optimized',

    validation: {
      l0: true,
      l1: true
    },

    costBudget: {
      total: 1500,
      perScene: 250
    },

    scenes: [
      // Scene 1-2: 对话场景,使用 Sora2
      {
        sceneId: 'scene-01',
        duration: 10,
        aspectRatio: '16:9',
        visual: { midground: '两人对话' },
        dialogue: [{
          speaker: 'Woman',
          text: 'How are you?',
          timing: { start: 2, end: 4 },
          lipSync: true, // Sora2 支持
          emotion: 'friendly'
        }]
      } as StandardVideoPrompt,

      // Scene 3-6: 静态场景,后续可以手动切换到即梦AI
      {
        sceneId: 'scene-03',
        duration: 10,
        aspectRatio: '9:16',
        visual: { midground: '园林风景' },
        // 无对话,适合即梦AI
      } as StandardVideoPrompt

      // ... 更多场景
    ]
  };

  const result = await orchestrator.executeWorkflow(config);
  orchestrator.destroy();
}

// 运行主示例
if (require.main === module) {
  main().catch(console.error);
}

export { main, exampleLoadFromPlan, exampleMultiPlatformStrategy };
