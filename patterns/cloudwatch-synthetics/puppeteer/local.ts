import puppeteer from "puppeteer-core"
;(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  })
  const page = await browser.newPage()
  await page.goto("https://example.com")
  await page.screenshot({ path: "/tmp/example.png" }) // Write screenshot to /tmp folder

  await browser.close()
})()
