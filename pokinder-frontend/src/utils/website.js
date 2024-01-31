export function getDaenaLink(path) {
  if (/[a-zA-Z]$/.test(path)) {
    path = path.slice(0, -1);
  }
  return `https://if.daena.me/${path}/`;
}
