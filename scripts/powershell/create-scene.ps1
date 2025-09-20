param(
    [string]$Json = ""
)

# MovieFlow 场景设计脚本 (PowerShell版本)
# 创建视频场景画面

# 获取当前时间戳
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# 默认值
$SceneNum = 1
$Description = "开场场景"

# 解析JSON参数
if ($Json -ne "") {
    try {
        $ParsedJson = $Json | ConvertFrom-Json
        if ($ParsedJson.scene) { $SceneNum = $ParsedJson.scene }
        if ($ParsedJson.description) { $Description = $ParsedJson.description }
    } catch {
        # JSON解析失败，使用默认值
    }
}

$SceneId = "scene_${SceneNum}_$Timestamp"
$SceneFile = ".\scenes\$SceneId.md"

# 创建场景目录
New-Item -ItemType Directory -Force -Path .\scenes | Out-Null

# 输出JSON格式的结果
$result = @{
    SCENE_ID = $SceneId
    SCENE_FILE = $SceneFile
    SCENE_NUM = $SceneNum
    DESCRIPTION = $Description
    TIMESTAMP = $Timestamp
    FRAMES = 241
    DURATION = 10
} | ConvertTo-Json

Write-Output $result