import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { IamManiaSolo } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const target = new IamManiaSolo(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
