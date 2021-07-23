import { App, Arn, aws_iam, Stack, StackProps } from "aws-cdk-lib"

export class IamManiaTutorial extends Stack {
  constructor(parent: App, id: string, props?: StackProps) {
    super(parent, id, props)

    const managedPolicy = new aws_iam.ManagedPolicy(this, "ManagedPolicy", {
      managedPolicyName: "IPAddressRestriction",
      statements: [
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.DENY,
          actions: ["*"],
          resources: ["*"],
          conditions: { NotIpAddress: { "aws:SourceIp": ["8.8.8.8/32"] } },
        }),
      ],
    })

    const group = new aws_iam.Group(this, "Group", {
      groupName: "ViewOnlyUsers",
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess"),
        managedPolicy,
      ],
    })

    const user = new aws_iam.User(this, "User", {
      userName: "test-user01",
      groups: [group],
    })

    new aws_iam.Role(this, "Role", {
      roleName: "SwitchRoleForTest01",
      assumedBy: new aws_iam.ArnPrincipal(user.userArn),
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    })
  }
}
