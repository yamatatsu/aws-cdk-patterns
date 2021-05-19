import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { LambdaInsights } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const target = new LambdaInsights(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
