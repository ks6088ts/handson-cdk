# static-site-stack

## Hands-on

```bash
export AWS_PROFILE=your-dev

# deploy a stack
yarn run cdk deploy HANDSON-CDK-StaticSiteStack \
  --context environment=dev

# access the dumped distribution domain name
# Outputs:
# HANDSON-CDK-StaticSiteStack.Distributiondomainname = XXX.cloudfront.net

# destroy a stack
yarn run cdk destroy HANDSON-CDK-StaticSiteStack \
  --context environment=dev
```

## Reference

- [AWS CDK V2 で CloudFront+S3 の静的サイトホスティングを構築してみた](https://dev.classmethod.jp/articles/i-tried-building-cloudfronts3-static-site-hosting-with-aws-cdk-v2/)
- [aws-cdk-examples/typescript/static-site](https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/static-site)
