/**
 * 每一排座位的数据结构
 * 设计时考虑
 * 能快速的获取：1. 该line剩余座位数 emptySeatCount；
 *              2. 该line最大剩余连排座位数 maxConSeatCount；
 * 提供方法： 1. 获取拥有count个连排座位的seatIndexArray；
 *           3. 锁定与释放从index位置开始的count个位置；
 * 后续改进： 1. 边界条件界定时根据产品需求给出更友善的错误提示；
 */

import { innerError } from '../util/error';

export default class Line {
  // seats = []; // 剩余的位置，{ index: 起始点, seatCount: 起始点开始有几个空位 }
  // lock = false;
  // seatTotalCount = 0;

  constructor (seatTotalCount) {
    this._init(seatTotalCount);
  }

  /**
   * 获取index位置的座位在seats中的正确插入位置
   * 如果index在this.seats中，返回其在seats中的位置，否则返回其插入后应当在的位置
   * @param {*} index
   * @param {Array} seats<seat>
   */
  static getPosition (index, seats) {
    // TODO 二分法
    let i = 0;
    for (; i < seats.length; i++) {
      let seat = seats[i];
      if (seat.index + seat.seatCount > index) return i; // 只要找到第一个右边界包裹index的即可，这说明index一定在seat中或在seat的左侧
    }

    return i;
  }

  /**
   * { index, seatCount } -> [index, index + 1, index + 2, ...]
   * @param {Object} seat
   * @param {Number} seat.index
   * @param {Number} seat.seatCount
   */
  static seatToArr ({ index, seatCount } = {}) {
    const arr = [];
    for (let i = 0; i < seatCount; i++) {
      arr.push(index + i);
    }

    return arr;
  }

  // 剩余的空位数量
  get emptySeatCount () {
    return this.seats.reduce((prev, curr) => prev + curr.seatCount, 0);
  }

  // 获取最大的连续空位长度
  get maxConSeatCount () {
    return Math.max(...this.seats.map(({ seatCount }) => seatCount));
  }

  _init (seatTotalCount) {
    this.seatTotalCount = seatTotalCount;
    this.seats = [
      {
        seatCount: seatTotalCount,
        index: 0
      }
    ];
  }

  _addLock (callback) {
    this.lock = true;
    callback();
    this.lock = false;
  }

  /**
   * 获取能放下count数量的index数组
   * 对于[{ index: 0, seatCount: 3 }]和count: 2, 应当返回[0, 1]， 因为位置0和1均可坐下两人
   * @param {Number} count
   */
  getPropertySeatIndex (count) {
    if (this.maxConSeatCount < count) return [];

    return this.seats
      .filter(seat => seat.seatCount >= count)
      .reduce((prev, curr) => {
        const arr = [];
        for (let i = curr.index; i <= curr.seatCount - count + curr.index; i++) {
          arr.push(i);
        }
        return prev.concat(arr);
      }, []);
  }

  /**
   * 锁定从index开始的count个位置
   * @param {Number} index
   * @param {Number} count
   * @returns {Array} seats<index: Number>
   */
  // FIXME 边界条件处理
  lockSeats (index, count) {
    if (this.lock) return false; // TODO
    this._addLock(_ => {
      if (this.seatCount < index + count) innerError();
      if (!this.getPropertySeatIndex(count).includes(index)) innerError();

      let correctPosIndex = Line.getPosition(index, this.seats);

      // this.seats[correctPosIndex]需要拆分
      let seat = this.seats[correctPosIndex];
      let newSeats = [
        {
          index: seat.index,
          seatCount: index - seat.index
        },
        {
          index: index + count,
          seatCount: seat.index + seat.seatCount - (index + count)
        }
      ].filter(({ seatCount }) => seatCount > 0);

      this.seats.splice(correctPosIndex, 1, ...newSeats);
    });

    return Line.seatToArr({
      index,
      seatCount: count
    });
  }

  /**
   * 释放从index开始的count个位置
   * @param {*} index
   * @param {*} count
   */
  // FIXME 包裹情况下的处理
  releaseSeats (index, count) {
    if (this.lock) return; // TODO
    this._addLock(_ => {
      if (index < 0 || index > this.seatTotalCount - 1) innerError();

      let correctPosIndex = Line.getPosition(index, this.seats);

      // 插入后前后两项可能需要合并
      let start = correctPosIndex;
      let deleteCount = 0;
      let newSeat = {
        index: index,
        seatCount: count
      };

      const last = this.seats[correctPosIndex - 1];
      if (last && last.index + last.seatCount >= index) {
        // 前项需合并
        start = correctPosIndex - 1;
        deleteCount++;
        newSeat = {
          index: last.index,
          seatCount:
            Math.max(last.index + last.seatCount, index + count) - last.index // 有可能整个包裹在last中
        };
      }

      const next = this.seats[correctPosIndex];
      if (next && next.index <= index + count) {
        // 后项需合并
        deleteCount++;
        let i = Math.min(newSeat.index, next.index); // 可能整个包裹在next中
        newSeat = {
          index: i,
          seatCount: next.index + next.seatCount - i
        };
      }

      this.seats.splice(start, deleteCount, newSeat);
    });
  }

  releaseAll () {
    if (this.lock) return; // TODO
    this._addLock(_ => {
      this._init(this.seatCount);
    });
  }
}
