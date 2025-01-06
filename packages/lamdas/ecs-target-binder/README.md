This lamda is used for registering targets on a target group.

The main objectives are

1. Fetching the dynamic port and instance id of container instances
2. Registering targets in a target group with this dyanamically fetched ports etc

The target group arn is shared from our primary server through containerOverrides propety
on ws container

Event Bridge Rule

{
"source": ["aws.ecs"],
"detail-type": ["ECS Task State Change"],
"detail": {
"clusterArn": ["arn:aws:ecs:us-west-1:990606644332:cluster/codecall-cluster"],
"lastStatus": ["RUNNING"],
"desiredStatus": ["RUNNING"]
}
}
