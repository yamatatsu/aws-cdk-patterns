import { APIGatewayProxyHandlerV2 } from "aws-lambda"
import _getChallenge from "./getChallenge"

console.info("Loading function")

export const getChallenge: APIGatewayProxyHandlerV2 = _getChallenge
