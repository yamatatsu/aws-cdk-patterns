import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import { SecurityHub } from "./SecurityHub"

test("snapshot test", () => {
  const app = new cdk.App()

  const target = new SecurityHub(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
