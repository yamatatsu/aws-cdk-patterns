import synthetics from "Synthetics" // Synthetics dependency

const basicPuppeteerExample = async function () {
  const page = await synthetics.getPage() // Get instrumented page from Synthetics
  await page.goto("https://example.com")
  await page.screenshot({ path: "/tmp/example.png" }) // Write screenshot to /tmp folder
}

export const handler = async () => {
  // Exported handler function
  return await basicPuppeteerExample()
}
