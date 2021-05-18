import {
  App,
  Stack,
  StackProps,
  RemovalPolicy,
  aws_logs as logs,
  aws_s3 as s3,
  aws_cloudtrail as cloudtrail,
} from "aws-cdk-lib"

import { addSslOnlyPolicyToBucket } from "./util"

export class CloudTrail extends Stack {
  public readonly logGroup: logs.ILogGroup

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    const logGroup = new logs.LogGroup(this, "CloudTrailLogGroup", {
      retention: logs.RetentionDays.THREE_MONTHS,
    })

    const accessLogBucket = new s3.Bucket(
      this,
      "CloudTrailBucketAccessLogBucket",
      {
        // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#s3-4-remediation
        encryption: s3.BucketEncryption.S3_MANAGED,
        // For private AWS account
        removalPolicy: RemovalPolicy.DESTROY,
      },
    )
    // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#s3-5-remediation
    addSslOnlyPolicyToBucket(accessLogBucket)

    const bucket = new s3.Bucket(this, "CloudTrailBucket", {
      // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-2.7-remediation
      // and
      // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#cloudtrail-2-remediation
      encryption: s3.BucketEncryption.KMS_MANAGED,
      // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-2.6-remediation
      serverAccessLogsBucket: accessLogBucket,
      // For private AWS account
      removalPolicy: RemovalPolicy.DESTROY,
    })
    // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#s3-5-remediation
    addSslOnlyPolicyToBucket(bucket)

    new cloudtrail.Trail(this, "CloudTrail", {
      includeGlobalServiceEvents: true,
      isMultiRegionTrail: true,
      enableFileValidation: true,
      managementEvents: cloudtrail.ReadWriteType.ALL,
      sendToCloudWatchLogs: true,
      cloudWatchLogGroup: logGroup,
      bucket,
    })

    this.logGroup = logGroup
  }
}
