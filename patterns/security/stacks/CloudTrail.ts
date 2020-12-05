import * as cdk from "@aws-cdk/core"
import * as logs from "@aws-cdk/aws-logs"
import * as kms from "@aws-cdk/aws-kms"
import * as iam from "@aws-cdk/aws-iam"
import * as cloudtrail from "@aws-cdk/aws-cloudtrail"

export class CloudTrail extends cdk.Stack {
  public readonly logGroup: logs.ILogGroup

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const logGroup = new logs.LogGroup(this, "CloudTrailLogGroup", {
      retention: logs.RetentionDays.THREE_MONTHS,
    })

    const key = new kms.Key(this, "KmsKey", {
      description: "For CloudTrail Storage Encryption",
      alias: "for-cloud-trail-storage-encryption",
      // For private AWS account
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // TODO: It will be fixed by https://github.com/aws/aws-cdk/issues/3822
    key.grantEncrypt({
      grantPrincipal: new iam.ServicePrincipal("cloudtrail.amazonaws.com"),
    })

    new cloudtrail.Trail(this, "CloudTrail", {
      includeGlobalServiceEvents: true,
      isMultiRegionTrail: true,
      enableFileValidation: true,
      managementEvents: cloudtrail.ReadWriteType.ALL,
      sendToCloudWatchLogs: true,
      cloudWatchLogGroup: logGroup,
      // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-2.7-remediation
      // and
      // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#cloudtrail-2-remediation
      encryptionKey: key,
    })

    this.logGroup = logGroup
  }
}
