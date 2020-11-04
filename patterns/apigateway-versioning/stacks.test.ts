import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import { ApigatewayVersioning } from "./stacks"

test("snapshot test", () => {
  const app = new cdk.App()

  const target = new ApigatewayVersioning(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
