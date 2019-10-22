/**
 * 每一排座位的数据结构
 * 设计时考虑
 * 能快速的获取： 1. 该line最大剩余连排座位；
 *             2. 该line符合要求的剩余连排位置；
 * 提供方法： 1. 锁定与释放从index位置开始的count个位置；
 *          2. 锁定随机位置的count座位数量；
 */

import { random } from '../util/index';

export default class Line {

  seats = []; // 剩余的位置，{ index: 起始点, seatCount: 起始点开始有几个空位 }
  lock = false;
  seatCount = 0;

  constructor (seatCount) {
    this._init(seatCount);
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
      arr.push(index + i + 1);
    }

    return arr;
  }

  // 获取最长的空位长度
  get maxCount () {
    return Math.max(...this.seats.map(({ seatCount }) => seatCount));
  }

  _init (seatCount) {
    this.seatCount = seatCount;
    this.seats = [{
      seatCount,
      index: 0
    }];
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
  _getPropertySeatIndex (count) {
    if (this.maxCount < count) return [];

    return this.seats.filter(seat => seat.seatCount >= count)
      .reduce((prev, curr) => {
        const arr = [];
        for (let i = curr.index; i <= curr.seatCount - count + curr.index; i++) arr.push(i);
        return prev.concat(arr);
      }, []);
  }

  /**
   * 锁定随机的长度为count的座位并返回
   * @param {Number} count
   */
  lockRandomSeat (count) {
    if (this.maxCount < count) return false; // TODO
    let arr = this._getPropertySeatIndex(count);

    return this.lockSeat(arr[random(arr.length)], count);
  }

  /**
   * 锁定从index开始的count个位置
   * @param {Number} index
   * @param {Number} count
   * @returns {Array} seats<index: Number>
   */
  // FIXME 边界条件处理
  lockSeat (index, count) {
    if (this.lock) return false; // TODO
    this._addLock(_ => {
      if (this.seatCount < index + count) return false; // TODO 超出范围
      if (!this._getPropertySeatIndex(count).includes(index)) return false; // TODO index位置放不下

      let correctPosIndex = Line.getPosition(index, this.seats);

      // this.seats[correctPosIndex]需要拆分
      let seat = this.seats[correctPosIndex];
      let newSeats = [{
          index: seat.index,
          seatCount: index - seat.index
        }, {
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
  releaseSeat (index, count) {
    if (this.lock) return; // TODO
    this._addLock(_ => {
      if (this.seatCount < index) return false; // TODO 超出范围
  
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
          seatCount: Math.max(last.index + last.seatCount, index + count) - last.index, // 有可能整个包裹在last中
        };
      }

      const next = this.seats[correctPosIndex];
      if (next && next.index <= index + count) {
        // 后项需合并
        deleteCount++;
        let i = Math.min(newSeat.index, next.index); // 可能整个包裹在next中
        newSeat = {
          index: i,
          seatCount: next.index + next.seatCount - i,
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