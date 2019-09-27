import cdk = require("@aws-cdk/core")
import { Duration } from "@aws-cdk/core"
import lambda = require("@aws-cdk/aws-lambda")
import apigateway = require("@aws-cdk/aws-apigateway")
import cloudwatch = require("@aws-cdk/aws-cloudwatch")

class ApigatewayMetrics extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const handler = new lambda.Function(this, "Lambda", {
      code: new lambda.AssetCode("./lambda"),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {},
      timeout: Duration.seconds(10),
    })

    const restApi = new apigateway.LambdaRestApi(this, "RestApi", {
      handler,
      options: {
        restApiName: "ApigatewayMetrics_RestApi",
        deploy: true,
        deployOptions: {
          stageName: "stg",
          tracingEnabled: false,
          variables: {
            stageVariable: "It is value for testing stage variable.",
          },
          metricsEnabled: true,
          loggingLevel: apigateway.MethodLoggingLevel.INFO,
          dataTraceEnabled: true,
          /**
           * If you want to use Custom Access Logging (sourceIp etc.), you should set on aws web console.
           * Api Gateway > Stages > Log/Tracing > Custom Access Logging
           *
           * X-Ray Tracing too.
           */
        },
      },
    })

    new cloudwatch.Alarm(this, "RestApi5XXErrorAlerm", {
      metric: new cloudwatch.Metric({
        namespace: "AWS/ApiGateway",
        metricName: "5XXError",
        dimensions: {
          ApiName: restApi.restApiId,
          Stage: "prod",
        },
      }),
      period: cdk.Duration.minutes(5),
      evaluationPeriods: 3,
      statistic: "Sum",
      alarmName: "ApigatewayMetrics_RestApi5XXErrorAlerm",
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      threshold: 10,
    })
  }
}

const app = new cdk.App()
new ApigatewayMetrics(app, "ApigatewayMetrics", {
  stackName: "ApigatewayMetrics",
})
