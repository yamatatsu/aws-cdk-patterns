/**
 * https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.20-remediation
 */
import { App, Stack, StackProps, aws_iam as iam } from "aws-cdk-lib"

export class Cis_1_20_AwsSupportAccessRole extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
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
