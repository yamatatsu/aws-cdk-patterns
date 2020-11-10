import * as cdk from "@aws-cdk/core"
import { WebAuthnDemo } from "./stacks"

const app = new cdk.App()
new WebAuthnDemo(app, "WebAuthnDemo", {
  stackName: "WebAuthnDemo",
})
