param(
    [string]$Json = ""
)

# MovieFlow 角色设计脚本 (PowerShell版本)
# 创建视频角色形象

# 获取当前时间戳
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# 默认值
$Name = "Q版唐僧"
$Type = "Q版动画"

# 解析JSON参数
if ($Json -ne "") {
    try {
        $ParsedJson = $Json | ConvertFrom-Json
        if ($ParsedJson.name) { $Name = $ParsedJson.name }
        if ($ParsedJson.type) { $Type = $ParsedJson.type }
    } catch {
        # JSON解析失败，使用默认值
    }
}

$CharacterName = "character_$Timestamp"
$CharacterFile = ".\characters\$CharacterName.md"

# 创建角色目录
New-Item -ItemType Directory -Force -Path .\characters | Out-Null

# 输出JSON格式的结果
$result = @{
    CHARACTER_NAME = $CharacterName
    CHARACTER_FILE = $CharacterFile
    NAME = $Name
    TYPE = $Type
    TIMESTAMP = $Timestamp
} | ConvertTo-Json

Write-Output $result