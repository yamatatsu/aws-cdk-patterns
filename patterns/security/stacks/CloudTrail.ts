import * as cdk from "@aws-cdk/core"
import * as logs from "@aws-cdk/aws-logs"
import * as cloudtrail from "@aws-cdk/aws-cloudtrail"

export class CloudTrail extends cdk.Stack {
  public readonly logGroup: logs.ILogGroup

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const logGroup = new logs.LogGroup(this, "CloudTrailLogGroup", {
      retention: logs.RetentionDays.THREE_MONTHS,
    })

    new cloudtrail.Trail(this, "CloudTrail", {
      includeGlobalServiceEvents: true,
      isMultiRegionTrail: true,
      enableFileValidation: true,
      managementEvents: cloudtrail.ReadWriteType.ALL,
      sendToCloudWatchLogs: true,
      cloudWatchLogGroup: logGroup,
    })

    this.logGroup = logGroup
  }
}
