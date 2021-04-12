import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import { LambdaInsights } from "./stacks"

test("snapshot test", () => {
  const app = new cdk.App()

  const target = new LambdaInsights(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
