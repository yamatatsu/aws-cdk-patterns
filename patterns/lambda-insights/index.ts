import { App } from "aws-cdk-lib"
import { LambdaInsights } from "./stacks"

const app = new App()
new LambdaInsights(app, "LambdaInsights", {
  stackName: "LambdaInsights",
})
