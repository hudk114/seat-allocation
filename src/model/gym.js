/**
 * 整体体育馆的数据结构
 * 
 */

import Section from './section';

export default class Gym {

  sections = []; // 扇区
  lock = false;
  sectionCount = 0;

  constructor (sectionCount = 4) {
    this._init(sectionCount);
  }

  // 剩余的空位数量
  get seatCount () {
    return this.sections.reduce((prev, curr) => prev + curr.seatCount, 0);
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

  getSection (sectionIndex) {
    return this.sections[sectionIndex];
  }

  /**
   * 获取能放下count数量的section的index数组
   * @param {Number} count
   */
  // FIXME 函数式抽象
  getPropertySectionIndex (count) {
    if (this.maxCount < count) return [];

    return this.sections.reduce((prev, section, sectionIndex) => {
      if (section.maxCount >= count) return prev.concat(sectionIndex);
      return prev;
    }, []);
  }

  // lockSeat (index, seatIndex, count) {

  // }

  // releaseSeat (index, seatIndex, count) {

  // }

  // releaseAll () {

  // }
}