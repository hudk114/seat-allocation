/**
 * 每一个扇区的数据结构
 * 设计时考虑
 * 能快速的获取：1. 当前section剩余座位数 emptySeatCount；
 *              2. 当前section最大剩余连排座位数 maxConSeatCount；
 * 提供方法： 1. 获取拥有count个连排座位的lineIndexArray；
 *           2. 获取第index个line
 * 后续改进：
 */

import Line from './line';

export default class Section {
  constructor (lineCount = 26, start = 50, gap = 2) {
    this._init(lineCount, start, gap);
  }

  // 剩余的空位数量
  get emptySeatCount () {
    return this.lines.reduce((prev, curr) => prev + curr.emptySeatCount, 0);
  }

  get maxConSeatCount () {
    return Math.max(...this.lines.map(line => line.maxConSeatCount));
  }

  _init (lineCount = 26, start = 50, gap = 2) {
    this.lineCount = lineCount;
    this.start = start;
    this.gap = gap;
    this.lines = [];
    for (let i = 0; i < lineCount; i++) {
      this.lines[i] = new Line(start + gap * i);
    }
  }

  getLine (lineIndex) {
    return this.lines[lineIndex];
  }

  /**
   * 获取能放下count数量的line的index数组
   * @param {Number} count
   */
  getPropertyLineIndex (count) {
    if (this.maxConSeatCount < count) return [];

    return this.lines.reduce((prev, line, lineIndex) => {
      if (line.maxConSeatCount >= count) return prev.concat(lineIndex);
      return prev;
    }, []);
  }

  releaseSeats (lineIndex, seatIndex, count) {
    return this.getLine(lineIndex).releaseSeats(seatIndex, count);
  }

  releaseAll () {
    this._init(this.lineCount, this.start, this.gap);
  }
}
