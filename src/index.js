/**
 * 库代码入口
 */

import AllRandomAllocation from './controller/allocation/all-random-allocation';
import HalfRandomAllocation from './controller/allocation/half-random-allocation';
import OrderAllocation from './controller/allocation/order-allocation';
import UserManager from './controller/userManager';
import Gym from './model/postion/gym';
import OrderManager from './controller/orderManager';

import { exec } from './util/lock'; // 加锁

const RuleType = {
  random: new AllRandomAllocation(),
  'random-order': new HalfRandomAllocation(),
  order: new OrderAllocation()
};

const gym = new Gym(4, 26, 50, 2);

const userManager = new UserManager(gym);
const orderManager = new OrderManager(gym);

const user = userManager.createUser(); // TODO 移到服务端

// TODO 这里export的方法应当移到服务端作为ajax请求
export function createUser () {
  return userManager.createUser();
}

export function getUser (userId) {
  return userManager.getUser(userId);
}

/**
 * 创建一个订单
 * @param {*} type
 * @param {*} count
 */
export function createOrder (type, count) {
  return exec(_ => {
    let order = orderManager.createOrder(RuleType[type].allocate, count, user);
    user.addOrder(order);
    return order;
  });
}

export function cancelOrder (orderId) {
  return exec(_ => {
    return orderManager.cancelOrder(orderManager.getOrderById(orderId));
  });
}

export function deleteOrder (orderId) {
  return exec(_ => {
    let order = orderManager.getOrderById(orderId);
    user.removeOrder(order);
    return orderManager.deleteOrder(order);
  });
}

export function getAllOrders () {
  return Array.from(orderManager.orderList);
}

export function getAllTickets () {
  return user.tickets;
}

export function getUserInfo () {
  return Promise.resolve(user);
}

export function userExit () {
  // TODO
}
