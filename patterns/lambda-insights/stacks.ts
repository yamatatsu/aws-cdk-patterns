import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs"
import * as iam from "@aws-cdk/aws-iam"

export class LambdaInsights extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const fn = new NodejsFunction(this, "Lambda", {
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
