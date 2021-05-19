import {
  App,
  Stack,
  StackProps,
  aws_guardduty as guardduty,
  aws_events as events,
  aws_events_targets as events_targets,
  aws_sns as sns,
} from "aws-cdk-lib"

export class GuardDuty extends Stack {
  public readonly topic: sns.ITopic

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    new guardduty.CfnDetector(this, "GuardDuty", {
      enable: true,
    })

    const topic = new sns.Topic(this, "GuardDutyTopic")

    const rule = new events.Rule(this, "GuardDutyNotificationRule", {
      ruleName: "GuardDutyNotificationRule",
      description: "Alert to SNS topic when find threats by Guardduty",
      eventPattern: {
        source: ["aws.guardduty"],
        detailType: ["GuardDuty Finding"],
      },
    })
    rule.addTarget(new events_targets.SnsTopic(topic))

    this.topic = topic
  }
}
