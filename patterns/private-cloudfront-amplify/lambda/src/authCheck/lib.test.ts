import { getIdToken } from "./lib"

test("getIdToken get undefined if no cookie", () => {
  const clientId = "test_clientId"
  const headers = {}
  expect(getIdToken(headers, clientId)).toBeUndefined()
})

test("getIdToken get undefined if empty cookie", () => {
  const clientId = "test_clientId"
  const headers = {
    cookie: [],
  }
  expect(getIdToken(headers, clientId)).toBeUndefined()
})

test("getIdToken get undefined if cookie doesn't have idToken", () => {
  const clientId = "test_clientId"
  const headers = {
    cookie: [
      { value: "" },
      {
        value: `CognitoIdentityServiceProvider.${clientId}.LastAuthUser=yamatatsu`,
      },
      {
        value: `CognitoIdentityServiceProvider.${clientId}.yamatatsu.clockDrift=0`,
      },
      { value: "amplify-signin-with-hostedUI=false" },
    ],
  }
  expect(getIdToken(headers, clientId)).toBeUndefined()
})

test("getIdToken idToken", () => {
  const clientId = "test_clientId"
  const headers = {
    cookie: [
      { value: "" },
      {
        value: `CognitoIdentityServiceProvider.${clientId}.LastAuthUser=yamatatsu`,
      },
      {
        value: `CognitoIdentityServiceProvider.${clientId}.yamatatsu.clockDrift=0`,
      },
      { value: "amplify-signin-with-hostedUI=false" },
      {
        value: `CognitoIdentityServiceProvider.${clientId}.yamatatsu.idToken=test_idToken`,
      },
    ],
  }
  expect(getIdToken(headers, clientId)).toEqual("test_idToken")
})
