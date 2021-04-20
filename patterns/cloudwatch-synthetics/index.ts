import * as cdk from "@aws-cdk/core"
import { CloudwatchSynthetics } from "./stacks"

const app = new cdk.App()
new CloudwatchSynthetics(app, "CloudwatchSynthetics", {
  stackName: "CloudwatchSynthetics",
})
