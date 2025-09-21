#!/usr/bin/env node

/**
 * 脚本导出命令
 * 支持将场景导出为专业格式脚本
 */

import { Command } from '@commander-js/extra-typings';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { ScriptFormatter, ExportFormat } from '../utils/script-formatter';
import { TANG_MONK_PROFESSIONAL_SCENES, generateProfessionalScript } from '../services/professional-scenes';
import * as path from 'path';

export const scriptExportCommand = new Command('script-export')
  .description('导出专业格式的分镜脚本')
  .option('-f, --format <format>', '导出格式 (markdown/json/html/csv)', 'markdown')
  .option('-o, --output <path>', '输出目录', './output')
  .option('-t, --title <title>', '脚本标题', '唐僧找工作 - 分镜脚本')
  .option('--preview', '仅预览不导出')
  .action(async (options) => {
    const spinner = ora();

    try {
      // 显示当前场景信息
      console.log(chalk.cyan('\n📽️  MovieFlow 专业脚本导出工具\n'));
      console.log(chalk.gray('当前场景数量:'), TANG_MONK_PROFESSIONAL_SCENES.length);
      console.log(chalk.gray('总时长:'), `${TANG_MONK_PROFESSIONAL_SCENES.length * 10}秒`);

      // 如果是预览模式
      if (options.preview) {
        console.log(chalk.yellow('\n📋 脚本预览:\n'));
        const preview = ScriptFormatter.generatePreview(TANG_MONK_PROFESSIONAL_SCENES);
        console.log(preview);

        // 询问是否导出
        const { shouldExport } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldExport',
            message: '是否导出完整脚本?',
            default: true
          }
        ]);

        if (!shouldExport) {
          console.log(chalk.gray('已取消导出'));
          return;
        }
      }

      // 选择导出格式
      let format = options.format as ExportFormat;
      if (!['markdown', 'json', 'html', 'csv'].includes(format)) {
        const { selectedFormat } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedFormat',
            message: '请选择导出格式:',
            choices: [
              { name: 'Markdown (推荐)', value: 'markdown' },
              { name: 'HTML (网页查看)', value: 'html' },
              { name: 'JSON (程序处理)', value: 'json' },
              { name: 'CSV (表格处理)', value: 'csv' }
            ]
          }
        ]);
        format = selectedFormat;
      }

      // 开始导出
      spinner.start('正在导出脚本...');

      // 根据格式导出
      let content: string;
      let extension: string;

      switch (format) {
        case 'markdown':
          content = ScriptFormatter.toMarkdown(TANG_MONK_PROFESSIONAL_SCENES, options.title);
          extension = 'md';
          break;
        case 'json':
          content = ScriptFormatter.toJSON(TANG_MONK_PROFESSIONAL_SCENES);
          extension = 'json';
          break;
        case 'html':
          content = ScriptFormatter.toHTML(TANG_MONK_PROFESSIONAL_SCENES, options.title);
          extension = 'html';
          break;
        case 'csv':
          content = ScriptFormatter.toCSV(TANG_MONK_PROFESSIONAL_SCENES);
          extension = 'csv';
          break;
        default:
          throw new Error(`不支持的格式: ${format}`);
      }

      // 保存文件
      const outputDir = path.resolve(options.output);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `script_${timestamp}.${extension}`;
      const filepath = path.join(outputDir, filename);

      await ScriptFormatter.saveToFile(
        TANG_MONK_PROFESSIONAL_SCENES,
        outputDir,
        format,
        options.title
      );

      spinner.succeed(chalk.green(`✅ 脚本已成功导出!`));
      console.log(chalk.gray('文件路径:'), filepath);

      // 显示导出统计
      console.log(chalk.cyan('\n📊 导出统计:'));
      console.log(chalk.gray('  - 镜头数量:'), TANG_MONK_PROFESSIONAL_SCENES.length);
      console.log(chalk.gray('  - 总时长:'), `${TANG_MONK_PROFESSIONAL_SCENES.length * 10}秒`);
      console.log(chalk.gray('  - 导出格式:'), format.toUpperCase());
      console.log(chalk.gray('  - 文件大小:'), `${(content.length / 1024).toFixed(2)} KB`);

      // 提示后续操作
      console.log(chalk.yellow('\n💡 提示:'));
      if (format === 'html') {
        console.log(chalk.gray('  - 可以直接在浏览器中打开HTML文件查看'));
      } else if (format === 'markdown') {
        console.log(chalk.gray('  - 可以使用Markdown编辑器或VS Code查看'));
      } else if (format === 'csv') {
        console.log(chalk.gray('  - 可以使用Excel或Google Sheets打开'));
      }

    } catch (error) {
      spinner.fail(chalk.red('导出失败'));
      console.error(chalk.red('错误:'), error);
      process.exit(1);
    }
  });

/**
 * 生成专业脚本的快捷命令
 */
export const generateScriptCommand = new Command('generate-script')
  .description('生成专业格式的分镜脚本')
  .option('-s, --scenes <scenes>', '场景数量', '6')
  .action(async (options) => {
    const spinner = ora();

    try {
      console.log(chalk.cyan('\n🎬 生成专业分镜脚本\n'));

      // 使用现有的专业场景
      spinner.start('正在生成脚本...');
      const script = generateProfessionalScript(TANG_MONK_PROFESSIONAL_SCENES);
      spinner.succeed(chalk.green('脚本生成成功!'));

      // 显示脚本
      console.log('\n' + script);

      // 询问是否保存
      const { shouldSave } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldSave',
          message: '是否保存脚本到文件?',
          default: true
        }
      ]);

      if (shouldSave) {
        const { format } = await inquirer.prompt([
          {
            type: 'list',
            name: 'format',
            message: '选择保存格式:',
            choices: [
              { name: 'Markdown', value: 'markdown' },
              { name: 'HTML', value: 'html' },
              { name: 'JSON', value: 'json' },
              { name: 'CSV', value: 'csv' }
            ],
            default: 'markdown'
          }
        ]);

        await ScriptFormatter.saveToFile(
          TANG_MONK_PROFESSIONAL_SCENES,
          './output',
          format as ExportFormat,
          '唐僧找工作 - 专业分镜脚本'
        );

        console.log(chalk.green('\n✅ 脚本已保存成功!'));
      }

    } catch (error) {
      spinner.fail(chalk.red('生成失败'));
      console.error(chalk.red('错误:'), error);
      process.exit(1);
    }
  });