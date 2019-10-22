/**
 * 整体体育馆的数据结构
 * 
 */

import Section from './section';
import { random } from '../util/index';

export default class Gym {

  sections = []; // 扇区
  lock = false;
  sectionCount = 0;

  constructor (sectionCount = 4) {
    this._init(sectionCount);
  }

  get maxCount() {
    return Math.max(...this.sections.map(section => section.maxCount));
  }

  _init (sectionCount) {
    this.sectionCount = sectionCount;
    this.sections = [];
    for (let i = 0; i < sectionCount; i++) {
      this.sections[i] = new Section();
    }
  }

  /**
   * 获取能放下count数量的section的index数组
   * @param {Number} count
   */
  // FIXME 函数式抽象
  _getPropertySectionIndex (count) {
    if (this.maxCount < count) return [];

    return this.sections.reduce((prev, section, sectionIndex) => {
      if (section.maxCount >= count) return prev.concat(sectionIndex);
      return prev;
    }, []);
  }

  /**
   * 锁定随机的长度为count的座位并返回
   * @param {Number} count
   */
  lockRandomSeat (count) {
    if (this.maxCount < count) return false; // TODO
    let arr = this._getPropertySectionIndex(count);
    let sectionIndex = random(arr.length);

    return {
      sectionIndex: sectionIndex + 1,
      ...this.sections[sectionIndex].lockRandomSeat(count)
    };
  }

  gagaga (count) {
    let {
      sectionIndex,
      lineIndex,
      seats,
    } = this.lockRandomSeat(count);

    seats.forEach(seat => {
      console.log(`票位置在： 第${sectionIndex}扇区 第${lineIndex}排 第${seat}号 `)
    });
  }

  // lockSeat (index, seatIndex, count) {

  // }

  // releaseSeat (index, seatIndex, count) {

  // }

  // releaseAll () {

  // }
}