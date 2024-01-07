export function deleteQueryParameter(rawUrl, name) {
  const url = new URL(rawUrl);
  const params = new URLSearchParams(url.search);
  params.delete(name);
  url.search = params.toString();
  return url.toString();
}

export function upsertQueryParameter(rawUrl, name, value) {
  const url = new URL(rawUrl);
  const params = new URLSearchParams(url.search);
  params.set(name, value);
  url.search = params.toString();
  return url.toString();
}
