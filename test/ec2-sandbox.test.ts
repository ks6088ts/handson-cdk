import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../lib/ec2-sandbox-stack';

test('Stack created', () => {
  const app = new cdk.App({
    context: {},
  });
  // WHEN
  const maxAzs = 1;
  const stack = new Cdk.Ec2SandboxStack(app, 'Ec2SandboxStack', {
    env: {
      region: 'ap-northeast-1',
    },
    prefix: '',
    cidr: '10.0.0.0/16',
    maxAzs: maxAzs,
  });
  // THEN
  const template = Template.fromStack(stack);

  // Check # of Resources
  // EC2
  template.resourceCountIs('AWS::EC2::Instance', 1);
  template.resourceCountIs('AWS::EC2::InternetGateway', 1);
  template.resourceCountIs('AWS::EC2::Route', 1);
  template.resourceCountIs('AWS::EC2::RouteTable', 1);
  template.resourceCountIs('AWS::EC2::SecurityGroup', 4);
  template.resourceCountIs('AWS::EC2::Subnet', 1);
  template.resourceCountIs('AWS::EC2::SubnetRouteTableAssociation', 1);
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.resourceCountIs('AWS::EC2::VPCEndpoint', 3);
  template.resourceCountIs('AWS::EC2::VPCGatewayAttachment', 1);
  // IAM
  template.resourceCountIs('AWS::IAM::InstanceProfile', 1);
  template.resourceCountIs('AWS::IAM::Role', 1);
});
