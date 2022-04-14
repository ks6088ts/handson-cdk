#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HandsonCdkStack } from '../lib/handson-cdk-stack';
import { HandsonEc2Stack } from '../lib/handson-ec2-stack';

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

new HandsonCdkStack(app, `${projectPrefix}-HandsonCdkStack`, {
  env: getProcEnv(),
});

new HandsonEc2Stack(app, `${projectPrefix}-HandsonEc2Stack`, {
  env: getProcEnv(),
  ec2KeyPairName: envVals['ec2KeyPairName'],
});
