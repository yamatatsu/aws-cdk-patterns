const https = require("https")
const http = require("http")
const fs = require("fs")
const url = require("url")
const AWS = require("aws-sdk")

const options = {
  key: fs.readFileSync("./keys/server-key.pem"),
  cert: fs.readFileSync("./keys/server-crt.pem"),
  ca: fs.readFileSync("./keys/ca-crt.pem"), // クライアント証明書
  requestCert: true, // クライアント認証（true:する, false:しない）
  rejectUnauthorized: true, // 認証失敗時に破棄（true:する, false:しない）
}

const handler = (req, res) => {
  // Getパラメータで渡されるOrg
  const orgByParam = url.parse(req.url, true).query.o
  // 実際の接続時に利用された証明書のOrg
  const orgByCert = res.connection.getPeerCertificate().subject?.O

  const outText = `Param:${orgByParam}\nOrg  :${orgByCert}\n`
  console.log(outText)

  // 一致しない場合406
  if (!orgByParam || !orgByCert || orgByParam !== orgByCert) {
    res.statusCode = 406
    res.end()
    return
  }

  res.setHeader("Content-Type", "text/plain")
  res.end(`Hello, world\n${outText}\n`)
}

// ssl server
https.createServer(options, handler).listen(443, () => {
  console.log(`Server is listening https!!`)
})

// non ssl server
http.createServer(handler).listen(3000, () => {
  console.log(`Server is listening http!!`)
})
