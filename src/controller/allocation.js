import { numToLetter } from '../util/index';
import { illegalInputError, noEnoughPosError } from '../util/error';

export default class Allocation {
  allocate (gym, count) {
    if (count < 1 || count > 5) illegalInputError();
    if (gym.emptySeatCount < count) noEnoughPosError();
  }

  printSeats (sectionIndex, lineIndex, seatIndex) {
    console.log(
      `【出票成功】 位置： ${numToLetter(sectionIndex)}区 ${numToLetter(
        lineIndex
      )}排 ${seatIndex + 1}号 `
    );
  }
}
