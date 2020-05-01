import * as cdk from "@aws-cdk/core"
import * as ec2 from "@aws-cdk/aws-ec2"
import * as iam from "@aws-cdk/aws-iam"
import * as elb from "@aws-cdk/aws-elasticloadbalancingv2"
import * as autoscaling from "@aws-cdk/aws-autoscaling"
import * as route53 from "@aws-cdk/aws-route53"
import * as route53Targets from "@aws-cdk/aws-route53-targets"
import * as secretsmanager from "@aws-cdk/aws-secretsmanager"
import * as ecs from "@aws-cdk/aws-ecs"

const {
  AWS_ACCOUNT_ID,
  HOSTED_ZONE_NAME,
  DOMANIN_NAME,
  SECRET_ARN,
} = process.env

const cheapInstanceType = new ec2.InstanceType("t3.nano")

class Stack extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    if (!HOSTED_ZONE_NAME) throw "環境変数[HOSTED_ZONE_NAME]は必須だよ"
    if (!DOMANIN_NAME) throw "環境変数[DOMANIN_NAME]は必須だよ"
    if (!SECRET_ARN) throw "環境変数[SECRET_ARN]は必須だよ"

    const secret = secretsmanager.Secret.fromSecretArn(
      this,
      "server-secrets",
      SECRET_ARN,
    )
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: HOSTED_ZONE_NAME,
    })

    const vpc = new ec2.Vpc(this, "vpc", {
      maxAzs: 2,
      natGatewayProvider: ec2.NatProvider.instance({
        instanceType: cheapInstanceType,
      }),
    })

    const cluster = new ecs.Cluster(this, "Cluster", { vpc })

    const taskDefinition = new ecs.FargateTaskDefinition(this, "TaskDef", {})
    secret.grantRead(taskDefinition.taskRole)

    // Create log driver if logging is enabled
    const logDriver = new ecs.AwsLogDriver({ streamPrefix: this.node.id })
    const container = taskDefinition.addContainer("web", {
      image: ecs.ContainerImage.fromRegistry(
        "yamatatsu193/client-certificate-test",
      ),
      logging: logDriver,
      environment: {
        SECRET_ID: SECRET_ARN,
      },
    })
    container.addPortMappings({ containerPort: 80 }, { containerPort: 443 })

    const service = new ecs.FargateService(this, "Service", {
      cluster: cluster,
      taskDefinition: taskDefinition,
      assignPublicIp: false,
    })

    const loadBalancer = new elb.NetworkLoadBalancer(this, "LB", {
      vpc,
      internetFacing: true,
    })
    loadBalancer
      .addListener("PublicNonSSLListener", { port: 80 })
      .addTargets("ECS", { port: 80, targets: [service] })
    loadBalancer
      .addListener("PublicListener", { port: 443 })
      .addTargets("ECS", { port: 443, targets: [service] })

    new route53.ARecord(this, "DNS", {
      zone: hostedZone,
      recordName: DOMANIN_NAME,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.LoadBalancerTarget(loadBalancer),
      ),
    })

    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: loadBalancer.loadBalancerDnsName,
    })
  }
}

if (!AWS_ACCOUNT_ID) throw "環境変数[AWS_ACCOUNT_ID]は必須だよ"
const app = new cdk.App()
new Stack(app, "ClientCertificate", {
  env: { region: "ap-northeast-1", account: AWS_ACCOUNT_ID },
})
