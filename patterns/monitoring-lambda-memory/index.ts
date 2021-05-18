import { App } from "aws-cdk-lib"
import { MonitoringLambdaMemory } from "./stacks"

const app = new App()
new MonitoringLambdaMemory(app, "MonitoringLambdaMemory", {
  stackName: "MonitoringLambdaMemory",
})
