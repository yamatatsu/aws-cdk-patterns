import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { SecurityHub } from "./SecurityHub"

test("snapshot test", () => {
  const app = new App()

  const target = new SecurityHub(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
