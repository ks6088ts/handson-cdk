import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../lib/iot-core-stack';

test('Stack created', () => {
  const app = new cdk.App({
    context: {},
  });
  // WHEN
  const stack = new Cdk.IotCoreStack(app, 'IotCoreStack', {
    prefix: 'test',
    certificateArn: 'test',
  });
  // THEN
  const template = Template.fromStack(stack);

  // Check # of Resources
  // IoT
  template.resourceCountIs('AWS::IoT::Policy', 1);
  template.resourceCountIs('AWS::IoT::PolicyPrincipalAttachment', 1);
  template.resourceCountIs('AWS::IoT::Thing', 1);
  template.resourceCountIs('AWS::IoT::ThingPrincipalAttachment', 1);
});
