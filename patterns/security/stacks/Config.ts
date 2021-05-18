import {
  App,
  Stack,
  StackProps,
  RemovalPolicy,
  Duration,
  aws_config as config,
  aws_iam as iam,
  aws_s3 as s3,
  aws_sns as sns,
} from "aws-cdk-lib"

import { addSslOnlyPolicyToBucket } from "./util"

export class Config extends Stack {
  public readonly topic: sns.ITopic

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props)

    const bucket = new s3.Bucket(this, "ConfigBucket", {
      // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#s3-4-remediation
      encryption: s3.BucketEncryption.S3_MANAGED,
      // For private AWS account
      removalPolicy: RemovalPolicy.DESTROY,
    })
    // https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#s3-5-remediation
    addSslOnlyPolicyToBucket(bucket)

    const topic = new sns.Topic(this, "ConfigTopic")
    const role = new iam.Role(this, "ConfigRole", {
      assumedBy: new iam.ServicePrincipal("config.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSConfigRole",
        ),
      ],
      inlinePolicies: {
        ExternalSecretsPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["config:Put*"],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["s3:*"],
              resources: ["*"],
            }),
          ],
        }),
      },
    })

    const configurationRecorder = new config.CfnConfigurationRecorder(
      this,
      "ConfigurationRecorder",
      {
        roleArn: role.roleArn,
        recordingGroup: {
          allSupported: true,
          includeGlobalResourceTypes: true,
          resourceTypes: [],
        },
      },
    )

    // Configuration Recorder とは互いに依存させない。同時に作成しないと成功しないから。
    new config.CfnDeliveryChannel(this, "DeliveryChannel", {
      configSnapshotDeliveryProperties: {
        deliveryFrequency: "Six_Hours",
      },
      s3KeyPrefix: "delivery",
      s3BucketName: bucket.bucketName,
      snsTopicArn: topic.topicArn,
    })

    const accessKeysRotated = new config.AccessKeysRotated(
      this,
      "AccessKeysRotated",
      { maxAge: Duration.days(90) },
    )
    accessKeysRotated.node.addDependency(configurationRecorder)

    rulePropsList.forEach((ruleProps) => {
      const rule = new config.ManagedRule(
        this,
        `ManagedRule-${ruleProps.identifier}`,
        ruleProps,
      )
      rule.node.addDependency(configurationRecorder)
    })

    this.topic = topic
  }
}

const rulePropsList: {
  identifier: string
  inputParameters?: { [key: string]: any }
}[] = [
  { identifier: "ACCOUNT_PART_OF_ORGANIZATIONS" },
  { identifier: "ACM_CERTIFICATE_EXPIRATION_CHECK" },
  { identifier: "ALB_HTTP_DROP_INVALID_HEADER_ENABLED" },
  { identifier: "ALB_HTTP_TO_HTTPS_REDIRECTION_CHECK" },
  { identifier: "ALB_WAF_ENABLED" },
  { identifier: "API_GW_CACHE_ENABLED_AND_ENCRYPTED" },
  // {
  //   identifier: "API_GW_ENDPOINT_TYPE_CHECK",
  //   inputParameters: {
  //     endpointConfigurationType: ""
  //   }
  // },
  { identifier: "API_GW_EXECUTION_LOGGING_ENABLED" },
  // {
  //   identifier: "APPROVED_AMIS_BY_ID",
  //   inputParameters: {
  //     amiIds: ""
  //   }
  // },
  // {
  //   identifier: "APPROVED_AMIS_BY_TAG",
  //   inputParameters: {
  //     amisByTagKeyAndValue: ""
  //   }
  // },
  { identifier: "AUTOSCALING_GROUP_ELB_HEALTHCHECK_REQUIRED" },
  // {
  //   identifier: "CLOUDFORMATION_STACK_DRIFT_DETECTION_CHECK",
  //   inputParameters: {
  //     cloudformationRoleArn: ""
  //   }
  // },
  { identifier: "CLOUDFORMATION_STACK_NOTIFICATION_CHECK" },
  // {identifier: "CLOUDFRONT_DEFAULT_ROOT_OBJECT_CONFIGURED"},
  // {identifier: "CLOUDFRONT_ORIGIN_ACCESS_IDENTITY_ENABLED"},
  // {identifier: "CLOUDFRONT_ORIGIN_FAILOVER_ENABLED"},
  // {identifier: "CLOUDFRONT_SNI_ENABLED"},
  // {identifier: "CLOUDFRONT_VIEWER_POLICY_HTTPS"},
  { identifier: "CLOUD_TRAIL_CLOUD_WATCH_LOGS_ENABLED" },
  { identifier: "CLOUD_TRAIL_ENABLED" },
  { identifier: "CLOUD_TRAIL_ENCRYPTION_ENABLED" },
  { identifier: "CLOUD_TRAIL_LOG_FILE_VALIDATION_ENABLED" },
  { identifier: "CLOUDTRAIL_S3_DATAEVENTS_ENABLED" },
  { identifier: "CLOUDTRAIL_SECURITY_TRAIL_ENABLED" },
  // {
  //   identifier: "CLOUDWATCH_ALARM_ACTION_CHECK",
  //   inputParameters: {
  //     action1: "",
  //   }
  // },
  // {
  //   identifier: "CLOUDWATCH_ALARM_RESOURCE_CHECK",
  //   inputParameters: {
  //     resourceType: "",
  //     metricName: ""
  //   }
  // },
  // {
  //   identifier: "CLOUDWATCH_ALARM_SETTINGS_CHECK",
  //   inputParameters: {
  //     action1: "",
  //   }
  // },
  { identifier: "CLOUDWATCH_LOG_GROUP_ENCRYPTED" },
  { identifier: "CMK_BACKING_KEY_ROTATION_ENABLED" },
  { identifier: "CODEBUILD_PROJECT_ENVVAR_AWSCRED_CHECK" },
  { identifier: "CODEBUILD_PROJECT_SOURCE_REPO_URL_CHECK" },
  { identifier: "CODEPIPELINE_DEPLOYMENT_COUNT_CHECK" },
  { identifier: "CODEPIPELINE_REGION_FANOUT_CHECK" },
  { identifier: "CW_LOGGROUP_RETENTION_PERIOD_CHECK" },
  { identifier: "DAX_ENCRYPTION_ENABLED" },
  { identifier: "DB_INSTANCE_BACKUP_ENABLED" },
  // {
  //   identifier: "DESIRED_INSTANCE_TENANCY",
  //   inputParameters: {
  //     tenancy: "",
  //     imageId: "",
  //     hostId: "",
  //   }
  // },
  // {
  //   identifier: "DESIRED_INSTANCE_TYPE",
  //   inputParameters: {
  //     instanceType: "",
  //   }
  // },
  { identifier: "DMS_REPLICATION_NOT_PUBLIC" },
  { identifier: "DYNAMODB_AUTOSCALING_ENABLED" },
  { identifier: "DYNAMODB_IN_BACKUP_PLAN" },
  { identifier: "DYNAMODB_PITR_ENABLED" },
  { identifier: "DYNAMODB_TABLE_ENCRYPTED_KMS" },
  { identifier: "DYNAMODB_TABLE_ENCRYPTION_ENABLED" },
  { identifier: "DYNAMODB_THROUGHPUT_LIMIT_CHECK" },
  { identifier: "EBS_IN_BACKUP_PLAN" },
  { identifier: "EFS_IN_BACKUP_PLAN" },
  { identifier: "EC2_EBS_ENCRYPTION_BY_DEFAULT" },
  { identifier: "EBS_OPTIMIZED_INSTANCE" },
  { identifier: "EBS_SNAPSHOT_PUBLIC_RESTORABLE_CHECK" },
  { identifier: "EC2_INSTANCE_DETAILED_MONITORING_ENABLED" },
  { identifier: "EC2_INSTANCE_MANAGED_BY_SSM" },
  { identifier: "EC2_INSTANCE_NO_PUBLIC_IP" },
  { identifier: "INSTANCES_IN_VPC" },
  // {
  //   identifier: "EC2_MANAGEDINSTANCE_APPLICATIONS_BLACKLISTED",
  //   inputParameters: {
  //     applicationNames: [],
  //     platformType: "Linux"
  //   }
  // },
  // {
  //   identifier: "EC2_MANAGEDINSTANCE_APPLICATIONS_REQUIRED",
  //   inputParameters: {
  //     applicationNames: [],
  //     platformType: "Linux"
  //   }
  // },
  { identifier: "EC2_MANAGEDINSTANCE_ASSOCIATION_COMPLIANCE_STATUS_CHECK" },
  // {
  //   identifier: "EC2_MANAGEDINSTANCE_INVENTORY_BLACKLISTED",
  //   inputParameters: {
  //     applicationNames: [],
  //     platformType: "Linux"
  //   }
  // },
  { identifier: "EC2_MANAGEDINSTANCE_PATCH_COMPLIANCE_STATUS_CHECK" },
  // {identifier: "EC2_MANAGEDINSTANCE_PLATFORM_CHECK"},
  { identifier: "EC2_SECURITY_GROUP_ATTACHED_TO_ENI" },
  { identifier: "EC2_STOPPED_INSTANCE" },
  { identifier: "EC2_VOLUME_INUSE_CHECK" },
  { identifier: "EFS_ENCRYPTED_CHECK" },
  { identifier: "EIP_ATTACHED" },
  { identifier: "ELASTICSEARCH_ENCRYPTED_AT_REST" },
  { identifier: "ELASTICSEARCH_IN_VPC_ONLY" },
  { identifier: "ELASTICACHE_REDIS_CLUSTER_AUTOMATIC_BACKUP_CHECK" },
  { identifier: "EC2_IMDSV2_CHECK" },
  { identifier: "EKS_ENDPOINT_NO_PUBLIC_ACCESS" },
  { identifier: "EKS_SECRETS_ENCRYPTED" },
  { identifier: "ELASTICSEARCH_NODE_TO_NODE_ENCRYPTION_CHECK" },
  { identifier: "ELB_CROSS_ZONE_LOAD_BALANCING_ENABLED" },
  { identifier: "ELB_TLS_HTTPS_LISTENERS_ONLY" },
  { identifier: "ELB_ACM_CERTIFICATE_REQUIRED" },
  // {
  //   identifier: "ELB_CUSTOM_SECURITY_POLICY_SSL_CHECK",
  //   inputParameters: {
  //     sslProtocolsAndCiphers: ""
  //   }
  // },
  { identifier: "ELB_DELETION_PROTECTION_ENABLED" },
  { identifier: "ELB_LOGGING_ENABLED" },
  // {
  //   identifier: "ELB_PREDEFINED_SECURITY_POLICY_SSL_CHECK",
  //   inputParameters: {
  //     predefinedPolicyName: ""
  //   }
  // },
  // {identifier: "EMR_KERBEROS_ENABLED"},
  { identifier: "EMR_MASTER_NO_PUBLIC_IP" },
  { identifier: "ENCRYPTED_VOLUMES" },
  // {identifier: "FMS_SECURITY_GROUP_AUDIT_POLICY_CHECK"},
  // {identifier: "FMS_SECURITY_GROUP_CONTENT_CHECK"},
  // {identifier: "FMS_SECURITY_GROUP_RESOURCE_ASSOCIATION_CHECK"},
  // {identifier: "FMS_SHIELD_RESOURCE_POLICY_CHECK"},
  // {identifier: "FMS_WEBACL_RESOURCE_POLICY_CHECK"},
  // {identifier: "FMS_WEBACL_RULEGROUP_ASSOCIATION_CHECK"},
  { identifier: "GUARDDUTY_ENABLED_CENTRALIZED" },
  // {identifier: "GUARDDUTY_NON_ARCHIVED_FINDINGS"},
  { identifier: "IAM_NO_INLINE_POLICY_CHECK" },
  { identifier: "IAM_GROUP_HAS_USERS_CHECK" },
  {
    identifier: "IAM_PASSWORD_POLICY",
    inputParameters: {
      RequireUppercaseCharacters: false,
      RequireLowercaseCharacters: false,
      RequireSymbols: false,
      RequireNumbers: false,
      MinimumPasswordLength: 14,
      PasswordReusePrevention: 1,
    },
  },
  // {identifier: "IAM_POLICY_BLACKLISTED_CHECK"},
  // {identifier: "IAM_POLICY_IN_USE"},
  { identifier: "IAM_POLICY_NO_STATEMENTS_WITH_ADMIN_ACCESS" },
  // {identifier: "IAM_ROLE_MANAGED_POLICY_CHECK"},
  { identifier: "IAM_ROOT_ACCESS_KEY_CHECK" },
  { identifier: "IAM_USER_GROUP_MEMBERSHIP_CHECK" },
  { identifier: "IAM_USER_MFA_ENABLED" },
  { identifier: "IAM_USER_NO_POLICIES_CHECK" },
  {
    identifier: "IAM_USER_UNUSED_CREDENTIALS_CHECK",
    inputParameters: {
      maxCredentialUsageAge: 90,
    },
  },
  // {identifier: "INTERNET_GATEWAY_AUTHORIZED_VPC_ONLY"},
  // {identifier: "KMS_CMK_NOT_SCHEDULED_FOR_DELETION"},
  { identifier: "LAMBDA_CONCURRENCY_CHECK" },
  { identifier: "LAMBDA_DLQ_CHECK" },
  { identifier: "LAMBDA_FUNCTION_PUBLIC_ACCESS_PROHIBITED" },
  // {identifier: "LAMBDA_FUNCTION_SETTINGS_CHECK"},
  // {identifier: "LAMBDA_INSIDE_VPC"},
  { identifier: "MFA_ENABLED_FOR_IAM_CONSOLE_ACCESS" },
  // {identifier: "MULTI_REGION_CLOUD_TRAIL_ENABLED"},
  { identifier: "RDS_CLUSTER_DELETION_PROTECTION_ENABLED" },
  { identifier: "RDS_INSTANCE_DELETION_PROTECTION_ENABLED" },
  { identifier: "RDS_INSTANCE_IAM_AUTHENTICATION_ENABLED" },
  { identifier: "RDS_LOGGING_ENABLED" },
  { identifier: "REDSHIFT_BACKUP_ENABLED" },
  { identifier: "RDS_IN_BACKUP_PLAN" },
  { identifier: "RDS_SNAPSHOT_ENCRYPTED" },
  { identifier: "REDSHIFT_REQUIRE_TLS_SSL" },
  { identifier: "RDS_ENHANCED_MONITORING_ENABLED" },
  { identifier: "RDS_INSTANCE_PUBLIC_ACCESS_CHECK" },
  { identifier: "RDS_MULTI_AZ_SUPPORT" },
  { identifier: "RDS_SNAPSHOTS_PUBLIC_PROHIBITED" },
  // {identifier: "RDS_STORAGE_ENCRYPTED"},
  // {identifier: "REDSHIFT_CLUSTER_CONFIGURATION_CHECK"},
  // {identifier: "REDSHIFT_CLUSTER_MAINTENANCESETTINGS_CHECK"},
  { identifier: "REDSHIFT_CLUSTER_PUBLIC_ACCESS_CHECK" },
  // {identifier: "REQUIRED_TAGS"},
  // {identifier: "RESTRICTED_INCOMING_TRAFFIC"},
  { identifier: "INCOMING_SSH_DISABLED" },
  { identifier: "ROOT_ACCOUNT_HARDWARE_MFA_ENABLED" },
  { identifier: "ROOT_ACCOUNT_MFA_ENABLED" },
  { identifier: "S3_BUCKET_DEFAULT_LOCK_ENABLED" },
  { identifier: "S3_DEFAULT_ENCRYPTION_KMS" },
  { identifier: "SECURITYHUB_ENABLED" },
  { identifier: "SNS_ENCRYPTED_KMS" },
  // {identifier: "S3_ACCOUNT_LEVEL_PUBLIC_ACCESS_BLOCKS"},
  // {identifier: "S3_BUCKET_BLACKLISTED_ACTIONS_PROHIBITED"},
  // {identifier: "S3_BUCKET_POLICY_NOT_MORE_PERMISSIVE"},
  // {identifier: "S3_BUCKET_LOGGING_ENABLED"},
  // {identifier: "S3_BUCKET_POLICY_GRANTEE_CHECK"},
  { identifier: "S3_BUCKET_PUBLIC_READ_PROHIBITED" },
  { identifier: "S3_BUCKET_PUBLIC_WRITE_PROHIBITED" },
  { identifier: "S3_BUCKET_REPLICATION_ENABLED" },
  { identifier: "S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED" },
  { identifier: "S3_BUCKET_SSL_REQUESTS_ONLY" },
  { identifier: "S3_BUCKET_VERSIONING_ENABLED" },
  // {identifier: "SAGEMAKER_ENDPOINT_CONFIGURATION_KMS_KEY_CONFIGURED"},
  // {identifier: "SAGEMAKER_NOTEBOOK_INSTANCE_KMS_KEY_CONFIGURED"},
  { identifier: "SAGEMAKER_NOTEBOOK_NO_DIRECT_INTERNET_ACCESS" },
  { identifier: "SECRETSMANAGER_ROTATION_ENABLED_CHECK" },
  { identifier: "SECRETSMANAGER_SCHEDULED_ROTATION_SUCCESS_CHECK" },
  // {identifier: "SERVICE_VPC_ENDPOINT_ENABLED"},
  // {identifier: "SHIELD_ADVANCED_ENABLED_AUTORENEW"},
  // {identifier: "SHIELD_DRT_ACCESS"},
  { identifier: "VPC_DEFAULT_SECURITY_GROUP_CLOSED" },
  // {identifier: "VPC_FLOW_LOGS_ENABLED"},
  // {identifier: "VPC_SG_OPEN_ONLY_TO_AUTHORIZED_PORTS"},
  { identifier: "VPC_VPN_2_TUNNELS_UP" },
  // {identifier: "WAF_CLASSIC_LOGGING_ENABLED"},
  // {identifier: "WAFV2_LOGGING_ENABLED"},
]
