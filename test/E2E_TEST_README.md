# MovieFlow E2E 测试指南

## 概述

MovieFlow 现已包含完整的端到端（E2E）测试套件，用于验证与即梦AI API的真实交互。这些测试确保所有核心功能在实际环境中正常工作。

## 配置 API 密钥

### 1. 获取即梦AI API密钥

访问 [火山引擎控制台](https://console.volcengine.com) 获取您的 API 密钥：
- Access Key
- Secret Key

### 2. 设置测试环境

```bash
# 复制环境变量模板
cp .env.test.example .env.test

# 编辑 .env.test 文件，填入您的真实API密钥
# VOLCANO_ACCESS_KEY=您的实际access_key
# VOLCANO_SECRET_KEY=您的实际secret_key
```

## API 版本说明

MovieFlow 支持三个版本的即梦AI视频生成API：

| 版本 | req_key | 分辨率 | 特点 |
|------|---------|--------|------|
| v30 | jimeng_t2v_v30 | 720P | 标准版，速度快，性价比高 |
| v30_1080p | jimeng_t2v_v30_1080p | 1080P | 高清版，画质优秀 |
| v30_pro | jimeng_ti2v_v30_pro | 1080P | Pro版，效果最佳，支持更多功能 |

## 运行测试

### 运行所有E2E测试

```bash
npm run test:e2e
```

### 运行特定测试套件

```bash
# 仅测试 API 客户端
npm run test:e2e -- volcano-engine

# 仅测试视频生成器
npm run test:e2e -- video-generator

# 仅测试片段管理器
npm run test:e2e -- segment-manager
```

### 跳过昂贵的测试

某些测试会实际生成视频，消耗API调用额度。您可以通过环境变量跳过这些测试：

```bash
# 在 .env.test 中设置
SKIP_EXPENSIVE_TESTS=true
```

### 生成测试覆盖率报告

```bash
npm run test:e2e:coverage
```

## 测试套件说明

### 1. VolcanoEngineClient E2E 测试
- 文本生成视频API测试
- 图片生成视频API测试
- 任务状态查询测试
- 批量任务处理测试
- 错误处理和重试机制测试

### 2. VideoGenerator E2E 测试
- 单场景视频生成
- 多场景视频合成
- 转场效果添加
- 背景音乐添加
- 不同平台配置测试

### 3. SegmentManager E2E 测试
- 片段创建和管理
- 批处理逻辑
- 并发控制
- 失败重试机制
- 进度跟踪

## 测试配置选项

在 `.env.test` 中可配置：

```bash
# API请求超时时间（毫秒）
TEST_API_TIMEOUT=300000

# 最大重试次数
TEST_MAX_RETRIES=3

# 并发任务数
TEST_MAX_CONCURRENCY=2

# 测试视频时长（帧数）
# 121 = 5秒, 241 = 10秒
TEST_VIDEO_FRAMES=121

# 测试视频宽高比
# 可选: 16:9, 4:3, 1:1, 3:4, 9:16, 21:9
TEST_ASPECT_RATIO=9:16

# 测试输出目录
TEST_OUTPUT_DIR=./test-output

# 临时文件目录
TEST_TEMP_DIR=./test-temp
```

## 测试数据

测试套件包含多种测试提示词：

### 简单提示词
- 一只可爱的小猫在花园里玩耍
- 夕阳下的宁静海滩
- 繁忙的城市街道

### 复杂提示词
- 宇航员在太空站内漂浮，透过窗户可以看到地球
- 古代武士在樱花飘落的庭院中练剑
- 未来城市的霓虹灯夜景，飞车穿梭于高楼之间

## 注意事项

### API 消耗控制
- 默认使用最短视频时长（5秒）进行测试
- 限制并发数为2个任务
- 实现了智能重试机制

### 安全性
- API密钥存储在 `.env.test` 中（已加入.gitignore）
- 不要将密钥提交到代码仓库
- 使用环境变量管理所有敏感信息

### 测试隔离
- 每个测试独立运行
- 自动清理测试产生的临时文件
- 使用唯一的项目名称避免冲突

## 故障排除

### 常见错误及解决方案

1. **API密钥未配置**
   ```
   ❌ API密钥未配置，请设置以下环境变量：
   VOLCANO_ACCESS_KEY - 火山引擎访问密钥
   VOLCANO_SECRET_KEY - 火山引擎密钥
   ```
   解决：检查 `.env.test` 文件是否正确配置

2. **QPS超限（错误码50429）**
   ```
   Request Has Reached API Limit, Please Try Later
   ```
   解决：降低 `TEST_MAX_CONCURRENCY` 值，增加请求间隔

3. **并发超限（错误码50430）**
   ```
   Request Has Reached API Concurrent Limit, Please Try Later
   ```
   解决：减少并发任务数，使用批处理模式

4. **任务超时**
   解决：增加 `TEST_API_TIMEOUT` 值，或检查网络连接

## 持续集成

### GitHub Actions 配置示例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:e2e
        env:
          VOLCANO_ACCESS_KEY: ${{ secrets.VOLCANO_ACCESS_KEY }}
          VOLCANO_SECRET_KEY: ${{ secrets.VOLCANO_SECRET_KEY }}
          SKIP_EXPENSIVE_TESTS: true
```

## 性能指标

典型的测试执行时间：
- 单个5秒视频生成：1-2分钟
- 单个10秒视频生成：2-3分钟
- 完整测试套件（跳过昂贵测试）：3-5分钟
- 完整测试套件（包含所有测试）：10-15分钟

## 贡献指南

欢迎贡献更多测试用例！请确保：
1. 新测试遵循现有的测试结构
2. 使用配置文件管理测试参数
3. 实现适当的错误处理
4. 添加必要的文档说明

## 联系支持

如有问题，请：
1. 查看本文档的故障排除部分
2. 检查 [火山引擎文档](https://www.volcengine.com/docs/85621)
3. 提交 Issue 到项目仓库