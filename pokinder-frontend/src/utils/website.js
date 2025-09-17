export function getDaenaLink(path) {
  const isInteger = /^[+-]?\d+$/.test(path);

  if (isInteger) {
    return `https://www.fusiondex.org/${path}/`;
  }

  return `https://www.fusiondex.org/sprite/pif/${path}/`;
}
