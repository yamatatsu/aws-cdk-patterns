import * as cdk from "@aws-cdk/core"
import * as s3 from "@aws-cdk/aws-s3"
import * as s3Deploy from "@aws-cdk/aws-s3-deployment"
import * as cloudfront from "@aws-cdk/aws-cloudfront"
import * as cognito from "@aws-cdk/aws-cognito"
import * as lambda from "@aws-cdk/aws-lambda"

type Props = cdk.StackProps & {
  lambdaCode: lambda.Code
  staticContents: s3Deploy.ISource
}
export class PrivateCloudfrontAmplify extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props: Props) {
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
      authFlows: { userPassword: true },
    })
    new cognito.UserPoolDomain(this, "UserPoolDomain", {
      userPool,
      cognitoDomain: { domainPrefix: "private-cloudfront-amplify" },
    })

    const authCheckLambda = new lambda.Function(this, "signInRedirectTarget", {
      handler: "index.authCheck",
      code: props.lambdaCode,
      runtime: lambda.Runtime.NODEJS_12_X,
    })
    const rewriteToIndexHtmlLambda = new lambda.Function(
      this,
      "rewriteToIndexHtml",
      {
        handler: "index.rewriteToIndexHtml",
        code: props.lambdaCode,
        runtime: lambda.Runtime.NODEJS_12_X,
      },
    )

    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    new s3Deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [props.staticContents],
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
