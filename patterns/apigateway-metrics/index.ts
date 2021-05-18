import { App } from "aws-cdk-lib"
import { ApigatewayMetrics } from "./stacks"

const app = new App()
new ApigatewayMetrics(app, "ApigatewayMetrics", {
  stackName: "ApigatewayMetrics",
})
