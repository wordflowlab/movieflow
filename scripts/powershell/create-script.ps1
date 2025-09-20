param(
    [string]$Json = ""
)

# MovieFlow 视频脚本创建 (PowerShell版本)
# 创建60秒视频的分镜脚本

# 获取当前时间戳
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# 默认值
$Theme = "唐僧说媒"
$Style = "幽默风格"

# 解析JSON参数
if ($Json -ne "") {
    try {
        $ParsedJson = $Json | ConvertFrom-Json
        if ($ParsedJson.theme) { $Theme = $ParsedJson.theme }
        if ($ParsedJson.style) { $Style = $ParsedJson.style }
    } catch {
        # JSON解析失败，使用默认值
    }
}

$ScriptName = "script_$Timestamp"
$ScriptFile = ".\scripts\$ScriptName.md"

# 创建脚本目录
New-Item -ItemType Directory -Force -Path .\scripts | Out-Null

# 输出JSON格式的结果
$result = @{
    SCRIPT_NAME = $ScriptName
    SCRIPT_FILE = $ScriptFile
    THEME = $Theme
    STYLE = $Style
    TIMESTAMP = $Timestamp
} | ConvertTo-Json

Write-Output $result