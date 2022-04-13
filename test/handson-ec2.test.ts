import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../lib/handson-ec2-stack';

test('Stack created', () => {
  const app = new cdk.App({
    context: {},
  });
  // WHEN
  const stack = new Cdk.HandsonEc2Stack(app, 'HandsonEc2Stack', {
    ec2KeyPairName: '',
  });
  // THEN
  const template = Template.fromStack(stack);

  // Check # of Resources
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.resourceCountIs('AWS::EC2::Subnet', 2);
  template.resourceCountIs('AWS::EC2::RouteTable', 2);
  template.resourceCountIs('AWS::EC2::Route', 2);
  template.resourceCountIs('AWS::EC2::InternetGateway', 1);
  template.resourceCountIs('AWS::EC2::SecurityGroup', 1);
  template.resourceCountIs('AWS::IAM::Role', 2);
  template.resourceCountIs('AWS::IAM::Policy', 1);
  template.resourceCountIs('AWS::EC2::Instance', 1);
  template.resourceCountIs('Custom::EC2-Key-Pair', 1);
  template.resourceCountIs('AWS::Lambda::Function', 1);
  template.resourceCountIs('AWS::EC2::Instance', 1);
  template.resourceCountIs('AWS::EC2::Instance', 1);
});
