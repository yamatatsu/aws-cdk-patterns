import * as cdk from "@aws-cdk/core"
import * as iam from "@aws-cdk/aws-iam"
import * as ec2 from "@aws-cdk/aws-ec2"
import * as autoscaling from "@aws-cdk/aws-autoscaling"
import * as elb from "@aws-cdk/aws-elasticloadbalancingv2"

export class Ec2AutoScaling extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      natGateways: 0,
    })

    // bastion
    // const bastion = new ec2.Instance(this, "Instance", {
    //   vpc,
    //   instanceType: ec2.InstanceType.of(
    //     ec2.InstanceClass.T2,
    //     ec2.InstanceSize.NANO,
    //   ),
    //   machineImage: ec2.MachineImage.latestAmazonLinux(),
    // })
    // // for ssm session manager
    // bastion.role.addManagedPolicy(
    //   iam.ManagedPolicy.fromManagedPolicyArn(
    //     this,
    //     "IAM-POLICY-AmazonSSMManagedInstanceCore",
    //     "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
    //   ),
    // )

    const autoScalingGroup = new autoscaling.AutoScalingGroup(
      this,
      "AutoScalingGroup",
      {
        vpc,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.NANO,
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux(),
      },
    )

    const alb = new elb.ApplicationLoadBalancer(this, "LoadBalancer", {
      vpc,
      internetFacing: true,
    })

    const listener = alb.addListener("Listener", {
      port: 80,
    })
    listener.addTargets("Target", {
      port: 80,
      targets: [autoScalingGroup],
    })

    autoScalingGroup.scaleOnRequestCount("AModestLoad", {
      targetRequestsPerSecond: 1,
    })
    listener.connections.allowDefaultPortFromAnyIpv4("Open to the world")
  }
}
