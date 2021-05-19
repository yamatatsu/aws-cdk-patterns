import { App } from "aws-cdk-lib"
import { ApigatewayCognito } from "./stacks"

const app = new App()
new ApigatewayCognito(app, "ApigatewayCognito", {
  stackName: "ApigatewayCognito",
})
