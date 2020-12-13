import * as cdk from "@aws-cdk/core"
import * as logs from "@aws-cdk/aws-logs"
import * as iam from "@aws-cdk/aws-iam"
import * as s3 from "@aws-cdk/aws-s3"
import * as cloudtrail from "@aws-cdk/aws-cloudtrail"

const ssslOnlyPolicyStatement = new iam.PolicyStatement({
  sid: "AllowSSLRequestsOnly",
  actions: ["s3:*"],
  effect: iam.Effect.DENY,
  resources: [
    "arn:aws:s3:::awsexamplebucket",
    "arn:aws:s3:::awsexamplebucket/*",
  ],
  conditions: {
    Bool: {
      "aws:SecureTransport": "false",
    },
  },
  principals: [new iam.AnyPrincipal()],
})

export class CloudTrail extends cdk.Stack {
  public readonly logGroup: logs.ILogGroup

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
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
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    )
    // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#s3-5-remediation
    // accessLogBucket.addToResourcePolicy(ssslOnlyPolicyStatement)

    const bucket = new s3.Bucket(this, "CloudTrailBucket", {
      // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-2.7-remediation
      // and
      // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#cloudtrail-2-remediation
      encryption: s3.BucketEncryption.KMS_MANAGED,
      // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-2.6-remediation
      serverAccessLogsBucket: accessLogBucket,
      // For private AWS account
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
    // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#s3-5-remediation
    // bucket.addToResourcePolicy(ssslOnlyPolicyStatement)

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
