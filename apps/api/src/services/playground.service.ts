import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';

const ecsClient = new ECSClient({
  region: 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEY ?? '',
    secretAccessKey: process.env.AWS_SECRETKEY ?? '',
  },
});



export async function runECSPlaygroundTask(taskName: string) {
  let command = new RunTaskCommand({
    cluster: 'codecall-cluster',
    taskDefinition: taskName,
    launchType: 'EC2',
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: ['subnet-0a74b75b4a1c7412b'],
        securityGroups: ['sg-0e2a3312321fdcdfd'],
      },
    }
  });
  const taskData = await ecsClient.send(command);
  if (taskData.tasks == undefined) return;
  console.log(`Started ECS Task: ${taskData.tasks[0].taskArn}`);
}
