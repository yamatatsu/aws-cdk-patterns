import { decode, verify } from "jsonwebtoken"

type Result =
  | { code: "no_token" }
  | { code: "unparseable_token"; decodedToken: string | null }
  | { code: "invalid_token"; error: Error }
  | { code: "valid_token" }

export const main = async (
  idToken: string | undefined,
  clientId: string,
  tokenIssuer: string,
  getSigningKey: (keyId: string) => Promise<string>,
): Promise<Result> => {
  if (!idToken) return { code: "no_token" }

  const decodedToken = decode(idToken, {
    complete: true,
  })
  if (!decodedToken || typeof decodedToken === "string") {
    return { code: "unparseable_token", decodedToken }
  }

  const jwk = await getSigningKey(decodedToken.header.kid)
  const option = { audience: clientId, issuer: tokenIssuer }

  try {
    verify(idToken, jwk, option)
  } catch (err) {
    return { code: "invalid_token", error: err }
  }

  return { code: "valid_token" }
}
