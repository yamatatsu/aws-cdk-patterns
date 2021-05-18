import { SynthUtils } from "@aws-cdk/assert"
import { App, Stack, aws_logs as logs } from "aws-cdk-lib"
import { Cis3xAlerms } from "./CIS-3.x-Alerms"

test("snapshot test", () => {
  const app = new App()
  const stack = new Stack(app, "testStack")

  const logGroup = new logs.LogGroup(stack, "test-LogGroup")

  const target = new Cis3xAlerms(app, "Target", {
    logGroup,
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
