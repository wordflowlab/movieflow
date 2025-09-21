/**
 * 任务状态管理器
 * 支持断点续传,避免重复调用 API 浪费 token
 */

import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

export interface TaskSegment {
  index: number;
  prompt: string;
  taskId?: string;
  status: 'pending' | 'submitted' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  submitTime?: number;
  completeTime?: number;
  retryCount: number;
  error?: string;
}

export interface TaskSession {
  id: string;
  projectName: string;
  totalSegments: number;
  segments: TaskSegment[];
  createTime: number;
  updateTime: number;
  apiVersion?: 'v30' | 'v30_1080p' | 'v30_pro';
  aspectRatio?: string;
  outputPath?: string;
  completed: boolean;
}

export class TaskStateManager {
  private stateDir: string;
  private currentSession: TaskSession | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor(stateDir: string = '.movieflow-state') {
    this.stateDir = path.resolve(stateDir);
    fs.ensureDirSync(this.stateDir);
  }

  /**
   * 创建新会话
   */
  async createSession(
    projectName: string,
    segments: Array<{prompt: string}>,
    options: {
      apiVersion?: 'v30' | 'v30_1080p' | 'v30_pro';
      aspectRatio?: string;
      outputPath?: string;
    } = {}
  ): Promise<TaskSession> {
    const sessionId = this.generateSessionId(projectName);
    
    const session: TaskSession = {
      id: sessionId,
      projectName,
      totalSegments: segments.length,
      segments: segments.map((seg, index) => ({
        index,
        prompt: seg.prompt,
        status: 'pending',
        retryCount: 0
      })),
      createTime: Date.now(),
      updateTime: Date.now(),
      apiVersion: options.apiVersion,
      aspectRatio: options.aspectRatio,
      outputPath: options.outputPath,
      completed: false
    };

    this.currentSession = session;
    await this.saveSession(session);
    this.startAutoSave();
    
    return session;
  }

  /**
   * 恢复会话
   */
  async resumeSession(sessionIdOrProjectName: string): Promise<TaskSession | null> {
    // 尝试直接作为 session ID 加载
    let sessionPath = path.join(this.stateDir, `${sessionIdOrProjectName}.json`);
    
    if (!await fs.pathExists(sessionPath)) {
      // 尝试作为项目名查找最新的 session
      const sessions = await this.listSessions();
      const matchingSessions = sessions
        .filter(s => s.projectName === sessionIdOrProjectName)
        .sort((a, b) => b.updateTime - a.updateTime);
      
      if (matchingSessions.length > 0) {
        sessionPath = path.join(this.stateDir, `${matchingSessions[0].id}.json`);
      } else {
        return null;
      }
    }

    try {
      const sessionData = await fs.readJson(sessionPath);
      this.currentSession = sessionData;
      this.startAutoSave();
      
      console.log(`🔄 恢复会话: ${sessionData.projectName}`);
      console.log(`  - 总片段: ${sessionData.totalSegments}`);
      console.log(`  - 已完成: ${sessionData.segments.filter((s: any) => s.status === 'completed').length}`);
      console.log(`  - 待处理: ${sessionData.segments.filter((s: any) => s.status === 'pending').length}`);
      
      return sessionData;
    } catch (error) {
      console.error('加载会话失败:', error);
      return null;
    }
  }

  /**
   * 列出所有会话
   */
  async listSessions(): Promise<TaskSession[]> {
    const files = await fs.readdir(this.stateDir);
    const sessions: TaskSession[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const sessionData = await fs.readJson(path.join(this.stateDir, file));
          sessions.push(sessionData);
        } catch (error) {
          // 忽略损坏的文件
        }
      }
    }

    return sessions.sort((a, b) => b.updateTime - a.updateTime);
  }

  /**
   * 更新片段状态
   */
  async updateSegmentStatus(
    segmentIndex: number,
    status: TaskSegment['status'],
    data?: {
      taskId?: string;
      videoUrl?: string;
      error?: string;
    }
  ): Promise<void> {
    if (!this.currentSession) {
      throw new Error('没有活动的会话');
    }

    const segment = this.currentSession.segments[segmentIndex];
    if (!segment) {
      throw new Error(`片段 ${segmentIndex} 不存在`);
    }

    segment.status = status;
    
    if (data) {
      if (data.taskId) segment.taskId = data.taskId;
      if (data.videoUrl) segment.videoUrl = data.videoUrl;
      if (data.error) segment.error = data.error;
    }

    if (status === 'submitted') {
      segment.submitTime = Date.now();
    } else if (status === 'completed') {
      segment.completeTime = Date.now();
    } else if (status === 'failed') {
      segment.retryCount++;
    }

    this.currentSession.updateTime = Date.now();
    
    // 检查是否所有片段都完成
    const allCompleted = this.currentSession.segments.every(
      s => s.status === 'completed'
    );
    if (allCompleted) {
      this.currentSession.completed = true;
    }

    await this.saveSession(this.currentSession);
  }

  /**
   * 获取待处理的片段
   */
  getPendingSegments(): TaskSegment[] {
    if (!this.currentSession) {
      return [];
    }

    return this.currentSession.segments.filter(
      s => s.status === 'pending' || 
          (s.status === 'failed' && s.retryCount < 3)
    );
  }

  /**
   * 获取正在处理的片段
   */
  getProcessingSegments(): TaskSegment[] {
    if (!this.currentSession) {
      return [];
    }

    return this.currentSession.segments.filter(
      s => s.status === 'submitted' || s.status === 'processing'
    );
  }

  /**
   * 获取已完成的片段
   */
  getCompletedSegments(): TaskSegment[] {
    if (!this.currentSession) {
      return [];
    }

    return this.currentSession.segments.filter(
      s => s.status === 'completed'
    );
  }

  /**
   * 获取当前会话
   */
  getCurrentSession(): TaskSession | null {
    return this.currentSession;
  }

  /**
   * 保存会话
   */
  private async saveSession(session: TaskSession): Promise<void> {
    const sessionPath = path.join(this.stateDir, `${session.id}.json`);
    await fs.writeJson(sessionPath, session, { spaces: 2 });
  }

  /**
   * 生成会话 ID
   */
  private generateSessionId(projectName: string): string {
    const timestamp = Date.now();
    const hash = crypto.createHash('md5')
      .update(`${projectName}_${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    return `${projectName}_${timestamp}_${hash}`;
  }

  /**
   * 启动自动保存
   */
  private startAutoSave(): void {
    this.stopAutoSave();
    
    this.autoSaveInterval = setInterval(() => {
      if (this.currentSession) {
        this.saveSession(this.currentSession).catch(error => {
          console.error('自动保存失败:', error);
        });
      }
    }, 10000);  // 每 10 秒自动保存
  }

  /**
   * 停止自动保存
   */
  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * 清理过期会话(默认 7 天)
   */
  async cleanExpiredSessions(daysToKeep: number = 7): Promise<number> {
    const sessions = await this.listSessions();
    const expireTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const session of sessions) {
      if (session.updateTime < expireTime && session.completed) {
        const sessionPath = path.join(this.stateDir, `${session.id}.json`);
        await fs.remove(sessionPath);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * 导出会话报告
   */
  generateReport(session?: TaskSession): string {
    const targetSession = session || this.currentSession;
    if (!targetSession) {
      return '没有可用的会话数据';
    }

    const completed = targetSession.segments.filter(s => s.status === 'completed').length;
    const failed = targetSession.segments.filter(s => s.status === 'failed').length;
    const pending = targetSession.segments.filter(s => s.status === 'pending').length;
    const processing = targetSession.segments.filter(
      s => s.status === 'submitted' || s.status === 'processing'
    ).length;

    const totalTime = targetSession.segments
      .filter(s => s.completeTime && s.submitTime)
      .reduce((sum, s) => sum + (s.completeTime! - s.submitTime!), 0);

    const avgTime = completed > 0 ? totalTime / completed / 1000 : 0;

    let report = '\n' + '='.repeat(50) + '\n';
    report += '📊 任务会话报告\n';
    report += '='.repeat(50) + '\n';
    report += `会话 ID: ${targetSession.id}\n`;
    report += `项目名称: ${targetSession.projectName}\n`;
    report += `API 版本: ${targetSession.apiVersion || 'v30'}\n`;
    report += `宽高比: ${targetSession.aspectRatio || '9:16'}\n`;
    report += `\n📋 片段状态:\n`;
    report += `  总计: ${targetSession.totalSegments}\n`;
    report += `  已完成: ${completed} (${(completed / targetSession.totalSegments * 100).toFixed(1)}%)\n`;
    report += `  处理中: ${processing}\n`;
    report += `  待处理: ${pending}\n`;
    report += `  失败: ${failed}\n`;
    report += `\n⏱  时间统计:\n`;
    report += `  平均处理时间: ${avgTime.toFixed(1)} 秒\n`;
    report += `  预计总时间: ${(avgTime * targetSession.totalSegments / 60).toFixed(1)} 分钟\n`;
    
    if (targetSession.outputPath) {
      report += `\n📦 输出路径: ${targetSession.outputPath}\n`;
    }
    
    report += '='.repeat(50) + '\n';

    return report;
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopAutoSave();
    if (this.currentSession) {
      this.saveSession(this.currentSession).catch(() => {});
    }
  }
}