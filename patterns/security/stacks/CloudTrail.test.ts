import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { CloudTrail } from "./CloudTrail"

test("snapshot test", () => {
  const app = new App()

  const target = new CloudTrail(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
