import {
  App,
  Stack,
  StackProps,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
  aws_iam as iam,
} from "aws-cdk-lib"

export class LambdaInsights extends Stack {
  constructor(parent: App, id: string, props?: StackProps) {
    super(parent, id, props)

    const fn = new lambda_nodejs.NodejsFunction(this, "Lambda", {
      entry: "./lambda/index.ts",
      // lambda insights don't work with node14...
      runtime: lambda.Runtime.NODEJS_12_X,
    })
    fn.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "CloudWatchLambdaInsightsExecutionRolePolicy",
      ),
    )

    const layer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      `LayerFromArn`,
      "arn:aws:lambda:ap-northeast-1:580247275435:layer:LambdaInsightsExtension:14",
    )
    fn.addLayers(layer)
  }
}
