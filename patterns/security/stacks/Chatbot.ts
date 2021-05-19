import {
  App,
  Stack,
  StackProps,
  aws_chatbot as chatbot,
  aws_sns as sns,
} from "aws-cdk-lib"

type Props = StackProps & {
  slackWorkspaceId: string
  slackChannelId: string
  notificationTopics: sns.ITopic[]
}

export class Chatbot extends Stack {
  constructor(scope: App, id: string, props: Props) {
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
