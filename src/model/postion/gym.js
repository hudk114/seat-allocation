/**
 * 整体体育馆的数据结构
 * 设计时考虑
 * 能快速的获取：1. 当前gym剩余座位数 emptySeatCount；
 *              2. 当前gym最大剩余连排座位数 maxConSeatCount；
 * 提供方法： 1. 获取拥有count个连排座位的sectionIndexArray；
 *           2. 获取第index个section
 * 后续改进： 1. 支持不同形状大小的扇区，添加addSection与removeSection方法；
 *           2. getPropertySectionIndex方法可以采用函数式；
 */

import Section from './section';

export default class Gym {
  constructor (sectionCount = 4, lineCount = 26, start = 50, gap = 2) {
    this._init(sectionCount, lineCount, start, gap);
  }

  // 剩余的空位数量
  get emptySeatCount () {
    return this.sections.reduce((prev, curr) => prev + curr.emptySeatCount, 0);
  }

  get maxConSeatCount () {
    return Math.max(...this.sections.map(section => section.maxConSeatCount));
  }

  _init (sectionCount = 4, lineCount = 26, start = 50, gap = 2) {
    this.sectionCount = sectionCount;
    this.lineCount = lineCount;
    this.start = start;
    this.gap = gap;
    this.sections = [];
    for (let i = 0; i < sectionCount; i++) {
      this.sections[i] = new Section(lineCount, start, gap);
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
    if (this.maxConSeatCount < count) return [];

    return this.sections.reduce((prev, section, sectionIndex) => {
      if (section.maxConSeatCount >= count) return prev.concat(sectionIndex);
      return prev;
    }, []);
  }

  releaseSeats (sectionIndex, lineIndex, seatIndex, count) {
    return this.getSection(sectionIndex).releaseSeats(lineIndex, seatIndex, count);
  }

  releaseAll () {
    this._init(this.sectionCount, this.lineCount, this.start, this.gap);
  }
}
