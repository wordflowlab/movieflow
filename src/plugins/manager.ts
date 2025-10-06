import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export interface PluginCommand {
  id: string
  file: string
  description: string
}

export interface PluginExpert {
  id: string
  file: string
  title: string
  description: string
}

export interface PluginConfig {
  name: string
  version: string
  description: string
  type: 'feature' | 'expert' | 'workflow'
  commands?: PluginCommand[]
  experts?: PluginExpert[]
  dependencies?: {
    core: string
  }
  installation?: {
    files?: Array<{
      source: string
      target: string
      prefix?: string
    }>
    message?: string
  }
}

export class PluginManager {
  private pluginsDir: string
  private commandsDirs: {
    claude: string
    cursor: string
    gemini: string
    windsurf: string
  }
  private expertsDir: string

  constructor(projectRoot: string) {
    this.pluginsDir = path.join(projectRoot, 'plugins')
    this.commandsDirs = {
      claude: path.join(projectRoot, '.claude', 'commands'),
      cursor: path.join(projectRoot, '.cursor', 'commands'),
      gemini: path.join(projectRoot, '.gemini', 'commands'),
      windsurf: path.join(projectRoot, '.windsurf', 'workflows')
    }
    this.expertsDir = path.join(projectRoot, 'experts')
  }

  /**
   * 扫描并加载所有插件
   */
  async loadPlugins(): Promise<void> {
    try {
      // 确保插件目录存在
      await fs.ensureDir(this.pluginsDir)

      // 扫描插件目录
      const plugins = await this.scanPlugins()

      if (plugins.length === 0) {
        console.log('没有发现插件')
        return
      }

      console.log(`发现 ${plugins.length} 个插件`)

      // 加载每个插件
      for (const pluginName of plugins) {
        await this.loadPlugin(pluginName)
      }

      console.log('✅ 所有插件加载完成')
    } catch (error) {
      console.error('❌ 加载插件失败:', error)
    }
  }

  /**
   * 扫描插件目录,返回所有插件名称
   */
  private async scanPlugins(): Promise<string[]> {
    try {
      // 检查插件目录是否存在
      if (!await fs.pathExists(this.pluginsDir)) {
        return []
      }

      const entries = await fs.promises.readdir(this.pluginsDir, { withFileTypes: true })

      // 过滤出目录，并且包含config.yaml的
      const plugins = []
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const configPath = path.join(this.pluginsDir, entry.name, 'config.yaml')
          if (await fs.pathExists(configPath)) {
            plugins.push(entry.name)
          }
        }
      }

      return plugins
    } catch (error) {
      console.error('扫描插件目录失败:', error)
      return []
    }
  }

  /**
   * 加载单个插件
   */
  private async loadPlugin(pluginName: string): Promise<void> {
    try {
      console.log(`📦 加载插件: ${pluginName}`)

      // 读取插件配置
      const configPath = path.join(this.pluginsDir, pluginName, 'config.yaml')
      const config = await this.loadConfig(configPath)

      if (!config) {
        console.warn(`⚠️  插件 ${pluginName} 配置无效`)
        return
      }

      // 检查依赖
      if (!this.checkDependencies(config)) {
        console.warn(`⚠️  插件 ${pluginName} 依赖不满足`)
        return
      }

      // 注入命令
      if (config.commands && config.commands.length > 0) {
        await this.injectCommands(pluginName, config.commands)
      }

      // 注册专家
      if (config.experts && config.experts.length > 0) {
        await this.registerExperts(pluginName, config.experts)
      }

      console.log(`✅ 插件 ${pluginName} 加载成功`)

      // 显示安装信息
      if (config.installation?.message) {
        console.log(config.installation.message)
      }
    } catch (error) {
      console.error(`❌ 加载插件 ${pluginName} 失败:`, error)
    }
  }

  /**
   * 读取并解析插件配置
   */
  private async loadConfig(configPath: string): Promise<PluginConfig | null> {
    try {
      const content = await fs.readFile(configPath, 'utf-8')
      const config = yaml.load(content) as PluginConfig

      // 验证必要字段
      if (!config.name || !config.version) {
        return null
      }

      return config
    } catch (error) {
      console.error(`读取配置文件失败: ${configPath}`, error)
      return null
    }
  }

  /**
   * 检查插件依赖
   */
  private checkDependencies(config: PluginConfig): boolean {
    if (!config.dependencies) {
      return true
    }

    // 检查核心版本依赖
    if (config.dependencies.core) {
      const requiredVersion = config.dependencies.core
      console.log(`需要核心版本: ${requiredVersion}`)
      // TODO: 实现版本比较逻辑
    }

    return true
  }

  /**
   * 检测项目支持的 AI 类型
   */
  private async detectSupportedAIs(): Promise<{
    claude: boolean
    cursor: boolean
    gemini: boolean
    windsurf: boolean
  }> {
    return {
      claude: await fs.pathExists(this.commandsDirs.claude) || await this.tryCreateDir(this.commandsDirs.claude),
      cursor: await fs.pathExists(this.commandsDirs.cursor) || await this.tryCreateDir(this.commandsDirs.cursor),
      gemini: await fs.pathExists(this.commandsDirs.gemini) || await this.tryCreateDir(this.commandsDirs.gemini),
      windsurf: await fs.pathExists(this.commandsDirs.windsurf) || await this.tryCreateDir(this.commandsDirs.windsurf)
    }
  }

  /**
   * 尝试创建目录
   */
  private async tryCreateDir(dir: string): Promise<boolean> {
    try {
      await fs.ensureDir(dir)
      return true
    } catch {
      return false
    }
  }

  /**
   * 注入插件命令到对应的 AI 目录
   */
  private async injectCommands(
    pluginName: string,
    commands: PluginConfig['commands']
  ): Promise<void> {
    if (!commands) return

    // 检测项目支持哪些 AI
    const supportedAIs = await this.detectSupportedAIs()

    for (const cmd of commands) {
      try {
        // 处理 Markdown 格式（Claude、Cursor、Windsurf）
        const sourcePath = path.join(this.pluginsDir, pluginName, cmd.file)

        if (supportedAIs.claude) {
          const destPath = path.join(this.commandsDirs.claude, `${cmd.id}.md`)
          await fs.ensureDir(this.commandsDirs.claude)
          await fs.copy(sourcePath, destPath)
          console.log(`  ✓ 注入命令到 Claude: /${cmd.id}`)
        }

        if (supportedAIs.cursor) {
          const destPath = path.join(this.commandsDirs.cursor, `${cmd.id}.md`)
          await fs.ensureDir(this.commandsDirs.cursor)
          await fs.copy(sourcePath, destPath)
          console.log(`  ✓ 注入命令到 Cursor: /${cmd.id}`)
        }

        if (supportedAIs.windsurf) {
          const destPath = path.join(this.commandsDirs.windsurf, `${cmd.id}.md`)
          await fs.ensureDir(this.commandsDirs.windsurf)
          await fs.copy(sourcePath, destPath)
          console.log(`  ✓ 注入命令到 Windsurf: /${cmd.id}`)
        }

        // 处理 TOML 格式（Gemini）
        if (supportedAIs.gemini) {
          // 检查是否有预定义的 TOML 版本
          const cmdId = path.basename(cmd.id, path.extname(cmd.id))
          const tomlSourcePath = path.join(this.pluginsDir, pluginName, 'commands-gemini', `${cmdId}.toml`)

          if (await fs.pathExists(tomlSourcePath)) {
            const destPath = path.join(this.commandsDirs.gemini, `${cmdId}.toml`)
            await fs.ensureDir(this.commandsDirs.gemini)
            await fs.copy(tomlSourcePath, destPath)
            console.log(`  ✓ 注入命令到 Gemini: /${cmdId}`)
          } else {
            // 如果没有预定义的 TOML，尝试从 Markdown 转换
            try {
              const mdContent = await fs.readFile(sourcePath, 'utf-8')
              const tomlContent = this.convertMarkdownToToml(mdContent, cmd)
              if (tomlContent) {
                const destPath = path.join(this.commandsDirs.gemini, `${cmdId}.toml`)
                await fs.ensureDir(this.commandsDirs.gemini)
                await fs.writeFile(destPath, tomlContent)
                console.log(`  ✓ 自动转换并注入命令到 Gemini: /${cmdId}`)
              }
            } catch (err) {
              console.log(`  ⚠ 插件 ${pluginName} 命令 ${cmdId} 转换失败`)
            }
          }
        }
      } catch (error) {
        console.error(`❌ 注入命令 ${cmd.id} 失败:`, error)
      }
    }
  }

  /**
   * 注册插件专家
   */
  private async registerExperts(
    pluginName: string,
    experts: PluginConfig['experts']
  ): Promise<void> {
    if (!experts) return

    const pluginExpertsDir = path.join(this.expertsDir, 'plugins', pluginName)
    await fs.ensureDir(pluginExpertsDir)

    for (const expert of experts) {
      try {
        const sourcePath = path.join(this.pluginsDir, pluginName, expert.file)
        const destPath = path.join(pluginExpertsDir, `${expert.id}.md`)

        // 复制专家文件
        await fs.copy(sourcePath, destPath)
        console.log(`  ✓ 注册专家: ${expert.title} (${expert.id})`)
      } catch (error) {
        console.error(`❌ 注册专家 ${expert.id} 失败:`, error)
      }
    }
  }

  /**
   * 列出所有已安装的插件
   */
  async listPlugins(): Promise<PluginConfig[]> {
    const plugins = await this.scanPlugins()
    const configs: PluginConfig[] = []

    for (const pluginName of plugins) {
      const configPath = path.join(this.pluginsDir, pluginName, 'config.yaml')
      const config = await this.loadConfig(configPath)
      if (config) {
        configs.push(config)
      }
    }

    return configs
  }

  /**
   * 将 Markdown 命令转换为 TOML 格式
   */
  private convertMarkdownToToml(mdContent: string, cmd: any): string | null {
    try {
      // 提取 frontmatter
      const frontmatterMatch = mdContent.match(/^---\n([\s\S]*?)\n---/)
      let description = cmd.description || ''

      if (frontmatterMatch) {
        const yamlContent = frontmatterMatch[1]
        const descMatch = yamlContent.match(/description:\s*(.+)/)
        if (descMatch) {
          description = descMatch[1].trim().replace(/^['"]|['"]$/g, '')
        }
      }

      // 提取内容（去除 frontmatter）
      const content = mdContent.replace(/^---\n[\s\S]*?\n---\n/, '')

      // 构建 TOML 内容
      const tomlContent = `description = "${description}"

prompt = """
${content}

用户输入：{{args}}
"""`

      return tomlContent
    } catch (error) {
      return null
    }
  }
}
