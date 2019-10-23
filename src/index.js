/**
 * 库代码入口
 */
import Gym from './model/gym';

// import HalfRandomAllocation from './controller/half-random-allocation';
// import AllRandomAllocation from './controller/all-random-allocation';
import OrderAllocation from './controller/order-allocation';

// export default Line;
// export default Section;
export default Gym;
export const allocation = new OrderAllocation();
export const gym = new Gym(4);

/**
 * TODO 最外层加锁及等待队列
 * TODO UI
 */
