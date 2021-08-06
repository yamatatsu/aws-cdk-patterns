import { App } from "aws-cdk-lib"
import { IamManiaAdmin } from "./stacks"

const app = new App()
new IamManiaAdmin(app, "IamManiaAdmin", {
  stackName: "IamManiaAdmin",
})
