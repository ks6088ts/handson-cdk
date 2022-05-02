import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../lib/three-tier-stack';

test('Stack created', () => {
  const app = new cdk.App({
    context: {},
  });
  // WHEN
  const stack = new Cdk.ThreeTierStack(app, 'ThreeTierStack', {
    env: {
      region: 'ap-northeast-1',
    },
    prefix: '',
    cidr: '10.0.0.0/16',
    dbUser: 'admin',
  });
  // THEN
  const template = Template.fromStack(stack);

  // Check # of Resources
  // EC2
  const maxAzs = 2;
  const numOfSubnets = 3;
  template.resourceCountIs('AWS::EC2::EIP', maxAzs);
  template.resourceCountIs('AWS::EC2::Instance', maxAzs);
  template.resourceCountIs('AWS::EC2::InternetGateway', 1);
  template.resourceCountIs('AWS::EC2::NatGateway', maxAzs);
  template.resourceCountIs('AWS::EC2::Route', 2 * maxAzs);
  template.resourceCountIs('AWS::EC2::RouteTable', maxAzs * numOfSubnets);
  template.resourceCountIs('AWS::EC2::SecurityGroup', 6);
  template.resourceCountIs('AWS::EC2::Subnet', maxAzs * numOfSubnets);
  template.resourceCountIs(
    'AWS::EC2::SubnetRouteTableAssociation',
    maxAzs * numOfSubnets
  );
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.resourceCountIs('AWS::EC2::VPCEndpoint', 3);
  template.resourceCountIs('AWS::EC2::VPCGatewayAttachment', 1);
  // ElasticLoadBalancingV2
  template.resourceCountIs('AWS::ElasticLoadBalancingV2::Listener', 1);
  template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
  template.resourceCountIs('AWS::ElasticLoadBalancingV2::TargetGroup', 1);
  // IAM
  template.resourceCountIs('AWS::IAM::InstanceProfile', 2);
  template.resourceCountIs('AWS::IAM::Role', 1);
  // RDS
  template.resourceCountIs('AWS::RDS::DBCluster', 1);
  template.resourceCountIs('AWS::RDS::DBInstance', 2);
  // SecretsManager
  template.resourceCountIs('AWS::SecretsManager::Secret', 1);
  template.resourceCountIs('AWS::SecretsManager::SecretTargetAttachment', 1);
});
