export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomDeterministicBetween(determinant, min, max) {
  let hash = 0;
  for (let i = 0; i < determinant.length; i++) {
    hash = (hash * 31 + determinant.charCodeAt(i)) & 0xffffffff;
  }

  hash = Math.abs(hash);

  const range = max - min + 1;
  const result = min + (hash % range);

  return result;
}
