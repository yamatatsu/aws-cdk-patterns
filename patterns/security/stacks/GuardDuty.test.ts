import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import { GuardDuty } from "./GuardDuty"

test("snapshot test", () => {
  const app = new cdk.App()

  const target = new GuardDuty(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
