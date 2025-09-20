param(
    [string]$Json = ""
)

# MovieFlow 视频生成脚本 (PowerShell版本)
# 生成60秒短视频的执行脚本

# 获取当前日期和时间
$CurrentDate = Get-Date -Format "yyyy-MM-dd"
$CurrentTime = Get-Date -Format "HH-mm-ss"

# 默认值
$ProjectName = "video_$($CurrentDate)_$($CurrentTime)"
$Platform = "douyin"
$Template = ""

# 解析JSON参数
if ($Json -ne "") {
    try {
        $ParsedJson = $Json | ConvertFrom-Json
        if ($ParsedJson.project) { $ProjectName = $ParsedJson.project }
        if ($ParsedJson.platform) { $Platform = $ParsedJson.platform }
        if ($ParsedJson.template) { $Template = $ParsedJson.template }
    } catch {
        # JSON解析失败，使用默认值
    }
}

# 创建输出目录
$OutputDir = ".\videos\$ProjectName"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# 输出JSON格式的结果
$result = @{
    PROJECT_NAME = $ProjectName
    OUTPUT_PATH = "$OutputDir\$ProjectName.mp4"
    PLATFORM = $Platform
    TEMPLATE = $Template
    DATE = $CurrentDate
    TIME = $CurrentTime
    SEGMENTS = @(
        @{ id = "segment_1"; start = 0; duration = 10; frames = 241 },
        @{ id = "segment_2"; start = 10; duration = 10; frames = 241 },
        @{ id = "segment_3"; start = 20; duration = 10; frames = 241 },
        @{ id = "segment_4"; start = 30; duration = 10; frames = 241 },
        @{ id = "segment_5"; start = 40; duration = 10; frames = 241 },
        @{ id = "segment_6"; start = 50; duration = 10; frames = 241 }
    )
} | ConvertTo-Json -Depth 3

Write-Output $result