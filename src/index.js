/**
 * 库代码入口
 */
import Line from './model/line';
import Section from './model/section';
import Gym from './model/gym';

import HalfRandomAllocation from './controller/half-random-allocation';

// export default Line;
// export default Section;
export default Gym;
export const allocation = new HalfRandomAllocation();
export const gym = new Gym(4);

// let gym = new Gym(4);
// halfRandom(gym, 5);