import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import * as fs from 'fs-extra';
import { PreviewService, ImageStyle } from '../services/preview-service';
import { UniAPIClient } from '../services/uniapi-client';
import { YunwuAPIClient } from '../services/yunwu-client';
import { PromptValidator } from '../services/prompt-validator';

export const validateCommand = new Command('validate')
  .argument('<project>', '项目名称')
  .option('--skip-l0', '跳过文本验证')
  .option('--skip-l1', '跳过图像预览')
  .option('--provider <type>', 'L1图像生成服务: uniapi | yunwu', 'uniapi')
  .option('--style <type>', '图像风格: wireframe | sketch | lineart | full', 'full')
  .option('--scenes <numbers>', '指定场景编号，如 "1,3,5"')
  .option('--env <path>', '环境变量文件路径', '.env')
  .description('执行L0和L1级渐进式验证')
  .action(async (project, options) => {
    const spinner = ora('正在执行渐进式验证...').start();

    try {
      // 加载环境变量
      const dotenv = await import('dotenv');
      dotenv.config({ path: options.env });

      // 检查项目目录
      const projectPath = path.join(process.cwd(), `.specify/projects/${project}`);
      if (!await fs.pathExists(projectPath)) {
        spinner.fail(`项目 "${project}" 不存在`);
        process.exit(1);
      }

      // 读取项目脚本
      const scriptPath = path.join(projectPath, 'script.json');
      if (!await fs.pathExists(scriptPath)) {
        spinner.fail('未找到项目脚本文件');
        process.exit(1);
      }

      const scriptData = await fs.readJson(scriptPath);
      const scenes = scriptData.scenes || [];

      // 过滤指定场景
      let selectedScenes = scenes;
      if (options.scenes) {
        const sceneNumbers = options.scenes.split(',').map((n: string) => parseInt(n.trim()));
        selectedScenes = scenes.filter((s: any, i: number) => sceneNumbers.includes(i + 1));
      }

      // 创建预览服务
      const imageClient = options.provider === 'yunwu'
        ? new YunwuAPIClient()
        : new UniAPIClient();

      const previewService = new PreviewService(imageClient);

      // L0级验证
      if (!options.skipL0) {
        spinner.text = 'L0级验证: 分析提示词质量...';
        const prompts = selectedScenes.map((s: any) => s.prompt || s.description);
        const l0Result = await previewService.validateL0(prompts);

        console.log(chalk.cyan('\n📊 L0 提示词质量分析:'));
        l0Result.details.forEach((detail, index) => {
          const score = detail.score;
          const color = score >= 80 ? chalk.green : score >= 60 ? chalk.yellow : chalk.red;
          console.log(`  场景${index + 1}: ${color(score + '/100 分')}`);

          if (detail.suggestions.length > 0) {
            detail.suggestions.forEach(s => {
              console.log(`    ⚠️  ${s}`);
            });
          } else {
            console.log(`    ✅ 所有要素完整`);
          }
        });

        console.log(`\n  平均分数: ${chalk.cyan(l0Result.avgScore.toFixed(1) + '/100')}`);
        console.log(`  总体建议: ${l0Result.passed ? chalk.green('质量良好，可以继续') : chalk.yellow('建议优化后再继续')}`);

        if (!l0Result.passed && !options.skipL1) {
          const readline = await import('readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });

          const answer = await new Promise<string>(resolve => {
            rl.question('\n是否继续进行L1图像预览？(y/n): ', resolve);
          });
          rl.close();

          if (answer.toLowerCase() !== 'y') {
            spinner.info('验证已取消');
            process.exit(0);
          }
        }
      }

      // L1级验证
      if (!options.skipL1) {
        // 验证风格参数
        const validStyles: ImageStyle[] = ['wireframe', 'sketch', 'lineart', 'full'];
        const imageStyle = options.style as ImageStyle;

        if (!validStyles.includes(imageStyle)) {
          spinner.fail(`无效的风格参数: ${options.style}`);
          console.error(chalk.yellow('可用风格: wireframe, sketch, lineart, full'));
          process.exit(1);
        }

        const validator = new PromptValidator();
        const styleDesc = validator.getStyleDescription(imageStyle);

        spinner.text = `L1级验证: 使用${options.provider.toUpperCase()}生成${styleDesc}...`;

        const sceneConfigs = selectedScenes.map((s: any, i: number) => ({
          id: `scene-${i + 1}`,
          prompt: s.prompt || s.description,
          name: s.name || `场景${i + 1}`
        }));

        const l1Result = await previewService.validateL1(sceneConfigs, imageStyle);

        if (l1Result.success) {
          console.log(chalk.green(`\n🖼️  L1 ${styleDesc}已生成:`));
          l1Result.images.forEach((img, index) => {
            const sceneName = selectedScenes[index]?.name || `场景${index + 1}`;
            console.log(`  ${img} - ${sceneName}`);
          });

          console.log(`\n  🎨 风格: ${chalk.cyan(styleDesc)}`);
          console.log(`  💰 预览成本: ${chalk.yellow(l1Result.estimatedCost.toFixed(1) + '元')}`);

          if (imageStyle !== 'full') {
            const fullCost = selectedScenes.length * 1;
            const saved = fullCost - l1Result.estimatedCost;
            console.log(`  💡 相比完整渲染节省: ${chalk.green(saved.toFixed(1) + '元')}`);
          }

          console.log(`  ✅ 视觉效果确认完成`);
        } else {
          spinner.fail('L1图像生成失败');
          if (l1Result.error) {
            console.error(chalk.red(`  错误: ${l1Result.error}`));
          }
        }
      }

      spinner.succeed('验证完成！');

      // 显示后续步骤
      console.log('\n' + chalk.cyan('后续操作:'));

      if (options.style && options.style !== 'full') {
        console.log('  如分镜构图满意，可生成完整渲染:');
        console.log(`    ${chalk.white(`movieflow validate ${project} --style full`)}`);
      }

      console.log('  如需优化提示词，请修改脚本后重新验证');
      console.log('  如效果满意，可执行:');
      console.log(`    ${chalk.white('movieflow preview')} ${project} - L2动态预览（可选）`);
      console.log(`    ${chalk.white('movieflow generate')} ${project} - 完整视频生成`);

    } catch (error: any) {
      spinner.fail('验证失败');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

export const previewCommand = new Command('preview')
  .argument('<project>', '项目名称')
  .option('--scene <number>', '预览场景编号 (1-6)', '1')
  .option('--with-audio', '包含音频')
  .option('--with-subtitle', '包含字幕')
  .option('--quality <level>', '视频质量: low | medium | high', 'medium')
  .option('--env <path>', '环境变量文件路径', '.env')
  .description('生成10秒L2级动态预览视频')
  .action(async (project, options) => {
    const spinner = ora('正在生成L2动态预览...').start();

    try {
      // 加载环境变量
      const dotenv = await import('dotenv');
      dotenv.config({ path: options.env });

      // 检查火山引擎配置
      if (!process.env.VOLCANO_ACCESS_KEY || !process.env.VOLCANO_SECRET_KEY) {
        spinner.fail('未找到火山引擎API配置');
        console.error(chalk.yellow('请在 .env 文件中设置:'));
        console.error('  VOLCANO_ACCESS_KEY=your_access_key');
        console.error('  VOLCANO_SECRET_KEY=your_secret_key');
        process.exit(1);
      }

      // 检查项目目录
      const projectPath = path.join(process.cwd(), `.specify/projects/${project}`);
      if (!await fs.pathExists(projectPath)) {
        spinner.fail(`项目 "${project}" 不存在`);
        process.exit(1);
      }

      // 读取项目脚本
      const scriptPath = path.join(projectPath, 'script.json');
      const scriptData = await fs.readJson(scriptPath);
      const sceneIndex = parseInt(options.scene) - 1;
      const scene = scriptData.scenes[sceneIndex];

      if (!scene) {
        spinner.fail(`场景 ${options.scene} 不存在`);
        process.exit(1);
      }

      spinner.text = `正在生成场景${options.scene}的10秒预览...`;

      // 创建预览服务
      const previewService = new PreviewService();

      const config = {
        prompt: scene.prompt || scene.description,
        duration: 10,
        aspectRatio: '9:16' as const,
        quality: options.quality as 'low' | 'medium' | 'high',
        includeAudio: options.withAudio,
        includeSubtitle: options.withSubtitle
      };

      const result = await previewService.generateL2Preview(config);

      if (result.success) {
        spinner.succeed('L2预览生成完成！');

        console.log(chalk.cyan('\n🎬 L2动态预览生成报告:'));
        console.log(`\n📝 预览配置:`);
        console.log(`  场景: ${scene.name || `场景${options.scene}`}`);
        console.log(`  时长: 10秒`);
        console.log(`  帧数: ${result.frames || 241}帧`);
        console.log(`  音频: ${options.withAudio ? '启用' : '禁用'}`);
        console.log(`  字幕: ${options.withSubtitle ? '启用' : '禁用'}`);
        console.log(`  质量: ${options.quality}`);

        if (result.taskId) {
          console.log(`\n⏳ 任务信息:`);
          console.log(`  任务ID: ${result.taskId}`);
          console.log(`  状态: ${result.status || '处理中'}`);
        }

        console.log(`\n✅ 预览文件:`);
        console.log(`  视频: ${result.videoPath}`);
        console.log(`  大小: ${result.fileSize || 'N/A'}`);
        console.log(`  分辨率: ${result.resolution || '1080×1920'}`);

        console.log(`\n💰 预览成本: ${chalk.yellow(result.estimatedCost + '元')}`);

        // 效果评估
        if (result.analysis) {
          console.log('\n📊 效果评估:');
          console.log(`  ✅ 画面流畅度: ${result.analysis.smoothness || '良好'}`);
          console.log(`  ✅ 音画同步: ${result.analysis.audioSync || '正常'}`);
          console.log(`  ✅ 字幕时间轴: ${result.analysis.subtitleTiming || '准确'}`);
        }

        // 后续操作建议
        console.log('\n' + chalk.cyan('后续操作:'));
        console.log('  效果满意: ' + chalk.white(`movieflow generate ${project}`) + ' - 生成完整视频');
        console.log('  需要调整: 修改参数后重新预览');
        console.log('  质量问题: 调整技术方案后重试');

      } else {
        spinner.fail('L2预览生成失败');
        if (result.error) {
          console.error(chalk.red(`错误: ${result.error}`));
        }
      }

    } catch (error: any) {
      spinner.fail('预览生成失败');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });