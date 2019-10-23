import {
  numToLetter,
  error
} from '../util/index';

const illegalInput = error('【出票失败】输入票据数量非法');
const noEnoughPos = error('【出票失败】无足够的可选位置');

export default class Allocation {
  constructor() {}

  allocate (gym, count) {
    if (count < 1 || count > 5) illegalInput();
    if (gym.seatCount < count) noEnoughPos();
  }

  printSeats (sectionIndex, lineIndex, seatIndex) {
    console.log(`【出票成功】 位置： ${numToLetter(sectionIndex)}区 ${numToLetter(lineIndex)}排 ${seatIndex + 1}号 `);
  }
}
