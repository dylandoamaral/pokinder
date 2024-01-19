export function getDaenaLink(path) {
  if (/[a-zA-Z]$/.test(path)) {
    path = path.slice(0, -1);
  }
  return `https://if.daena.me/${path}/`;
}

export function getDaenaLinkArtists(name) {
  var encodedName = encodeURIComponent(name);
  return `https://if.daena.me/artists/${encodedName}/`;
}
