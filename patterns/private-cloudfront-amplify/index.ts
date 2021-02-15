import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import * as s3Deploy from "@aws-cdk/aws-s3-deployment"
import { PrivateCloudfrontAmplify } from "./stacks"

const app = new cdk.App()

const lambdaCode = new lambda.AssetCode("./lambda/dist")
const staticContents = s3Deploy.Source.asset("./front/build")
new PrivateCloudfrontAmplify(app, "PrivateCloudfrontAmplify", {
  stackName: "PrivateCloudfrontAmplify",
  lambdaCode,
  staticContents,
  // lambda@edge に使う lambda は us-east-1 である必要があるので、簡単のために全部バージニア北部で作っちゃう。
  env: { region: "us-east-1" },
})
