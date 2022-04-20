# lambda-cron-stack

## Hands-on

```bash
export AWS_PROFILE=your-dev

# deploy a stack
yarn run cdk deploy HANDSON-CDK-LambdaCronStack \
  --context environment=dev

# destroy a stack
yarn run cdk destroy HANDSON-CDK-LambdaCronStack \
  --context environment=dev
```

## Local test for Lambda

```bash
cd lambda/python
python -m venv .venv
source .venv/bin/activate
# pip install boto3
# pip freeze > requirements.txt
pip install -r requirements.txt
```

## Reference
