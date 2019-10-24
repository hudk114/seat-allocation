/**
 * 用户类
 * 用户绑定了对应对id与订单
 */
import {
  getRandomNumber,
  numToLetter
} from '../util/index';

export default class User {
  constructor (id, name = numToLetter(getRandomNumber(1000))) { // -。- name just for fun
    this.id = id;
    this.name = name;
    this.orders = new Set();
  }

  /**
   * 获取所有tickets
   */
  get tickets () {
    return Array.from(this.orders).filter(order => order.valid).reduce((prev, order) => prev.concat(order.tickets), []);
  }

  addOrder (order) {
    return this.orders.add(order);
  }

  removeOrder (order) {
    return this.orders.delete(order);
  }

  /**
   * 释放所有座位，并清空所有
   */
  clearAll () {
    Array.from(this.orders).forEach(order => {
      order.clear(); // TODO 后续可以处理成，有没释放的订单的情况下，不让删除用户
      this.orders.delete(order);
    });
  }
}
