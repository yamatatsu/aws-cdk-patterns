import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import * as synthetics from "@aws-cdk/aws-synthetics"
import { CloudwatchSynthetics } from "./stacks"

test("snapshot test", () => {
  const app = new cdk.App()

  const target = new CloudwatchSynthetics(app, "Target", {
    code: synthetics.Code.fromInline("dummy"),
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
