import { SynthUtils } from "@aws-cdk/assert"
import * as cdk from "@aws-cdk/core"
import * as sns from "@aws-cdk/aws-sns"
import { Chatbot } from "./chatbot"

test("snapshot test", () => {
  const app = new cdk.App()
  const stack = new cdk.Stack(app, "testStack")

  const topic = new sns.Topic(stack, "test-Topic")

  const target = new Chatbot(app, "Target", {
    slackWorkspaceId: "test-slackWorkspaceId",
    slackChannelId: "test-slackChannelId",
    notificationTopics: [topic],
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
