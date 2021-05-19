import {
  App,
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_autoscaling as autoscaling,
  aws_elasticloadbalancingv2 as elb,
} from "aws-cdk-lib"

export class Ec2AutoScaling extends Stack {
  constructor(parent: App, id: string, props?: StackProps) {
    super(parent, id, props)

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      // これやるとnat代かからないけどprivate subnetが生成されないから、3層アーキテクチャできてない。
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
      targetRequestsPerMinute: 1,
    })
    listener.connections.allowDefaultPortFromAnyIpv4("Open to the world")
  }
}
