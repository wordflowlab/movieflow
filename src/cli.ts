#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { execSync } from 'child_process';
import { scriptExportCommand, generateScriptCommand } from './commands/script-export';
import { validateCommand, previewCommand } from './commands/validate';
import { PlatformDetector } from './utils/platform-detector';
import { TaskStateManager } from './core/task-state-manager';
import { VideoGenerator } from './core/video-generator';
import { getVersion, getVersionInfo } from './utils/version';
import * as dotenv from 'dotenv';

const program = new Command();

// 辅助函数：处理命令模板生成 Markdown 格式
function generateMarkdownCommand(template: string, scriptPath: string): string {
  return template.replace(/{SCRIPT}/g, scriptPath);
}

// 辅助函数：生成 TOML 格式命令
function generateTomlCommand(template: string, scriptPath: string): string {
  const descMatch = template.match(/description:\s*(.+)/);
  const description = descMatch ? descMatch[1].trim() : '命令说明';

  // 移除 YAML frontmatter
  const content = template.replace(/^---[\s\S]*?---\n/, '');

  // 替换 {SCRIPT}
  const processedContent = content.replace(/{SCRIPT}/g, scriptPath);

  return `description = "${description}"

prompt = """
${processedContent}
"""`;
}

// 显示欢迎横幅
function displayBanner(): void {
  const platformDetector = PlatformDetector.getInstance();
  const platform = platformDetector.getPlatform();

  const banner = `
╔═══════════════════════════════════════╗
║     🎬  MovieFlow  🎥                 ║
║     AI 驱动的短视频生成工具           ║
╚═══════════════════════════════════════╝
`;
  console.log(chalk.cyan(banner));
  console.log(chalk.gray(`  ${getVersionInfo()}`));
  console.log(chalk.gray(`  检测到平台: ${platform.toUpperCase()}\n`));
}

displayBanner();

program
  .name('movieflow')
  .description(chalk.cyan('MovieFlow - AI 驱动的短视频生成工具初始化'))
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
        '.specify/scripts',
        '.specify/scripts/bash',
        '.specify/scripts/powershell',
        '.specify/templates',
        'videos',
        'assets',
        'segments',
        '.movieflow-state'  // 添加状态目录
      ];

      for (const dir of baseDirs) {
        await fs.ensureDir(path.join(projectPath, dir));
      }

      // 根据 AI 类型创建特定目录
      const aiDirs: string[] = [];
      if (options.all) {
        aiDirs.push('.claude/commands', '.cursor/commands', '.gemini/commands', '.windsurf/workflows');
      } else {
        switch(options.ai) {
          case 'claude':
            aiDirs.push('.claude/commands');
            break;
          case 'cursor':
            aiDirs.push('.cursor/commands');
            break;
          case 'gemini':
            aiDirs.push('.gemini/commands');
            break;
          case 'windsurf':
            aiDirs.push('.windsurf/workflows');
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

      // 创建 spec.md 文件
      const packageRoot = path.resolve(__dirname, '..');
      const templatesDir = path.join(packageRoot, 'templates', 'commands');
      const scriptsDir = path.join(packageRoot, 'scripts');

      let specContent = `# MovieFlow Spec - AI 短视频生成命令规范

本文件定义了 MovieFlow 支持的所有斜杠命令。
在 Claude、Cursor 或其他 AI 助手中使用这些命令进行视频创作。

## 核心概念

- **分段生成**: 60秒视频分为6个10秒片段
- **并行处理**: 同时处理3个任务避免超限
- **视频合成**: 使用FFmpeg合并片段

`;

      if (await fs.pathExists(templatesDir)) {
        const commandFiles = await fs.readdir(templatesDir);

        // 生成合并的 spec.md
        for (const file of commandFiles.sort()) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
            const commandName = path.basename(file, '.md');
            specContent += `## /${commandName}\n\n${content}\n\n`;
          }
        }
        await fs.writeFile(path.join(projectPath, '.specify', 'spec.md'), specContent);

        // 为每个 AI 助手生成特定格式的命令文件
        for (const file of commandFiles) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
            const commandName = path.basename(file, '.md');

            // 提取脚本路径
            const shMatch = content.match(/sh:\s*(.+)/);
            const scriptPath = shMatch ? shMatch[1].trim() : `.specify/scripts/bash/${commandName}.sh`;

            // 为各 AI 助手生成命令文件
            if (aiDirs.some(dir => dir.includes('.claude'))) {
              const claudePath = path.join(projectPath, '.claude', 'commands', file);
              const claudeContent = generateMarkdownCommand(content, scriptPath);
              await fs.writeFile(claudePath, claudeContent);
            }

            if (aiDirs.some(dir => dir.includes('.cursor'))) {
              const cursorPath = path.join(projectPath, '.cursor', 'commands', file);
              const cursorContent = generateMarkdownCommand(content, scriptPath);
              await fs.writeFile(cursorPath, cursorContent);
            }

            if (aiDirs.some(dir => dir.includes('.windsurf'))) {
              const windsurfPath = path.join(projectPath, '.windsurf', 'workflows', file);
              const windsurfContent = generateMarkdownCommand(content, scriptPath);
              await fs.writeFile(windsurfPath, windsurfContent);
            }

            if (aiDirs.some(dir => dir.includes('.gemini'))) {
              const geminiPath = path.join(projectPath, '.gemini', 'commands', `${commandName}.toml`);
              const geminiContent = generateTomlCommand(content, scriptPath);
              await fs.writeFile(geminiPath, geminiContent);
            }
          }
        }
      } else {
        await fs.writeFile(path.join(projectPath, '.specify', 'spec.md'), specContent);
      }

      // 复制脚本文件
      if (await fs.pathExists(scriptsDir)) {
        const userScriptsDir = path.join(projectPath, '.specify', 'scripts');
        await fs.copy(scriptsDir, userScriptsDir);

        // 设置 bash 脚本执行权限
        const bashDir = path.join(userScriptsDir, 'bash');
        if (await fs.pathExists(bashDir)) {
          const bashFiles = await fs.readdir(bashDir);
          for (const file of bashFiles) {
            if (file.endsWith('.sh')) {
              const filePath = path.join(bashDir, file);
              await fs.chmod(filePath, 0o755);
            }
          }
        }
      }

      // Git 初始化
      if (options.git !== false) {
        try {
          execSync('git init', { cwd: projectPath, stdio: 'ignore' });

          // 创建 .gitignore
          const gitignore = `# 临时文件
*.tmp
*.swp
.DS_Store

# 编辑器配置
.vscode/
.idea/

# AI 缓存
.ai-cache/

# 节点模块
node_modules/

# 视频文件
*.mp4
*.mov
*.avi

# 临时片段
segments/*.mp4
`;
          await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);

          execSync('git add .', { cwd: projectPath, stdio: 'ignore' });
          execSync('git commit -m "初始化视频项目"', { cwd: projectPath, stdio: 'ignore' });
        } catch {
          console.log(chalk.yellow('\n提示: Git 初始化失败，但项目已创建成功'));
        }
      }

      spinner.succeed(chalk.green(`视频项目 "${name}" 创建成功！`));

      // 显示后续步骤
      console.log('\n' + chalk.cyan('接下来:'));
      console.log(chalk.gray('─────────────────────────────'));

      if (!options.here) {
        console.log(`  1. ${chalk.white(`cd ${name}`)} - 进入项目目录`);
      }

      const aiName = {
        'claude': 'Claude Code',
        'cursor': 'Cursor',
        'gemini': 'Gemini',
        'windsurf': 'Windsurf'
      }[options.ai] || 'AI 助手';

      if (options.all) {
        console.log(`  2. ${chalk.white('在任意 AI 助手中打开项目')}`);
      } else {
        console.log(`  2. ${chalk.white(`在 ${aiName} 中打开项目`)}`);
      }
      console.log(`  3. 使用以下斜杠命令开始创作:`);
      console.log(`     ${chalk.cyan('/video-script')} - 创建视频脚本`);
      console.log(`     ${chalk.cyan('/video-character')} - 设计角色形象`);
      console.log(`     ${chalk.cyan('/video-scene')} - 生成场景画面`);
      console.log(`     ${chalk.cyan('/video-voice')} - 生成配音`);
      console.log(`     ${chalk.cyan('/video-generate')} - 生成视频`);

      console.log('\n' + chalk.dim('提示: 斜杠命令在 AI 助手内部使用，不是在终端中'));

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
    console.log(chalk.cyan('检查系统环境...\n'));

    const checks = [
      { name: 'Node.js', command: 'node --version', installed: false },
      { name: 'FFmpeg', command: 'ffmpeg -version', installed: false },
      { name: 'Git', command: 'git --version', installed: false }
    ];

    checks.forEach(check => {
      try {
        execSync(check.command, { stdio: 'ignore' });
        check.installed = true;
        console.log(chalk.green('✓') + ` ${check.name} 已安装`);
      } catch {
        console.log(chalk.yellow('⚠') + ` ${check.name} 未安装`);
      }
    });

    const ffmpegCheck = checks.find(c => c.name === 'FFmpeg');
    if (!ffmpegCheck?.installed) {
      console.log('\n' + chalk.yellow('警告: FFmpeg 未安装，无法进行视频合成'));
      console.log('请安装 FFmpeg: https://ffmpeg.org/download.html');
    } else {
      console.log('\n' + chalk.green('环境检查通过！'));
    }
  });

// 添加脚本导出相关命令
program.addCommand(scriptExportCommand);
program.addCommand(generateScriptCommand);

// 添加验证相关命令
program.addCommand(validateCommand);
program.addCommand(previewCommand);

// 自定义帮助信息
program.on('--help', () => {
  console.log('');
  console.log(chalk.yellow('使用示例:'));
  console.log('');
  console.log('  $ movieflow init my-video');
  console.log('  $ movieflow init my-video --ai cursor');
  console.log('  $ movieflow init --here');
  console.log('  $ movieflow check');
  console.log('  $ movieflow validate tang-monk-dating');
  console.log('  $ movieflow preview tang-monk-dating --scene 3');
  console.log('  $ movieflow script-export --format markdown');
  console.log('  $ movieflow generate-script');
  console.log('');
  console.log(chalk.gray('更多信息: https://github.com/wordflowlab/movieflow'));
});

// generate 命令 - 生成60秒视频
program
  .command('generate')
  .argument('<project>', '项目名称')
  .option('--resume <session>', '恢复之前的会话')
  .option('--template <type>', '使用模板: tang-monk | custom', 'tang-monk')
  .option('--version <type>', 'API 版本: v30 | v30_1080p | v30_pro', 'v30_pro')
  .option('--aspect <ratio>', '宽高比: 16:9 | 9:16 | 1:1 | 4:3 | 3:4', '9:16')
  .option('--platform <type>', '平台: douyin | wechat | kuaishou', 'douyin')
  .option('--no-audio', '禁用音频生成')
  .option('--no-subtitle', '禁用字幕生成')
  .option('--env <path>', '环境变量文件路径', '.env')
  .description('生成60秒短视频')
  .action(async (project, options) => {
    // 加载环境变量
    dotenv.config({ path: options.env });

    // 检查 API 配置
    if (!process.env.VOLCANO_ACCESS_KEY || !process.env.VOLCANO_SECRET_KEY) {
      console.error(chalk.red('错误: 未找到火山引擎 API 密钥'));
      console.error(chalk.yellow('请在 .env 文件中设置:'));
      console.error('  VOLCANO_ACCESS_KEY=your_access_key');
      console.error('  VOLCANO_SECRET_KEY=your_secret_key');
      process.exit(1);
    }

    const platformDetector = PlatformDetector.getInstance();
    const adapter = platformDetector.getAdapter();

    try {
      const generator = new VideoGenerator({
        accessKey: process.env.VOLCANO_ACCESS_KEY,
        secretKey: process.env.VOLCANO_SECRET_KEY,
        outputDir: './videos',
        tempDir: './temp',
        maxConcurrency: 3,
        aspectRatio: options.aspect as any,
        platform: options.platform as 'douyin' | 'wechat' | 'kuaishou',
        apiVersion: options.version as any
      });

      const videoPath = await generator.generateVideo({
        projectName: project,
        useTemplate: options.template as any,
        enableAudio: options.audio !== false,
        enableSubtitle: options.subtitle !== false,
        resumeFromSession: options.resume
      });

      adapter.outputMessage(`视频生成完成: ${videoPath}`, 'success');
    } catch (error: any) {
      adapter.outputMessage(`生成失败: ${error.message}`, 'error');
      process.exit(1);
    }
  });

// sessions 命令 - 管理会话
program
  .command('sessions')
  .option('--list', '列出所有会话')
  .option('--resume <id>', '恢复指定会话')
  .option('--clean', '清理过期会话')
  .option('--report <id>', '显示会话报告')
  .description('管理视频生成会话')
  .action(async (options) => {
    const stateManager = new TaskStateManager('.movieflow-state');

    if (options.list) {
      const sessions = await stateManager.listSessions();
      if (sessions.length === 0) {
        console.log(chalk.yellow('没有找到任何会话'));
      } else {
        console.log(chalk.cyan('\n📋 会话列表:\n'));
        sessions.forEach(session => {
          const completed = session.segments.filter(s => s.status === 'completed').length;
          const status = session.completed ? '✅ 完成' : '🔄 进行中';
          console.log(`${status} ${session.id}`);
          console.log(`  项目: ${session.projectName}`);
          console.log(`  进度: ${completed}/${session.totalSegments}`);
          console.log(`  更新时间: ${new Date(session.updateTime).toLocaleString()}`);
          console.log('');
        });
      }
    } else if (options.resume) {
      const session = await stateManager.resumeSession(options.resume);
      if (session) {
        console.log(chalk.green(`✅ 恢复会话: ${session.projectName}`));
        console.log(stateManager.generateReport(session));
      } else {
        console.log(chalk.red('未找到指定会话'));
      }
    } else if (options.clean) {
      const cleaned = await stateManager.cleanExpiredSessions();
      console.log(chalk.green(`✅ 清理了 ${cleaned} 个过期会话`));
    } else if (options.report) {
      const session = await stateManager.resumeSession(options.report);
      if (session) {
        console.log(stateManager.generateReport(session));
      } else {
        console.log(chalk.red('未找到指定会话'));
      }
    } else {
      program.outputHelp();
    }

    stateManager.destroy();
  });


// 解析命令行参数
program.parse(process.argv);

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}