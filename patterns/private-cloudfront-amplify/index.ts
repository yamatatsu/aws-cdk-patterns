import * as cdk from "@aws-cdk/core"
import { PrivateCloudfrontAmplify } from "./stacks"

const app = new cdk.App()
new PrivateCloudfrontAmplify(app, "PrivateCloudfrontAmplify", {
  stackName: "PrivateCloudfrontAmplify",
  // lambda@edge に使う lambda は us-east-1 である必要があるので、簡単のために全部バージニア北部で作っちゃう。
  env: { region: "us-east-1" },
})
