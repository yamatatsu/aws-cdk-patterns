import { CloudFrontHeaders } from "aws-lambda"
import { promisify } from "util"
import { parse } from "cookie"
import jwksClient from "jwks-rsa"

export const redirectResponse = (domainName: string) => ({
  status: "307",
  statusDescription: "Temporary Redirect",
  headers: {
    location: [{ key: "location", value: `https://${domainName}/auth/` }],
  },
})

export function getIdToken(headers: CloudFrontHeaders, clientId: string) {
  if (!headers["cookie"]) return ""

  const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`

  const idToken = headers["cookie"]
    .map((header) => parse(header.value))
    .map((header) => Object.entries(header))
    .reduce((acc, header) => [...acc, ...header], []) // flatten
    .find(
      ([key, val]) => key.startsWith(keyPrefix) && key.endsWith(".idToken"),
    )?.[1]

  return idToken
}

export const getJwk = (tokenIssuer: string) => {
  const jwksRsa = jwksClient({
    cache: true,
    rateLimit: true,
    jwksUri: `${tokenIssuer}/.well-known/jwks.json`,
  })

  return async (keyId: string) => {
    const signingKey = await promisify(jwksRsa.getSigningKey)(keyId)
    return signingKey.getPublicKey()
  }
}
