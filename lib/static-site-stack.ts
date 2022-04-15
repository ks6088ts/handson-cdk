import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3_deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';

import * as iam from 'aws-cdk-lib/aws-iam';

import * as ssm from 'aws-cdk-lib/aws-ssm';

import { Construct } from 'constructs';

export interface StaticSiteStackProps extends cdk.StackProps {
  path: string;
}

export class StaticSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StaticSiteStackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'OriginAccessIdentity',
      {
        comment: 'website distribution origin access identity',
      }
    );

    const websiteBucketPolicyStatement = new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      effect: iam.Effect.ALLOW,
      principals: [
        new iam.CanonicalUserPrincipal(
          originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
        ),
      ],
      resources: [`${websiteBucket.bucketArn}/*`],
    });

    websiteBucket.addToResourcePolicy(websiteBucketPolicyStatement);

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'website-distribution',
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          ttl: cdk.Duration.seconds(300),
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: '/error.html',
        },
        {
          ttl: cdk.Duration.seconds(300),
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/error.html',
        },
      ],
      defaultBehavior: {
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        origin: new cloudfront_origins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
    });

    new s3_deployment.BucketDeployment(this, 'WebsiteDeploy', {
      sources: [s3_deployment.Source.asset(props.path)],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });

    // StringParameters
    new ssm.StringParameter(this, 'DISTRIBUTION_DOMAIN_NAME', {
      parameterName: 'DISTRIBUTION_DOMAIN_NAME',
      stringValue: distribution.distributionDomainName,
    });

    // Create outputs for connecting
    new cdk.CfnOutput(this, 'Distribution domain name', {
      value: distribution.distributionDomainName,
    });
  }
}
