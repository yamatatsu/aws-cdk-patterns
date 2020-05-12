/**
 * テスト見て
 */
export const rewrite = (uri: string) => {
  if (uri.match(/\/[^/^.]+$/)) return uri + "/index.html"
  if (uri.match(/\/[^/^.]+\/$/)) return uri + "index.html"
  return uri
}
