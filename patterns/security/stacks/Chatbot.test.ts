import { SynthUtils } from "@aws-cdk/assert"
import { App, Stack, aws_sns as sns } from "aws-cdk-lib"
import { Chatbot } from "./Chatbot"

test("snapshot test", () => {
  const app = new App()
  const stack = new Stack(app, "testStack")

  const topic = new sns.Topic(stack, "test-Topic")

  const target = new Chatbot(app, "Target", {
    slackWorkspaceId: "test-slackWorkspaceId",
    slackChannelId: "test-slackChannelId",
    notificationTopics: [topic],
  })

  expect(SynthUtils.toCloudFormation(target)).toMatchSnapshot()
})
