# /validate - 渐进式验证命令

## 概述
执行L0和L1级验证，快速且低成本地验证视频项目的提示词质量和视觉效果。

## 验证级别
- **L0（文本验证）**：分析提示词质量，提供优化建议（免费）
- **L1（图像预览）**：生成关键帧静态图像，预览视觉效果（约6元）

## 使用方法
```bash
/validate [项目名] [选项]
```

## 参数
- `项目名`：要验证的视频项目名称
- `--skip-l0`：跳过文本验证，直接进行图像预览
- `--skip-l1`：只进行文本验证，跳过图像生成
- `--provider`：选择图像生成服务（uniapi | yunwu），默认 uniapi
- `--scenes`：指定要预览的场景编号，如 "1,3,5"

## 示例

### 完整验证（L0+L1）
```bash
/validate tang-monk-dating
```

### 仅文本验证
```bash
/validate tang-monk-dating --skip-l1
```

### 使用云雾API生成预览
```bash
/validate tang-monk-dating --provider yunwu
```

### 只预览特定场景
```bash
/validate tang-monk-dating --scenes "1,3,6"
```

## 输出结果

### L0 文本验证报告
```
📊 提示词质量分析：
  场景1: 85/100 分
    ✅ 包含场景描述
    ✅ 包含人物描述
    ✅ 包含动作描述
    ⚠️ 建议添加视觉风格描述

  场景2: 92/100 分
    ✅ 所有要素完整
    💡 可以增加更多细节描述

  平均分数: 88.5/100
  总体建议: 质量良好，可以继续
```

### L1 图像预览结果
```
🖼️ 关键帧预览已生成：
  output/preview/l1-preview-1.jpg - 场景1：开场介绍
  output/preview/l1-preview-2.jpg - 场景2：工作经历
  output/preview/l1-preview-3.jpg - 场景3：感情经历
  output/preview/l1-preview-4.jpg - 场景4：个人优点
  output/preview/l1-preview-5.jpg - 场景5：解决问题
  output/preview/l1-preview-6.jpg - 场景6：物质条件

  💰 预览成本：6元
  ✅ 视觉效果确认完成
```

## 决策流程

### 验证通过条件
1. L0平均分数 ≥ 60分
2. L1图像符合预期效果
3. 无重大问题需要修正

### 后续操作
- **通过验证**：继续执行 `/tasks` 进行任务分解
- **需要优化**：根据建议修改提示词，重新验证
- **视觉调整**：修改场景描述或风格设置

## 成本控制
- L0验证：0元（可无限次数）
- L1验证：约6元（建议优化后再生成）
- 总成本：约6元（比直接生成节省96%）

## 注意事项
1. 确保已配置 UNIAPI_KEY 或 YUNWU_API_KEY
2. 图像预览仅供参考，最终视频效果可能有所不同
3. 建议先通过L0验证再进行L1预览
4. 保存的预览图像可用于向客户确认效果

## 配置要求
```env
# .env 文件配置
UNIAPI_KEY=your_uniapi_key        # UniAPI密钥
YUNWU_API_KEY=your_yunwu_key      # 云雾API密钥（备选）
```

## 相关命令
- `/specify` - 创建项目规格
- `/plan` - 制定技术计划
- `/preview` - L2级动态预览
- `/implement` - 完整视频生成