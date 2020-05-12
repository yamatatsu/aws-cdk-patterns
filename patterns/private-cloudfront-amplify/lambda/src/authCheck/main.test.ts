import { sign } from "jsonwebtoken"
import { main } from "./main"

const clientId = "test_clientId"
const tokenIssuer = "test_tokenIssuer"
const secretKey = "test_secretKey"
const now = Date.now()
const keyid = "test_keyid"
const getSigningKeyMock = async () => secretKey
const token = sign(
  {
    sub: "test_user",
    aud: clientId,
    event_id: "test_event_id",
    token_use: "id",
    auth_time: now,
    iss: tokenIssuer,
    "cognito:username": "yamatatsu",
    exp: Date.now() + 1000 * 60 * 60,
    iat: now,
  },
  secretKey,
  { keyid },
)

test("main() return no_token if no cookie", async () => {
  const idToken = undefined
  const actual = await main(idToken, clientId, tokenIssuer, getSigningKeyMock)
  expect(actual).toEqual({ code: "no_token" })
})

test("main() return unparseable_token if dummy idToken", async () => {
  const idToken = "aaa"
  const actual = await main(idToken, clientId, tokenIssuer, getSigningKeyMock)
  expect(actual).toEqual({ code: "unparseable_token", decodedToken: null })
})

test("main() return invalid_token if dummy tokenIssuer", async () => {
  const idToken = token
  const actual = await main(
    idToken,
    clientId,
    "dummy_tokenIssuer",
    getSigningKeyMock,
  )
  expect(actual).toEqual({ code: "invalid_token", error: expect.any(Error) })
})

test("main() return valid_token", async () => {
  const idToken = token
  const actual = await main(idToken, clientId, tokenIssuer, getSigningKeyMock)
  expect(actual).toEqual({ code: "valid_token" })
})
