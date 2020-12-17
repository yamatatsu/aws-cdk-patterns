const { promisify } = require('util')
const zlib = require('zlib')
const aws = require('aws-sdk')

const cloudwatch = new aws.CloudWatch({ region: 'ap-northeast-1' })

const pGunzip = promisify(zlib.gunzip)

/**
 * CloudWatch LogGroup の作成イベントをハンドリングして、
 * lambdaのメモリ使用量をカスタムメトリクスとして記録する関数
 * @see https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/SubscriptionFilters.html#LambdaFunctionExample
 * @param {*} input
 */
exports.handler = async (input) => {
  const zippedData = new Buffer(input.awslogs.data, 'base64')
  const data = await pGunzip(zippedData)
  const resultJson = JSON.parse(data.toString('utf-8'))

  const functionName = resultJson.logGroup.split('/').pop() // /aws/lambda/[functionName];
  const metricData = resultJson.logEvents
    .map((evt) => {
      const match = evt.message.match(
        /^REPORT.+Memory Size: (\d+) MB\sMax Memory Used: (\d+) MB/,
      )
      if (match === null) return null
      return createMetricData(functionName, match[1], match[2])
    })
    .filter((data) => data !== null)

  if (metricData.length === 0) {
    return
  }

  console.info(functionName, metricData)

  return cloudwatch
    .putMetricData({
      Namespace: 'Custom',
      MetricData: metricData,
    })
    .promise()
}

const createMetricData = (functionName, maxMemory, usedMemory) => ({
  MetricName: 'MemoryUtilization',
  Dimensions: [
    {
      Name: 'FunctionName',
      Value: functionName,
    },
  ],
  Unit: 'Percent',
  Value: (100.0 * Number(usedMemory)) / Number(maxMemory),
})
