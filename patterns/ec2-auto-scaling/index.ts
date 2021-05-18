import { App } from "aws-cdk-lib"
import { Ec2AutoScaling } from "./stacks"

const app = new App()
new Ec2AutoScaling(app, "Ec2AutoScaling", {
  stackName: "Ec2AutoScaling",
})
