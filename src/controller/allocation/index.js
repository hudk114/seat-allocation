import { illegalInputError, noEnoughPosError } from '../../util/error';

export default class Allocation {
  allocate (gym, count) {
    if (count < 1 || count > 5) illegalInputError();
    if (gym.emptySeatCount < count) noEnoughPosError();
  }
}
