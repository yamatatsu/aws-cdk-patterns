import * as dotenv from "dotenv"
import { App, Environment } from "aws-cdk-lib"
import { SecurityHub } from "./SecurityHub"
import { CloudTrail } from "./CloudTrail"
import { GuardDuty } from "./GuardDuty"
import { Config } from "./config"
import { Chatbot } from "./Chatbot"
import { Cis3xAlerms } from "./CIS-3.x-Alerms"
import { Cis_1_20_AwsSupportAccessRole } from "./CIS-1.20-AwsSupportAccessRole"

dotenv.config()

const SLACK_WORKSPACE_ID = process.env.SLACK_WORKSPACE_ID
if (!SLACK_WORKSPACE_ID) {
  throw new Error("No `process.env.SLACK_WORKSPACE_ID` is set")
}
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID
if (!SLACK_CHANNEL_ID) {
  throw new Error("No `process.env.SLACK_CHANNEL_ID` is set")
}

const app = new App()
const enviroment: Environment = {
  region: "ap-northeast-1",
}

new SecurityHub(app, "SecurityHubStack", {
  env: enviroment,
})

const cloudTrail = new CloudTrail(app, "CloudTrailStack", {
  env: enviroment,
})

const guardDuty = new GuardDuty(app, "GuardDutyStack", {
  env: enviroment,
})

new Config(app, "ConfigStack", { env: enviroment })

const cis3xAlerms = new Cis3xAlerms(app, "Cis3xAlerms", {
  env: enviroment,
  logGroup: cloudTrail.logGroup,
})
new Cis_1_20_AwsSupportAccessRole(app, "Cis-1-20-AwsSupportAccessRole")

new Chatbot(app, "SecurityChatbotStack", {
  slackWorkspaceId: SLACK_WORKSPACE_ID,
  slackChannelId: SLACK_CHANNEL_ID,
  notificationTopics: [guardDuty.topic, ...cis3xAlerms.topics],
  env: enviroment,
})
