import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { Construct } from 'constructs';

export interface HandsonEcsStackProps extends cdk.StackProps {
  containerImageName: string;
}

export class HandsonEcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: HandsonEcsStackProps) {
    super(scope, id, props);
    // Create a new VPC
    const vpc = new ec2.Vpc(this, 'Vpc', {
      natGateways: 0,
      maxAzs: 1,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create an ECS Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: vpc,
    });

    const taskDef = new ecs.FargateTaskDefinition(
      this,
      'FargateTaskDefinition',
      {
        cpu: 1024, // 1 CPU
        memoryLimitMiB: 4096, // 4GB RAM
      }
    );

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'item_id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    table.grantReadWriteData(taskDef.taskRole);
    taskDef.addToTaskRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: ['ssm:GetParameter'],
      })
    );

    const container = taskDef.addContainer('Container', {
      image: ecs.ContainerImage.fromRegistry(props.containerImageName),
    });

    // StringParameters
    new ssm.StringParameter(this, 'ECS_CLUSTER_NAME', {
      parameterName: 'ECS_CLUSTER_NAME',
      stringValue: cluster.clusterName,
    });
    new ssm.StringParameter(this, 'ECS_TASK_DEFINITION_ARN', {
      parameterName: 'ECS_TASK_DEFINITION_ARN',
      stringValue: taskDef.taskDefinitionArn,
    });
    new ssm.StringParameter(this, 'ECS_TASK_VPC_SUBNET_1', {
      parameterName: 'ECS_TASK_VPC_SUBNET_1',
      stringValue: vpc.publicSubnets[0].subnetId,
    });
    new ssm.StringParameter(this, 'CONTAINER_NAME', {
      parameterName: 'CONTAINER_NAME',
      stringValue: container.containerName,
    });
    new ssm.StringParameter(this, 'TABLE_NAME', {
      parameterName: 'TABLE_NAME',
      stringValue: table.tableName,
    });

    // Create outputs
    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
    });
    new cdk.CfnOutput(this, 'TaskDefinitionArn', {
      value: taskDef.taskDefinitionArn,
    });
  }
}
