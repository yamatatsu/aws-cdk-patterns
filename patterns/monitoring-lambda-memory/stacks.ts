import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import * as iam from "@aws-cdk/aws-iam"
import * as logs from "@aws-cdk/aws-logs"
import { LambdaDestination } from "@aws-cdk/aws-logs-destinations"

export class MonitoringLambdaMemory extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const testFunction = new lambda.Function(this, "TestFunction", {
      functionName: "MonitoringLambda-TestFunction",
      code: lambda.Code.fromInline(`
exports.handler = async (event) => {
  console.inf("Hello World.)
  console.info("event: %o", event)
}`),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(3),
      memorySize: 128,
    })

    const handler = new lambda.Function(this, "MonitoringLambda", {
      functionName: "MonitoringLambda",
      code: lambda.Code.fromAsset(`${__dirname}/lambda`),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(3),
      memorySize: 128,
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["cloudwatch:PutMetricData"],
          resources: ["*"],
        }),
      ],
    })

    testFunction.logGroup.addSubscriptionFilter("SubscriptionFilter", {
      destination: new LambdaDestination(handler),
      filterPattern: logs.FilterPattern.literal('"REPORT"'), // `REPORT` というワードを含むログだけが対象
    })
  }
}
