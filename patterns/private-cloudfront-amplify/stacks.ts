import path from "path"
import {
  App,
  Stack,
  StackProps,
  RemovalPolicy,
  Duration,
  aws_lambda as lambda,
  aws_lambda_nodejs,
  aws_s3_deployment as s3Deploy,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cognito as cognito,
} from "aws-cdk-lib"

type Props = StackProps & {
  lambdaEntry: string
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

    const authCheckLambda = {
      eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
      lambdaFunction: new aws_lambda_nodejs.NodejsFunction(
        this,
        "signInRedirectTarget",
        {
          handler: "authCheck",
          entry: props.lambdaEntry,
          runtime: lambda.Runtime.NODEJS_14_X,
        },
      ).currentVersion,
    }
    const rewriteLambda = {
      eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
      lambdaFunction: new aws_lambda_nodejs.NodejsFunction(
        this,
        "rewriteToIndexHtml",
        {
          handler: "rewriteToIndexHtml",
          entry: props.lambdaEntry,
          runtime: lambda.Runtime.NODEJS_14_X,
        },
      ).currentVersion,
    }

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
        priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
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
                lambdaFunctionAssociations: [rewriteLambda],
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
                lambdaFunctionAssociations: [authCheckLambda],
              },
              {
                isDefaultBehavior: true,
                minTtl: Duration.seconds(0),
                maxTtl: Duration.days(365),
                defaultTtl: Duration.days(1),
                forwardedValues: { queryString: false },
                lambdaFunctionAssociations: [authCheckLambda, rewriteLambda],
              },
            ],
          },
        ],
      },
    )
  }
}
