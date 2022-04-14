# handson-ecs-stack

## Hands-on

```bash
export AWS_PROFILE=your-dev
export CDK_DEFAULT_ACCOUNT=your-aws-organization-jp
export CDK_DEFAULT_REGION=ap-northeast-1

# deploy a stack
yarn run cdk deploy HANDSON-CDK-HandsonEcsStack \
  --context environment=dev

# destroy a stack
yarn run cdk deploy HANDSON-CDK-HandsonEcsStack \
  --context environment=dev

# download a script
curl --output scripts/run_task.py https://raw.githubusercontent.com/tomomano/learn-aws-by-coding/main/handson/qa-bot/run_task.py

# install dependencies

# run task
python scripts/run_task.py \
  ask \
  "A giant peach was flowing in the river. She picked it up and brought it home. Later, a healthy baby was born from the peach. She named the baby Momotaro." \
  "What is the name of the baby?"
```

## Reference

- [EC2 Instance Creation with CDK](https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/ec2-instance/README.md)
- EC2 SSH keypair: [Deploy a Web Application on Amazon EC2](https://aws.amazon.com/getting-started/guides/deploy-webapp-ec2/module-one/?nc1=h_ls)
