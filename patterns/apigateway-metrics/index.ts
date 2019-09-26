import cdk = require("@aws-cdk/core")
import { Duration } from "@aws-cdk/core"
import lambda = require("@aws-cdk/aws-lambda")
import apigateway = require("@aws-cdk/aws-apigateway")

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

    new apigateway.LambdaRestApi(this, "RestApi", {
      handler,
      options: {
        restApiName: "ApigatewayMetrics_RestApi",
      },
    })
  }
}

const app = new cdk.App()
new ApigatewayMetrics(app, "ApigatewayMetrics", {
  stackName: "ApigatewayMetrics",
})
