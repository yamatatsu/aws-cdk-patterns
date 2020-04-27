const https = require("https")
const http = require("http")
const fs = require("fs")
const url = require("url")
const express = require("express")
const AWS = require("aws-sdk")

const secretsManager = new AWS.SecretsManager({ region: "ap-northeast-1" })
const acm = new AWS.ACM({ region: "ap-northeast-1" })

const { SECRET_ID, SERVER_CERTIFICATE_ARN } = process.env

// Getパラメータで渡されるOrg
const getOrgByParam = (req) => url.parse(req.url, true).query.o
// 実際の接続時に利用された証明書のOrg
const getOrgByCert = (res) => res.connection.getPeerCertificate().subject?.O

const clientCertificateMiddleware = (req, res, next) => {
  const orgByParam = getOrgByParam(req)
  const orgByCert = getOrgByCert(res)

  console.log({ orgByParam, orgByCert })

  // 一致しない場合406
  if (!orgByParam || !orgByCert || orgByParam !== orgByCert) {
    res.statusCode = 406
    res.end()
  } else {
    next()
  }
}

const app = express()
app.use(clientCertificateMiddleware)
app.get("/", (req, res) => {
  const orgByParam = getOrgByParam(req)
  const orgByCert = getOrgByCert(res)
  res.send(
    `Hello, world. ${JSON.stringify({ orgByParam, orgByCert }, null, 2)}`,
  )
})

// ssl server
const secretPromise = secretsManager
  .getSecretValue({ SecretId: SECRET_ID })
  .promise()
  .then((secretData) => {
    console.info("Success `secretsManager.getSecretValue`")

    const secret = JSON.parse(secretData.SecretString)
    const [SERVER_KEY, SERVER_CRT, CA_CRT] = [
      "SERVER_KEY",
      "SERVER_CRT",
      "CA_CRT",
    ].map((name) => secret[name].replace(/\\n/g, "\n"))

    const options = {
      key: SERVER_KEY,
      cert: SERVER_CRT,
      ca: CA_CRT, // クライアント証明書のCA証明書
      requestCert: true, // クライアント認証（true:する, false:しない）
      rejectUnauthorized: true, // 認証失敗時に破棄（true:する, false:しない）
    }
    https.createServer(options, app).listen(443, () => {
      console.log(`Server is listening https!!`)
    })
  })

// non ssl server
http.createServer(app).listen(3000, () => {
  console.log(`Server is listening http!!`)
})
