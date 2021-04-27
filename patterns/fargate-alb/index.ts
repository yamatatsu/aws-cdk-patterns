import * as cdk from "@aws-cdk/core"
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts"
import { FargateAlb } from "./stacks"

const region = "ap-northeast-1"
const client = new STSClient({ region })
client
  .send(new GetCallerIdentityCommand({}))
  .then((data) => {
    const app = new cdk.App()
    new FargateAlb(app, "FargateAlb", {
      stackName: "FargateAlb",
      env: { region, account: data.Account },
    })
  })
  .catch((err) => {
    console.error(err)
  })
