import { App } from "aws-cdk-lib"
import { Waf } from "./stacks"

const app = new App()

new Waf(app, "WafStack")
