import { EFSClient, CreateFileSystemCommand, CreateMountTargetCommand } from '@aws-sdk/client-efs';
import { ECSClient, RunTaskCommand, MountPoint } from '@aws-sdk/client-ecs';

const ecsClient = new ECSClient({
  region: 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEY ?? '',
    secretAccessKey: process.env.AWS_SECRETKEY ?? '',
  },
});

const efsClient = new EFSClient({
  region: 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEY ?? '',
    secretAccessKey: process.env.AWS_SECRETKEY ?? '',
  },
});

export async function createEFSForPlayground() {
  const command = new CreateFileSystemCommand({
    PerformanceMode: 'generalPurpose',
    ThroughputMode: 'bursting',
    Encrypted: true,
    Tags: [{ Key: 'Purpose', Value: 'CodePlayground' }],
  });

  const efsData = await efsClient.send(command);
  console.log('EFS Created:', efsData.FileSystemId);
  return efsData;
}

export async function createMountTargetForPlayground(fileSystemId: string) {
  await new Promise(resolve => setTimeout(resolve, 10000));
  const createMountTargetParams = {
    FileSystemId: fileSystemId,
    SubnetId: 'subnet-0a74b75b4a1c7412b',
    SecurityGroups: ['sg-0e2a3312321fdcdfd'],
  };
  const createMountTargetCommand = new CreateMountTargetCommand(createMountTargetParams);
  const mountTargetData = await efsClient.send(createMountTargetCommand);
  console.log(`Created Mount Target: ${mountTargetData.MountTargetId}`);
}

export async function runECSPlaygroundTask(fileSystemId: string) {
  let command = new RunTaskCommand({
    cluster: 'codecall-cluster',
    taskDefinition: 'code-vite',
    launchType: 'EC2',
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: ['subnet-0a74b75b4a1c7412b'],
        securityGroups: ['sg-0e2a3312321fdcdfd'],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: 'vite',
          environment: [
            {
              name: 'EFS_ID',
              value: fileSystemId,
            },
          ],
        },
        {
          name: 'ws',
          environment: [
            {
              name: 'EFS_ID',
              value: fileSystemId,
            },
          ],
        },
      ],
    },
  });
  const taskData = await ecsClient.send(command);
  if (taskData.tasks == undefined) return;
  console.log(`Started ECS Task: ${taskData.tasks[0].taskArn}`);
}
