# MovieFlow v0.2.1 发布说明

## 🎉 新功能发布

版本 0.2.1 添加了专业MV分镜脚本格式支持！

## 📦 安装/更新

```bash
# 全局安装或更新
npm install -g movieflow-cli@latest

# 或作为项目依赖
npm install movieflow-cli@0.2.1
```

## 🆕 主要新功能

### 1. 专业分镜脚本格式
- ✨ 支持完整的镜头语言描述（景别、运镜、转场等）
- 📊 包含时间码、画面层次、视觉效果等专业字段
- 🎬 参考真实MV制作的分镜格式标准

### 2. 多格式脚本导出
- 📝 **Markdown**: 适合文档查看和编辑
- 🌐 **HTML**: 可在浏览器中查看，支持打印
- 💾 **JSON**: 便于程序处理和集成
- 📊 **CSV**: 可导入Excel进行表格处理

### 3. 新增CLI命令
```bash
# 导出专业格式脚本
movieflow script-export --format markdown --output ./output

# 生成脚本并预览
movieflow script-export --preview

# 快速生成脚本
movieflow generate-script
```

### 4. 场景数据升级
- 将简单的 `prompt + audio` 格式升级为专业分镜格式
- 唐僧找工作场景已全面升级，包含完整拍摄信息

## 📋 专业脚本示例

**镜头 001** (00:00:00-00:00:10)
- **景别**: 中景 | **运镜**: 固定镜头 | **转场**: 淡入
- **画面层次**:
  - 前景: 寺庙石阶和栏杆
  - 中景: Q版唐僧站立，红色袈裟
  - 背景: 青山绿水，祥云缭绕
- **视觉效果**: 暖色调，自然光，祥和氛围

## 🔧 技术改进

- 扩展了Scene数据模型，添加专业字段
- 实现了灵活的脚本格式化器（ScriptFormatter）
- 创建了专业场景预设系统
- 完善了CLI命令架构

## 📚 使用指南

1. **查看预览**:
   ```bash
   movieflow script-export --preview
   ```

2. **导出为Markdown**:
   ```bash
   movieflow script-export --format markdown --title "我的视频脚本"
   ```

3. **导出为网页**:
   ```bash
   movieflow script-export --format html --output ./my-scripts
   ```

## 🚀 下一步计划

- 支持自定义场景模板
- 添加脚本模板库
- 集成更多视频生成API
- 支持批量脚本处理

## 🙏 致谢

感谢社区的反馈和建议，让MovieFlow变得更专业、更实用！

---

*发布时间: 2025-09-21*
*版本: 0.2.1*