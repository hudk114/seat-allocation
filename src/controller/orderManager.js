import Order from '../model/order';

export default class OrderManager {
  constructor (gym) {
    this.orderList = new Set();
    this.maxOrderId = 0;
    this.gym = gym;
  }

  createOrder (allocate, count, user) {
    let tickets = allocate(this.gym, count);
    let order = new Order(++this.maxOrderId, user, tickets);
    this.orderList.add(order);

    return order;
  }

  /**
   * 释放order中的全部seats
   * @param {Order} order
   */
  releaseOrder (order) {
    Array.from(order.tickets).forEach(({ sectionIndex, lineIndex, seatIndex }) => {
      this.gym.releaseSeats(sectionIndex, lineIndex, seatIndex, 1);
    });
  }

  /**
   * 取消order
   * @param {Order} order
   */
  cancelOrder (order) {
    this.releaseOrder(order);
    order.cancel();
  }

  /**
   * 删除order
   * @param {Order} order
   */
  deleteOrder (order) {
    this.releaseOrder(order);
    this.orderList.delete(order);
  }

  getOrderById (orderId) {
    return Array.from(this.orderList).find(({ id }) => id === orderId);
  }
}
