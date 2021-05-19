// FIXME: RCにはまだ synthetics が実装されていない。実装を待つ。
// import { SynthUtils } from "@aws-cdk/assert"
// import { App, aws_synthetics as synthetics } from "aws-cdk-lib"
// import { CloudwatchSynthetics } from "./stacks"

test.skip("snapshot test", () => {
  // const app = new App()
  // const target = new CloudwatchSynthetics(app, "Target", {
  //   code: synthetics.Code.fromInline("dummy"),
  // })
  // expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
