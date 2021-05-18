import {
  App,
  Stack,
  StackProps,
  Duration,
  aws_lambda as lambda,
  aws_iam as iam,
  aws_logs as logs,
  aws_logs_destinations as logs_destinations,
} from "aws-cdk-lib"

export class MonitoringLambdaMemory extends Stack {
  constructor(parent: App, id: string, props?: StackProps) {
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
      timeout: Duration.seconds(3),
      memorySize: 128,
    })

    const handler = new lambda.Function(this, "MonitoringLambda", {
      functionName: "MonitoringLambda",
      code: lambda.Code.fromAsset(`${__dirname}/lambda`),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(3),
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
      destination: new logs_destinations.LambdaDestination(handler),
      filterPattern: logs.FilterPattern.literal('"REPORT"'), // `REPORT` というワードを含むログだけが対象
    })
  }
}
