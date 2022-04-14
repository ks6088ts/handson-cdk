# handson-ec2-stack

## Hands-on

```bash
export AWS_PROFILE=your-dev
export CDK_DEFAULT_ACCOUNT=your-aws-organization-jp
export CDK_DEFAULT_REGION=ap-northeast-1

# deploy a stack
yarn run cdk deploy HANDSON-CDK-HandsonEc2Stack \
  --context environment=dev

# Outputs:
# HANDSON-CDK-HandsonEc2Stack.DownloadKeyCommand = aws secretsmanager get-secret-value --secret-id ec2-ssh-key/dev-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem
# HANDSON-CDK-HandsonEc2Stack.IPAddress = IP_ADDRESS
# HANDSON-CDK-HandsonEc2Stack.KeyName = dev-keypair
# HANDSON-CDK-HandsonEc2Stack.sshcommand = ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@IP_ADDRESS

# Download the private key with the command `HandsonEc2Stack.DownloadKeyCommand`
aws secretsmanager get-secret-value --secret-id ec2-ssh-key/dev-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem

# SSH to the instance with the command `HandsonEc2Stack.sshcommand`
ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@IP_ADDRESS

# destroy a stack
yarn run cdk deploy HANDSON-CDK-HandsonEc2Stack \
  --context environment=dev
```

## Reference

- [EC2 Instance Creation with CDK](https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/ec2-instance/README.md)
- EC2 SSH keypair: [Deploy a Web Application on Amazon EC2](https://aws.amazon.com/getting-started/guides/deploy-webapp-ec2/module-one/?nc1=h_ls)
