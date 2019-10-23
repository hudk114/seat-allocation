/**
 * get random number from [0, number)
 * @param {Number} number
 */
export function random (number) {
  return Math.floor(number * Math.random());
}

export function error (msg) {
  return function () {
    throw new Error(msg);
  };
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
