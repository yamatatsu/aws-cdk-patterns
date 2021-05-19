import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { ApigatewayMetrics } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const target = new ApigatewayMetrics(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
