import * as cdk from "@aws-cdk/core"
import { ApigatewayVersioning } from "./stacks"

const app = new cdk.App()
new ApigatewayVersioning(app, "ApigatewayVersioning", {
  stackName: "ApigatewayVersioning",
})
