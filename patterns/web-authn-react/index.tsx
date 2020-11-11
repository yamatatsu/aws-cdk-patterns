import React, { useState } from "react"
import reactDom from "react-dom"
import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
} from "react-router-dom"

type User = {}

const Router = () => {
  const [user, setUser] = useState<User | null>()
  const history = useHistory()

  return (
    <Switch>
      <Route path="/sign-in">
        <h2>Sign In</h2>

        <div>
          <button
            type="button"
            onClick={() => {
              setUser({})
              history.push("/")
            }}
          >
            login
          </button>
        </div>
        <div>
          <Link to="/sign-up">Sign Up</Link>
        </div>
      </Route>
      <Route path="/sign-up">
        <h2>Sign Up</h2>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            signUp().then(() => {
              history.push("/signed-in")
            })
          }}
        >
          <div>
            <label htmlFor="form-name">username:</label>
            <input type="text" name="form-name" id="form-name" />
          </div>
          <div>
            <button type="submit">Sign Up</button>
          </div>
        </form>
      </Route>
      <Route path="/">
        {!!user ? (
          <>
            <div>awesome Contents</div>
            <button
              type="button"
              onClick={() => {
                setUser(null)
                history.push("/sign-in")
              }}
            >
              signout
            </button>
          </>
        ) : (
          <Redirect to="/sign-in" />
        )}
      </Route>
    </Switch>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <h1>Web Authn Demo</h1>
      <Router />
    </BrowserRouter>
  )
}

reactDom.render(<App />, document.getElementById("app"))

async function signUp() {
  const response = await fetch(process.env.CHALLENGE_URL ?? "")
  const json = await response.json()
  const challenge = json.challenge
  if (!challenge || typeof challenge !== "string") {
    throw new Error(`challenge should be string.`)
  }

  navigator.credentials
    .create({
      publicKey: {
        attestation: "none",
        authenticatorSelection: {
          // authenticatorAttachment: AuthenticatorAttachment,
          requireResidentKey: false,
          userVerification: "preferred",
        },
        challenge: new TextEncoder().encode(challenge),
        // excludeCredentials?: PublicKeyCredentialDescriptor[],
        // extensions?: AuthenticationExtensionsClientInputs,
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" },
        ],
        rp: { name: "Yamatatsu WebAuthn Demo" },
        // timeout?: number,
        user: {
          id: new TextEncoder().encode("dummy-username"),
          name: "dummy-username",
          displayName: "Dummy taro",
          // icon?: string,
        },
      },
      // signal?: AbortSignal,
    })
    .then((res) => {
      console.log(res)
      return res
    })
    .catch((err) => console.error(err))
}
