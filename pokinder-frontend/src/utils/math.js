export const pythagoras = (x, y) => {
  return Math.sqrt(x ** 2 + y ** 2);
};

export const normalize = (arr) => {
  const sum = Math.abs(arr[0]) + Math.abs(arr[1]);

  return arr.map((value) => value / sum);
};

export const clamp = (val, min, max) => {
  return val > max ? max : val < min ? min : val;
};
