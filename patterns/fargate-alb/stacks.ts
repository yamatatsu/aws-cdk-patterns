import path from "path"
import {
  App,
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elb,
  aws_ecs as ecs,
  aws_iam as iam,
} from "aws-cdk-lib"

export class FargateAlb extends Stack {
  constructor(parent: App, id: string, props?: StackProps) {
    super(parent, id, props)

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      natGatewayProvider: ec2.NatInstanceProvider.instance({
        instanceType: new ec2.InstanceType("t2.nano"),
      }),
    })

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc,
    })

    // FargateTaskDefinition のデフォルトのRoleではlogsの権限が足りなくてログが吐けないため、作成する
    const executionRole = new iam.Role(this, "EcsTaskExecutionRole", {
      roleName: "ecs-task-execution-role",
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonECSTaskExecutionRolePolicy",
        ),
      ],
    })

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "FargateTaskDefinition",
      { executionRole },
    )

    const container = taskDefinition.addContainer("webContainer", {
      image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, "server")),
      // コンテナのログがCloudWatchに吐かれるようになる
      logging: new ecs.AwsLogDriver({
        streamPrefix: "fargate-task",
      }),
      portMappings: [{ containerPort: 8000 }],
    })

    const service = new ecs.FargateService(this, "FargateService", {
      cluster,
      taskDefinition,
    })

    const loadBalancer = new elb.ApplicationLoadBalancer(this, "LB", {
      vpc,
      internetFacing: true,
    })
    const listener = loadBalancer.addListener("PublicListener", {
      protocol: elb.ApplicationProtocol.HTTP,
    })
    listener.addTargets("ECS", {
      protocol: elb.ApplicationProtocol.HTTP,
      // TODO: serviceに複数のweb serverがあるときにどんな挙動をするのか？
      targets: [service],
    })
  }
}
