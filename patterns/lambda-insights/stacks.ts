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
      bundling: {
        // forceDockerBundling これは default false であるが、明示的に示す。
        // これが true のとき、もしくは esbuild が見つからないとき(下記URL参照)にdockerを用いてビルドが行われる。
        // https://github.com/aws/aws-cdk/blob/4c8e938e01b87636390a4f04de63bcd4dfe44cf8/packages/@aws-cdk/aws-lambda-nodejs/lib/esbuild-installation.ts#L8-L31
        forceDockerBundling: false,
      },
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
