import {
  App,
  Stack,
  StackProps,
  RemovalPolicy,
  Duration,
  aws_lambda as lambda,
  aws_s3_deployment as s3Deploy,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cognito as cognito,
} from "aws-cdk-lib"

type Props = StackProps & {
  lambdaCode: lambda.Code
  staticContents: s3Deploy.ISource
}
export class PrivateCloudfrontAmplify extends Stack {
  constructor(parent: App, id: string, props: Props) {
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
      removalPolicy: RemovalPolicy.DESTROY,
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
                minTtl: Duration.seconds(0),
                maxTtl: Duration.seconds(0),
                defaultTtl: Duration.seconds(0),
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
                minTtl: Duration.seconds(0),
                maxTtl: Duration.days(365),
                defaultTtl: Duration.days(1),
                forwardedValues: { queryString: false },
              },
              {
                pathPattern: "index.html",
                minTtl: Duration.seconds(0),
                maxTtl: Duration.seconds(0),
                defaultTtl: Duration.seconds(0),
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
                minTtl: Duration.seconds(0),
                maxTtl: Duration.days(365),
                defaultTtl: Duration.days(1),
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
