import { ECSClient, DescribeTasksCommand, DescribeContainerInstancesCommand } from '@aws-sdk/client-ecs';
import { ElasticLoadBalancingV2Client, RegisterTargetsCommand } from '@aws-sdk/client-elastic-load-balancing-v2';

const ecsClient = new ECSClient();
const elbv2Client = new ElasticLoadBalancingV2Client();

export const handler  = async (event) => {
    const detail = event.detail;
    try {
            const taskArn = detail.taskArn;
            const clusterArn = detail.clusterArn;

            const taskInfo = await ecsClient.send(new DescribeTasksCommand({
                tasks: [taskArn],
                cluster: clusterArn
            }));
            
            if(taskInfo.tasks.length <= 0 ) return
            const containerInstanceArn = taskInfo.tasks[0].containerInstanceArn;
            const containerInstanceInfo = await ecsClient.send(new DescribeContainerInstancesCommand({
                containerInstances: [containerInstanceArn],
                cluster: clusterArn
            }));
            
            if(containerInstanceInfo.containerInstances.length <= 0) return
            const ec2InstanceId = containerInstanceInfo.containerInstances[0].ec2InstanceId;
            const hostPort = detail.containers[0].networkBindings[0].hostPort
            const hostPort2 = detail.containers[1].networkBindings[0].hostPort


            const containersOver = taskInfo.tasks[0].overrides.containerOverrides
            const containerOverride = containersOver.find((cont) => cont.name === 'ws'); // Choosing ws bcz ws will be always present no matter the task defenition
            
            if(containerOverride == undefined || containerOverride.environment.length < 1){
                console.log("No env")
                return
            }
            let targetGroup = containerOverride.environment.find((env)=>env.name == "TargetGroupArn")
            if(targetGroup == undefined) return 
            let targetGroupArn = targetGroup.value
            console.log("Target Arn " + targetGroupArn)
            
            //Registerning target to the created target group
            const registerParams = {
                TargetGroupArn: targetGroupArn, 
                Targets: [{ Id: ec2InstanceId, Port: hostPort },{Id:ec2InstanceId,Port:hostPort2}]
            };
            await elbv2Client.send(new RegisterTargetsCommand(registerParams));
            console.log(`Registered EC2 instance ${ec2InstanceId} with port ${hostPort} and ${hostPort2}`);
            
            
    } catch (error) {
        console.error("Error handling event:", error);
    }
};



