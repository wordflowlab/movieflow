import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { execSync } from 'child_process';
import * as path from 'path';

// Mock modules
jest.mock('child_process');
jest.mock('fs-extra', () => ({
  pathExists: jest.fn(),
  ensureDir: jest.fn(),
  ensureDirSync: jest.fn(),
  writeJson: jest.fn(),
  writeFile: jest.fn(),
  readdir: jest.fn(),
  readFile: jest.fn(),
  copy: jest.fn(),
  chmod: jest.fn(),
  remove: jest.fn(),
  createWriteStream: jest.fn(),
}));
jest.mock('ora', () => ({
  default: jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    text: ''
  }))
}));

const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockedFs = jest.requireMock('fs-extra') as any;

describe('MovieFlow CLI', () => {
  const cliPath = path.join(__dirname, '../src/cli.ts');
  let originalArgv: string[];
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Save original argv
    originalArgv = process.argv;

    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Reset fs mocks
    mockedFs.pathExists.mockReset();
    mockedFs.ensureDir.mockReset();
    mockedFs.writeJson.mockReset();
    mockedFs.writeFile.mockReset();
    mockedFs.readdir.mockReset();
    mockedFs.readFile.mockReset();
    mockedFs.copy.mockReset();
    mockedFs.chmod.mockReset();

    // Set default mock implementations
    mockedFs.pathExists.mockResolvedValue(false);
    mockedFs.ensureDir.mockResolvedValue(undefined);
    mockedFs.writeJson.mockResolvedValue(undefined);
    mockedFs.writeFile.mockResolvedValue(undefined);
    mockedFs.readdir.mockResolvedValue([]);
    mockedFs.readFile.mockResolvedValue('');
    mockedFs.copy.mockResolvedValue(undefined);
    mockedFs.chmod.mockResolvedValue(undefined);

    // Mock execSync for git commands
    mockedExecSync.mockReturnValue(Buffer.from(''));
  });

  afterEach(() => {
    // Restore original argv
    process.argv = originalArgv;

    // Restore console
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('init command', () => {
    it('should create new project directory structure', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'test-video'];

      // Mock that directory doesn't exist
      mockedFs.pathExists.mockResolvedValueOnce(false);

      // Dynamically import and run CLI
      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that directories were created
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('test-video'));
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.specify'));
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('videos'));
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('assets'));
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('segments'));
    });

    it('should create claude-specific directories for claude AI', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'claude-video', '--ai', 'claude'];

      mockedFs.pathExists.mockResolvedValueOnce(false);

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.claude/commands'));
    });

    it('should create cursor-specific directories for cursor AI', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'cursor-video', '--ai', 'cursor'];

      mockedFs.pathExists.mockResolvedValueOnce(false);

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.cursor/commands'));
    });

    it('should create windsurf-specific directories for windsurf AI', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'windsurf-video', '--ai', 'windsurf'];

      mockedFs.pathExists.mockResolvedValueOnce(false);

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.windsurf/workflows'));
    });

    it('should create all AI directories when --all flag is used', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'all-video', '--all'];

      mockedFs.pathExists.mockResolvedValueOnce(false);

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.claude/commands'));
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.cursor/commands'));
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.gemini/commands'));
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.windsurf/workflows'));
    });

    it('should initialize in current directory with --here flag', async () => {
      process.argv = ['node', 'cli.ts', 'init', '--here'];

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should use current directory
      expect(mockedFs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.specify'));
      expect(mockedFs.ensureDir).not.toHaveBeenCalledWith(expect.stringContaining('test-video'));
    });

    it('should skip git initialization with --no-git flag', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'no-git-video', '--no-git'];

      mockedFs.pathExists.mockResolvedValueOnce(false);

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not call git init
      expect(mockedExecSync).not.toHaveBeenCalledWith(expect.stringContaining('git init'));
    });

    it('should create config.json file', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'config-video'];

      mockedFs.pathExists.mockResolvedValueOnce(false);

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('config.json'),
        expect.objectContaining({
          name: 'config-video',
          type: 'video',
          ai: 'claude',
          version: expect.any(String),
          settings: expect.objectContaining({
            defaultDuration: 10,
            defaultFrames: 241,
            defaultRatio: '9:16',
            concurrency: 3
          })
        }),
        { spaces: 2 }
      );
    });

    it('should copy script files and set permissions', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'scripts-video'];

      mockedFs.pathExists
        .mockResolvedValueOnce(false)  // Project directory
        .mockResolvedValueOnce(true)   // Scripts directory exists
        .mockResolvedValueOnce(true);  // Bash directory exists

      mockedFs.readdir.mockResolvedValueOnce(['script1.sh', 'script2.sh']);

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFs.copy).toHaveBeenCalled();
      expect(mockedFs.chmod).toHaveBeenCalledTimes(2);
      expect(mockedFs.chmod).toHaveBeenCalledWith(expect.stringContaining('script1.sh'), 0o755);
      expect(mockedFs.chmod).toHaveBeenCalledWith(expect.stringContaining('script2.sh'), 0o755);
    });

    it('should handle existing project directory error', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'existing-video'];

      // Mock that directory exists
      mockedFs.pathExists.mockResolvedValueOnce(true);

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      jest.isolateModules(async () => {
        try {
          await import('../src/cli');
        } catch (e) {
          // Expected to throw due to process.exit
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });

    it('should require project name or --here flag', async () => {
      process.argv = ['node', 'cli.ts', 'init'];

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit');
      });

      jest.isolateModules(async () => {
        try {
          await import('../src/cli');
        } catch (e) {
          // Expected to throw due to process.exit
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe('check command', () => {
    it('should check for required dependencies', async () => {
      process.argv = ['node', 'cli.ts', 'check'];

      // Mock successful checks
      mockedExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes('node --version')) return Buffer.from('v18.0.0');
        if (cmd.includes('ffmpeg -version')) return Buffer.from('ffmpeg version 4.4.0');
        if (cmd.includes('git --version')) return Buffer.from('git version 2.30.0');
        return Buffer.from('');
      });

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedExecSync).toHaveBeenCalledWith('node --version', expect.any(Object));
      expect(mockedExecSync).toHaveBeenCalledWith('ffmpeg -version', expect.any(Object));
      expect(mockedExecSync).toHaveBeenCalledWith('git --version', expect.any(Object));
    });

    it('should handle missing FFmpeg', async () => {
      process.argv = ['node', 'cli.ts', 'check'];

      mockedExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes('ffmpeg')) {
          throw new Error('Command not found');
        }
        return Buffer.from('');
      });

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should log warning about FFmpeg
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('FFmpeg 未安装'));
    });
  });

  describe('help command', () => {
    it('should display help information', async () => {
      process.argv = ['node', 'cli.ts', '--help'];

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('使用示例'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('movieflow init'));
    });
  });

  describe('banner display', () => {
    it('should display welcome banner', async () => {
      process.argv = ['node', 'cli.ts'];

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('MovieFlow'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('AI 驱动的短视频生成工具'));
    });
  });

  describe('template file generation', () => {
    it('should generate markdown commands for Claude', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'template-video', '--ai', 'claude'];

      mockedFs.pathExists
        .mockResolvedValueOnce(false)  // Project directory
        .mockResolvedValueOnce(true);  // Templates directory

      mockedFs.readdir.mockResolvedValueOnce(['video-script.md', 'video-character.md']);
      mockedFs.readFile.mockResolvedValue('---\ndescription: Test\nsh: test.sh\n---\n{SCRIPT}');

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.claude/commands'),
        expect.stringContaining('test.sh')
      );
    });

    it('should generate TOML commands for Gemini', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'gemini-video', '--ai', 'gemini'];

      mockedFs.pathExists
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      mockedFs.readdir.mockResolvedValueOnce(['video-script.md']);
      mockedFs.readFile.mockResolvedValue('---\ndescription: Test Command\n---\nContent {SCRIPT}');

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.gemini/commands'),
        expect.stringContaining('description = "Test Command"')
      );
    });
  });

  describe('git initialization', () => {
    it('should initialize git repository by default', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'git-video'];

      mockedFs.pathExists.mockResolvedValueOnce(false);

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedExecSync).toHaveBeenCalledWith('git init', expect.any(Object));
      expect(mockedExecSync).toHaveBeenCalledWith('git add .', expect.any(Object));
      expect(mockedExecSync).toHaveBeenCalledWith('git commit -m "初始化视频项目"', expect.any(Object));
    });

    it('should create gitignore file', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'gitignore-video'];

      mockedFs.pathExists.mockResolvedValueOnce(false);

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.gitignore'),
        expect.stringContaining('*.mp4')
      );
    });

    it('should handle git initialization failure gracefully', async () => {
      process.argv = ['node', 'cli.ts', 'init', 'git-fail-video'];

      mockedFs.pathExists.mockResolvedValueOnce(false);
      mockedExecSync.mockImplementation((cmd: string) => {
        if (cmd.includes('git')) {
          throw new Error('Git not found');
        }
        return Buffer.from('');
      });

      jest.isolateModules(async () => {
        await import('../src/cli');
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should continue despite git failure
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Git 初始化失败'));
    });
  });
});