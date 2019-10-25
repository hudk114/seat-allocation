import Allocation from './index.js';
import { random } from '../../util/index.js';

export default class AllRandomAllocation extends Allocation {
  // TODO 写得太丑陋了...
  static lockPostionByIndex (index, gym) {
    if (index >= gym.emptySeatCount) return false; // TODO

    let fixedIndex = index;
    let sectionIndex = -1;
    let lineIndex = -1;
    let seatIndex = -1;

    let sum = 0;
    let i = 0;

    for (; i < gym.sectionCount; i++) {
      sum += gym.getSection(i).emptySeatCount;
      if (sum > fixedIndex) break;
    }
    sectionIndex = i;
    for (i = 0; i < sectionIndex; i++) {
      fixedIndex -= gym.getSection(i).emptySeatCount;
    }

    let section = gym.getSection(sectionIndex);
    for (i = 0, sum = 0; i < section.lineCount; i++) {
      sum += section.getLine(i).emptySeatCount;
      if (sum > fixedIndex) break;
    }
    lineIndex = i;
    for (i = 0; i < lineIndex; i++) {
      fixedIndex -= section.getLine(i).emptySeatCount;
    }

    let line = section.getLine(lineIndex);
    seatIndex = line.getPropertySeatIndex(1)[fixedIndex];
    line.lockSeats(seatIndex, 1);

    return {
      sectionIndex,
      lineIndex,
      seatIndex
    };
  }

  /**
   * 全随机在gym里锁定count个位置
   * 根据定义的底层数据结构，这种方式的效率会相对比较低
   * 这是因为我认为这样的随机方式意义不大，且不太符合真实的产品逻辑行为
   * 半随机的方式基本可以取代这种随机方式
   * 随机扇区 -> 随机行 -> 随机连续count位置
   * @param {Object} gym
   * @param {Number} count
   */
  allocate (gym, count) {
    super.allocate(gym, count);

    let seatIndexs = random(gym.emptySeatCount, count);

    return seatIndexs.map(index => AllRandomAllocation.lockPostionByIndex(index, gym));
  }
}
