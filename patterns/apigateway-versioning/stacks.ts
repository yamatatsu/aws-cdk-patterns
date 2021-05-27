import {
  App,
  Stack,
  StackProps,
  RemovalPolicy,
  aws_lambda as lambda,
  aws_apigateway as apigateway,
} from "aws-cdk-lib"

export class ApigatewayVersioning extends Stack {
  constructor(parent: App, id: string, props?: StackProps) {
    super(parent, id, props)

    const handler = new lambda.Function(this, "Lambda", {
      code: new lambda.AssetCode("./lambda"),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_14_X,
      tracing: lambda.Tracing.ACTIVE,
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
      },
    })

    const restApi = new apigateway.RestApi(this, "RestApi", {
      restApiName: "ApiGatewayVersioning",
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      deployOptions: {
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
      },
      defaultIntegration: new apigateway.LambdaIntegration(handler),
    })

    const fixVersion = genFixVersion(this, handler, restApi)
    fixVersion("v1.0.0", "6")
    fixVersion("v1.0.1", "7")
    fixVersion("v1.0.2", handler.currentVersion.version)
  }
}

const genFixVersion =
  (scope: Stack, handler: lambda.IFunction, restApi: apigateway.IRestApi) =>
  (versionName: string, version: string) => {
    const _versionName = versionName.replace(/\./g, "_")

    const alias = lambda.Version.fromVersionAttributes(
      scope,
      `lambdaVersion_${_versionName}`,
      { lambda: handler, version },
    ).addAlias(_versionName)

    restApi.root.addResource(versionName).addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(alias),
    })
  }
