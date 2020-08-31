import cdk = require("@aws-cdk/core")
import lambda = require("@aws-cdk/aws-lambda")
import apigateway = require("@aws-cdk/aws-apigateway")
import cognito = require("@aws-cdk/aws-cognito")

class ApigatewayCognito extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)

    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      /**
       * emailのみにすると SignUp API にて UsernameExistsException によるユーザー存在確認ができてしまう。
       * `username: true` を追加することで メール疎通以前においてメアド重複エラーが発生しなくなるため、ユーザー存在確認ができなくなる。
       * ただし username の入力が必須になる。変更はできないので変更機能の実装は不要。
       * 変更もしたい場合は preferred_username を使う。
       *
       * SignUp API の呼び出しサンプル
       *
       * curl https://cognito-idp.ap-northeast-1.amazonaws.com/ \
       *   -H 'Content-Type: application/x-amz-json-1.1' \
       *   -H 'x-amz-target: AWSCognitoIdentityProviderService.SignUp' \
       *   -d '{"ClientId":"xxxxxxxxxxxxxxxxx","Username":"hogehoge","UserAttributes": [{"Name":"email","Value":"xxxxxxxxxx@gmail.com"}],"Password": "xxxxxxxxxx","ValidationData":null}'
       *
       * curl https://cognito-idp.ap-northeast-1.amazonaws.com/ \
       *   -H 'Content-Type: application/x-amz-json-1.1' \
       *   -H 'x-amz-target: AWSCognitoIdentityProviderService.ConfirmSignUp' \
       *   -d '{"ClientId":"xxxxxxxxxxxxxxxxx","Username":"hogehoge","ConfirmationCode":"xxxxxx"}'
       */
      signInAliases: { username: true, email: true },
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
    })
    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      authFlows: { userSrp: true, refreshToken: true },
    })

    new cognito.UserPoolDomain(this, "UserPoolDomain", {
      userPool,
      cognitoDomain: { domainPrefix: `yamatatsu-apigateway-example` },
    })

    const handler = new lambda.Function(this, "Lambda", {
      code: new lambda.AssetCode("./lambda"),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
    })

    const restApi = new apigateway.RestApi(this, "RestApi", {
      restApiName: "ApigatewayCognito_RestApi",
      deploy: true,
    })

    const cognitoAuthrizer = new apigateway.CfnAuthorizer(
      this,
      "CfnAuthorizer",
      {
        name: "Cognito-Userpool",
        type: "COGNITO_USER_POOLS",
        restApiId: restApi.restApiId,
        identitySource: "method.request.header.x-ytoken",
        providerArns: [userPool.userPoolArn],
      },
    )

    restApi.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(handler),
      defaultMethodOptions: {
        authorizer: {
          authorizationType: apigateway.AuthorizationType.COGNITO,
          authorizerId: cognitoAuthrizer.ref,
        },
      },
    })
  }
}

const app = new cdk.App()
new ApigatewayCognito(app, "ApigatewayCognito", {
  stackName: "ApigatewayCognito",
})
