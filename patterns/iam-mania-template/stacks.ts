import { App, Arn, aws_iam, Stack, StackProps } from "aws-cdk-lib"

export class IamManiaAdmin extends Stack {
  constructor(parent: App, id: string, props?: StackProps) {
    super(parent, id, props)

    const ipRestrictionAndMFAForcePolicy = new aws_iam.ManagedPolicy(
      this,
      "IpRestrictionAndMFAForcePolicy",
      {
        managedPolicyName: "IpRestrictionAndMFAForcePolicy",
        statements: [
          // [DENY]IP制限
          new aws_iam.PolicyStatement({
            effect: aws_iam.Effect.DENY,
            actions: ["*"],
            resources: ["*"],
            // 任意のIPに変更すること
            conditions: { NotIpAddress: { "aws:SourceIp": ["8.8.8.8/32"] } },
          }),
          // [DENY]MFA必須化
          new aws_iam.PolicyStatement({
            effect: aws_iam.Effect.DENY,
            notActions: ["iam:*"],
            resources: ["*"],
            conditions: {
              BoolIfExists: { "aws:MultiFactorAuthPresent": "false" },
            },
          }),
          // [ALLOW]全ユーザーのリスト表示
          new aws_iam.PolicyStatement({
            effect: aws_iam.Effect.ALLOW,
            actions: ["iam:ListUsers", "iam:ListVirtualMFADevices"],
            resources: ["*"],
          }),
        ],
      },
    )
    const changeOwnPasswordPolicy = new aws_iam.ManagedPolicy(
      this,
      "ChangeOwnPasswordPolicy",
      {
        managedPolicyName: "ChangeOwnPasswordPolicy",
        statements: [
          // [ALLOW]自身のパスワード変更＆MFA有効化ポリシー
          new aws_iam.PolicyStatement({
            effect: aws_iam.Effect.ALLOW,
            actions: [
              "iam:ChangePassword",
              "iam:CreateAccessKey",
              "iam:CreateVirtualMFADevice",
              "iam:DeactivateMFADevice",
              "iam:DeleteAccessKey",
              "iam:DeleteVirtualMFADevice",
              "iam:EnableMFADevice",
              "iam:GetAccountPasswordPolicy",
              "iam:UpdateAccessKey",
              "iam:UpdateSigningCertificate",
              "iam:UploadSigningCertificate",
              "iam:UpdateLoginProfile",
              "iam:ResyncMFADevice",
            ],
            resources: [
              Arn.format(
                {
                  service: "iam",
                  region: "",
                  resource: "user",
                  resourceName: "${aws:username}",
                },
                this,
              ),
              Arn.format(
                {
                  service: "iam",
                  region: "",
                  resource: "mfa",
                  resourceName: "${aws:username}",
                },
                this,
              ),
            ],
          }),
          // [ALLOW]全ユーザーのリスト表示
          new aws_iam.PolicyStatement({
            effect: aws_iam.Effect.ALLOW,
            actions: ["iam:ListUsers", "iam:ListVirtualMFADevices"],
            resources: ["*"],
          }),
        ],
      },
    )
    const denyNetworkAccessPolicy = new aws_iam.ManagedPolicy(
      this,
      "DenyNetworkAccessPolicy",
      {
        managedPolicyName: "DenyNetworkAccessPolicy",
        statements: [
          new aws_iam.PolicyStatement({
            effect: aws_iam.Effect.DENY,
            actions: [
              "ec2:AcceptVpcEndpointConnections",
              "ec2:AssociateDhcpOptions",
              "ec2:AssociateRouteTable",
              "ec2:AssociateSubnetCidrBlock",
              "ec2:AssociateVpcCidrBlock",
              "ec2:AttachInternetGateway",
              "ec2:AttachNetworkInterface",
              "ec2:AttachVpnGateway",
              "ec2:CreateCustomerGateway",
              "ec2:CreateDefaultSubnet",
              "ec2:CreateDefaultVpc",
              "ec2:CreateDhcpOptions",
              "ec2:CreateEgressOnlyInternetGateway",
              "ec2:CreateInternetGateway",
              "ec2:CreateNetworkAcl",
              "ec2:CreateNetworkAclEntry",
              "ec2:CreateRoute",
              "ec2:CreateRouteTable",
              "ec2:CreateSecurityGroup",
              "ec2:CreateSubnet",
              "ec2:CreateVpc",
              "ec2:CreateVpcEndpoint",
              "ec2:CreateVpcEndpointConnectionNotification",
              "ec2:CreateVpcEndpointServiceConfiguration",
              "ec2:CreateVpnConnection",
              "ec2:CreateVpnConnectionRoute",
              "ec2:CreateVpnGateway",
              "ec2:DeleteEgressOnlyInternetGateway",
              "ec2:DeleteNatGateway",
              "ec2:DeleteNetworkInterface",
              "ec2:DeleteNetworkInterfacePermission",
              "ec2:DeletePlacementGroup",
              "ec2:DeleteSubnet",
              "ec2:DeleteVpc",
              "ec2:DeleteVpcEndpointConnectionNotifications",
              "ec2:DeleteVpcEndpoints",
              "ec2:DeleteVpcEndpointServiceConfigurations",
              "ec2:DeleteVpnConnection",
              "ec2:DeleteVpnConnectionRoute",
              "ec2:DeleteVpnGateway",
              "ec2:DetachInternetGateway",
              "ec2:DetachNetworkInterface",
              "ec2:DetachVpnGateway",
              "ec2:DisableVgwRoutePropagation",
              "ec2:DisableVpcClassicLinkDnsSupport",
              "ec2:DisassociateRouteTable",
              "ec2:DisassociateSubnetCidrBlock",
              "ec2:DisassociateVpcCidrBlock",
              "ec2:EnableVgwRoutePropagation",
              "ec2:EnableVpcClassicLinkDnsSupport",
              "ec2:ModifyNetworkInterfaceAttribute",
              "ec2:ModifySubnetAttribute",
              "ec2:ModifyVpcAttribute",
              "ec2:ModifyVpcEndpoint",
              "ec2:ModifyVpcEndpointConnectionNotification",
              "ec2:ModifyVpcEndpointServiceConfiguration",
              "ec2:ModifyVpcEndpointServicePermissions",
              "ec2:ModifyVpcPeeringConnectionOptions",
              "ec2:ModifyVpcTenancy",
              "ec2:MoveAddressToVpc",
              "ec2:RejectVpcEndpointConnections",
              "ec2:ReplaceNetworkAclAssociation",
              "ec2:ReplaceNetworkAclEntry",
              "ec2:ReplaceRoute",
              "ec2:ReplaceRouteTableAssociation",
              "ec2:ResetNetworkInterfaceAttribute",
              "ec2:RestoreAddressToClassic",
              "ec2:UpdateSecurityGroupRuleDescriptionsEgress",
              "ec2:UpdateSecurityGroupRuleDescriptionsIngress",
              "directconnect:*",
            ],
            resources: ["*"],
          }),
          new aws_iam.PolicyStatement({
            effect: aws_iam.Effect.DENY,
            actions: [
              "ec2:AcceptVpcPeeringConnection",
              "ec2:AttachClassicLinkVpc",
              "ec2:AuthorizeSecurityGroupEgress",
              "ec2:AuthorizeSecurityGroupIngress",
              "ec2:CreateVpcPeeringConnection",
              "ec2:DeleteCustomerGateway",
              "ec2:DeleteDhcpOptions",
              "ec2:DeleteInternetGateway",
              "ec2:DeleteNetworkAcl",
              "ec2:DeleteNetworkAclEntry",
              "ec2:DeleteRoute",
              "ec2:DeleteRouteTable",
              "ec2:DeleteSecurityGroup",
              "ec2:DeleteVolume",
              "ec2:DeleteVpcPeeringConnection",
              "ec2:DetachClassicLinkVpc",
              "ec2:DisableVpcClassicLink",
              "ec2:EnableVpcClassicLink",
              "ec2:GetConsoleScreenshot",
              "ec2:RejectVpcPeeringConnection",
              "ec2:RevokeSecurityGroupEgress",
              "ec2:RevokeSecurityGroupIngress",
              "ec2:AcceptTransitGatewayVpcAttachment",
              "ec2:AssociateTransitGatewayRouteTable",
              "ec2:CreateTransitGateway",
              "ec2:CreateTransitGatewayRoute",
              "ec2:CreateTransitGatewayRouteTable",
              "ec2:CreateTransitGatewayVpcAttachment",
              "ec2:DeleteTransitGateway",
              "ec2:DeleteTransitGatewayRoute",
              "ec2:DeleteTransitGatewayRouteTable",
              "ec2:DeleteTransitGatewayVpcAttachment",
              "ec2:DescribeTransitGatewayAttachments",
              "ec2:DescribeTransitGatewayRouteTables",
              "ec2:DescribeTransitGatewayVpcAttachments",
              "ec2:DescribeTransitGateways",
              "ec2:DisableTransitGatewayRouteTablePropagation",
              "ec2:DisassociateTransitGatewayRouteTable",
              "ec2:EnableTransitGatewayRouteTablePropagation",
              "ec2:ExportTransitGatewayRoutes",
              "ec2:GetTransitGatewayAttachmentPropagations",
              "ec2:GetTransitGatewayRouteTableAssociations",
              "ec2:GetTransitGatewayRouteTablePropagations",
              "ec2:ModifyTransitGatewayVpcAttachment",
              "ec2:RejectTransitGatewayVpcAttachment",
              "ec2:ReplaceTransitGatewayRoute",
              "ec2:SearchTransitGatewayRoutes",
            ],
            resources: ["*"],
          }),
        ],
      },
    )

    const adminGroup = new aws_iam.Group(this, "AdminGroup", {
      groupName: "Admins",
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
        ipRestrictionAndMFAForcePolicy,
      ],
    })
    const networkAdminGroup = new aws_iam.Group(this, "NetworkAdminGroup", {
      groupName: "NetworkAdmins",
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "job-function/NetworkAdministrator",
        ),
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess"),
        ipRestrictionAndMFAForcePolicy,
        changeOwnPasswordPolicy,
      ],
    })
    const developerGroup = new aws_iam.Group(this, "DeveloperGroup", {
      groupName: "Developers",
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("PowerUserAccess"),
        ipRestrictionAndMFAForcePolicy,
        changeOwnPasswordPolicy,
        denyNetworkAccessPolicy,
      ],
    })
    const operatorGroup = new aws_iam.Group(this, "OperatorGroup", {
      groupName: "Operators",
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AWSSupportAccess"),
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess"),
        ipRestrictionAndMFAForcePolicy,
        changeOwnPasswordPolicy,
      ],
    })
    const billingUserGroup = new aws_iam.Group(this, "BillingUserGroup", {
      groupName: "BillingUsers",
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("job-function/Billing"),
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess"),
        ipRestrictionAndMFAForcePolicy,
        changeOwnPasswordPolicy,
      ],
    })

    const user = new aws_iam.User(this, "user", {
      userName: "hoge",
      groups: [adminGroup],
    })

    new aws_iam.Role(this, "AdminRole", {
      roleName: "AdminRole",
      assumedBy: new aws_iam.ArnPrincipal(user.userArn),
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    })
  }
}
