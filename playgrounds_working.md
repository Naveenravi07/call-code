# Online IDE: Cloud Infrastructure and Backend Setup

## Overview

This project implements an online IDE with isolated coding playgrounds. Each playground consists of two Docker containers:
1. A WebSocket server for real-time code modifications
2. A code execution environment

The system uses AWS ECS for container orchestration, with each playground isolated on its own EFS volume for shared storage between the two containers.

## Architecture

- **AWS ECS**: Manages Docker containers
- **AWS EFS**: Provides isolated, persistent storage for each playground
- **AWS ALB**: Handles routing to the appropriate containers
- **AWS EC2**: Hosts the ECS tasks (containers)

## Key Components

### 1. EFS Creation

Each playground gets its own EFS file system for isolated storage.

```javascript
async function createPlaygroundEFS() {
  const efs = new AWS.EFS();
  const createFileSystemResult = await efs.createFileSystem({
    PerformanceMode: 'generalPurpose',
    ThroughputMode: 'bursting',
    Encrypted: true,
    Tags: [{ Key: 'Purpose', Value: 'CodePlayground' }]
  }).promise();

  const fileSystemId = createFileSystemResult.FileSystemId;

  // Create mount targets in VPC subnets
  const subnets = ['subnet-xxxxx', 'subnet-yyyyy'];
  for (const subnetId of subnets) {
    await efs.createMountTarget({
      FileSystemId: fileSystemId,
      SubnetId: subnetId,
      SecurityGroups: ['sg-zzzzz'],
    }).promise();
  }

  await waitForMountTargetsAvailable(fileSystemId);
  return fileSystemId;
}
```

### 2. ECS Task Definition

Defines the containers and their configuration, including the EFS volume mount.

```javascript
async function createTaskDefinition() {
  const ecs = new AWS.ECS();
  const taskDefinition = {
    family: 'playground-task',
    taskRoleArn: 'arn:aws:iam::your-account-id:role/ecsTaskExecutionRole',
    executionRoleArn: 'arn:aws:iam::your-account-id:role/ecsTaskExecutionRole',
    networkMode: 'awsvpc',
    containerDefinitions: [
      {
        name: 'websocket-container',
        image: 'your-websocket-image:latest',
        portMappings: [{ containerPort: 3000 }],
        mountPoints: [
          {
            sourceVolume: 'playground-volume',
            containerPath: '/app/shared',
            readOnly: false
          }
        ]
      },
      {
        name: 'code-execution-container',
        image: 'your-code-execution-image:latest',
        portMappings: [{ containerPort: 8080 }],
        mountPoints: [
          {
            sourceVolume: 'playground-volume',
            containerPath: '/app/shared',
            readOnly: false
          }
        ]
      }
    ],
    volumes: [
      {
        name: 'playground-volume',
        efsVolumeConfiguration: {
          transitEncryption: 'ENABLED'
        }
      }
    ],
    requiresCompatibilities: ['FARGATE'],
    cpu: '256',
    memory: '512'
  };

  const result = await ecs.registerTaskDefinition(taskDefinition).promise();
  return result.taskDefinition.taskDefinitionArn;
}
```

### 3. Playground Creation

Orchestrates the creation of an EFS volume and ECS task for a new playground.

```javascript
async function createPlayground() {
  const fileSystemId = await createPlaygroundEFS();
  const taskDefinitionArn = await createTaskDefinition();

  const ecs = new AWS.ECS();
  const runTaskResult = await ecs.runTask({
    taskDefinition: taskDefinitionArn,
    cluster: 'your-cluster',
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: ['subnet-xxxxx', 'subnet-yyyyy'],
        securityGroups: ['sg-zzzzz'],
        assignPublicIp: 'ENABLED'
      }
    },
    overrides: {
      containerOverrides: [],
      volumeOverrides: [
        {
          name: 'playground-volume',
          efsVolumeConfiguration: {
            fileSystemId: fileSystemId,
            transitEncryption: 'ENABLED'
          }
        }
      ]
    }
  }).promise();

  const taskArn = runTaskResult.tasks[0].taskArn;
  const playgroundId = generateUniqueId();

  await storePlaygroundMapping(playgroundId, {
    taskArn,
    fileSystemId,
    // ... other details ...
  });

  // Register with ALB, etc.

  return playgroundId;
}
```

### 4. Playground Cleanup

Ensures proper resource cleanup when a playground is no longer needed.

```javascript
async function deletePlayground(playgroundId) {
  const playgroundDetails = await getPlaygroundMapping(playgroundId);

  const ecs = new AWS.ECS();
  await ecs.stopTask({
    cluster: 'your-cluster',
    task: playgroundDetails.taskArn
  }).promise();

  const efs = new AWS.EFS();
  await efs.deleteFileSystem({ FileSystemId: playgroundDetails.fileSystemId }).promise();

  await removePlaygroundMapping(playgroundId);

  // Additional cleanup (e.g., ALB deregistration)
}
```


Routing
The Application Load Balancer (ALB) routes requests to the appropriate containers based on unique playground identifiers. This can be implemented using path-based or host-based routing rules.
Security Considerations

Ensure proper IAM roles and policies for ECS tasks and EFS access.
Implement network security groups to control traffic between components.
Use encrypted EFS volumes for data at rest protection.

Scalability
This architecture allows for horizontal scaling by running multiple playgrounds across multiple EC2 instances in the ECS cluster.
Future Improvements

Implement auto-scaling for the ECS cluster based on demand.
Add monitoring and logging for better observability.
Optimize EFS performance settings based on usage patterns.
