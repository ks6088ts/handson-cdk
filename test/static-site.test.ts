import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Cdk from '../lib/static-site-stack';

test('Stack created', () => {
  const app = new cdk.App({
    context: {},
  });
  // WHEN
  const stack = new Cdk.StaticSiteStack(app, 'StaticSiteStack', {
    path: './assets/static_site',
  });
  // THEN
  const template = Template.fromStack(stack);

  // Check # of Resources
  // S3
  template.resourceCountIs('AWS::S3::Bucket', 1);
  template.resourceCountIs('AWS::S3::BucketPolicy', 1);
  // IAM
  template.resourceCountIs('AWS::IAM::Role', 2);
  template.resourceCountIs('AWS::IAM::Policy', 1);
  // Lambda
  template.resourceCountIs('AWS::Lambda::Function', 2);
  template.resourceCountIs('AWS::Lambda::LayerVersion', 1);
  // CloudFront
  template.resourceCountIs(
    'AWS::CloudFront::CloudFrontOriginAccessIdentity',
    1
  );
  template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  // SSM
  template.resourceCountIs('AWS::SSM::Parameter', 1);
});
