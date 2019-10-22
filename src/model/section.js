/**
 * 每一个扇区的数据结构
 * 设计时考虑
 * 能快速的获取：1. 当前section最大剩余连排座位数量；
 *            2. 每line的
 * 提供方法： 1. 锁定与释放第index行line的第seatIndex位置的count个位置；
 *          2. 锁定随机行的count座位数量；
 */

import Line from './line';
import { random } from '../util/index';

export default class Section {

  lines = []; // 行数据结构
  lock = false;
  lineCount = 0;
  start = 50;
  gap = 2;

  constructor (lineCount = 26, start = 50, gap = 2) {
    this._init(lineCount, start, gap);
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

  /**
   * 获取能放下count数量的line的index数组
   * @param {Number} count
   */
  _getPropertyLineIndex (count) {
    if (this.maxCount < count) return [];

    return this.lines.reduce((prev, line, lineIndex) => {
      if (line.maxCount >= count) return prev.concat(lineIndex);
      return prev;
    }, []);
  }

  /**
   * 锁定随机的长度为count的座位并返回
   * @param {Number} count
   */
  lockRandomSeat (count) {
    if (this.maxCount < count) return false; // TODO
    let arr = this._getPropertyLineIndex(count);
    let lineIndex = random(arr.length);

    return {
      lineIndex: lineIndex + 1,
      seats: this.lines[lineIndex].lockRandomSeat(count)
    };
  }

  lockSeat (index, seatIndex, count) {

  }

  releaseSeat (index, seatIndex, count) {

  }

  releaseAll () {

  }
}