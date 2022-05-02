# three-tier-stack

## Hands-on

```bash
export AWS_PROFILE=your-dev

# deploy a stack
yarn run cdk deploy HANDSON-CDK-ThreeTierStack \
  --context environment=dev

# Outputs
# HANDSON-CDK-ThreeTierStack-ap-northeast-1.ec2Instance0 = i-*
# HANDSON-CDK-ThreeTierStack-ap-northeast-1.ec2Instance1 = i-*

# connect to an EC2 instance via Session Manager
INSTANCE_ID=i-*
aws ssm start-session --target $INSTANCE_ID

# destroy a stack
yarn run cdk destroy HANDSON-CDK-ThreeTierStack \
  --context environment=dev
```

## Reference
