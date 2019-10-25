import Ticket from './ticket';

/**
 * 订单数据结构
 * 订单创建后内容不可修改
 * 订单可以被取消，取消后状态不可变
 */
export default class Order {
  constructor (id, user, tickets = new Set(Ticket)) {
    this.id = id;
    this.user = user;
    this.tickets = tickets;
    this.time = new Date();
    this.valid = true;
  }

  get isValid () {
    return this.valid;
  }

  /**
   * 清除不会删除订单，只会释放订单
   */
  cancel () {
    if (!this.valid) return;
    this.valid = false;
    this.time = new Date();
    return this;
  }
}
