/**
 * https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.20-remediation
 */
import * as cdk from "@aws-cdk/core"
import * as iam from "@aws-cdk/aws-iam"

export class Cis_1_20_AwsSupportAccessRole extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    new iam.Role(this, "Role", {
      roleName: "AWSSupportAccessRole",
      description:
        "https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.20-remediation",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AWSSupportAccess"),
      ],
      assumedBy: new iam.AccountPrincipal(this.account),
    })
  }
}
