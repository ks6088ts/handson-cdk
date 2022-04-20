import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../lib/lambda-cron-stack';

test('Stack created', () => {
  const app = new cdk.App({
    context: {},
  });
  // WHEN
  const stack = new Cdk.LambdaCronStack(app, 'LambdaCronStack', {
    scheduleExpression: 'cron(0 18 ? * MON-FRI *)',
  });
  // THEN
  const template = Template.fromStack(stack);

  // Check # of Resources
  // Lambda
  template.resourceCountIs('AWS::Lambda::Function', 4);
  // DynamoDB
  template.resourceCountIs('AWS::DynamoDB::Table', 1);
  // IAM
  template.resourceCountIs('AWS::IAM::Policy', 4);
  template.resourceCountIs('AWS::IAM::Role', 4);
});
