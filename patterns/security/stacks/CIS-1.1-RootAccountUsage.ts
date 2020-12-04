/**
 * 1.1 – Avoid the use of the "root" account
 * https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-standards-cis-controls-1.1
 * and
 * 3.3 – Ensure a log metric filter and alarm exist for usage of "root" account
 * https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.3
 */
import * as cdk from "@aws-cdk/core"
import * as cloudwatch from "@aws-cdk/aws-cloudwatch"
import * as cloudwatchActions from "@aws-cdk/aws-cloudwatch-actions"
import * as logs from "@aws-cdk/aws-logs"
import * as sns from "@aws-cdk/aws-sns"

type Props = cdk.StackProps & { logGroup: logs.ILogGroup }

export class RootAccountUsage extends cdk.Stack {
  public readonly topic: sns.ITopic

  constructor(scope: cdk.App, id: string, props: Props) {
    super(scope, id, props)

    const metricFilter = new logs.MetricFilter(this, "MetricFilter", {
      metricName: "UsedRootAccount",
      metricNamespace: "LogMetrics",
      metricValue: "1",
      logGroup: props.logGroup,
      filterPattern: {
        logPatternString:
          '{$.userIdentity.type="Root" && $.userIdentity.invokedBy NOT EXISTS && $.eventType !="AwsServiceEvent"}',
      },
    })

    const alarm = new cloudwatch.Alarm(this, "Alarm", {
      alarmName: "CIS-1.1-RootAccountUsage",
      alarmDescription:
        "https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-standards-cis-controls-1.1",
      threshold: 1,
      evaluationPeriods: 1,
      metric: metricFilter.metric({}),
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    })

    const topic = new sns.Topic(this, "Topic")
    const snsAction = new cloudwatchActions.SnsAction(topic)
    alarm.addAlarmAction(snsAction)

    this.topic = topic
  }
}
