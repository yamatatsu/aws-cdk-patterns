import * as cdk from "@aws-cdk/core"
import * as synthetics from "@aws-cdk/aws-synthetics"
import { CloudwatchSynthetics } from "./stacks"

const app = new cdk.App()
new CloudwatchSynthetics(app, "CloudwatchSynthetics", {
  stackName: "CloudwatchSynthetics",
  code: synthetics.Code.fromAsset(`${__dirname}/dist`),
})
