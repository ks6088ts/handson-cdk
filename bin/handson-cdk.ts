#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HandsonCdkStack } from '../lib/handson-cdk-stack';
import { HandsonEc2Stack } from '../lib/handson-ec2-stack';
import { HandsonEcsStack } from '../lib/handson-ecs-stack';
import { StaticSiteStack } from '../lib/static-site-stack';
import { LambdaCronStack } from '../lib/lambda-cron-stack';
import { ThreeTierStack } from '../lib/three-tier-stack';
import { IotCoreStack } from '../lib/iot-core-stack';

const projectPrefix = 'HANDSON-CDK';
const app = new cdk.App();

// ----------------------- Load context variables ------------------------------
// This context need to be specified in args
const argContext = 'environment';

// Environment Key (dev,stage,prod...)
// Should be defined in 2nd level of "context" tree in cdk.json
const envKey = app.node.tryGetContext(argContext);
if (envKey == undefined)
  throw new Error(
    `Please specify environment with context option. ex) cdk deploy -c ${argContext}=dev`
  );

// Array of envrionment variables. These values hould be defined in cdk.json or cdk.context.json
const envVals = app.node.tryGetContext(envKey);
if (envVals == undefined) throw new Error('Invalid environment.');

// ----------------------- Environment variables for stack ------------------------------
// Default enviroment
const procEnvDefault = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// Define account id and region from context.
// If "env" isn't defined on the environment variable in context, use account and region specified by "--profile".
function getProcEnv() {
  if (envVals['env'] && envVals['env']['account'] && envVals['env']['region']) {
    return {
      account: envVals['env']['account'],
      region: envVals['env']['region'],
    };
  } else {
    return procEnvDefault;
  }
}

const env = getProcEnv();

new HandsonCdkStack(app, `${projectPrefix}-HandsonCdkStack`, {
  env: env,
});

new HandsonEc2Stack(app, `${projectPrefix}-HandsonEc2Stack`, {
  env: env,
  ec2KeyPairName: envVals['ec2Stack']['ec2KeyPairName'],
});

new HandsonEcsStack(app, `${projectPrefix}-HandsonEcsStack`, {
  env: env,
  containerImageName: envVals['ecsStack']['containerImageName'],
});

new StaticSiteStack(app, `${projectPrefix}-StaticSiteStack`, {
  env: env,
  path: envVals['staticSiteStack']['path'],
});

new LambdaCronStack(app, `${projectPrefix}-LambdaCronStack`, {
  env: env,
  scheduleExpression: envVals['lambdaCronStack']['scheduleExpression'],
});

new ThreeTierStack(app, `${projectPrefix}-ThreeTierStack`, {
  env: env,
  prefix: envVals['threeTierStack']['prefix'],
  cidr: envVals['threeTierStack']['cidr'],
  dbUser: envVals['threeTierStack']['dbUser'],
});

new IotCoreStack(app, `${projectPrefix}-IotCoreStack`, {
  env: env,
  prefix: envVals['iotCoreStack']['prefix'],
  certificateArn: envVals['iotCoreStack']['certificateArn'],
  sql: envVals['iotCoreStack']['sql'],
});
