import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { GuardDuty } from "./GuardDuty"

test("snapshot test", () => {
  const app = new App()

  const target = new GuardDuty(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
