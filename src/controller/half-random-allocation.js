import Allocation from './allocation';
import { random } from '../util/index';
import { noEnoughPosError } from '../util/error';

export default class HalfRandomAllocation extends Allocation {
  /**
   * 半随机在gym里锁定count个位置
   * 随机扇区 -> 随机行 -> 随机连续count位置
   * 想要达到类似全随机的效果调用count次allocate(gym, 1)即可
   * @param {Object} gym
   * @param {Number} count
   */
  allocate (gym, count) {
    super.allocate(gym, count);
    if (gym.maxConSeatCount < count) noEnoughPosError();

    const propertySectionArr = gym.getPropertySectionIndex(count);
    const sectionIndex =
      propertySectionArr[random(propertySectionArr.length)[0]];
    const section = gym.getSection(sectionIndex);

    const propertyLineArr = section.getPropertyLineIndex(count);
    const lineIndex = propertyLineArr[random(propertyLineArr.length)[0]];
    const line = section.getLine(lineIndex);

    const propertySeatArr = line.getPropertySeatIndex(count);
    const seatIndex = propertySeatArr[random(propertySeatArr.length)[0]];
    const seats = line.lockSeats(seatIndex, count);

    seats.forEach(seatIndex => {
      // this.printSeats(sectionIndex, lineIndex, seatIndex);
      super.printSeats(sectionIndex, lineIndex, seatIndex); // FIXME rollup这个版本的babel对class打包貌似有问题
    });
  }
}
