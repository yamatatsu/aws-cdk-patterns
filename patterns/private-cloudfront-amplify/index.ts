import * as cdk from "@aws-cdk/core"
import * as s3 from "@aws-cdk/aws-s3"
import * as s3Deploy from "@aws-cdk/aws-s3-deployment"
import * as cloudfront from "@aws-cdk/aws-cloudfront"
import * as cognito from "@aws-cdk/aws-cognito"
import * as lambda from "@aws-cdk/aws-lambda"

class PrivateCloudfrontAmplify extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props: cdk.StackProps) {
    super(parent, id, props)

    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      passwordPolicy: {
        minLength: 6,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
      },
    })
    new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      authFlows: { userPassword: true, refreshToken: true },
    })
    new cognito.UserPoolDomain(this, "UserPoolDomain", {
      userPool,
      cognitoDomain: { domainPrefix: "private-cloudfront-amplify" },
    })

    const lambdaCode = new lambda.AssetCode("./lambda/dist")
    const authCheckLambda = new lambda.Function(this, "signInRedirectTarget", {
      handler: "index.authCheck",
      code: lambdaCode,
      runtime: lambda.Runtime.NODEJS_12_X,
    })
    const rewriteToIndexHtmlLambda = new lambda.Function(
      this,
      "rewriteToIndexHtml",
      {
        handler: "index.rewriteToIndexHtml",
        code: lambdaCode,
        runtime: lambda.Runtime.NODEJS_12_X,
      },
    )

    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const staticContents = s3Deploy.Source.asset("./front/build")
    new s3Deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [staticContents],
      destinationBucket: bucket,
      retainOnDelete: false,
    })

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity",
    )
    bucket.grantRead(originAccessIdentity)

    new cloudfront.CloudFrontWebDistribution(
      this,
      "CloudFrontWebDistribution",
      {
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        httpVersion: cloudfront.HttpVersion.HTTP2,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity,
            },
            behaviors: [
              {
                pathPattern: "auth/",
                minTtl: cdk.Duration.seconds(0),
                maxTtl: cdk.Duration.seconds(0),
                defaultTtl: cdk.Duration.seconds(0),
                forwardedValues: { queryString: false },
                lambdaFunctionAssociations: [
                  {
                    eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
                    lambdaFunction: rewriteToIndexHtmlLambda.currentVersion,
                  },
                ],
              },
              {
                pathPattern: "auth/*",
                minTtl: cdk.Duration.seconds(0),
                maxTtl: cdk.Duration.days(365),
                defaultTtl: cdk.Duration.days(1),
                forwardedValues: { queryString: false },
              },
              {
                pathPattern: "index.html",
                minTtl: cdk.Duration.seconds(0),
                maxTtl: cdk.Duration.seconds(0),
                defaultTtl: cdk.Duration.seconds(0),
                forwardedValues: { queryString: false },
                lambdaFunctionAssociations: [
                  {
                    eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                    lambdaFunction: authCheckLambda.currentVersion,
                  },
                ],
              },
              {
                isDefaultBehavior: true,
                minTtl: cdk.Duration.seconds(0),
                maxTtl: cdk.Duration.days(365),
                defaultTtl: cdk.Duration.days(1),
                forwardedValues: { queryString: false },
                lambdaFunctionAssociations: [
                  {
                    eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                    lambdaFunction: authCheckLambda.currentVersion,
                  },
                  {
                    eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
                    lambdaFunction: rewriteToIndexHtmlLambda.currentVersion,
                  },
                ],
              },
            ],
          },
        ],
      },
    )
  }
}

const app = new cdk.App()
new PrivateCloudfrontAmplify(app, "PrivateCloudfrontAmplify", {
  stackName: "PrivateCloudfrontAmplify",
  // lambda@edge に使う lambda は us-east-1 である必要があるので、簡単のために全部バージニア北部で作っちゃう。
  env: { region: "us-east-1" },
})
