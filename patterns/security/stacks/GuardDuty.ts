import * as cdk from "@aws-cdk/core"
import * as guardduty from "@aws-cdk/aws-guardduty"
import * as events from "@aws-cdk/aws-events"
import * as targets from "@aws-cdk/aws-events-targets"
import * as sns from "@aws-cdk/aws-sns"

export class GuardDuty extends cdk.Stack {
  public readonly topic: sns.ITopic

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
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
    rule.addTarget(new targets.SnsTopic(topic))

    this.topic = topic
  }
}
