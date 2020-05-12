import { rewrite } from "./lib"

test("Ends with domain", () => {
  const _old = "https://hoge.com"
  const _new = "https://hoge.com"
  expect(rewrite(_old)).toBe(_new)
})

test("Ends with domain and '/'", () => {
  const _old = "https://hoge.com/"
  const _new = "https://hoge.com/"
  expect(rewrite(_old)).toBe(_new)
})

test("Ends with directory", () => {
  const _old = "https://hoge.com/fuga"
  const _new = "https://hoge.com/fuga/index.html"
  expect(rewrite(_old)).toBe(_new)
})

test("Ends with directory and '/'", () => {
  const _old = "https://hoge.com/fuga/"
  const _new = "https://hoge.com/fuga/index.html"
  expect(rewrite(_old)).toBe(_new)
})

test("Ends with file name", () => {
  const _old = "https://hoge.com/fuga.html"
  const _new = "https://hoge.com/fuga.html"
  expect(rewrite(_old)).toBe(_new)
})
