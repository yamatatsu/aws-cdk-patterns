import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import * as apigateway from "@aws-cdk/aws-apigatewayv2"
import * as s3 from "@aws-cdk/aws-s3"
import * as s3Deployment from "@aws-cdk/aws-s3-deployment"
import * as cloudfront from "@aws-cdk/aws-cloudfront"
import * as cloudfrontOrigins from "@aws-cdk/aws-cloudfront-origins"

export class WebAuthnDemo extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const bucket = new s3.Bucket(this, "Bucket", {
      bucketName: "yamatatsu.web-authn-demo",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
    new s3Deployment.BucketDeployment(this, "BucketDeployment", {
      destinationBucket: bucket,
      sources: [s3Deployment.Source.asset("../web-authn-react/dist")],
    })
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity",
    )
    const origin = new cloudfrontOrigins.S3Origin(bucket, {
      originAccessIdentity,
    })
    bucket.grantRead(originAccessIdentity)
    new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "/index.html",
      defaultBehavior: { origin },
      additionalBehaviors: {
        "/index.html": {
          origin,
          cachePolicy: new cloudfront.CachePolicy(this, "CachePolicy", {
            defaultTtl: cdk.Duration.seconds(0),
            maxTtl: cdk.Duration.seconds(0),
            minTtl: cdk.Duration.seconds(0),
          }),
        },
      },
      errorResponses: [
        {
          ttl: cdk.Duration.seconds(0),
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          ttl: cdk.Duration.seconds(0),
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    })

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
        allowOrigins: ["https://d3hpon1ucd4h43.cloudfront.net"],
      },
    })

    api.addRoutes({
      path: "/auth/challenge",
      methods: [apigateway.HttpMethod.GET],
      integration: new apigateway.LambdaProxyIntegration({
        handler: getChallengeHandler,
      }),
    })
  }
}
