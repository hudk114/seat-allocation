import Allocation from './index.js';
import { noEnoughPosError } from '../../util/error';

export default class OrderAllocation extends Allocation {
  /**
   * 根据顺序在gym里锁定连续count个位置
   * 简单模拟类似用户行为的一种方式
   * 扇区顺序 1 -> 2 -> 0 -> 4
   * 排顺序 从前向后
   * 座位顺序 从前往后依次排列
   * 根据真实产品逻辑，这里的逻辑可以随意调整
   * 或编写新的class
   * @param {Object} gym
   * @param {Number} count
   */
  allocate (gym, count) {
    super.allocate(gym, count);
    // TODO 如果没有连续的count，拆分： 例如 4 = 2 + 2， 5 = 2 + 2 + 1 然后递归调用该方法即可
    if (gym.maxConSeatCount < count) noEnoughPosError();

    const sectionIndex = [1, 2, 0, 4].find(
      index => gym.getSection(index).maxConSeatCount >= count
    );
    const section = gym.getSection(sectionIndex);

    const lineIndex = section.lines.findIndex(
      line => line.maxConSeatCount >= count
    );
    const line = section.getLine(lineIndex);

    const seatIndex = line.getPropertySeatIndex(count)[0];
    const seats = line.lockSeats(seatIndex, count);

    return seats.map(seatIndex => ({
      sectionIndex,
      lineIndex,
      seatIndex
    }));
  }
}
