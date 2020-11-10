import getChallenge from "./getChallenge"

test("response shape", async () => {
  const result = await getChallenge()
  expect(result).toStrictEqual({
    statusCode: 201,
    body: expect.any(String),
  })
})

test("body shape", async () => {
  const result = await getChallenge()
  const body = JSON.parse(result.body ?? "")
  expect(body).toStrictEqual({
    challenge: expect.any(String),
  })
})
