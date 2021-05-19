import {
  App,
  aws_lambda as lambda,
  aws_s3_deployment as s3Deploy,
} from "aws-cdk-lib"
import { PrivateCloudfrontAmplify } from "./stacks"

const app = new App()

const lambdaCode = new lambda.AssetCode("./lambda/dist")
const staticContents = s3Deploy.Source.asset("./front/build")
new PrivateCloudfrontAmplify(app, "PrivateCloudfrontAmplify", {
  stackName: "PrivateCloudfrontAmplify",
  lambdaCode,
  staticContents,
  // lambda@edge に使う lambda は us-east-1 である必要があるので、簡単のために全部バージニア北部で作っちゃう。
  env: { region: "us-east-1" },
})
