# ec2-sandbox-stack

## Hands-on

```bash
export AWS_PROFILE=your-dev

# deploy a stack
yarn run cdk deploy HANDSON-CDK-Ec2SandboxStack \
  --context environment=dev

# fixme: do the following operations manually via management console
# - associate route table to subnet
# - edit route table (attach internet gateway, peering connection, etc)

# Outputs:
# HANDSON-CDK-Ec2SandboxStack.ec2Instance0 = i-0d8554b32e76a4c77
# Stack ARN:
# arn:aws:cloudformation:ap-northeast-1:xxx:stack/HANDSON-CDK-Ec2SandboxStack/xxx

# connect to an EC2 instance via Session Manager
INSTANCE_ID=i-*
aws ssm start-session --target $INSTANCE_ID

# destroy a stack
yarn run cdk destroy HANDSON-CDK-Ec2SandboxStack \
  --context environment=dev
```

## Reference

- [EC2 Instance Creation with CDK](https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/ec2-instance/README.md)
- EC2 SSH keypair: [Deploy a Web Application on Amazon EC2](https://aws.amazon.com/getting-started/guides/deploy-webapp-ec2/module-one/?nc1=h_ls)
