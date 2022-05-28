import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { readFileSync } from 'fs';

import { Construct } from 'constructs';

export interface Ec2SandboxStackProps extends cdk.StackProps {
  prefix: string;
  cidr: string;
  maxAzs: number;
}

export class Ec2SandboxStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Ec2SandboxStackProps) {
    super(scope, id, props);

    const region = cdk.Stack.of(this).region;
    const subnetType = ec2.SubnetType.PUBLIC;

    // Create a new VPC
    const vpc = new ec2.Vpc(this, `${props.prefix}-Vpc`, {
      cidr: props.cidr,
      maxAzs: props.maxAzs,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: subnetType,
        },
      ],
    });

    // Create ServiceRole for EC2 instances to enable SSM usage
    const ec2InstanceRole = new iam.Role(
      this,
      `${props.prefix}-Ec2InstanceIamRole`,
      {
        assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'AmazonSSMManagedInstanceCore'
          ),
        ],
        description: 'This is a custom role for assuming the SSM role',
      }
    );

    // Create security group
    const ec2InstanceSecurityGroup = new ec2.SecurityGroup(
      this,
      `${props.prefix}-SecurityGroupEc2`,
      {
        vpc,
        description: 'Security group for EC2 instances',
        allowAllOutbound: true,
        securityGroupName: `${props.prefix}-Ec2InstanceSecurityGroup`,
      }
    );
    ec2InstanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allIcmp(),
      'Allow ICMP'
    );
    ec2InstanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP'
    );

    // Create EC2 instances
    const ec2Instances: ec2.Instance[] = [];
    const userDataScript = readFileSync(
      './scripts/three-tier-stack-amazonlinux2.sh',
      'utf8'
    );
    vpc.availabilityZones.forEach((availabilityZone, index) => {
      const instance = new ec2.Instance(this, `${props.prefix}-Ec2-${index}`, {
        vpc: vpc,
        role: ec2InstanceRole,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T4G,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux({
          cpuType: ec2.AmazonLinuxCpuType.ARM_64,
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        securityGroup: ec2InstanceSecurityGroup,
        vpcSubnets: {
          subnetType: subnetType,
          availabilityZones: [availabilityZone],
        },
      });
      instance.addUserData(userDataScript); // add user data to the EC2 instance
      ec2Instances.push(instance);
    });

    // Create VPC Endpoints for SSM
    // ref. https://aws.amazon.com/premiumsupport/knowledge-center/ec2-systems-manager-vpc-endpoints
    const vpcEndpoints: ec2.InterfaceVpcEndpoint[] = [];
    ['ssm', 'ec2messages', 'ssmmessages'].forEach((name, index) => {
      vpcEndpoints.push(
        new ec2.InterfaceVpcEndpoint(
          this,
          `${props.prefix}-VpcEndpoint-${name}-${index}`,
          {
            vpc: vpc,
            service: new ec2.InterfaceVpcEndpointService(
              `com.amazonaws.${region}.${name}`
            ),
            privateDnsEnabled: true,
            subnets: {
              subnetType: subnetType,
            },
          }
        )
      );
    });

    // Create outputs for EC2 instances
    ec2Instances.forEach((ec2Instance, index) => {
      new cdk.CfnOutput(this, `ec2Instance-${index}`, {
        value: ec2Instance.instanceId,
      });
    });
  }
}
