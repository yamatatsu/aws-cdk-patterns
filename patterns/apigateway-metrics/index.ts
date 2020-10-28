import * as cdk from "@aws-cdk/core"
import { ApigatewayMetrics } from "./stacks"

const app = new cdk.App()
new ApigatewayMetrics(app, "ApigatewayMetrics", {
  stackName: "ApigatewayMetrics",
})
