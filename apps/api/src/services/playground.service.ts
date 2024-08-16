import AWS from 'aws-sdk';
import { EFSClient, CreateFileSystemCommand } from '@aws-sdk/client-efs';

const ecsClient = new AWS.ECS({
  accessKeyId: process.env.AWS_ACCESSKEY,
  secretAccessKey: process.env.AWS_SECRETKEY,
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
