import "@aws-amplify/ui/dist/style.css"
import React, { useEffect, useState } from "react"
import { render } from "react-dom"
import { Auth } from "aws-amplify"
import { withAuthenticator } from "aws-amplify-react"

const isDev = process.env.NODE_ENV === "development"

Auth.configure({
  region: "us-east-1",
  userPoolId: "us-east-1_dlaYaRVxq",
  userPoolWebClientId: "6v6nivfgvpmrca71v7obigggjm",
  cookieStorage: {
    domain: isDev ? "localhost" : "d2e3oabn6p0qhu.cloudfront.net",
    path: "/",
    expires: 365,
    secure: !isDev,
  },
  authenticationFlowType: "USER_PASSWORD_AUTH",
})

const Redirect = () => {
  useEffect(() => {
    if (isDev) {
      alert("login!!")
    } else {
      location.assign("/")
    }
  })
  return null
}

const Login = withAuthenticator(Redirect)

type AuthState = "not_yet" | "done" | "unknown"
const App = () => {
  const [authState, setAuthState] = useState<AuthState>("unknown")
  useEffect(() => {
    Auth.currentSession().then(
      () => {
        setAuthState("done")
      },
      (error) => {
        setAuthState("not_yet")
      },
    )
  }, [authState])

  switch (authState) {
    case "unknown":
      return <p>wait...</p>
    case "not_yet":
      return <Login />
    case "done":
      return <Redirect />
  }
}

render(<App />, document.getElementById("root"))
