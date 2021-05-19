import { SynthUtils } from "@aws-cdk/assert"
import { App } from "aws-cdk-lib"
import { Cis_1_20_AwsSupportAccessRole } from "./CIS-1.20-AwsSupportAccessRole"

test("snapshot test", () => {
  const app = new App()

  const target = new Cis_1_20_AwsSupportAccessRole(app, "Target")

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
