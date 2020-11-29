import * as cdk from "@aws-cdk/core"
import { Waf } from "./stacks"

const app = new cdk.App()

new Waf(app, "WafStack")
