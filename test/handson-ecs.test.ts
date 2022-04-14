import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../lib/handson-ecs-stack';

test('Stack created', () => {
  const app = new cdk.App({
    context: {},
  });
  // WHEN
  const stack = new Cdk.HandsonEcsStack(app, 'HandsonEcsStack', {
    containerImageName: '',
  });
  // THEN
  const template = Template.fromStack(stack);

  // Check # of Resources
  // EC2
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.resourceCountIs('AWS::EC2::Subnet', 1);
  template.resourceCountIs('AWS::EC2::RouteTable', 1);
  template.resourceCountIs('AWS::EC2::SubnetRouteTableAssociation', 1);
  template.resourceCountIs('AWS::EC2::Route', 1);
  template.resourceCountIs('AWS::EC2::InternetGateway', 1);
  template.resourceCountIs('AWS::EC2::VPCGatewayAttachment', 1);
  // ECS
  template.resourceCountIs('AWS::ECS::Cluster', 1);
  template.resourceCountIs('AWS::ECS::TaskDefinition', 1);
  // DynamoDB
  template.resourceCountIs('AWS::DynamoDB::Table', 1);
  // SSM
  template.resourceCountIs('AWS::SSM::Parameter', 5);
});
