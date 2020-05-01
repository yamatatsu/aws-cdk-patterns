console.info("Loading function")

exports.handler = async (event, context, callback) => {
  console.info({ event })
  switch (event.path) {
    case "/error":
      throw new Error("わざとです")
    case "/timeout":
      return new Promise((res) => setTimeout(res, 1000 * 5))
    case "/outofmemory":
      while (true) {
        m.push({})
      }
      return { statusCode: 201, body: JSON.stringify({ event }, null, 2) }
    default:
      return { statusCode: 201, body: JSON.stringify({ event }, null, 2) }
  }
}
