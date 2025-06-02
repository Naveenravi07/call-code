import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import namor from 'namor';
import { manifestRegistry } from 'src/kubernetes/helper/manifest-registry';
import { PlayGroundStatus } from './dto/playground-status';
import { RedisService } from 'src/redis/redis.service';
import { playGroundStatusSchema } from 'src/playgrounds/dto/playground-status';
import { V1JobStatus } from '@kubernetes/client-node';

@Injectable()
export class PlaygroundsService {
    constructor(
        @Inject(forwardRef(() => KubernetesService))
        private readonly kubernetesService: KubernetesService,
        private readonly redisService: RedisService
    ) {}

    async createPlayground( playground_type: string, user_id: string ) {

        let session_name = namor.generate({ words: 2, saltLength: 0 });
        let registry = manifestRegistry[playground_type];

        let [_job, _service, _virtualService] = await Promise.all([
            this.kubernetesService.spawnJob(this.kubernetesService.namespace, registry.jobManifest(user_id, session_name)),
            this.kubernetesService.createService(this.kubernetesService.namespace, registry.serviceManifest(user_id, session_name)),
            this.kubernetesService.createIstioVirtualService(this.kubernetesService.namespace, registry.virtualServiceManifest(session_name)),
        ])
        let status : PlayGroundStatus = {
           job: {
            ready: false,
            status: "Created",
            lastUpdated: new Date().toISOString(),
           },
           service: {
            ready: false,
            status: 'Created',
            lastUpdated: new Date().toISOString(),
           },
           virtual_service: {
            ready: false,   
            hosts: [],
            lastUpdated: new Date().toISOString(),
           },
           statusHistory: ["Job Created", "Service Created", "Virtual Service Created"],
           lastChecked: new Date().toISOString(),
           overallStatus: 'Initializing',
           updateCount: 0,
        }

        await this.redisService.set(session_name, status);
        return {
            session_name,
            status,
        }
    }


    async updatePlaygroundStatus(jobName: string, phase: string, jobStatus: V1JobStatus | undefined) {
        let sessionName = jobName.split('callcode-session-')[1];
        if (!sessionName) return;
        if (!jobStatus) return;
        
        let status = await this.redisService.get(sessionName, playGroundStatusSchema);
        if (!status) return;
        
        const now = new Date().toISOString();
        
        const isJobReady = (active?: number, ready?: number) => {
            return active === 1 && ready === 1;
        };

        const isJobPending = (active?: number, ready?: number) => {
            return active === 1 && ready === 0;
        };
        
        const isJobFailed = (failed?: number) => {
            return failed && failed > 0;
        };
        
        const isJobSucceeded = (succeeded?: number) => {
            return succeeded && succeeded > 0;
        };
    
        switch (phase) {
            case 'ADDED':
                if (isJobReady(jobStatus.active, jobStatus.ready)) {
                    status.job.phase = "Running";
                    status.job.status = "Job Running";
                    status.job.ready = true;
                    status.statusHistory.push("Job Added - Running");
                    status.overallStatus = "Running";
                } else if (isJobPending(jobStatus.active, jobStatus.ready)) {
                    status.job.phase = "Pending";
                    status.job.status = "Job Pending";
                    status.job.ready = false;
                    status.statusHistory.push("Job Added - Pending");
                    status.overallStatus = "Initializing";
                }
                break;
                
            case 'MODIFIED':
                if (isJobSucceeded(jobStatus.succeeded)) {
                    status.job.phase = "Succeeded";
                    status.job.status = "Job Completed Successfully";
                    status.job.ready = true;
                    status.statusHistory.push("Job Succeeded");
                    status.overallStatus = "Ready";
                } else if (isJobFailed(jobStatus.failed)) {
                    status.job.phase = "Failed";
                    status.job.status = "Job Failed";
                    status.job.ready = false;
                    status.job.error = "Job execution failed";
                    status.statusHistory.push("Job Failed");
                    status.overallStatus = "Failed";
                } else if (isJobReady(jobStatus.active, jobStatus.ready)) {
                    if (status.job.phase !== "Running") {
                        status.job.phase = "Running";
                        status.job.status = "Job Running";
                        status.job.ready = true;
                        status.statusHistory.push("Job Modified - Running");
                        status.overallStatus = "Running";
                    }
                } else if (isJobPending(jobStatus.active, jobStatus.ready)) {
                    status.job.phase = "Pending";
                    status.job.status = "Job Pending";
                    status.job.ready = false;
                    status.statusHistory.push("Job Modified - Pending");
                    status.overallStatus = "Initializing";
                }
                break;
                
            case 'DELETED':
                status.job.phase = "Failed";
                status.job.status = "Job Deleted";
                status.job.ready = false;
                status.job.error = "Job was deleted";
                status.statusHistory.push("Job Deleted");
                status.overallStatus = "Deleted";
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
    
}
