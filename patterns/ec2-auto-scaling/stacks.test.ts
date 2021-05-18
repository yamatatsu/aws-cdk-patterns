import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { Ec2AutoScaling } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const target = new Ec2AutoScaling(app, "Target", {
    env: {
      region: "ap-northeast-1",
      account: "XXXXXXXXXXXX",
    },
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
