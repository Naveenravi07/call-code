import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import namor from 'namor';
import { manifestRegistry } from 'src/kubernetes/helper/manifest-registry';
import { RedisService } from 'src/redis/redis.service';
import { V1JobStatus } from '@kubernetes/client-node';
import { Observable, Observer } from 'rxjs';
import {
  PlayGroundStatus,
  playGroundStatusSchema,
  PlaygroundCreationResponse,
} from '@repo/shared/playgrounds/schema';
import axios from 'axios';

@Injectable()
export class PlaygroundsService {
  private readonly MAX_DELAY = 4000;
  private readonly BASE_DELAY = 1000;
  private readonly HOST_CHECK_TIMEOUT = 10000;

  constructor(
    @Inject(forwardRef(() => KubernetesService))
    private readonly kubernetesService: KubernetesService,
    private readonly redisService: RedisService,
  ) {}

  getHostUrl(session_name: string) {
    return `ws.${session_name}.call-code.local`;
  }

  async createPlayground(
    playground_type: string,
    user_id: string,
  ): Promise<PlaygroundCreationResponse> {
    const session_name = namor.generate({ words: 2, saltLength: 0 });
    const registry = manifestRegistry[playground_type];

    const [_job, _service] = await Promise.all([
      this.kubernetesService.spawnJob(
        this.kubernetesService.namespace,
        registry.jobManifest(user_id, session_name),
      ),
      this.kubernetesService.createService(
        this.kubernetesService.namespace,
        registry.serviceManifest(user_id, session_name),
      ),
      this.kubernetesService.createIstioVirtualService(
        this.kubernetesService.namespace,
        registry.virtualServiceManifest(session_name),
      ),
    ]);

    const status = this.createInitialPlaygroundStatus(session_name);

    await this.redisService.set(session_name, status);
    return {
      session_name,
      status,
    };
  }
  private extractSessionName(jobName: string): string | null {
    const sessionName = jobName.split('callcode-session-')[1];
    return sessionName || null;
  }

  async updatePlaygroundStatus(
    jobName: string,
    phase: string,
    jobStatus: V1JobStatus | undefined,
  ) {
    const sessionName = this.extractSessionName(jobName);
    if (!sessionName) return;
    if (!jobStatus) return;

    const status = await this.redisService.get(
      sessionName,
      playGroundStatusSchema,
    );
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
        break;
    }

    status.job.lastUpdated = now;
    status.lastChecked = now;
    status.updateCount = status.updateCount + 1;
    status.job.podName = jobName;

    await this.redisService.set(sessionName, status);
    return status;
  }

  async getPlaygroundStatus(sessionId: string) {
    const status = await this.redisService.get(
      sessionId,
      playGroundStatusSchema,
    );
    if (!status) {
      throw new NotFoundException('Playground not found');
    }
    return status;
  }

  createStatusObserver(sessionId: string): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      let retryCount = 0;

      const checkStatus = async () => {
        try {
          const status = await this.getPlaygroundStatus(sessionId);
          if (status?.job?.ready === false) {
            observer.next(status);

            const delay = Math.min(
              this.BASE_DELAY * Math.pow(2, retryCount),
              this.MAX_DELAY,
            );
            retryCount++;
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            setTimeout(async () => {
              await checkStatus();
            }, delay);
          } else if (status?.job?.ready === true) {
            observer.next(status);
            observer.complete();
          } else {
            observer.error(new Error('Invalid status response'));
          }
        } catch (error) {
          observer.error(error);
        }
      };

      void checkStatus();

      return () => {
        console.log('SSE connection closed for session:', sessionId);
      };
    });
  }

  private handleAddedPhase(status: PlayGroundStatus, jobStatus: V1JobStatus) {
    if (this.isJobReady(jobStatus)) {
      status.job.phase = 'Running';
      status.job.status = 'Job Running';
      status.job.ready = true;
      status.statusHistory.push('Job Added - Running');
      status.overallStatus = 'Running';
    } else if (this.isJobPending(jobStatus)) {
      status.job.phase = 'Pending';
      status.job.status = 'Job Pending';
      status.job.ready = false;
      status.statusHistory.push('Job Added - Pending');
      status.overallStatus = 'Initializing';
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
        this.setJobRunning(status);
        await this.checkHostReachability(status);
      }
    } else if (this.isJobPending(jobStatus)) {
      this.setJobPending(status);
    }
  }

  private handleDeletedPhase(status: PlayGroundStatus) {
    status.job.phase = 'Failed';
    status.job.status = 'Job Deleted';
    status.job.ready = false;
    status.job.error = 'Job was deleted';
    status.statusHistory.push('Job Deleted');
    status.overallStatus = 'Deleted';
  }

  private async checkHostReachability(status: PlayGroundStatus) {
    const hostChecks = status.virtual_service.hosts.map(async (host) => {
      try {
        const res = await axios.get(`http://${host}`, {
          timeout: this.HOST_CHECK_TIMEOUT,
        });
        status.statusHistory.push(
          `✅ Host ${host} is ready to take connnections`,
        );
        console.log(`✅ Host ${host} is ready to take connnections`);
        return res.status === 200;
      } catch (err) {
        console.warn(`⚠️ Host ${host} not ready: ${err}`);
        return false;
      }
    });
    const results = await Promise.all(hostChecks);
    const allReady = results.every(Boolean);

    status.job.ready = allReady;
    status.service.ready = true;
    status.virtual_service.ready = allReady;

    if (allReady) {
      status.statusHistory.push('All services are reachable');
      status.overallStatus = 'Ready';
    } else {
      status.statusHistory.push('Some services are not yet reachable');
    }
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
    status.job.phase = 'Succeeded';
    status.job.status = 'Job Completed Successfully';
    status.job.ready = true;
    status.statusHistory.push('Job Succeeded');
    status.overallStatus = 'Ready';
  }

  private setJobFailed(status: PlayGroundStatus) {
    status.job.phase = 'Failed';
    status.job.status = 'Job Failed';
    status.job.ready = false;
    status.job.error = 'Job execution failed';
    status.statusHistory.push('Job Failed');
    status.overallStatus = 'Failed';
  }

  private setJobRunning(status: PlayGroundStatus) {
    status.job.phase = 'Running';
    status.job.status = 'Job Running';
    status.job.ready = true;
    status.statusHistory.push('Job Modified - Running');
    status.overallStatus = 'Running';
  }

  private setJobPending(status: PlayGroundStatus) {
    status.job.phase = 'Pending';
    status.job.status = 'Job Pending';
    status.job.ready = false;
    status.statusHistory.push('Job Modified - Pending');
    status.overallStatus = 'Initializing';
  }

  private createInitialPlaygroundStatus(sessionName: string): PlayGroundStatus {
    const now = new Date().toISOString();

    return {
      job: {
        ready: false,
        status: 'Created',
        lastUpdated: now,
      },
      service: {
        ready: false,
        status: 'Created',
        lastUpdated: now,
      },
      virtual_service: {
        ready: true,
        hosts: [this.getHostUrl(sessionName)],
        lastUpdated: now,
      },
      statusHistory: [
        'Job Created',
        'Service Created',
        'Virtual Service Created',
      ],
      lastChecked: now,
      overallStatus: 'Initializing',
      updateCount: 0,
    };
  }
}
