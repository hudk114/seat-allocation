/**
 * get random number from [0, number)
 * @param {Number} number
 */
export function getRandomNumber (number) {
  return Math.floor(number * Math.random());
}

/**
 * 获取count个[0, number)间的random数并返回
 * @param {Number} number
 * @param {Number} count
 */
export function random (number, count = 1) {
  if (number < count) return []; // TODO

  const arr = [];
  for (let i = 0; i < count; i++) {
    let n = -1;
    do {
      n = getRandomNumber(number);
    } while (arr.includes(n));
    arr.push(n);
  }

  return arr;
}

/**
 * 0 -> A， 26 -> AA
 */
export function numToLetter (number) {
  if (number > 25) {
    let count = Math.floor(number / 26);
    return numToLetter(count - 1) + numToLetter(number - count * 26);
  }

  return String.fromCharCode(number + 65);
}
