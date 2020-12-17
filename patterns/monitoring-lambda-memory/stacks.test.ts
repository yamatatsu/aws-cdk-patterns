import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import { MonitoringLambdaMemory } from "./stacks"

test("snapshot test", () => {
  const app = new cdk.App()

  const target = new MonitoringLambdaMemory(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
