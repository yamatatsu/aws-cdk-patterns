import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { Config } from "./Config"

test("snapshot test", () => {
  const app = new App()

  const target = new Config(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
