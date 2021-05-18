import {
  App,
  Stack,
  StackProps,
  aws_iam as iam,
  aws_securityhub as securityhub,
  aws_events as events,
  aws_events_targets as events_targets,
  aws_sns as sns,
} from "aws-cdk-lib"

export class SecurityHub extends Stack {
  public readonly topic: sns.ITopic

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    new iam.CfnServiceLinkedRole(this, "ServiceLinkedRoleForSecurityHub", {
      awsServiceName: "securityhub.amazonaws.com",
      description:
        "A service-linked role required for AWS Security Hub to access your resources.",
    })

    new securityhub.CfnHub(this, "SecurityHub")

    const topic = new sns.Topic(this, "SecurityHubTopic")

    const rule = new events.Rule(this, "SecurityHubNotificationRule", {
      ruleName: "AlertSecurityHubFindings",
      description: "Alert to SNS topic when find threats by SecurityHub",
      eventPattern: {
        source: ["aws.securityhub"],
        detailType: ["Security Hub Findings - Imported"],
        detail: {
          // PASSED(問題なし)以外を1度だけ報告 参考:https://dev.classmethod.jp/articles/security-hub-filtering-examples/#toc-4
          findings: {
            Compliance: { Status: [{ "anything-but": "PASSED" }] },
            RecordState: ["ARCHIVED"],
          },
        },
      },
    })
    rule.addTarget(new events_targets.SnsTopic(topic))

    this.topic = topic
  }
}
