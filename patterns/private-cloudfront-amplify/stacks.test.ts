import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import * as s3Deploy from "@aws-cdk/aws-s3-deployment"
import { PrivateCloudfrontAmplify } from "./stacks"

test("snapshot test", () => {
  const app = new cdk.App()

  const lambdaCode = new lambda.AssetCode("./dummy-for-test")
  const staticContents = s3Deploy.Source.asset("./dummy-for-test")
  const target = new PrivateCloudfrontAmplify(app, "Target", {
    lambdaCode,
    staticContents,
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
