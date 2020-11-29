import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import { Config } from "./Config"

test("snapshot test", () => {
  const app = new cdk.App()

  const target = new Config(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
