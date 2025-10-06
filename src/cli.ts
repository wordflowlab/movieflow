#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { execSync } from 'child_process';
import { PlatformDetector } from './utils/platform-detector';
import { getVersion, getVersionInfo } from './utils/version';

const program = new Command();

// 显示欢迎横幅
function displayBanner(): void {
  const banner = `
╔═══════════════════════════════════════╗
║     🎬  MovieFlow  🎥                 ║
║     AI 驱动的短视频生成工具           ║
║     Spec-Kit Compatible               ║
╚═══════════════════════════════════════╝
`;
  console.log(chalk.cyan(banner));
  console.log(chalk.gray(`  ${getVersionInfo()}\n`));
}

displayBanner();

program
  .name('movieflow')
  .description(chalk.cyan('MovieFlow - AI 驱动的短视频生成工具 (基于 Spec-Kit)'))
  .version(getVersion(), '-v, --version', '显示版本号')
  .helpOption('-h, --help', '显示帮助信息');

// init 命令 - 初始化视频项目
program
  .command('init')
  .argument('[name]', '视频项目名称')
  .option('--here', '在当前目录初始化')
  .option('--ai <type>', '选择 AI 助手: claude | cursor | gemini | windsurf', 'auto')
  .option('--all', '为所有支持的 AI 助手生成配置')
  .option('--no-git', '跳过 Git 初始化')
  .description('初始化一个新的视频项目')
  .action(async (name, options) => {
    const spinner = ora('正在初始化视频项目...').start();

    try {
      // 确定项目路径
      let projectPath: string;
      if (options.here) {
        projectPath = process.cwd();
        name = path.basename(projectPath);
      } else {
        if (!name) {
          spinner.fail('请提供项目名称或使用 --here 参数');
          process.exit(1);
        }
        projectPath = path.join(process.cwd(), name);
        if (await fs.pathExists(projectPath)) {
          spinner.fail(`项目目录 "${name}" 已存在`);
          process.exit(1);
        }
        await fs.ensureDir(projectPath);
      }

      // 创建基础项目结构
      const baseDirs = [
        '.specify',
        '.specify/memory',
        '.specify/specs',
        '.specify/projects',
        '.specify/scripts',
      ];

      for (const dir of baseDirs) {
        await fs.ensureDir(path.join(projectPath, dir));
      }

      // 根据 AI 类型创建特定目录
      const aiDirs: string[] = [];
      if (options.all) {
        aiDirs.push('.claude/commands', '.cursor/prompts', '.gemini/commands', '.windsurf/workflows');
      } else {
        switch(options.ai) {
          case 'claude':
            aiDirs.push('.claude/commands');
            break;
          case 'cursor':
            aiDirs.push('.cursor/prompts');
            break;
          case 'gemini':
            aiDirs.push('.gemini/commands');
            break;
          case 'windsurf':
            aiDirs.push('.windsurf/workflows');
            break;
          case 'auto':
            // 自动检测，创建所有目录
            aiDirs.push('.claude/commands', '.cursor/prompts', '.gemini/commands', '.windsurf/workflows');
            break;
        }
      }

      for (const dir of aiDirs) {
        await fs.ensureDir(path.join(projectPath, dir));
      }

      // 创建基础配置文件
      const config = {
        name,
        type: 'video',
        ai: options.ai,
        created: new Date().toISOString(),
        version: getVersion(),
        settings: {
          defaultDuration: 10,  // 默认10秒片段
          defaultFrames: 241,   // 10秒 = 241帧
          defaultRatio: '9:16', // 抖音竖屏
          concurrency: 3        // 并发任务数
        }
      };

      await fs.writeJson(path.join(projectPath, '.specify', 'config.json'), config, { spaces: 2 });

      // 创建 Constitution (项目原则)
      const constitution = `# MovieFlow 项目原则

## 核心理念

MovieFlow 遵循 **渐进式验证** 的开发理念，在生成最终视频前通过多个层级验证效果，降低调试成本。

## 验证层级

1. **L0 级 (免费)** - 文本质量分析
   - 评估提示词完整性
   - 提供优化建议

2. **L1 级 (约3-6元)** - 图像预览
   - wireframe: 黑白线框图，快速验证分镜
   - full: 完整彩色渲染，验证最终效果

3. **L2 级 (约28元, 可选)** - 动态预览
   - 生成10秒测试视频
   - 验证运动效果

4. **L3 级 (约170元)** - 最终生成
   - 完整60秒视频

## 开发准则

- **成本优先**: 优先使用低成本验证方式
- **快速迭代**: 通过线框图快速验证构图
- **质量保证**: 满意后才进入下一层级
- **规范驱动**: 所有功能通过 Slash 命令执行
`;

      await fs.writeFile(path.join(projectPath, '.specify', 'memory', 'constitution.md'), constitution);

      // 创建 Slash 命令模板
      const commands = [
        {
          name: 'specify',
          description: '创建视频项目规范',
          prompt: `# 创建视频项目规范

请根据用户描述创建视频项目规范。

输出格式：创建 .specify/specs/<编号>-<名称>/spec.md 文件

## 规范应包含

1. **项目概述** - 视频目的和目标受众
2. **内容要求** - 场景描述、角色设定、情节梗概
3. **技术要求** - 时长、分辨率、风格等
4. **验证标准** - 如何判断视频是否满足要求

用户输入：{args}
`
        },
        {
          name: 'plan',
          description: '创建技术实现计划',
          prompt: `# 创建技术实现计划

基于视频规范，创建详细的技术实现计划。

输出格式：创建 .specify/specs/<编号>-<名称>/plan.md 文件

## 计划应包含

1. **技术选型** - API版本、画质、音频方案
2. **分镜设计** - 6个10秒场景的详细描述
3. **资源准备** - 素材、配音、字幕等
4. **验证策略** - 选择合适的验证层级（L0/L1/L2）

用户输入：{args}
`
        },
        {
          name: 'script',
          description: '生成视频脚本',
          prompt: `# 生成视频脚本

根据技术计划生成详细的6场景视频脚本。

输出格式：.specify/projects/<项目名>/script.json

脚本结构：
\`\`\`json
{
  "title": "视频标题",
  "scenes": [
    {
      "id": 1,
      "duration": 10,
      "prompt": "场景提示词",
      "description": "场景描述",
      "voiceover": "配音文本"
    }
  ]
}
\`\`\`

用户输入：{args}
`
        },
        {
          name: 'validate',
          description: 'L0+L1 渐进式验证',
          prompt: `# 执行渐进式验证

运行 L0 文本分析和 L1 图像预览验证。

命令选项：
- --style wireframe: 黑白线框图（约3元）
- --style full: 完整渲染（约6元）
- --scenes 1,3,5: 指定验证的场景

执行步骤：
1. 读取项目脚本
2. 运行 L0 验证分析每个场景的提示词质量
3. 如果通过，运行 L1 图像预览
4. 生成验证报告

用户输入：{args}
`
        },
        {
          name: 'preview',
          description: 'L2 动态预览（可选）',
          prompt: `# 生成动态预览

生成10秒测试视频验证动态效果。

命令选项：
- --scene N: 指定预览场景（1-6）
- --with-audio: 包含音频
- --quality high: 高质量预览

执行步骤：
1. 选择场景
2. 调用火山引擎 API 生成10秒视频
3. 可选：添加音频和字幕
4. 输出预览文件

用户输入：{args}
`
        },
        {
          name: 'implement',
          description: '生成完整60秒视频',
          prompt: `# 生成完整视频

执行最终视频生成，创建60秒完整视频。

执行步骤：
1. 确认所有验证已通过
2. 分6批生成10秒片段（并发3个）
3. 生成配音和字幕
4. 使用 FFmpeg 合成最终视频
5. 输出到 .specify/projects/<项目名>/output/

用户输入：{args}
`
        }
      ];

      // 为每个 AI 助手生成命令文件
      for (const cmd of commands) {
        // Claude Code 格式 (Markdown)
        if (aiDirs.some(dir => dir.includes('.claude'))) {
          const claudePath = path.join(projectPath, '.claude', 'commands', `${cmd.name}.md`);
          const claudeContent = `---
description: ${cmd.description}
---

${cmd.prompt}
`;
          await fs.writeFile(claudePath, claudeContent);
        }

        // Cursor 格式 (Markdown)
        if (aiDirs.some(dir => dir.includes('.cursor'))) {
          const cursorPath = path.join(projectPath, '.cursor', 'prompts', `${cmd.name}.md`);
          const cursorContent = `# ${cmd.description}

${cmd.prompt}
`;
          await fs.writeFile(cursorPath, cursorContent);
        }

        // Gemini 格式 (TOML)
        if (aiDirs.some(dir => dir.includes('.gemini'))) {
          const geminiPath = path.join(projectPath, '.gemini', 'commands', `${cmd.name}.toml`);
          const geminiContent = `description = "${cmd.description}"

prompt = """
${cmd.prompt}
"""
`;
          await fs.writeFile(geminiPath, geminiContent);
        }

        // Windsurf 格式 (Markdown)
        if (aiDirs.some(dir => dir.includes('.windsurf'))) {
          const windsurfPath = path.join(projectPath, '.windsurf', 'workflows', `${cmd.name}.md`);
          const windsurfContent = `# ${cmd.description}

${cmd.prompt}
`;
          await fs.writeFile(windsurfPath, windsurfContent);
        }
      }

      // Git 初始化
      if (options.git !== false) {
        try {
          execSync('git init', { cwd: projectPath, stdio: 'ignore' });

          // 创建 .gitignore
          const gitignore = `# Dependencies
node_modules/

# Environment
.env
.env.local

# AI Cache
.ai-cache/

# Build Output
dist/
*.log

# Video Files
*.mp4
*.mov
*.avi

# Temporary
.specify/projects/*/output/
.specify/projects/*/temp/
segments/

# OS
.DS_Store
Thumbs.db
`;
          await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);

          execSync('git add .', { cwd: projectPath, stdio: 'ignore' });
          execSync('git commit -m "chore: initialize movieflow project"', { cwd: projectPath, stdio: 'ignore' });
        } catch {
          console.log(chalk.yellow('\n提示: Git 初始化失败，但项目已创建成功'));
        }
      }

      spinner.succeed(chalk.green(`视频项目 "${name}" 创建成功！`));

      // 显示后续步骤
      console.log('\n' + chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.cyan.bold('  下一步'));
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

      if (!options.here) {
        console.log(`  1. ${chalk.white.bold(`cd ${name}`)}`);
        console.log(chalk.dim('     进入项目目录\n'));
      }

      const aiName = {
        'claude': 'Claude Code',
        'cursor': 'Cursor',
        'gemini': 'Gemini CLI',
        'windsurf': 'Windsurf'
      }[options.ai] || 'AI 助手';

      if (options.all || options.ai === 'auto') {
        console.log(`  2. ${chalk.white.bold('在支持的 AI 助手中打开项目')}`);
        console.log(chalk.dim('     Claude Code / Cursor / Gemini / Windsurf\n'));
      } else {
        console.log(`  2. ${chalk.white.bold(`在 ${aiName} 中打开项目`)}\n`);
      }

      console.log(`  3. ${chalk.white.bold('使用 Slash 命令开始创作:')}`);
      console.log(`     ${chalk.cyan('┌─ /specify')}   ${chalk.dim('创建视频规范')}`);
      console.log(`     ${chalk.cyan('├─ /plan')}      ${chalk.dim('制定技术计划')}`);
      console.log(`     ${chalk.cyan('├─ /script')}    ${chalk.dim('生成视频脚本')}`);
      console.log(`     ${chalk.cyan('├─ /validate')}  ${chalk.dim('L0+L1 验证 (推荐)')}`);
      console.log(`     ${chalk.cyan('├─ /preview')}   ${chalk.dim('L2 预览 (可选)')}`);
      console.log(`     ${chalk.cyan('└─ /implement')} ${chalk.dim('生成完整视频')}`);

      console.log('\n' + chalk.yellow('💡 提示:'));
      console.log(chalk.dim('   • Slash 命令在 AI 助手中使用，不是终端命令'));
      console.log(chalk.dim('   • 使用 wireframe 风格快速验证分镜（仅3元）'));
      console.log(chalk.dim('   • 满意后再使用 full 风格验证最终效果'));
      console.log(chalk.dim('   • 运行 movieflow check 检查环境依赖\n'));

    } catch (error) {
      spinner.fail(chalk.red('项目初始化失败'));
      console.error(error);
      process.exit(1);
    }
  });

// check 命令 - 检查环境
program
  .command('check')
  .description('检查系统环境和依赖')
  .action(() => {
    console.log(chalk.cyan.bold('\n🔍 检查系统环境\n'));

    const checks = [
      { name: 'Node.js', command: 'node --version', required: true },
      { name: 'FFmpeg', command: 'ffmpeg -version', required: true },
      { name: 'Git', command: 'git --version', required: false }
    ];

    let allRequired = true;

    checks.forEach(check => {
      try {
        const version = execSync(check.command, { encoding: 'utf-8', stdio: 'pipe' }).split('\n')[0];
        console.log(chalk.green('  ✓ ') + chalk.white(check.name.padEnd(12)) + chalk.dim(version));
      } catch {
        console.log(chalk.red('  ✗ ') + chalk.white(check.name.padEnd(12)) + chalk.yellow('未安装'));
        if (check.required) allRequired = false;
      }
    });

    console.log('\n' + chalk.cyan.bold('🔑 环境变量检查\n'));

    const envVars = [
      { name: 'VOLCANO_ACCESS_KEY', required: true, desc: '火山引擎密钥（视频生成）' },
      { name: 'VOLCANO_SECRET_KEY', required: true, desc: '火山引擎密钥（视频生成）' },
      { name: 'UNIAPI_KEY', required: false, desc: 'UniAPI密钥（L1图像预览）' },
      { name: 'YUNWU_API_KEY', required: false, desc: '云雾API密钥（L1图像预览）' },
    ];

    envVars.forEach(envVar => {
      const value = process.env[envVar.name];
      if (value) {
        const masked = value.slice(0, 8) + '...';
        console.log(chalk.green('  ✓ ') + chalk.white(envVar.name.padEnd(22)) + chalk.dim(`(${masked})`));
      } else {
        const mark = envVar.required ? chalk.red('  ✗ ') : chalk.yellow('  ○ ');
        const status = envVar.required ? chalk.red('未设置') : chalk.yellow('未设置（可选）');
        console.log(mark + chalk.white(envVar.name.padEnd(22)) + status);
        console.log(chalk.dim(`      ${envVar.desc}`));
      }
    });

    if (allRequired && process.env.VOLCANO_ACCESS_KEY && process.env.VOLCANO_SECRET_KEY) {
      console.log('\n' + chalk.green.bold('✓ 环境检查通过！\n'));
    } else {
      console.log('\n' + chalk.yellow.bold('⚠ 需要完成配置\n'));
      if (!allRequired) {
        console.log(chalk.dim('安装指南:'));
        console.log(chalk.dim('  • FFmpeg: https://ffmpeg.org/download.html'));
        console.log(chalk.dim('  • Node.js: https://nodejs.org/\n'));
      }
      if (!process.env.VOLCANO_ACCESS_KEY || !process.env.VOLCANO_SECRET_KEY) {
        console.log(chalk.dim('配置环境变量:'));
        console.log(chalk.dim('  1. 复制 .env.example 为 .env'));
        console.log(chalk.dim('  2. 在 .env 中填入你的 API 密钥'));
        console.log(chalk.dim('  3. 参考 README.md 获取密钥\n'));
      }
    }
  });

// 自定义帮助信息
program.on('--help', () => {
  console.log('');
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.cyan.bold('  使用示例'));
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  console.log(chalk.white('  基础用法:'));
  console.log(chalk.dim('    $ movieflow init my-video'));
  console.log(chalk.dim('    $ movieflow init my-video --ai claude'));
  console.log(chalk.dim('    $ movieflow init --here\n'));
  console.log(chalk.white('  环境检查:'));
  console.log(chalk.dim('    $ movieflow check\n'));
  console.log(chalk.yellow('  💡 提示:'));
  console.log(chalk.dim('     业务功能通过 AI 助手的 Slash 命令执行'));
  console.log(chalk.dim('     运行 movieflow init 后查看可用命令\n'));
  console.log(chalk.dim('  文档: https://github.com/wordflowlab/movieflow'));
  console.log(chalk.dim('  基于: Spec-Kit (https://github.com/github/spec-kit)\n'));
});

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
