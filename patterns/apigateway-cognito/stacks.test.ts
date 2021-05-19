import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { ApigatewayCognito } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const target = new ApigatewayCognito(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
