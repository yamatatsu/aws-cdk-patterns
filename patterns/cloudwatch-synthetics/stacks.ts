// FIXME: RCにはまだ synthetics が実装されていない。実装を待つ。
// import {
//   App,
//   Stack,
//   StackProps,
//   RemovalPolicy,
//   Duration,
//   aws_synthetics as synthetics,
//   aws_s3 as s3,
// } from "aws-cdk-lib"

// type Props = StackProps & {
//   code: synthetics.Code
// }

// export class CloudwatchSynthetics extends Stack {
//   constructor(parent: App, id: string, props: Props) {
//     super(parent, id, props)

//     const bucket = new s3.Bucket(this, "Bucket", {
//       removalPolicy: RemovalPolicy.DESTROY,
//     })

//     new synthetics.Canary(this, "Canary", {
//       artifactsBucketLocation: { bucket },
//       // role?: iam.IRole
//       timeToLive: Duration.minutes(5),
//       schedule: synthetics.Schedule.once(),
//       // startAfterCreation?: boolean
//       // successRetentionPeriod: Duration.days(7),
//       // failureRetentionPeriod: Duration.days(0),
//       // canaryName?: string
//       runtime: synthetics.Runtime.SYNTHETICS_NODEJS_PUPPETEER_3_0,
//       test: synthetics.Test.custom({
//         code: props.code,
//         handler: "index.handler",
//       }),
//     })
//   }
// }
