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

export const calculateCardsAmount = (ratios) => {
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;

  for (const ratio of ratios) {
    const { maxWidth, cardHeight, cardsPerRow } = ratio;
    if (windowWidth < maxWidth) return Math.ceil(windowHeight / cardHeight) * cardsPerRow;
  }

  // NOTE: Fallback to the last ratio otherwise
  const { cardHeight, cardsPerRow } = ratios.slice(-1);

  // NOTE: Lets fetch 200% of the space to allow smooth infinite scrolling
  return Math.ceil(windowHeight / cardHeight) * cardsPerRow * 2;
};
