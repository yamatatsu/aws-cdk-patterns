import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import { Ec2AutoScaling } from "./stacks"

test("snapshot test", () => {
  const app = new cdk.App()

  const target = new Ec2AutoScaling(app, "Target", {
    env: {
      region: "ap-northeast-1",
      account: "XXXXXXXXXXXX",
    },
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
