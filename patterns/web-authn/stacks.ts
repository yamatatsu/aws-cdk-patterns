import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import * as apigateway from "@aws-cdk/aws-apigatewayv2"
import * as s3 from "@aws-cdk/aws-s3"
import * as s3Deployment from "@aws-cdk/aws-s3-deployment"
import * as cloudfront from "@aws-cdk/aws-cloudfront"
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2"

export class WebAuthnDemo extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const code = lambda.Code.fromAsset("./dist")
    const getChallengeHandler = new lambda.Function(
      this,
      "getChallengeHandler",
      {
        functionName: "WebAuthnDemo_getChallengeHandler",
        runtime: lambda.Runtime.NODEJS_12_X,
        code,
        handler: "index.getChallenge",
        timeout: cdk.Duration.seconds(3),
        memorySize: 128,
        tracing: lambda.Tracing.ACTIVE,
      },
    )

    const api = new apigateway.HttpApi(this, "HttpApi", {
      apiName: "WebAuthnDemoApi",
      corsPreflight: {
        // allowOrigins?: string[];
      },
    })

    api.addRoutes({
      path: "/auth/challenge",
      methods: [apigateway.HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: getChallengeHandler,
      }),
    })
  }
}
