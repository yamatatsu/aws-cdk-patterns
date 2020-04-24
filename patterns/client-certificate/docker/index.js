const https = require("https")
const http = require("http")
const fs = require("fs")
const url = require("url")
const express = require("express")
const AWS = require("aws-sdk")

// Getパラメータで渡されるOrg
const getOrgByParam = (req) => url.parse(req.url, true).query.o
// 実際の接続時に利用された証明書のOrg
const getOrgByCert = (res) => res.connection.getPeerCertificate().subject?.O
const getCertText = (orgByParam, orgByCert) =>
  `Param:${orgByParam}\nOrg  :${orgByCert}\n`

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
const options = {
  key: fs.readFileSync("./keys/server-key.pem"),
  cert: fs.readFileSync("./keys/server-crt.pem"),
  ca: fs.readFileSync("./keys/ca-crt.pem"), // クライアント証明書
  requestCert: true, // クライアント認証（true:する, false:しない）
  rejectUnauthorized: true, // 認証失敗時に破棄（true:する, false:しない）
}
https.createServer(options, app).listen(443, () => {
  console.log(`Server is listening https!!`)
})

// non ssl server
http.createServer(app).listen(3000, () => {
  console.log(`Server is listening http!!`)
})
