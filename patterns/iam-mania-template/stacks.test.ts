import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { IamManiaAdmin } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const target = new IamManiaAdmin(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
