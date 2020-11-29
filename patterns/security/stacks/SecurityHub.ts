import * as cdk from "@aws-cdk/core"
import * as iam from "@aws-cdk/aws-iam"
import * as securityhub from "@aws-cdk/aws-securityhub"
import * as events from "@aws-cdk/aws-events"
import * as targets from "@aws-cdk/aws-events-targets"
import * as sns from "@aws-cdk/aws-sns"

export class SecurityHub extends cdk.Stack {
  public readonly topic: sns.ITopic

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
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
    rule.addTarget(new targets.SnsTopic(topic))

    this.topic = topic
  }
}
