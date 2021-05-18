import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { Waf } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const target = new Waf(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
