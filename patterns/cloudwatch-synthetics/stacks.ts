import * as cdk from "@aws-cdk/core"
import * as synthetics from "@aws-cdk/aws-synthetics"
import * as s3 from "@aws-cdk/aws-s3"

export class CloudwatchSynthetics extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    new synthetics.Canary(this, "Canary", {
      artifactsBucketLocation: { bucket },
      // role?: iam.IRole
      timeToLive: cdk.Duration.minutes(5),
      schedule: synthetics.Schedule.once(),
      // startAfterCreation?: boolean
      // successRetentionPeriod: cdk.Duration.days(7),
      // failureRetentionPeriod: cdk.Duration.days(0),
      // canaryName?: string
      runtime: synthetics.Runtime.SYNTHETICS_NODEJS_PUPPETEER_3_0,
      test: synthetics.Test.custom({
        code: synthetics.Code.fromAsset(`${__dirname}/dist`),
        handler: "index.handler",
      }),
    })
  }
}
