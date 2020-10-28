import * as cdk from "@aws-cdk/core"
import { ApigatewayCognito } from "./stacks"

const app = new cdk.App()
new ApigatewayCognito(app, "ApigatewayCognito", {
  stackName: "ApigatewayCognito",
})
