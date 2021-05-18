import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { ApigatewayVersioning } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const target = new ApigatewayVersioning(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
