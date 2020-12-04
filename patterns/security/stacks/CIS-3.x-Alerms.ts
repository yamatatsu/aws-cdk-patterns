/**
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-standards-cis-controls-1.1
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.3
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.1
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.2
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.3
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.4
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.5
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.6
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.7
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.8
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.9
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.10
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.11
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.12
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.13
 *   https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#securityhub-cis-controls-3.14
 */
import * as cdk from "@aws-cdk/core"
import * as cloudwatch from "@aws-cdk/aws-cloudwatch"
import * as cloudwatchActions from "@aws-cdk/aws-cloudwatch-actions"
import * as logs from "@aws-cdk/aws-logs"
import * as sns from "@aws-cdk/aws-sns"

type Props = cdk.StackProps & { logGroup: logs.ILogGroup }

type AlermParam = {
  name: string
  filterPatternString: string
  // metricName: string
}

const alermParams: AlermParam[] = [
  {
    name: "CIS-3.1-UnauthorizedApiCalls",
    filterPatternString:
      '{($.errorCode="*UnauthorizedOperation") || ($.errorCode="AccessDenied*")}',
  },
  {
    name: "CIS-3.2-AwsManagementConsoleSignInWithoutMfa",
    filterPatternString:
      '{($.eventName="ConsoleLogin") && ($.additionalEventData.MFAUsed !="Yes")}',
  },
  {
    name: "CIS-3.3-UsageOfRootAccount",
    filterPatternString:
      '{$.userIdentity.type="Root" && $.userIdentity.invokedBy NOT EXISTS && $.eventType !="AwsServiceEvent"}',
  },
  {
    name: "CIS-3.4-IamPolicyChanges",
    filterPatternString:
      "{($.eventName=DeleteGroupPolicy) || ($.eventName=DeleteRolePolicy) || ($.eventName=DeleteUserPolicy) || ($.eventName=PutGroupPolicy) || ($.eventName=PutRolePolicy) || ($.eventName=PutUserPolicy) || ($.eventName=CreatePolicy) || ($.eventName=DeletePolicy) || ($.eventName=CreatePolicyVersion) || ($.eventName=DeletePolicyVersion) || ($.eventName=AttachRolePolicy) || ($.eventName=DetachRolePolicy) || ($.eventName=AttachUserPolicy) || ($.eventName=DetachUserPolicy) || ($.eventName=AttachGroupPolicy) || ($.eventName=DetachGroupPolicy)}",
  },
  {
    name: "CIS-3.5-CloudTrailConfigurationChanges",
    filterPatternString:
      "{($.eventName=CreateTrail) || ($.eventName=UpdateTrail) || ($.eventName=DeleteTrail) || ($.eventName=StartLogging) || ($.eventName=StopLogging)}",
  },
  {
    name: "CIS-3.6-AwsManagementConsoleAuthenticationFailures",
    filterPatternString:
      '{($.eventName=ConsoleLogin) && ($.errorMessage="Failed authentication")}',
  },
  {
    name: "CIS-3.7-DisablingOrScheduledDeletionOfCustomerCreatedCmKs",
    filterPatternString:
      "{($.eventSource=kms.amazonaws.com) && (($.eventName=DisableKey) || ($.eventName=ScheduleKeyDeletion))}",
  },
  {
    name: "CIS-3.8-S3BucketPolicyChanges",
    filterPatternString:
      "{($.eventSource=s3.amazonaws.com) && (($.eventName=PutBucketAcl) || ($.eventName=PutBucketPolicy) || ($.eventName=PutBucketCors) || ($.eventName=PutBucketLifecycle) || ($.eventName=PutBucketReplication) || ($.eventName=DeleteBucketPolicy) || ($.eventName=DeleteBucketCors) || ($.eventName=DeleteBucketLifecycle) || ($.eventName=DeleteBucketReplication))}",
  },
  {
    name: "CIS-3.9-AwsConfigConfigurationChanges",
    filterPatternString:
      "{($.eventSource=config.amazonaws.com) && (($.eventName=StopConfigurationRecorder) || ($.eventName=DeleteDeliveryChannel) || ($.eventName=PutDeliveryChannel) || ($.eventName=PutConfigurationRecorder))}",
  },
  {
    name: "CIS-3.10-SecurityGroupChanges",
    filterPatternString:
      "{($.eventName=AuthorizeSecurityGroupIngress) || ($.eventName=AuthorizeSecurityGroupEgress) || ($.eventName=RevokeSecurityGroupIngress) || ($.eventName=RevokeSecurityGroupEgress) || ($.eventName=CreateSecurityGroup) || ($.eventName=DeleteSecurityGroup)}",
  },
  {
    name: "CIS-3.11-ChangesToNetworkAccessControlListsNacl",
    filterPatternString:
      "{($.eventName=CreateNetworkAcl) || ($.eventName=CreateNetworkAclEntry) || ($.eventName=DeleteNetworkAcl) || ($.eventName=DeleteNetworkAclEntry) || ($.eventName=ReplaceNetworkAclEntry) || ($.eventName=ReplaceNetworkAclAssociation)}",
  },
  {
    name: "CIS-3.12-ChangesToNetworkGateways",
    filterPatternString:
      "{($.eventName=CreateCustomerGateway) || ($.eventName=DeleteCustomerGateway) || ($.eventName=AttachInternetGateway) || ($.eventName=CreateInternetGateway) || ($.eventName=DeleteInternetGateway) || ($.eventName=DetachInternetGateway)}",
  },
  {
    name: "CIS-3.13-RouteTableChanges",
    filterPatternString:
      "{($.eventName=CreateRoute) || ($.eventName=CreateRouteTable) || ($.eventName=ReplaceRoute) || ($.eventName=ReplaceRouteTableAssociation) || ($.eventName=DeleteRouteTable) || ($.eventName=DeleteRoute) || ($.eventName=DisassociateRouteTable)}",
  },
  {
    name: "CIS-3.14-VpcChanges",
    filterPatternString:
      "{($.eventName=CreateVpc) || ($.eventName=DeleteVpc) || ($.eventName=ModifyVpcAttribute) || ($.eventName=AcceptVpcPeeringConnection) || ($.eventName=CreateVpcPeeringConnection) || ($.eventName=DeleteVpcPeeringConnection) || ($.eventName=RejectVpcPeeringConnection) || ($.eventName=AttachClassicLinkVpc) || ($.eventName=DetachClassicLinkVpc) || ($.eventName=DisableVpcClassicLink) || ($.eventName=EnableVpcClassicLink)}",
  },
]

export class Cis3xAlerms extends cdk.Stack {
  public readonly topics: sns.ITopic[]

  constructor(scope: cdk.App, id: string, props: Props) {
    super(scope, id, props)

    const topics = alermParams.map(
      (alermParam): sns.ITopic => {
        const metricFilter = new logs.MetricFilter(
          this,
          `${alermParam.name}-MetricFilter`,
          {
            metricName: alermParam.name,
            metricNamespace: "LogMetrics",
            metricValue: "1",
            logGroup: props.logGroup,
            filterPattern: {
              logPatternString: alermParam.filterPatternString,
            },
          },
        )

        const alarm = new cloudwatch.Alarm(this, `${alermParam.name}-Alarm`, {
          alarmName: alermParam.name,
          threshold: 1,
          evaluationPeriods: 1,
          metric: metricFilter.metric({}),
          comparisonOperator:
            cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        })

        const topic = new sns.Topic(this, `${alermParam.name}-Topic`)
        const snsAction = new cloudwatchActions.SnsAction(topic)
        alarm.addAlarmAction(snsAction)

        return topic
      },
    )

    this.topics = topics
  }
}
