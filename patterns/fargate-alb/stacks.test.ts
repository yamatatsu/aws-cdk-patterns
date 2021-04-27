import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import { FargateAlb } from "./stacks"

test("snapshot test", () => {
  const app = new cdk.App()

  const target = new FargateAlb(app, "Target", {
    env: {
      region: "ap-northeast-1",
      account: "XXXXXXXXXXXX",
    },
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
