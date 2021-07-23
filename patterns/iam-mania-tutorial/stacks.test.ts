import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { IamManiaTutorial } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const target = new IamManiaTutorial(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
