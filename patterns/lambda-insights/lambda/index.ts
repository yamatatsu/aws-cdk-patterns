import { Handler } from "aws-lambda"

console.info("Loading function")

export const handler: Handler = async (event) => {
  console.info({ event })
  return { body: "Hello, Hello!!" }
}
