import { App } from "aws-cdk-lib"
import { ApigatewayVersioning } from "./stacks"

const app = new App()
new ApigatewayVersioning(app, "ApigatewayVersioning", {
  stackName: "ApigatewayVersioning",
})
