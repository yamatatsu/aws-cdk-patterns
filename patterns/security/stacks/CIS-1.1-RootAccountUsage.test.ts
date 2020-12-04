import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import * as logs from "@aws-cdk/aws-logs"
import { RootAccountUsage } from "./CIS-1.1-RootAccountUsage"

test("snapshot test", () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, "testStack")

  const logGroup = new logs.LogGroup(stack, "test-LogGroup")

  const target = new RootAccountUsage(app, "Target", {
    logGroup,
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
