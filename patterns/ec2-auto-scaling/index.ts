import * as cdk from "@aws-cdk/core"
import { Ec2AutoScaling } from "./stacks"

const app = new cdk.App()
new Ec2AutoScaling(app, "Ec2AutoScaling", {
  stackName: "Ec2AutoScaling",
})
