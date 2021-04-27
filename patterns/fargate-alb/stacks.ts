import path from "path"
import * as cdk from "@aws-cdk/core"
import * as ec2 from "@aws-cdk/aws-ec2"
import * as elb from "@aws-cdk/aws-elasticloadbalancingv2"
import * as ecs from "@aws-cdk/aws-ecs"
import * as iam from "@aws-cdk/aws-iam"

export class FargateAlb extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      // 素振りではnat代をケチりたい
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

    // // /////////////////
    // // Pipeline

    // const sourceOutputArtifact = new codepipeline.Artifact("SourceOutput")

    // const bucket = new s3.Bucket(this, "Bucket", {
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   // `versioned: true` is needed for CodePipeline
    //   versioned: true,
    // })
    // const sourceAction = new S3SourceAction({
    //   actionName: "sourceAction",
    //   bucket,
    //   bucketKey: "deploy/index.js",
    //   output: sourceOutputArtifact,
    // })
    // // new GitHubSourceAction({
    // //   actionName: "sourceAction",
    // //   output: sourceOutputArtifact,
    // //   owner: "yamatatsu",
    // //   repo: "aws-cdk-patterns",
    // //   branch: "main",
    // //   oauthToken: cdk.SecretValue.plainText("");
    // //   trigger: GitHubTrigger.WEBHOOK
    // // })

    // const application = new codedeploy.ServerApplication(
    //   this,
    //   "ServerApplication",
    // )

    // const deploymentGroup = new codedeploy.ServerDeploymentGroup(
    //   this,
    //   "ServerDeploymentGroup",
    //   {
    //     application,
    //     autoScalingGroups: [autoScalingGroup],
    //   },
    // )

    // const deployAction = new CodeDeployServerDeployAction({
    //   actionName: "deployAction",
    //   input: sourceOutputArtifact,
    //   deploymentGroup: deploymentGroup,
    // })

    // const pipeline = new codepipeline.Pipeline(this, "Pipeline", {})

    // pipeline.addStage({ stageName: "sourceStage", actions: [sourceAction] })
    // pipeline.addStage({ stageName: "deployStage", actions: [deployAction] })
  }
}
