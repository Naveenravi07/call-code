import AWS from 'aws-sdk';

const ecsClient = new AWS.ECS({
  accessKeyId: process.env.AWS_ACCESSKEY,
  secretAccessKey: process.env.AWS_SECRETKEY,
});

async function createPlayground(clusterName: string, taskId: string) {
  const taskData = await ecsClient
    .runTask({
      cluster: clusterName,
      taskDefinition: taskId,
      count: 1,
    })
    .promise();

  if (taskData.tasks == undefined) {
    return;
  }
  const taskArn = taskData.tasks[0].taskArn;
}
