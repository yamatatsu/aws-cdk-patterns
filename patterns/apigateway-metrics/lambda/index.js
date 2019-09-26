console.info("Loading function")

exports.handler = async (event, context, callback) => {
  console.info({ event, context })
  return { statusCode: 201, body: "" }
}
