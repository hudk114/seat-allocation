import Allocation from './allocation';
import {
  random
} from '../util/index';

export default class HalfRandomAllocation extends Allocation {
  constructor () {
    super();
  }

  /**
   * 半随机在gym里锁定count个位置
   * 随机扇区 -> 随机行 -> 随机连续count位置
   * @param {Object} gym
   * @param {Number} count
   */
  allocate (gym, count) {
    super.allocate(gym, count);

    const propertySectionArr = gym.getPropertySectionIndex(count);
    const sectionIndex = propertySectionArr[random(propertySectionArr.length)];
    const section = gym.getSection(sectionIndex);

    const propertyLineArr = section.getPropertyLineIndex(count);
    const lineIndex = propertyLineArr[random(propertyLineArr.length)];
    const line = section.getLine(lineIndex);

    const propertySeatArr = line.getPropertySeatIndex(count);
    const seatIndex = propertySeatArr[random(propertySeatArr.length)];
    const seats = line.lockSeat(seatIndex, count);

    seats.forEach(seatIndex => {
      // this.printSeats(sectionIndex, lineIndex, seatIndex);
      super.printSeats(sectionIndex, lineIndex, seatIndex); // FIXME rollup这个版本的babel对class打包貌似有问题
    });
  }
}
