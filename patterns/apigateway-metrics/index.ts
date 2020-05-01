import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import * as apigateway from "@aws-cdk/aws-apigateway"
import * as cloudwatch from "@aws-cdk/aws-cloudwatch"

class ApigatewayMetrics extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const handler = new lambda.Function(this, "Lambda", {
      code: new lambda.AssetCode("./lambda"),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_10_X,
      tracing: lambda.Tracing.ACTIVE,
    })

    const restApiName = "ApigatewayMetrics_RestApi"
    const restApi = new apigateway.LambdaRestApi(this, "RestApi", {
      handler,
      options: {
        restApiName,
        deploy: true,
        deployOptions: {
          stageName: "stg",
          variables: {
            stageVariable: "It is value for testing stage variable.",
          },
          metricsEnabled: true,
          loggingLevel: apigateway.MethodLoggingLevel.INFO,
          dataTraceEnabled: true,
          tracingEnabled: true,
        },
      },
    })

    const getApiMetric = (metricName: string) =>
      new cloudwatch.Metric({
        namespace: "AWS/ApiGateway",
        metricName,
        dimensions: {
          ApiName: restApiName,
          Stage: restApi.deploymentStage.stageName,
        },
      })

    const apigateway5XXAlerm = new cloudwatch.Alarm(this, "Apigateway_5XX", {
      alarmName: "Apigateway_5XX",
      metric: getApiMetric("5XXError"),
      period: cdk.Duration.minutes(1),
      evaluationPeriods: 1,
      statistic: "Sum",
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      threshold: 1,
    })
    const lambdaThrottleAlerm = new cloudwatch.Alarm(this, "Lambda_Throttle", {
      alarmName: "Lambda_Throttle",
      metric: handler.metric("Throttles"),
      period: cdk.Duration.minutes(1),
      evaluationPeriods: 1,
      statistic: "Sum",
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      threshold: 1,
    })

    const alermWidget = (
      width: number,
      title: string,
      alarm: cloudwatch.IAlarm,
    ) => new cloudwatch.AlarmWidget({ title, alarm, width })
    const graphWidget = (
      width: number,
      title: string,
      ...metrics: cloudwatch.IMetric[]
    ) => new cloudwatch.GraphWidget({ title, left: metrics, width })

    new cloudwatch.Dashboard(this, "Dashboard", {
      widgets: [
        [
          alermWidget(12, "5XX アラーム", apigateway5XXAlerm),
          alermWidget(12, "lambda Throttle アラーム", lambdaThrottleAlerm),
        ],
        [
          graphWidget(
            12,
            "呼び出し回数",
            getApiMetric("Count"),
            handler.metric("Invocations"),
          ),
          graphWidget(
            12,
            "レイテンシー",
            handler.metric("Duration"),
            getApiMetric("IntegrationLatency"),
            getApiMetric("Latency"),
          ),
        ],
        [
          graphWidget(12, "5XX", getApiMetric("5XXError")),
          graphWidget(12, "4XX", getApiMetric("4XXError")),
        ],
        [
          graphWidget(8, "Lambda Errors", handler.metric("Errors")),
          graphWidget(8, "Lambda Throttles", handler.metric("Throttles")),
          graphWidget(
            8,
            "Lambda 並列実行数",
            handler.metric("ConcurrentExecutions"),
          ),
        ],
      ],
    })
  }
}

const app = new cdk.App()
new ApigatewayMetrics(app, "ApigatewayMetrics", {
  stackName: "ApigatewayMetrics",
})
