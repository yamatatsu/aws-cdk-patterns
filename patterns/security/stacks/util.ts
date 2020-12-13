import * as iam from "@aws-cdk/aws-iam"
import * as s3 from "@aws-cdk/aws-s3"

// https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#s3-5-remediation
export const addSslOnlyPolicyToBucket = (bucket: s3.IBucket) => {
  const ps = new iam.PolicyStatement({
    sid: "AllowSSLRequestsOnly",
    actions: ["s3:*"],
    effect: iam.Effect.DENY,
    conditions: {
      Bool: {
        "aws:SecureTransport": "false",
      },
    },
    principals: [new iam.AnyPrincipal()],
  })
  ps.addResources(bucket.bucketArn, bucket.arnForObjects("*"))
  bucket.addToResourcePolicy(ps)
}
