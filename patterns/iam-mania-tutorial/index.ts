import { App } from "aws-cdk-lib"
import { IamManiaTutorial } from "./stacks"

const app = new App()
new IamManiaTutorial(app, "IamManiaTutorial", {
  stackName: "IamManiaTutorial",
})
