/**
 * user的manager类
 */
import User from '../model/user';

export default class UserManager {
  constructor (gym) {
    this.userList = new Set();
    this.maxUserId = 0;
    this.gym = gym;
  }

  createUser () {
    let user = new User(++this.maxUserId);
    this.userList.add(user);

    return user;
  }

  addUser (user) {
    if (!(user instanceof User)) return false;
    if (this.getUser(user.id)) return false; // id重复

    this.userList.add(user);
  }

  getUser (id) {
    return Array.from(this.userList).find(user => user.id === id);
  }

  rmUser (user) {
    let u = user;
    if (typeof u === 'number') u = this.getUser(u); // u为userId;
    if (!u) return false;

    // 调用user的remove方法取消其所有订单，随后从userList中删除
    u.clearAll();
    return this.userList.delete(u);
  }
}
