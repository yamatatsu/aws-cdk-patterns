import path from "path"
import { SynthUtils } from "@aws-cdk/assert"
import {
  App,
  aws_lambda as lambda,
  aws_s3_deployment as s3Deploy,
} from "aws-cdk-lib"
import { PrivateCloudfrontAmplify } from "./stacks"

test("snapshot test", () => {
  const app = new App()

  const staticContents = s3Deploy.Source.asset("./dummy-for-test")
  const target = new PrivateCloudfrontAmplify(app, "Target", {
    lambdaEntry: path.resolve(__dirname, "dummy-for-test/dummy.js"),
    staticContents,
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
