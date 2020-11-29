import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import { CloudTrail } from "./CloudTrail"

test("snapshot test", () => {
  const app = new cdk.App()

  const target = new CloudTrail(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
