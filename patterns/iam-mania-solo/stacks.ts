import { App, aws_iam, Stack, StackProps } from "aws-cdk-lib"

export class IamManiaSolo extends Stack {
  constructor(parent: App, id: string, props?: StackProps) {
    super(parent, id, props)

    const forceMfaPolicy = new aws_iam.ManagedPolicy(this, "ForceMfaPolicy", {
      managedPolicyName: "ForceMfaPolicy",
      statements: [
        new aws_iam.PolicyStatement({
          effect: aws_iam.Effect.DENY,
          notActions: ["iam:*"],
          resources: ["*"],
          conditions: {
            BoolIfExists: {
              "aws:MultiFactorAuthPresent": "false",
            },
          },
        }),
      ],
    })

    const adminGroup = new aws_iam.Group(this, "AdminGroup", {
      groupName: "AdminGroup",
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess"),
        forceMfaPolicy,
      ],
    })

    const soloUserName: string =
      this.node.tryGetContext("soloUserName") ?? "dummy"
    const user = aws_iam.User.fromUserName(this, "SoloUser", soloUserName)

    user.addToGroup(adminGroup)

    new aws_iam.Role(this, "AdminRole", {
      roleName: "AdminRole",
      assumedBy: new aws_iam.ArnPrincipal(user.userArn),
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    })
  }
}
