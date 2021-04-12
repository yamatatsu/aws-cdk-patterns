import * as cdk from "@aws-cdk/core"
import { LambdaInsights } from "./stacks"

const app = new cdk.App()
new LambdaInsights(app, "LambdaInsights", {
  stackName: "LambdaInsights",
})
