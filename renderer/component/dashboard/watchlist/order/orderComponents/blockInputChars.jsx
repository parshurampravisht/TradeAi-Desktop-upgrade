export const blockInvalidChar = (e) =>
  ["e", "E", "+", "-"].includes(e.key) && e.preventDefault();

export const blockInvalidCharFnoBasket = (e) =>
  ["e", "E"].includes(e.key) && e.preventDefault();
