/**
 * FIXME: lambda@edge は環境変数をサポートしていないので、雑にignoreしたfileから読む。
 * https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/lambda-requirements-limits.html#lambda-requirements-lambda-function-configuration
 *
 * secret managerとかから読んだ方がエレガントかと思う。
 */
export const CLIENT_ID = "cognitoのクライアントID"
export const TOKEN_ISSUER =
  "https://cognito-idp.us-east-1.amazonaws.com/cognitoのuser_pool_id"
