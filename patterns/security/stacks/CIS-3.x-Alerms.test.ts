import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import * as logs from "@aws-cdk/aws-logs"
import { Cis3xAlerms } from "./CIS-3.x-Alerms"

test("snapshot test", () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, "testStack")

  const logGroup = new logs.LogGroup(stack, "test-LogGroup")

  const target = new Cis3xAlerms(app, "Target", {
    logGroup,
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
