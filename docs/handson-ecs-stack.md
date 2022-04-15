# handson-ecs-stack

## Hands-on

```bash
export AWS_PROFILE=your-dev

# deploy a stack
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

# destroy a stack
yarn run cdk destroy HANDSON-CDK-HandsonEcsStack \
  --context environment=dev
```

## Reference

- [Hands-on #3: Creating a Transformer-based Q&A bot system](https://github.com/tomomano/learn-aws-by-coding/blob/main/handson/qa-bot/README.md)
