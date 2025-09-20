# MovieFlow 本地开发指南

本指南介绍如何在本地开发和测试 MovieFlow，无需发布版本或提交到主分支。

## 1. 克隆和分支管理

```bash
git clone https://github.com/wordflowlab/movieflow.git
cd movieflow
# 在功能分支上工作
git checkout -b feature/your-feature
```

## 2. 环境设置

### 2.1 Python 环境

```bash
# 使用 uv 创建虚拟环境（推荐）
uv venv
source .venv/bin/activate  # macOS/Linux
# Windows PowerShell: .venv\Scripts\Activate.ps1

# 安装依赖
uv pip install -e .
```

### 2.2 API 密钥配置

```bash
# 火山引擎（字节跳动）
export VOLCANO_ACCESS_KEY="your-access-key"
export VOLCANO_SECRET_KEY="your-secret-key"

# Google Gemini
export GEMINI_API_KEY="your-api-key"

# 其他 AI 提供商
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
```

## 3. 直接运行 CLI（最快反馈）

无需安装即可直接运行 CLI：

```bash
# 从仓库根目录
python -m src.movieflow_cli --help
python -m src.movieflow_cli video-specify "制作一个科技产品介绍视频"
```

或使用脚本文件方式：

```bash
python src/movieflow_cli/__init__.py video-plan 001-tech-demo
```

## 4. 使用可编辑安装（隔离环境）

创建隔离环境，确保依赖解析与用户环境一致：

```bash
# 创建并激活虚拟环境
uv venv
source .venv/bin/activate

# 可编辑模式安装
uv pip install -e .

# 现在 'movieflow' 命令可用
movieflow --help
movieflow video-specify "创建动画短片"
```

代码修改后无需重新安装（可编辑模式）。

## 5. 使用 uvx 直接从 Git 运行

### 5.1 从本地路径运行

```bash
uvx --from . movieflow video-specify "产品演示视频"
```

### 5.2 从特定分支运行（无需合并）

```bash
# 先推送工作分支
git push origin feature/your-feature

# 从分支运行
uvx --from git+https://github.com/wordflowlab/movieflow.git@feature/your-feature movieflow video-tasks
```

### 5.3 绝对路径运行（从任何位置）

```bash
# 使用绝对路径
uvx --from /Users/yourname/dev/movieflow movieflow --help

# 设置环境变量便于使用
export MOVIEFLOW_SRC=/Users/yourname/dev/movieflow
uvx --from "$MOVIEFLOW_SRC" movieflow video-specify "教育视频"

# 定义 shell 函数（可选）
movieflow-dev() { uvx --from /Users/yourname/dev/movieflow movieflow "$@"; }
movieflow-dev --help
```

## 6. 测试脚本权限

### POSIX 系统（macOS/Linux）

```bash
# 检查脚本可执行权限
ls -l scripts/bash/*.sh
# 期望看到 -rwxr-xr-x

# 必要时添加执行权限
chmod +x scripts/bash/*.sh
```

### Windows 系统

Windows 使用 `.ps1` 脚本，无需 chmod。

```powershell
# 设置执行策略（首次运行）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 运行脚本
.\scripts\powershell\create-video-project.ps1 "产品介绍"
```

## 7. 运行测试

```bash
# 运行所有测试
pytest

# 运行特定测试
pytest tests/test_video_generation.py

# 带覆盖率运行
pytest --cov=src --cov-report=html

# 测试 API 集成
pytest tests/integration/ -m volcano_engine
```

## 8. 代码质量检查

```bash
# Python 代码检查
ruff check src/
black --check src/
mypy src/

# Shell 脚本检查
shellcheck scripts/bash/*.sh

# PowerShell 脚本检查
pwsh -Command "Invoke-ScriptAnalyzer -Path scripts/powershell/"
```

## 9. 本地视频生成测试

### 9.1 模拟模式（无需 API）

```bash
# 使用模拟模式测试流程
movieflow video-specify "测试视频" --mock
movieflow video-plan specs/001-test-video --mock
movieflow video-tasks specs/001-test-video --mock
```

### 9.2 沙箱环境

```bash
# 创建测试环境
mkdir -p /tmp/movieflow-test && cd /tmp/movieflow-test

# 测试完整流程
movieflow video-specify "30秒产品介绍视频，展示APP主要功能"
movieflow video-plan specs/001-product-demo
movieflow video-tasks specs/001-product-demo
movieflow video-generate specs/001-product-demo --scene 1
```

## 10. API 调试

### 10.1 火山引擎调试

```bash
# 测试签名算法
python scripts/test_volcano_signature.py

# 验证 API 连接
curl -X POST https://openspeech.bytedance.com/api/v1/vc \
  -H "X-Date: $(date -u +%Y%m%dT%H%M%SZ)" \
  -H "Authorization: HMAC-SHA256 ..." \
  -d '{"text": "测试"}'
```

### 10.2 Gemini 调试

```bash
# 测试图像生成
python -c "
from movieflow.generators import GeminiImageGenerator
gen = GeminiImageGenerator()
gen.test_connection()
"
```

## 11. WebSocket 实时预览

```bash
# 启动开发服务器
python -m movieflow.server --debug

# 在另一个终端测试 WebSocket
python scripts/test_websocket.py

# 或使用 websocat
websocat ws://localhost:8000/ws/generation
```

## 12. 快速迭代总结

| 操作 | 命令 |
|------|------|
| 直接运行 CLI | `python -m src.movieflow_cli --help` |
| 可编辑安装 | `uv pip install -e .` 然后 `movieflow ...` |
| 本地 uvx 运行 | `uvx --from . movieflow ...` |
| 运行测试 | `pytest` |
| 代码检查 | `ruff check src/` |
| 模拟生成 | `movieflow video-generate --mock` |
| API 调试 | `python scripts/test_api.py` |

## 13. 清理构建产物

```bash
# 清理 Python 构建产物
rm -rf .venv dist build *.egg-info

# 清理生成的视频和缓存
rm -rf specs/*/output
rm -rf .cache

# 清理测试产物
rm -rf htmlcov .coverage
rm -rf test-results/
```

## 14. 常见问题

| 问题 | 解决方案 |
|------|---------|
| `ModuleNotFoundError: movieflow` | 运行 `uv pip install -e .` |
| 火山引擎认证失败 | 检查环境变量和签名算法 |
| Gemini API 限额 | 使用 `--mock` 模式或等待配额重置 |
| 视频生成超时 | 调整 `--timeout` 参数或检查网络 |
| WebSocket 连接失败 | 确保开发服务器正在运行 |
| 脚本权限错误 | 运行 `chmod +x scripts/bash/*.sh` |

## 15. 开发工作流

### 15.1 功能开发流程

1. **创建功能分支**
   ```bash
   git checkout -b feature/multi-scene-transition
   ```

2. **编写测试**
   ```python
   # tests/test_transitions.py
   def test_scene_transition():
       # TDD: 先写测试
   ```

3. **实现功能**
   ```python
   # src/movieflow/transitions.py
   class SceneTransition:
       # 实现转场效果
   ```

4. **本地测试**
   ```bash
   pytest tests/test_transitions.py
   movieflow video-generate --transition smooth
   ```

5. **提交 PR**

### 15.2 调试技巧

```python
# 启用详细日志
import logging
logging.basicConfig(level=logging.DEBUG)

# 使用断点调试
import pdb; pdb.set_trace()

# 保存中间结果
from movieflow.debug import save_intermediate
save_intermediate(scene_data, "scene_1_debug.json")
```

## 16. 性能优化

### 16.1 并行处理

```python
# 并行生成多个场景
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=3) as executor:
    futures = [executor.submit(generate_scene, i) for i in range(6)]
```

### 16.2 缓存策略

```python
# 使用 Redis 缓存
import redis
cache = redis.Redis(host='localhost', port=6379)

# 缓存生成的场景
cache.set(f"scene_{project_id}_{scene_num}", scene_data)
```

## 17. 与 Spec-Kit 集成

MovieFlow 参考 Spec-Kit 的方法论，可以与 Spec-Kit 配合使用：

```bash
# 使用 Spec-Kit 生成规格
specify init video-project --ai claude

# 使用 MovieFlow 生成视频
movieflow video-specify "基于规格生成视频"
movieflow video-plan --from-spec ../spec-kit/specs/001-video
```

## 18. 下一步

- 阅读 [API 文档](api.md) 了解接口详情
- 查看 [工作流指南](workflow.md) 了解完整流程
- 参考 [PRD 文档](PRD.md) 理解产品设计
- 访问 [GitHub Issues](https://github.com/wordflowlab/movieflow/issues) 报告问题

---

💡 **提示**：开发过程中遇到问题？在 [Discussions](https://github.com/wordflowlab/movieflow/discussions) 中交流。