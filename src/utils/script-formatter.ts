/**
 * 脚本格式化和导出工具
 * 支持多种格式的脚本导出
 */

import { ProfessionalScene } from '../services/professional-scenes';
import * as fs from 'fs-extra';
import * as path from 'path';

export type ExportFormat = 'markdown' | 'json' | 'html' | 'csv' | 'pdf';

/**
 * 脚本格式化器
 */
export class ScriptFormatter {
  /**
   * 导出为Markdown格式
   */
  static toMarkdown(scenes: ProfessionalScene[], title: string = '分镜脚本'): string {
    let output = `# ${title}\n\n`;

    // 项目信息
    output += `## 项目信息\n\n`;
    output += `- **总时长**: ${scenes.length * 10}秒\n`;
    output += `- **镜头数**: ${scenes.length}镜\n`;
    output += `- **格式**: 9:16竖屏\n`;
    output += `- **创建时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;

    // 分镜表
    output += `## 分镜表\n\n`;
    output += `| 镜头 | 时间码 | 景别 | 运镜 | 画面描述 | 音频/台词 | 转场 | 备注 |\n`;
    output += `|------|--------|------|------|----------|-----------|------|------|\n`;

    scenes.forEach((scene) => {
      const timeEnd = scene.timeCode.end.split(':').slice(1).join(':');
      const layerDesc = this.formatLayers(scene.layers);
      const visualDesc = scene.visualEffects ?
        `${scene.visualEffects.colorTone}色调，${scene.visualEffects.atmosphere}氛围` : '';

      output += `| ${String(scene.shotNumber).padStart(3, '0')} `;
      output += `| ${scene.timeCode.start}-${timeEnd} `;
      output += `| ${scene.shotType} `;
      output += `| ${scene.cameraWork} `;
      output += `| ${layerDesc} `;
      output += `| "${scene.audio}" `;
      output += `| ${scene.transition} `;
      output += `| ${visualDesc} |\n`;
    });

    // 详细场景描述
    output += `\n## 详细场景描述\n\n`;
    scenes.forEach((scene) => {
      output += `### 镜头 ${String(scene.shotNumber).padStart(3, '0')} (${scene.timeCode.start}-${scene.timeCode.end})\n\n`;
      output += `**景别**: ${scene.shotType} | **运镜**: ${scene.cameraWork} | **转场**: ${scene.transition}\n\n`;

      output += `**画面描述**:\n`;
      output += `${scene.prompt}\n\n`;

      output += `**画面层次**:\n`;
      output += `- 前景: ${scene.layers.foreground || '无'}\n`;
      output += `- 中景: ${scene.layers.midground}\n`;
      output += `- 背景: ${scene.layers.background}\n`;
      output += `- 景深: ${scene.layers.depth}\n`;
      output += `- 焦点: ${scene.layers.focusPoint}\n\n`;

      if (scene.visualEffects) {
        output += `**视觉效果**:\n`;
        output += `- 色调: ${scene.visualEffects.colorTone}\n`;
        output += `- 光线: ${scene.visualEffects.lighting}\n`;
        output += `- 氛围: ${scene.visualEffects.atmosphere}\n`;
        if (scene.visualEffects.specialEffects) {
          output += `- 特效: ${scene.visualEffects.specialEffects.join(', ')}\n`;
        }
        output += '\n';
      }

      output += `**台词/音频**:\n`;
      output += `> ${scene.audio}\n\n`;

      if (scene.notes) {
        output += `**制作备注**:\n`;
        output += `${scene.notes}\n\n`;
      }

      output += '---\n\n';
    });

    return output;
  }

  /**
   * 导出为JSON格式
   */
  static toJSON(scenes: ProfessionalScene[]): string {
    return JSON.stringify({
      version: '1.0',
      createTime: new Date().toISOString(),
      totalDuration: scenes.length * 10,
      format: '9:16',
      scenes: scenes
    }, null, 2);
  }

  /**
   * 导出为HTML格式
   */
  static toHTML(scenes: ProfessionalScene[], title: string = '分镜脚本'): string {
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1, h2, h3 { color: #333; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #fafafa;
    }
    .scene-detail {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fff;
    }
    .layer-info, .visual-info {
      background: #f9f9f9;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .audio-text {
      font-style: italic;
      color: #666;
      padding: 10px;
      background: #f0f0f0;
      border-left: 4px solid #4CAF50;
      margin: 10px 0;
    }
    @media print {
      .scene-detail { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>

  <div class="project-info">
    <h2>项目信息</h2>
    <ul>
      <li><strong>总时长</strong>: ${scenes.length * 10}秒</li>
      <li><strong>镜头数</strong>: ${scenes.length}镜</li>
      <li><strong>格式</strong>: 9:16竖屏</li>
      <li><strong>创建时间</strong>: ${new Date().toLocaleString('zh-CN')}</li>
    </ul>
  </div>

  <h2>分镜表</h2>
  <table>
    <thead>
      <tr>
        <th>镜头</th>
        <th>时间码</th>
        <th>景别</th>
        <th>运镜</th>
        <th>画面描述</th>
        <th>音频/台词</th>
        <th>转场</th>
      </tr>
    </thead>
    <tbody>`;

    scenes.forEach((scene) => {
      html += `
      <tr>
        <td>${String(scene.shotNumber).padStart(3, '0')}</td>
        <td>${scene.timeCode.start}-${scene.timeCode.end}</td>
        <td>${scene.shotType}</td>
        <td>${scene.cameraWork}</td>
        <td>${this.formatLayers(scene.layers)}</td>
        <td>${scene.audio}</td>
        <td>${scene.transition}</td>
      </tr>`;
    });

    html += `
    </tbody>
  </table>

  <h2>详细场景描述</h2>`;

    scenes.forEach((scene) => {
      html += `
  <div class="scene-detail">
    <h3>镜头 ${String(scene.shotNumber).padStart(3, '0')} (${scene.timeCode.start}-${scene.timeCode.end})</h3>

    <p><strong>景别</strong>: ${scene.shotType} | <strong>运镜</strong>: ${scene.cameraWork} | <strong>转场</strong>: ${scene.transition}</p>

    <h4>画面描述</h4>
    <p>${scene.prompt}</p>

    <div class="layer-info">
      <h4>画面层次</h4>
      <ul>
        <li>前景: ${scene.layers.foreground || '无'}</li>
        <li>中景: ${scene.layers.midground}</li>
        <li>背景: ${scene.layers.background}</li>
        <li>景深: ${scene.layers.depth}</li>
        <li>焦点: ${scene.layers.focusPoint}</li>
      </ul>
    </div>`;

      if (scene.visualEffects) {
        html += `
    <div class="visual-info">
      <h4>视觉效果</h4>
      <ul>
        <li>色调: ${scene.visualEffects.colorTone}</li>
        <li>光线: ${scene.visualEffects.lighting}</li>
        <li>氛围: ${scene.visualEffects.atmosphere}</li>
        ${scene.visualEffects.specialEffects ?
          `<li>特效: ${scene.visualEffects.specialEffects.join(', ')}</li>` : ''}
      </ul>
    </div>`;
      }

      html += `
    <div class="audio-text">
      <h4>台词/音频</h4>
      <p>${scene.audio}</p>
    </div>`;

      if (scene.notes) {
        html += `
    <div class="notes">
      <h4>制作备注</h4>
      <p>${scene.notes}</p>
    </div>`;
      }

      html += `
  </div>`;
    });

    html += `
</body>
</html>`;

    return html;
  }

  /**
   * 导出为CSV格式
   */
  static toCSV(scenes: ProfessionalScene[]): string {
    const headers = [
      '镜头编号',
      '开始时间',
      '结束时间',
      '时长(秒)',
      '景别',
      '运镜',
      '转场',
      '画面描述',
      '前景',
      '中景',
      '背景',
      '景深',
      '焦点',
      '色调',
      '光线',
      '氛围',
      '特效',
      '台词',
      '备注'
    ];

    const rows = scenes.map(scene => {
      return [
        String(scene.shotNumber).padStart(3, '0'),
        scene.timeCode.start,
        scene.timeCode.end,
        scene.timeCode.duration.toString(),
        scene.shotType,
        scene.cameraWork,
        scene.transition,
        `"${scene.prompt.replace(/"/g, '""')}"`,
        scene.layers.foreground || '',
        scene.layers.midground,
        scene.layers.background,
        scene.layers.depth,
        scene.layers.focusPoint,
        scene.visualEffects?.colorTone || '',
        scene.visualEffects?.lighting || '',
        scene.visualEffects?.atmosphere || '',
        scene.visualEffects?.specialEffects?.join('; ') || '',
        `"${scene.audio.replace(/"/g, '""')}"`,
        scene.notes || ''
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * 保存脚本到文件
   */
  static async saveToFile(
    scenes: ProfessionalScene[],
    outputPath: string,
    format: ExportFormat = 'markdown',
    title: string = '分镜脚本'
  ): Promise<void> {
    let content: string;
    let extension: string;

    switch (format) {
      case 'markdown':
        content = this.toMarkdown(scenes, title);
        extension = 'md';
        break;
      case 'json':
        content = this.toJSON(scenes);
        extension = 'json';
        break;
      case 'html':
        content = this.toHTML(scenes, title);
        extension = 'html';
        break;
      case 'csv':
        content = this.toCSV(scenes);
        extension = 'csv';
        break;
      default:
        throw new Error(`不支持的格式: ${format}`);
    }

    const filename = path.join(outputPath, `script_${Date.now()}.${extension}`);
    await fs.ensureDir(outputPath);
    await fs.writeFile(filename, content, 'utf-8');

    console.log(`✅ 脚本已保存到: ${filename}`);
  }

  /**
   * 格式化画面层次描述
   */
  private static formatLayers(layers: ProfessionalScene['layers']): string {
    const parts = [];
    if (layers.foreground) {
      parts.push(`前景:${layers.foreground}`);
    }
    parts.push(`中景:${layers.midground}`);
    parts.push(`背景:${layers.background}`);
    return parts.join(' | ');
  }

  /**
   * 生成预览文本
   */
  static generatePreview(scenes: ProfessionalScene[]): string {
    let preview = '📋 分镜脚本预览\n\n';

    scenes.forEach((scene, index) => {
      preview += `【镜头${String(scene.shotNumber).padStart(2, '0')}】 ${scene.timeCode.start}-${scene.timeCode.end}\n`;
      preview += `  景别: ${scene.shotType} | 运镜: ${scene.cameraWork}\n`;
      preview += `  台词: "${scene.audio.substring(0, 30)}${scene.audio.length > 30 ? '...' : ''}"\n`;
      if (index < scenes.length - 1) {
        preview += '\n';
      }
    });

    return preview;
  }
}