import { forwardRef, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../redis/redis.service';
import { V1JobStatus } from '@kubernetes/client-node';
import {
  JobPhases,
  PlayGroundStatus,
  playGroundStatusSchema,
} from '@repo/shared/playgrounds/schema';
import { PlaygroundsService } from './playgrounds.service';

@Injectable()
export class PlaygroundStatusService {
  constructor(
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => PlaygroundsService))
    private readonly playgroundService: PlaygroundsService,
  ) {}

  async getStatus(sessionId: string): Promise<PlayGroundStatus | null> {
    return await this.redisService.get(sessionId, playGroundStatusSchema);
  }

  async saveStatus(sessionId: string, status: PlayGroundStatus): Promise<void> {
    await this.redisService.set(sessionId, status);
  }

  createInitialStatus(sessionName: string): PlayGroundStatus {
    const now = new Date().toISOString();
    return {
      job: { ready: false, lastUpdated: now },
      service: { ready: false, lastUpdated: now },
      virtual_service: {
        ready: true,
        hosts: [this.playgroundService.getHostUrl(sessionName)],
        lastUpdated: now,
      },
      ready: false,
      statusHistory: [
        'Job Created',
        'Service Created',
        'Virtual Service Created',
      ],
      lastChecked: now,
      updateCount: 0,
    };
  }

  async updateFromJobEvent(
    jobName: string,
    phase: string,
    jobStatus?: V1JobStatus,
  ) {
    const sessionName = this.extractSessionName(jobName);
    if (!sessionName || !jobStatus) return;

    const status = await this.getStatus(sessionName);
    if (!status) return;
    const now = new Date().toISOString();

    switch (phase) {
      case 'ADDED':
        this.handleAddedPhase(status, jobStatus);
        break;
      case 'MODIFIED':
        await this.handleModifiedPhase(status, jobStatus);
        break;
      case 'DELETED':
        this.handleDeletedPhase(status);
        break;
      default:
        status.statusHistory.push(`Unknown phase: ${phase}`);
    }

    status.job.lastUpdated = now;
    status.lastChecked = now;
    status.updateCount++;
    status.job.podName = jobName;

    await this.saveStatus(sessionName, status);
    return status;
  }

  private extractSessionName(jobName: string): string | null {
    return jobName.split('callcode-session-')[1] || null;
  }

  private handleAddedPhase(status: PlayGroundStatus, jobStatus: V1JobStatus) {
    if (this.isJobReady(jobStatus)) {
      this.setJobRunning(status, 'Job Added - Running');
    } else if (this.isJobPending(jobStatus)) {
      this.setJobPending(status, 'Job Added - Pending');
    }
  }

  private async handleModifiedPhase(
    status: PlayGroundStatus,
    jobStatus: V1JobStatus,
  ) {
    if (this.isJobSucceeded(jobStatus)) {
      this.setJobSucceeded(status);
    } else if (this.isJobFailed(jobStatus)) {
      this.setJobFailed(status);
    } else if (this.isJobReady(jobStatus)) {
      if (status.job.phase !== 'Running') {
        this.setJobRunning(status, 'Job Modified - Running');
        await this.checkHostReachability(status);
      }
    } else if (this.isJobPending(jobStatus)) {
      this.setJobPending(status, 'Job Modified - Pending');
    }
  }

  private handleDeletedPhase(status: PlayGroundStatus) {
    status.job.phase = 'Failed';
    status.job.ready = false;
    status.statusHistory.push('Job Deleted');
  }

  private async retryHostCheck(
    host: string,
    attempts = 5,
    delayMs = 2000,
  ): Promise<boolean> {
    for (let i = 0; i < attempts; i++) {
      const isReady = await this.checkSingleHost(host);
      if (isReady) return true;
      await new Promise((res) => setTimeout(res, delayMs));
    }
    return false;
  }

  private async checkSingleHost(host: string): Promise<boolean> {
    try {
      const res = await axios.get(`http://${host}`, { timeout: 1000 });
      console.log(`✅ Host ${host} ready`);
      return res.status === 200;
    } catch (err) {
      console.warn(
        `⚠️ Host ${host} not ready: ${err instanceof Error ? err?.message : err}`,
      );
      return false;
    }
  }

  private async checkHostReachability(status: PlayGroundStatus) {
    const results = await Promise.all(
      status.virtual_service.hosts.map((host) => this.retryHostCheck(host)),
    );

    const allReady = results.every(Boolean);
    status.service.ready = allReady;
    status.virtual_service.ready = allReady;

    if (allReady) {
      status.statusHistory.push('All services are reachable');
    } else {
      status.statusHistory.push('Some services are not yet reachable');
    }
    status.ready = [
      status.job.ready,
      status.service.ready,
      status.virtual_service.ready,
    ].every(Boolean);
  }

  private isJobReady(jobStatus: V1JobStatus): boolean {
    return jobStatus.active === 1 && jobStatus.ready === 1;
  }

  private isJobPending(jobStatus: V1JobStatus): boolean {
    return jobStatus.active === 1 && jobStatus.ready === 0;
  }

  private isJobFailed(jobStatus: V1JobStatus): boolean {
    return !!jobStatus.failed && jobStatus.failed > 0;
  }

  private isJobSucceeded(jobStatus: V1JobStatus): boolean {
    return !!jobStatus.succeeded && jobStatus.succeeded > 0;
  }

  private setJobSucceeded(status: PlayGroundStatus) {
    this.updateStatus(status, {
      phase: 'Succeeded',
      ready: true,
      history: 'Job Succeeded',
    });
  }

  private setJobFailed(status: PlayGroundStatus) {
    this.updateStatus(status, {
      phase: 'Failed',
      ready: false,
      history: 'Job Failed',
    });
  }

  private setJobRunning(status: PlayGroundStatus, history: string) {
    this.updateStatus(status, {
      phase: 'Running',
      ready: true,
      history,
    });
  }

  private setJobPending(status: PlayGroundStatus, history: string) {
    this.updateStatus(status, {
      phase: 'Pending',
      ready: false,
      history,
    });
  }

  private updateStatus(
    status: PlayGroundStatus,
    options: {
      phase: JobPhases;
      ready: boolean;
      history: string;
    },
  ) {
    status.job.phase = options.phase;
    status.job.ready = options.ready;
    status.statusHistory.push(options.history);
  }
}
