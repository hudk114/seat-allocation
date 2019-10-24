(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['seat-allocation'] = {})));
}(this, (function (exports) { 'use strict';

  function error(msg) {
    return function () {
      throw new Error(msg);
    };
  }

  var illegalInputError = error('【出票失败】 输入票据数量非法');
  var noEnoughPosError = error('【出票失败】 无足够的可选位置');
  var innerError = error('【出票失败】 内部错误');

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Allocation = function () {
    function Allocation() {
      _classCallCheck(this, Allocation);
    }

    _createClass(Allocation, [{
      key: 'allocate',
      value: function allocate(gym, count) {
        if (count < 1 || count > 5) illegalInputError();
        if (gym.emptySeatCount < count) noEnoughPosError();
      }
    }]);

    return Allocation;
  }();

  /**
   * get random number from [0, number)
   * @param {Number} number
   */
  function getRandomNumber(number) {
    return Math.floor(number * Math.random());
  }

  /**
   * 获取count个[0, number)间的random数并返回
   * @param {Number} number
   * @param {Number} count
   */
  function random(number) {
    var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    if (number < count) return []; // TODO

    var arr = [];
    for (var i = 0; i < count; i++) {
      var n = -1;
      do {
        n = getRandomNumber(number);
      } while (arr.includes(n));
      arr.push(n);
    }

    return arr;
  }

  /**
   * 0 -> A， 26 -> AA
   */
  function numToLetter(number) {
    if (number > 25) {
      var count = Math.floor(number / 26);
      return numToLetter(count - 1) + numToLetter(number - count * 26);
    }

    return String.fromCharCode(number + 65);
  }

  var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var AllRandomAllocation = function (_Allocation) {
    _inherits(AllRandomAllocation, _Allocation);

    function AllRandomAllocation() {
      _classCallCheck$1(this, AllRandomAllocation);

      return _possibleConstructorReturn(this, (AllRandomAllocation.__proto__ || Object.getPrototypeOf(AllRandomAllocation)).apply(this, arguments));
    }

    _createClass$1(AllRandomAllocation, [{
      key: 'allocate',


      /**
       * 全随机在gym里锁定count个位置
       * 根据定义的底层数据结构，这种方式的效率会相对比较低
       * 这是因为我认为这样的随机方式意义不大，且不太符合真实的产品逻辑行为
       * 半随机的方式基本可以取代这种随机方式
       * 随机扇区 -> 随机行 -> 随机连续count位置
       * @param {Object} gym
       * @param {Number} count
       */
      value: function allocate(gym, count) {
        _get(AllRandomAllocation.prototype.__proto__ || Object.getPrototypeOf(AllRandomAllocation.prototype), 'allocate', this).call(this, gym, count);

        var seatIndexs = random(gym.emptySeatCount, count);

        return seatIndexs.map(function (index) {
          return AllRandomAllocation.lockPostionByIndex(index, gym);
        });
      }
    }], [{
      key: 'lockPostionByIndex',

      // TODO 写得太丑陋了...
      value: function lockPostionByIndex(index, gym) {
        if (index >= gym.emptySeatCount) return false; // TODO

        var fixedIndex = index;
        var sectionIndex = -1;
        var lineIndex = -1;
        var seatIndex = -1;

        var sum = 0;
        var i = 0;

        for (; i < gym.sectionCount; i++) {
          sum += gym.getSection(i).emptySeatCount;
          if (sum > fixedIndex) break;
        }
        sectionIndex = i;
        for (i = 0; i < sectionIndex; i++) {
          fixedIndex -= gym.getSection(i).emptySeatCount;
        }

        var section = gym.getSection(sectionIndex);
        for (i = 0, sum = 0; i < section.lineCount; i++) {
          sum += section.getLine(i).emptySeatCount;
          if (sum > fixedIndex) break;
        }
        lineIndex = i;
        for (i = 0; i < lineIndex; i++) {
          fixedIndex -= section.getLine(i).emptySeatCount;
        }

        var line = section.getLine(lineIndex);
        seatIndex = line.getPropertySeatIndex(1)[fixedIndex];
        line.lockSeats(seatIndex, 1);

        return {
          sectionIndex: sectionIndex,
          lineIndex: lineIndex,
          seatIndex: seatIndex
        };
      }
    }]);

    return AllRandomAllocation;
  }(Allocation);

  var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get$1 = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var HalfRandomAllocation = function (_Allocation) {
    _inherits$1(HalfRandomAllocation, _Allocation);

    function HalfRandomAllocation() {
      _classCallCheck$2(this, HalfRandomAllocation);

      return _possibleConstructorReturn$1(this, (HalfRandomAllocation.__proto__ || Object.getPrototypeOf(HalfRandomAllocation)).apply(this, arguments));
    }

    _createClass$2(HalfRandomAllocation, [{
      key: 'allocate',

      /**
       * 半随机在gym里锁定count个位置
       * 随机扇区 -> 随机行 -> 随机连续count位置
       * 想要达到类似全随机的效果调用count次allocate(gym, 1)即可
       * @param {Object} gym
       * @param {Number} count
       */
      value: function allocate(gym, count) {
        _get$1(HalfRandomAllocation.prototype.__proto__ || Object.getPrototypeOf(HalfRandomAllocation.prototype), 'allocate', this).call(this, gym, count);
        if (gym.maxConSeatCount < count) noEnoughPosError();

        var propertySectionArr = gym.getPropertySectionIndex(count);
        var sectionIndex = propertySectionArr[random(propertySectionArr.length)[0]];
        var section = gym.getSection(sectionIndex);

        var propertyLineArr = section.getPropertyLineIndex(count);
        var lineIndex = propertyLineArr[random(propertyLineArr.length)[0]];
        var line = section.getLine(lineIndex);

        var propertySeatArr = line.getPropertySeatIndex(count);
        var seatIndex = propertySeatArr[random(propertySeatArr.length)[0]];
        var seats = line.lockSeats(seatIndex, count);

        return seats.map(function (seatIndex) {
          return {
            sectionIndex: sectionIndex,
            lineIndex: lineIndex,
            seatIndex: seatIndex
          };
        });
      }
    }]);

    return HalfRandomAllocation;
  }(Allocation);

  var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get$2 = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var OrderAllocation = function (_Allocation) {
    _inherits$2(OrderAllocation, _Allocation);

    function OrderAllocation() {
      _classCallCheck$3(this, OrderAllocation);

      return _possibleConstructorReturn$2(this, (OrderAllocation.__proto__ || Object.getPrototypeOf(OrderAllocation)).apply(this, arguments));
    }

    _createClass$3(OrderAllocation, [{
      key: 'allocate',

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
      value: function allocate(gym, count) {
        _get$2(OrderAllocation.prototype.__proto__ || Object.getPrototypeOf(OrderAllocation.prototype), 'allocate', this).call(this, gym, count);
        // TODO 如果没有连续的count，拆分： 例如 4 = 2 + 2， 5 = 2 + 2 + 1 然后递归调用该方法即可
        if (gym.maxConSeatCount < count) noEnoughPosError();

        var sectionIndex = [1, 2, 0, 4].find(function (index) {
          return gym.getSection(index).maxConSeatCount >= count;
        });
        var section = gym.getSection(sectionIndex);

        var lineIndex = section.lines.findIndex(function (line) {
          return line.maxConSeatCount >= count;
        });
        var line = section.getLine(lineIndex);

        var seatIndex = line.getPropertySeatIndex(count)[0];
        var seats = line.lockSeats(seatIndex, count);

        return seats.map(function (seatIndex) {
          return {
            sectionIndex: sectionIndex,
            lineIndex: lineIndex,
            seatIndex: seatIndex
          };
        });
      }
    }]);

    return OrderAllocation;
  }(Allocation);

  var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var User = function () {
    function User(id) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : numToLetter(getRandomNumber(1000));

      _classCallCheck$4(this, User);

      // -。- name just for fun
      this.id = id;
      this.name = name;
      this.orders = new Set();
    }

    /**
     * 获取所有tickets
     */


    _createClass$4(User, [{
      key: 'addOrder',
      value: function addOrder(order) {
        return this.orders.add(order);
      }
    }, {
      key: 'removeOrder',
      value: function removeOrder(order) {
        return this.orders.delete(order);
      }

      /**
       * 释放所有座位，并清空所有
       */

    }, {
      key: 'clearAll',
      value: function clearAll() {
        var _this = this;

        Array.from(this.orders).forEach(function (order) {
          order.clear(); // TODO 后续可以处理成，有没释放的订单的情况下，不让删除用户
          _this.orders.delete(order);
        });
      }
    }, {
      key: 'tickets',
      get: function get() {
        return Array.from(this.orders).filter(function (order) {
          return order.valid;
        }).reduce(function (prev, order) {
          return prev.concat(order.tickets);
        }, []);
      }
    }]);

    return User;
  }();

  var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var UserManager = function () {
    function UserManager(gym) {
      _classCallCheck$5(this, UserManager);

      this.userList = new Set();
      this.maxUserId = 0;
      this.gym = gym;
    }

    _createClass$5(UserManager, [{
      key: 'createUser',
      value: function createUser() {
        var user = new User(++this.maxUserId);
        this.userList.add(user);

        return user;
      }
    }, {
      key: 'addUser',
      value: function addUser(user) {
        if (!(user instanceof User)) return false;
        if (this.getUser(user.id)) return false; // id重复

        this.userList.add(user);
      }
    }, {
      key: 'getUser',
      value: function getUser(id) {
        return Array.from(this.userList).find(function (user) {
          return user.id === id;
        });
      }
    }, {
      key: 'rmUser',
      value: function rmUser(user) {
        var u = user;
        if (typeof u === 'number') u = this.getUser(u); // u为userId;
        if (!u) return false;

        // 调用user的remove方法取消其所有订单，随后从userList中删除
        u.clearAll();
        return this.userList.delete(u);
      }
    }]);

    return UserManager;
  }();

  var _createClass$6 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Line = function () {
    function Line(seatTotalCount) {
      _classCallCheck$6(this, Line);

      this._init(seatTotalCount);
    }

    /**
     * 获取index位置的座位在seats中的正确插入位置
     * 如果index在this.seats中，返回其在seats中的位置，否则返回其插入后应当在的位置
     * @param {*} index
     * @param {Array} seats<seat>
     */


    _createClass$6(Line, [{
      key: '_init',
      value: function _init(seatTotalCount) {
        this.seatTotalCount = seatTotalCount;
        this.seats = [{
          seatCount: seatTotalCount,
          index: 0
        }]; // 剩余的位置，{ index: 起始点, seatCount: 起始点开始有几个空位 }
      }
    }, {
      key: '_addLock',
      value: function _addLock(callback) {
        this.lock = true;
        callback();
        this.lock = false;
      }

      /**
       * 获取能放下count数量的index数组
       * 对于[{ index: 0, seatCount: 3 }]和count: 2, 应当返回[0, 1]， 因为位置0和1均可坐下两人
       * @param {Number} count
       */

    }, {
      key: 'getPropertySeatIndex',
      value: function getPropertySeatIndex(count) {
        if (this.maxConSeatCount < count) return [];

        return this.seats.filter(function (seat) {
          return seat.seatCount >= count;
        }).reduce(function (prev, curr) {
          var arr = [];
          for (var i = curr.index; i <= curr.seatCount - count + curr.index; i++) {
            arr.push(i);
          }
          return prev.concat(arr);
        }, []);
      }

      /**
       * 锁定从index开始的count个位置
       * @param {Number} index
       * @param {Number} count
       * @returns {Array} seats<index: Number>
       */
      // FIXME 边界条件处理

    }, {
      key: 'lockSeats',
      value: function lockSeats(index, count) {
        var _this = this;

        if (this.lock) return false; // TODO
        this._addLock(function (_) {
          var _seats;

          if (_this.seatCount < index + count) innerError();
          if (!_this.getPropertySeatIndex(count).includes(index)) innerError();

          var correctPosIndex = Line.getPosition(index, _this.seats);

          // this.seats[correctPosIndex]需要拆分
          var seat = _this.seats[correctPosIndex];
          var newSeats = [{
            index: seat.index,
            seatCount: index - seat.index
          }, {
            index: index + count,
            seatCount: seat.index + seat.seatCount - (index + count)
          }].filter(function (_ref) {
            var seatCount = _ref.seatCount;
            return seatCount > 0;
          });

          (_seats = _this.seats).splice.apply(_seats, [correctPosIndex, 1].concat(_toConsumableArray(newSeats)));
        });

        return Line.seatToArr({
          index: index,
          seatCount: count
        });
      }

      /**
       * 释放从index开始的count个位置
       * @param {*} index
       * @param {*} count
       */
      // FIXME 包裹情况下的处理

    }, {
      key: 'releaseSeats',
      value: function releaseSeats(index, count) {
        var _this2 = this;

        if (this.lock) return; // TODO
        this._addLock(function (_) {
          if (index < 0 || index > _this2.seatTotalCount - 1) innerError();

          var correctPosIndex = Line.getPosition(index, _this2.seats);

          // 插入后前后两项可能需要合并
          var start = correctPosIndex;
          var deleteCount = 0;
          var newSeat = {
            index: index,
            seatCount: count
          };

          var last = _this2.seats[correctPosIndex - 1];
          if (last && last.index + last.seatCount >= index) {
            // 前项需合并
            start = correctPosIndex - 1;
            deleteCount++;
            newSeat = {
              index: last.index,
              seatCount: Math.max(last.index + last.seatCount, index + count) - last.index // 有可能整个包裹在last中
            };
          }

          var next = _this2.seats[correctPosIndex];
          if (next && next.index <= index + count) {
            // 后项需合并
            deleteCount++;
            var i = Math.min(newSeat.index, next.index); // 可能整个包裹在next中
            newSeat = {
              index: i,
              seatCount: next.index + next.seatCount - i
            };
          }

          _this2.seats.splice(start, deleteCount, newSeat);
        });
      }
    }, {
      key: 'releaseAll',
      value: function releaseAll() {
        var _this3 = this;

        if (this.lock) return; // TODO
        this._addLock(function (_) {
          _this3._init(_this3.seatCount);
        });
      }
    }, {
      key: 'emptySeatCount',


      // 剩余的空位数量
      get: function get() {
        return this.seats.reduce(function (prev, curr) {
          return prev + curr.seatCount;
        }, 0);
      }

      // 获取最大的连续空位长度

    }, {
      key: 'maxConSeatCount',
      get: function get() {
        return Math.max.apply(Math, _toConsumableArray(this.seats.map(function (_ref2) {
          var seatCount = _ref2.seatCount;
          return seatCount;
        })));
      }
    }], [{
      key: 'getPosition',
      value: function getPosition(index, seats) {
        // TODO 二分法
        var i = 0;
        for (; i < seats.length; i++) {
          var seat = seats[i];
          if (seat.index + seat.seatCount > index) return i; // 只要找到第一个右边界包裹index的即可，这说明index一定在seat中或在seat的左侧
        }

        return i;
      }

      /**
       * { index, seatCount } -> [index, index + 1, index + 2, ...]
       * @param {Object} seat
       * @param {Number} seat.index
       * @param {Number} seat.seatCount
       */

    }, {
      key: 'seatToArr',
      value: function seatToArr() {
        var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            index = _ref3.index,
            seatCount = _ref3.seatCount;

        var arr = [];
        for (var i = 0; i < seatCount; i++) {
          arr.push(index + i);
        }

        return arr;
      }
    }]);

    return Line;
  }();

  var _createClass$7 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Section = function () {
    function Section() {
      var lineCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 26;
      var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
      var gap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

      _classCallCheck$7(this, Section);

      this._init(lineCount, start, gap);
    }

    // 剩余的空位数量


    _createClass$7(Section, [{
      key: '_init',
      value: function _init() {
        var lineCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 26;
        var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
        var gap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

        this.lineCount = lineCount;
        this.start = start;
        this.gap = gap;
        this.lines = [];
        for (var i = 0; i < lineCount; i++) {
          this.lines[i] = new Line(start + gap * i);
        }
      }
    }, {
      key: 'getLine',
      value: function getLine(lineIndex) {
        return this.lines[lineIndex];
      }

      /**
       * 获取能放下count数量的line的index数组
       * @param {Number} count
       */

    }, {
      key: 'getPropertyLineIndex',
      value: function getPropertyLineIndex(count) {
        if (this.maxConSeatCount < count) return [];

        return this.lines.reduce(function (prev, line, lineIndex) {
          if (line.maxConSeatCount >= count) return prev.concat(lineIndex);
          return prev;
        }, []);
      }
    }, {
      key: 'releaseSeats',
      value: function releaseSeats(lineIndex, seatIndex, count) {
        return this.getLine(lineIndex).releaseSeats(seatIndex, count);
      }
    }, {
      key: 'releaseAll',
      value: function releaseAll() {
        this._init(this.lineCount, this.start, this.gap);
      }
    }, {
      key: 'emptySeatCount',
      get: function get() {
        return this.lines.reduce(function (prev, curr) {
          return prev + curr.emptySeatCount;
        }, 0);
      }
    }, {
      key: 'maxConSeatCount',
      get: function get() {
        return Math.max.apply(Math, _toConsumableArray$1(this.lines.map(function (line) {
          return line.maxConSeatCount;
        })));
      }
    }]);

    return Section;
  }();

  var _createClass$8 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _toConsumableArray$2(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function _classCallCheck$8(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Gym = function () {
    // sections = []; // eslint-disable-line
    // lock = false;
    // sectionCount = 0;

    function Gym() {
      var sectionCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;
      var lineCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 26;
      var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 50;
      var gap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;

      _classCallCheck$8(this, Gym);

      this._init(sectionCount, lineCount, start, gap);
    }

    // 剩余的空位数量


    _createClass$8(Gym, [{
      key: '_init',
      value: function _init() {
        var sectionCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;
        var lineCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 26;
        var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 50;
        var gap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;

        this.sectionCount = sectionCount;
        this.lineCount = lineCount;
        this.start = start;
        this.gap = gap;
        this.sections = [];
        for (var i = 0; i < sectionCount; i++) {
          this.sections[i] = new Section(lineCount, start, gap);
        }
      }
    }, {
      key: 'getSection',
      value: function getSection(sectionIndex) {
        return this.sections[sectionIndex];
      }

      /**
       * 获取能放下count数量的section的index数组
       * @param {Number} count
       */
      // FIXME 函数式抽象

    }, {
      key: 'getPropertySectionIndex',
      value: function getPropertySectionIndex(count) {
        if (this.maxConSeatCount < count) return [];

        return this.sections.reduce(function (prev, section, sectionIndex) {
          if (section.maxConSeatCount >= count) return prev.concat(sectionIndex);
          return prev;
        }, []);
      }
    }, {
      key: 'releaseSeats',
      value: function releaseSeats(sectionIndex, lineIndex, seatIndex, count) {
        return this.getSection(sectionIndex).releaseSeats(lineIndex, seatIndex, count);
      }
    }, {
      key: 'releaseAll',
      value: function releaseAll() {
        this._init(this.sectionCount, this.lineCount, this.start, this.gap);
      }
    }, {
      key: 'emptySeatCount',
      get: function get() {
        return this.sections.reduce(function (prev, curr) {
          return prev + curr.emptySeatCount;
        }, 0);
      }
    }, {
      key: 'maxConSeatCount',
      get: function get() {
        return Math.max.apply(Math, _toConsumableArray$2(this.sections.map(function (section) {
          return section.maxConSeatCount;
        })));
      }
    }]);

    return Gym;
  }();

  var _createClass$9 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$9(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Ticket = function () {
    function Ticket(sectionIndex, lineIndex, seatIndex) {
      _classCallCheck$9(this, Ticket);

      this.sectionIndex = sectionIndex;
      this.lineIndex = lineIndex;
      this.seatIndex = seatIndex;
    }

    _createClass$9(Ticket, [{
      key: 'position',
      get: function get() {
        return numToLetter(this.sectionIndex) + '\u533A ' + numToLetter(this.lineIndex) + '\u6392 ' + (this.seatIndex + 1) + '\u53F7';
      }
    }]);

    return Ticket;
  }();

  var _createClass$a = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$a(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  /**
   * 订单数据结构
   * 订单创建后内容不可修改
   * 订单可以被取消，取消后状态不可变
   */

  var Order = function () {
    function Order(id) {
      var tickets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set(Ticket);

      _classCallCheck$a(this, Order);

      this.id = id;
      this.tickets = tickets;
      this.time = new Date();
      this.valid = true;
    }

    _createClass$a(Order, [{
      key: 'cancel',


      /**
       * 清除不会删除订单，只会释放订单
       */
      value: function cancel() {
        if (!this.valid) return;
        this.valid = false;
        this.time = new Date();
        return this;
      }
    }, {
      key: 'isValid',
      get: function get() {
        return this.valid;
      }
    }]);

    return Order;
  }();

  var _createClass$b = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$b(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var OrderManager = function () {
    function OrderManager(gym) {
      _classCallCheck$b(this, OrderManager);

      this.orderList = new Set();
      this.maxOrderId = 0;
      this.gym = gym;
    }

    _createClass$b(OrderManager, [{
      key: 'createOrder',
      value: function createOrder(allocate, count) {
        var tickets = allocate(this.gym, count);
        var order = new Order(++this.maxOrderId, tickets);
        this.orderList.add(order);

        return order;
      }

      /**
       * 释放order中的全部seats
       * @param {Order} order
       */

    }, {
      key: 'releaseOrder',
      value: function releaseOrder(order) {
        var _this = this;

        Array.from(order.tickets).forEach(function (_ref) {
          var sectionIndex = _ref.sectionIndex,
              lineIndex = _ref.lineIndex,
              seatIndex = _ref.seatIndex;

          _this.gym.releaseSeats(sectionIndex, lineIndex, seatIndex, 1);
        });
      }

      /**
       * 取消order
       * @param {Order} order
       */

    }, {
      key: 'cancelOrder',
      value: function cancelOrder(order) {
        this.releaseOrder(order);
        order.cancel();
      }

      /**
       * 删除order
       * @param {Order} order
       */

    }, {
      key: 'deleteOrder',
      value: function deleteOrder(order) {
        this.releaseOrder(order);
        this.orderList.delete(order);
      }
    }, {
      key: 'getOrderById',
      value: function getOrderById(orderId) {
        return Array.from(this.orderList).find(function (_ref2) {
          var id = _ref2.id;
          return id === orderId;
        });
      }
    }]);

    return OrderManager;
  }();

  /**
   * 加锁，悲观锁
   * 被锁的操作进入缓存队列等待执行
   */

  var lock = false;
  var cacheQueue = [];

  function exec(callback) {
    return new Promise(function (resolve) {
      if (lock) {
        cacheQueue.push(function (_) {
          resolve(callback());
        });
      } else {
        addLock(function (_) {
          resolve(callback());
        });
      }
    });
  }

  function addLock(callback) {
    lock = true;

    callback(); // TODO 因为没有db操作，所以此处简单处理均采用同步编写，之后可采用promise或者async改写

    // 清空cacheQueue
    if (cacheQueue.length) {
      addLock(cacheQueue.shift());
    }

    lock = false;
  }

  /**
   * 库代码入口
   */

  var RuleType = {
    random: new AllRandomAllocation(),
    'random-order': new HalfRandomAllocation(),
    order: new OrderAllocation()
  };

  var gym = new Gym(4, 26, 50, 2);

  var userManager = new UserManager(gym);
  var orderManager = new OrderManager(gym);

  var user = userManager.createUser(); // TODO 移到服务端

  // TODO 这里的方法应当移到服务端作为后端请求
  function createUser() {
    return userManager.createUser();
  }

  function getUser(userId) {
    return userManager.getUser(userId);
  }

  /**
   * 创建一个订单
   * @param {*} type
   * @param {*} count
   */
  function createOrder(type, count) {
    return exec(function (_) {
      var order = orderManager.createOrder(RuleType[type].allocate, count);
      user.addOrder(order);
      return order;
    });
  }

  function cancelOrder(orderId) {
    return exec(function (_) {
      return orderManager.cancelOrder(orderManager.getOrderById(orderId));
    });
  }

  function deleteOrder(orderId) {
    return exec(function (_) {
      var order = orderManager.getOrderById(orderId);
      user.removeOrder(order);
      return orderManager.deleteOrder(order);
    });
  }

  function getAllOrders() {
    return Array.from(orderManager.orderList);
  }

  function getAllTickets() {
    return user.tickets;
  }

  function getUserInfo() {
    return Promise.resolve(user);
  }

  function exit() {
    // TODO 
  }

  exports.gym = gym;
  exports.userManager = userManager;
  exports.orderManager = orderManager;
  exports.createUser = createUser;
  exports.getUser = getUser;
  exports.createOrder = createOrder;
  exports.cancelOrder = cancelOrder;
  exports.deleteOrder = deleteOrder;
  exports.getAllOrders = getAllOrders;
  exports.getAllTickets = getAllTickets;
  exports.getUserInfo = getUserInfo;
  exports.exit = exit;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
