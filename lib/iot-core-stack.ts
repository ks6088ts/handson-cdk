import * as cdk from 'aws-cdk-lib';
import * as iot from 'aws-cdk-lib/aws-iot';

import { Construct } from 'constructs';

export interface IotCoreStackProps extends cdk.StackProps {
  prefix: string;
  certificateArn: string;
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
  }
}
