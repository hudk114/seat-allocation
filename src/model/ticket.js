/**
 * 一张牌
 */

import { numToLetter } from '../util/index';

export default class Ticket {
  constructor (sectionIndex, lineIndex, seatIndex) {
    this.sectionIndex = sectionIndex;
    this.lineIndex = lineIndex;
    this.seatIndex = seatIndex;
  }

  get position () {
    return `${numToLetter(this.sectionIndex)}区 ${numToLetter(this.lineIndex)}排 ${this.seatIndex + 1}号`;
  }
}
