import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as events_targets from 'aws-cdk-lib/aws-events-targets';

import { Construct } from 'constructs';

export interface LambdaCronStackProps extends cdk.StackProps {
  scheduleExpression: string;
}

export class LambdaCronStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaCronStackProps) {
    super(scope, id, props);

    // DynamoDB table to store examples
    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'item_id',
        type: dynamodb.AttributeType.STRING,
      },
      tableName: 'ExampleTable',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda for CRUD example
    const createFunction = new lambda.Function(this, 'Create', {
      code: lambda.Code.fromAsset('./lambda/python'),
      handler: 'example.create',
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    const readFunction = new lambda.Function(this, 'Read', {
      code: lambda.Code.fromAsset('./lambda/python'),
      handler: 'example.read',
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    const updateFunction = new lambda.Function(this, 'Update', {
      code: lambda.Code.fromAsset('./lambda/python'),
      handler: 'example.update',
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    const deleteFunction = new lambda.Function(this, 'Delete', {
      code: lambda.Code.fromAsset('./lambda/python'),
      handler: 'example.delete',
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // grant permissions
    table.grantReadData(readFunction);
    table.grantWriteData(createFunction);
    table.grantWriteData(updateFunction);
    table.grantWriteData(deleteFunction);

    // EventBridge rule to trigger Lambda functions
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.expression(props.scheduleExpression),
    });
    rule.addTarget(new events_targets.LambdaFunction(readFunction));
  }
}
