import AWS from 'aws-sdk';

const ecsClient = new AWS.ECS({
  accessKeyId: process.env.AWS_ACCESSKEY,
  secretAccessKey: process.env.AWS_SECRETKEY,
});

async function createPlayground(clusterName: string, taskId: string) {
  let response = await ecsClient
    .runTask({
      cluster: clusterName,
      taskDefinition: taskId,
      count: 1,
    })
    .promise();
}
