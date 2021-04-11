import * as cdk from "@aws-cdk/core"
import * as chatbot from "@aws-cdk/aws-chatbot"
import * as sns from "@aws-cdk/aws-sns"

type Props = cdk.StackProps & {
  slackWorkspaceId: string
  slackChannelId: string
  notificationTopics: sns.ITopic[]
}

export class Chatbot extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: Props) {
    super(scope, id, props)

    new chatbot.SlackChannelConfiguration(this, "SlackChannelConfiguration", {
      slackChannelConfigurationName: "SecurityAlert",
      // role?: iam.IRole,
      slackWorkspaceId: props.slackWorkspaceId,
      slackChannelId: props.slackChannelId,
      notificationTopics: props.notificationTopics,
      // loggingLevel?: LoggingLevel,
      // logRetention?: logs.RetentionDays,
      // logRetentionRole?: iam.IRole,
      // logRetentionRetryOptions?: logs.LogRetentionRetryOptions,
    })
  }
}
