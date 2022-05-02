import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2_targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as rds from 'aws-cdk-lib/aws-rds';
import { readFileSync } from 'fs';

import { Construct } from 'constructs';

export interface ThreeTierStackProps extends cdk.StackProps {
  prefix: string;
  cidr: string;
  dbUser: string;
}

export class ThreeTierStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ThreeTierStackProps) {
    super(scope, id, props);

    const region = cdk.Stack.of(this).region;

    // Create a new VPC
    const vpc = new ec2.Vpc(this, `${props.prefix}-Vpc`, {
      cidr: props.cidr,
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
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
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
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
              subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
            },
          }
        )
      );
    });

    // Create a security group for ALB
    const albSecurityGroup = new ec2.SecurityGroup(
      this,
      `${props.prefix}-Alb-SecurityGroup`,
      {
        allowAllOutbound: true,
        securityGroupName: 'alb-sg',
        vpc: vpc,
      }
    );
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    // Create the load balancer in a VPC
    const lb = new elbv2.ApplicationLoadBalancer(
      this,
      `${props.prefix}-Alb-ApplicationLoadBalancer`,
      {
        vpc,
        internetFacing: true,
        ipAddressType: elbv2.IpAddressType.IPV4,
        loadBalancerName: `${props.prefix}-Alb`,
        vpcSubnets: vpc.selectSubnets({
          subnetType: ec2.SubnetType.PUBLIC,
        }),
        securityGroup: albSecurityGroup,
      }
    );

    // Create EC2 Targets for ApplicationTargetGroup
    const ec2Targets: elbv2_targets.InstanceTarget[] = [];
    for (const ec2Instance of ec2Instances) {
      ec2Targets.push(new elbv2_targets.InstanceTarget(ec2Instance));
    }

    // Create ApplicationTargetGroup
    const targetGroup = new elbv2.ApplicationTargetGroup(
      this,
      `${props.prefix}-Alb-ApplicationTargetGroup`,
      {
        healthCheck: {
          healthyHttpCodes: '200',
          healthyThresholdCount: 2,
          interval: cdk.Duration.seconds(30),
          path: '/',
          timeout: cdk.Duration.seconds(5),
          unhealthyThresholdCount: 2,
        },
        targetType: elbv2.TargetType.INSTANCE,
        targets: ec2Targets,
        port: 80,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targetGroupName: 'alb-tg',
        vpc: vpc,
      }
    );

    // Create a listener
    lb.addListener(`${props.prefix}-Alb-Listener`, {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      open: true,
      defaultAction: elbv2.ListenerAction.forward([targetGroup]),
    });

    // Create a security group for RDS
    const rdsSecurityGroup = new ec2.SecurityGroup(
      this,
      `${props.prefix}-Rds-SecurityGroup`,
      {
        allowAllOutbound: true,
        securityGroupName: 'rds-sg',
        vpc: vpc,
      }
    );
    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3306),
      'Ingress 3306'
    );

    // Create a database cluster
    new rds.DatabaseCluster(this, `${props.prefix}-DatabaseCluster`, {
      engine: rds.DatabaseClusterEngine.AURORA_MYSQL,
      instanceProps: {
        vpc: vpc,
        vpcSubnets: vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }),
        securityGroups: [rdsSecurityGroup],
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MEDIUM
        ),
      },
      credentials: rds.Credentials.fromGeneratedSecret(props.dbUser),
      defaultDatabaseName: `${props.prefix}Database`,
    });

    // Create outputs for EC2 instances
    ec2Instances.forEach((ec2Instance, index) => {
      new cdk.CfnOutput(this, `ec2Instance-${index}`, {
        value: ec2Instance.instanceId,
      });
    });
  }
}
