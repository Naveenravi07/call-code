import { ECSClient, ResourceType, RunTaskCommand } from '@aws-sdk/client-ecs';
import {
  CreateTargetGroupCommand,
  ElasticLoadBalancingV2Client,
  RegisterTargetsCommand,
} from '@aws-sdk/client-elastic-load-balancing-v2';
import { CustomError } from './../classes/CustomError.class';
import { generateRandomFiveDigitNumber } from '../utils/numberUtils';

const ecsClient = new ECSClient({
  region: 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEY ?? '',
    secretAccessKey: process.env.AWS_SECRETKEY ?? '',
  },
});

const elbClient = new ElasticLoadBalancingV2Client({
  region: 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEY ?? '',
    secretAccessKey: process.env.AWS_SECRETKEY ?? '',
  },
});

export async function runECSPlaygroundTask(taskName: string, tgArn: string) {
  let command = new RunTaskCommand({
    cluster: 'codecall-cluster',
    taskDefinition: taskName,
    launchType: 'EC2',
    overrides: {
      containerOverrides: [
        {
          name: 'ws',
          environment: [
            {
              name: 'TargetGroupArn',
              value: tgArn,
            },
          ],
        },
        {
          name: 'vite',
          environment: [
            {
              name: 'TargetGroupArn',
              value: tgArn,
            },
          ],
        },
      ],
    },
  });
  const taskData = await ecsClient.send(command);
  if (taskData.tasks == undefined) throw new CustomError(400, 'Failed to create task');
  if (taskData.tasks[0].taskArn == undefined)
    throw new CustomError(400, 'Failed to fetch task arn');
  console.log(`Started ECS Task: ${taskData.tasks[0].taskArn}`);
  return taskData.tasks[0].taskArn;
}

export async function createTargetGroupForPlayground() {
  let tgName = 'callcode-tg-' + generateRandomFiveDigitNumber();
  let command = new CreateTargetGroupCommand({
    Protocol: 'HTTP',
    Port: 80,
    Name: tgName,
    VpcId: 'vpc-00e7b9f58204ebf73',
  });
  let elbResponse = await elbClient.send(command);
  if (elbResponse.TargetGroups == undefined || elbResponse.TargetGroups.length < 0)
    throw new CustomError(400, 'Failed to create a target group');
  if (elbResponse.TargetGroups[0].TargetGroupArn == undefined)
    throw new CustomError(400, 'Failed to create a target group');
  return elbResponse.TargetGroups[0].TargetGroupArn;
}
