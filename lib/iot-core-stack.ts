import * as cdk from 'aws-cdk-lib';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';

export interface IotCoreStackProps extends cdk.StackProps {
  prefix: string;
  certificateArn: string;
  sql: string;
}

export class IotCoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IotCoreStackProps) {
    super(scope, id, props);

    const iotThing = new iot.CfnThing(this, `${props.prefix}-iot-thing`, {
      thingName: `${props.prefix}-thing`,
    });

    const iotPolicy = new iot.CfnPolicy(this, `${props.prefix}-iot-policy`, {
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 'iot:*',
            Resource: '*',
          },
        ],
      },
      policyName: `${props.prefix}-iot-policy`,
    });

    const iotThingPrincipalAttachment = new iot.CfnThingPrincipalAttachment(
      this,
      `${props.prefix}-iot-thing-principal-attachment`,
      {
        principal: props.certificateArn,
        thingName: `${props.prefix}-thing`,
      }
    );
    iotThingPrincipalAttachment.addDependsOn(iotThing);

    const iotPolicyPrincipalAttachment = new iot.CfnPolicyPrincipalAttachment(
      this,
      `${props.prefix}-iot-policy-principal-attachment`,
      {
        principal: props.certificateArn,
        policyName: `${props.prefix}-iot-policy`,
      }
    );
    iotPolicyPrincipalAttachment.addDependsOn(iotPolicy);

    const table = new dynamodb.Table(this, `${props.prefix}-table`, {
      partitionKey: {
        name: 'timestamp',
        type: dynamodb.AttributeType.NUMBER,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: `${props.prefix}-table`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const tablePutItemRole = new iam.CfnRole(
      this,
      `${props.prefix}-table-put-item-role`,
      {
        assumeRolePolicyDocument: {
          Statement: [
            {
              Action: 'sts:AssumeRole',
              Effect: 'Allow',
              Principal: {
                Service: 'iot.amazonaws.com',
              },
            },
          ],
          Version: '2012-10-17',
        },
        policies: [
          {
            policyName: `${props.prefix}-table-put-item-policy`,
            policyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: 'dynamoDB:PutItem',
                  Resource: table.tableArn,
                },
              ],
            },
          },
        ],
      }
    );

    new iot.CfnTopicRule(this, `${props.prefix}-iot-topic-rule`, {
      ruleName: `${props.prefix}_iot_topic_rule`,
      topicRulePayload: {
        actions: [
          {
            dynamoDBv2: {
              putItem: {
                tableName: table.tableName,
              },
              roleArn: tablePutItemRole.attrArn,
            },
          },
        ],
        awsIotSqlVersion: '2016-03-23',
        ruleDisabled: false,
        sql: props.sql,
      },
    });
  }
}
