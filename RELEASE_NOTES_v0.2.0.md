# MovieFlow v0.2.0 发布说明

## 🎉 发布成功

版本 0.2.0 已成功发布到：
- ✅ **GitHub**: https://github.com/wordflowlab/movieflow
- ✅ **npm**: https://www.npmjs.com/package/movieflow-cli

## 📦 安装/更新

```bash
# 全局安装或更新
npm install -g movieflow-cli@latest

# 或作为项目依赖
npm install movieflow-cli@0.2.0
```

## 🆕 新功能

### 1. 完整的E2E测试框架
- 添加了全面的端到端测试套件
- 支持真实API调用测试
- 测试覆盖率监控

### 2. 火山引擎签名V4认证
- 实现了正确的火山引擎API认证
- 使用官方SDK `@volcengine/openapi`
- 支持即梦AI 3.0 Pro版本

### 3. API版本支持
- **v30_pro**: 即梦AI 3.0 Pro (1080P) ✅
- **v30**: 即梦AI 3.0 (720P)
- **v30_1080p**: 即梦AI 3.0 1080P

### 4. 环境配置管理
- 添加 `.env.test.example` 模板
- 支持多环境配置
- 敏感信息安全管理

## 🐛 修复

- 修复了错误的 `req_key` 值
- 修正了API认证流程
- 改进了错误处理和提示

## 📝 使用示例

```javascript
const { VolcanoEngineClient } = require('movieflow-cli');

const client = new VolcanoEngineClient(
  process.env.VOLCANO_ACCESS_KEY,
  process.env.VOLCANO_SECRET_KEY
);

// 使用即梦AI 3.0 Pro生成视频
const response = await client.submitTextToVideoTask({
  prompt: '一只可爱的小猫在花园里玩耍',
  frames: 121,        // 5秒视频
  aspect_ratio: '9:16',  // 竖屏
  version: 'v30_pro'     // 使用3.0 Pro版本
});

console.log('任务ID:', response.data.task_id);
```

## ⚠️ 重要提醒

1. **API密钥配置**：需要在火山引擎控制台开通即梦AI服务
2. **版本选择**：根据您的权限选择正确的API版本
3. **费用提醒**：即梦AI是付费服务，每次调用会产生费用

## 📚 文档

- [E2E测试指南](./test/E2E_TEST_README.md)
- [API文档](./docs/API.md)
- [本地开发指南](./docs/local-development.md)

## 🙏 致谢

感谢所有贡献者和使用者的支持！

---

*发布时间: 2025-09-21*
*版本: 0.2.0*