import * as cdk from "@aws-cdk/core"
import * as waf from "@aws-cdk/aws-wafv2"

const ALLOW_IP_DIC: Record<string, string[]> = {}
const OWASP_RULE: waf.CfnWebACL.RuleProperty = {
  name: "AWSCommonRule",
  priority: 0,
  overrideAction: {
    none: {},
  },
  visibilityConfig: {
    sampledRequestsEnabled: true,
    cloudWatchMetricsEnabled: true,
    metricName: "RuleWithAWSManagedRulesMetric",
  },
  statement: {
    managedRuleGroupStatement: {
      excludedRules: [],
      name: "AWSManagedRulesCommonRuleSet",
      vendorName: "AWS",
    },
  },
}

export class Waf extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const allowIpRules: waf.CfnWebACL.RuleProperty[] = Object.entries(
      ALLOW_IP_DIC,
    ).map(([ipListName, ipList], index) => {
      const ipSetName = `${ipListName}IpSet`

      const ipSet = new waf.CfnIPSet(this, ipSetName, {
        name: ipSetName,
        description: ipSetName,
        addresses: ipList,
        ipAddressVersion: "IPV4",
        scope: "REGIONAL",
      })

      return {
        name: `${ipSetName}Allow`,
        // 他のルールの分を開けるために+10する。他のruleと重複したpriorityは存在できない。連続である必要はない。
        priority: index + 10,
        action: {
          allow: {},
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: `${ipSetName}AllowRuleMetric`,
        },
        statement: {
          ipSetReferenceStatement: {
            arn: ipSet.getAtt("Arn").toString(),
          },
        },
      }
    })

    // OWASPのWebAcl
    new waf.CfnWebACL(this, "CommonAcl", {
      defaultAction: {
        allow: {},
      },
      description: "CommonAcl",
      name: "CommonAcl",
      rules: [OWASP_RULE],
      scope: "REGIONAL",
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "CommonAclMetric",
      },
    })

    // OWASPと特定のIPのみ許可のWebAcl
    new waf.CfnWebACL(this, "AllowSpecificIpAcl", {
      defaultAction: {
        block: {},
      },
      description: "AllowSpecificIpAcl",
      name: "AllowSpecificIpAcl",
      rules: [OWASP_RULE, ...allowIpRules],
      scope: "REGIONAL",
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "AllowSpecificIpAclMetric",
      },
    })
  }
}
