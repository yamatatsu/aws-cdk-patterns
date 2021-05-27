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
      runtime: lambda.Runtime.NODEJS_14_X,
      bundling: {
        /**
         * forceDockerBundling: これは default false であるが、下記理由により明示的に示す。
         * これが true のとき、もしくは esbuild が見つからないとき(下記URL参照)に、
         * NodejsFunction では docker を用いてビルドが行われる。
         * https://github.com/aws/aws-cdk/blob/4c8e938e01b87636390a4f04de63bcd4dfe44cf8/packages/@aws-cdk/aws-lambda-nodejs/lib/esbuild-installation.ts#L8-L31
         * dockerでビルドする場合、特に Mac M1 での実行結果と GitHub actions 上での実行結果とで、
         * 成果物のfingerprintがズレて snapshot test が落ちてしまう。
         * そのため、 forceDockerBundling を明示し、 package.json でも esbuild を明示的にインストールする。
         */
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
