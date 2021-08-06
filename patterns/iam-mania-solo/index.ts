import { App } from "aws-cdk-lib"
import { IamManiaSolo } from "./stacks"

const app = new App()
new IamManiaSolo(app, "IamManiaSolo", {
  stackName: "IamManiaSolo",
})
