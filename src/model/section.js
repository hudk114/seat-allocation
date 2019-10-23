/**
 * 每一个扇区的数据结构
 * 设计时考虑
 * 能快速的获取：1. 当前section最大剩余连排座位数量；
 *            2. 每line的
 * 提供方法： 1. 锁定与释放第index行line的第seatIndex位置的count个位置；
 *          2. 锁定随机行的count座位数量；
 */

import Line from './line';

export default class Section {

  lines = []; // 排数据结构
  lock = false;
  lineCount = 0;
  start = 50;
  gap = 2;

  constructor (lineCount = 26, start = 50, gap = 2) {
    this._init(lineCount, start, gap);
  }

  // 剩余的空位数量
  get seatCount () {
    return this.lines.reduce((prev, curr) => prev + curr.seatCount, 0);
  }

  get maxCount() {
    return Math.max(...this.lines.map(line => line.maxCount));
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
    if (this.maxCount < count) return [];

    return this.lines.reduce((prev, line, lineIndex) => {
      if (line.maxCount >= count) return prev.concat(lineIndex);
      return prev;
    }, []);
  }

  lockSeat (index, seatIndex, count) {

  }

  releaseSeat (index, seatIndex, count) {

  }

  releaseAll () {

  }
}