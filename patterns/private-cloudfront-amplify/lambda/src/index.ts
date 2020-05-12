import { CloudFrontRequestHandler } from "aws-lambda"
import { main } from "./authCheck/main"
import { getJwk, getIdToken, redirectResponse } from "./authCheck/lib"
import { CLIENT_ID, TOKEN_ISSUER } from "./config"
import { rewrite } from "./rewriteToIndexHtml/lib"

export const authCheck: CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request
  const domainName = request.headers["host"][0].value

  const idToken = getIdToken(request.headers, CLIENT_ID)
  const res = await main(idToken, CLIENT_ID, TOKEN_ISSUER, getJwk(TOKEN_ISSUER))

  switch (res.code) {
    case "no_token":
      console.info("No token in cookie.")
      return redirectResponse(domainName)
    case "unparseable_token":
      console.error(
        `Cannot parse JWT token. ${{
          res: res.decodedToken,
        }}`,
      )
      throw new Error("Cannot parse JWT token")
    case "invalid_token":
      console.info(res.error)
      return redirectResponse(domainName)
    case "valid_token":
      return request
  }
}

export const rewriteToIndexHtml: CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request

  const oldUri = request.uri
  const newUri = rewrite(oldUri)

  console.info({ from: oldUri, to: newUri })

  return { ...request, uri: newUri }
}
