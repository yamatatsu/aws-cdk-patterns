import * as cdk from "@aws-cdk/core"
import { RetentionDays } from "@aws-cdk/aws-logs"
import { Trail, ReadWriteType } from "@aws-cdk/aws-cloudtrail"

export class CloudTrail extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    new Trail(this, "CloudTrail", {
      includeGlobalServiceEvents: true,
      isMultiRegionTrail: true,
      enableFileValidation: true,
      managementEvents: ReadWriteType.ALL,
      sendToCloudWatchLogs: true,
      cloudWatchLogsRetention: RetentionDays.THREE_MONTHS,
    })
  }
}
