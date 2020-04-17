import cdk = require("@aws-cdk/core")
import { Duration } from "@aws-cdk/core"
import lambda = require("@aws-cdk/aws-lambda")
import apigateway = require("@aws-cdk/aws-apigateway")
import cognito = require("@aws-cdk/aws-cognito")

class ApigatewayCognito extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const userPool = new cognito.UserPool(this, "UserPool", {})

    const handler = new lambda.Function(this, "Lambda", {
      code: new lambda.AssetCode("./lambda"),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {},
      timeout: Duration.seconds(10),
    })

    const restApi = new apigateway.LambdaRestApi(this, "RestApi", {
      handler,
      options: {
        restApiName: "ApigatewayCognito_RestApi",
        deploy: true,
      },
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.COGNITO,
        /**
         * If `authorizationType` is `Custom`, this specifies the ID of the method
         * authorizer resource.
         */
        // authorizer?: IAuthorizer,
        /**
         * Indicates whether the method requires clients to submit a valid API key.
         * @default false
         */
        // apiKeyRequired?: boolean,
        /**
         * The responses that can be sent to the client who calls the method.
         * @default None
         *
         * This property is not required, but if these are not supplied for a Lambda
         * proxy integration, the Lambda function must return a value of the correct format,
         * for the integration response to be correctly mapped to a response to the client.
         * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-settings-method-response.html
         */
        // methodResponses?: MethodResponse[],
        /**
         * The request parameters that API Gateway accepts. Specify request parameters
         * as key-value pairs (string-to-Boolean mapping), with a source as the key and
         * a Boolean as the value. The Boolean specifies whether a parameter is required.
         * A source must match the format method.request.location.name, where the location
         * is querystring, path, or header, and name is a valid, unique parameter name.
         * @default None
         */
        // requestParameters?: {
        //     [param: string]: boolean,
        // },
        /**
         * The resources that are used for the response's content type. Specify request
         * models as key-value pairs (string-to-string mapping), with a content type
         * as the key and a Model resource name as the value
         */
        // requestModels?: {
        //     [param: string]: IModel,
        // },
        /**
         * The ID of the associated request validator.
         */
        // requestValidator?: IRequestValidator,
      },
    })

    new apigateway.CfnAuthorizer(this, "CfnAuthorizer", {
      name: "CognitoAuthorizer",
      type: "COGNITO_USER_POOLS",
      restApiId: restApi.restApiId,
      providerArns: [userPool.userPoolArn],
      /**
       * `AWS::ApiGateway::Authorizer.IdentitySource`
       * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-authorizer.html#cfn-apigateway-authorizer-identitysource
       */
      // identitySource?: string,
    })
  }
}

const app = new cdk.App()
new ApigatewayCognito(app, "ApigatewayCognito", {
  stackName: "ApigatewayCognito",
})
