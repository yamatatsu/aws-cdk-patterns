import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { MonitoringLambdaMemory } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const target = new MonitoringLambdaMemory(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
