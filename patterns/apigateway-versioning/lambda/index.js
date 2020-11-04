console.info("Loading function")

exports.handler = async (event, context, callback) => {
  console.info({ event })

  return { statusCode: 201, body: "version v1.0.2" }
}
