(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.row = {})));
}(this, (function (exports) { 'use strict';

  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  /**
   * 每一排座位的数据结构
   * 设计时考虑
   * 能快速的获取： 1. 该line剩余座位数；
   *             2.该line最大剩余连排座位；
   *             2. 该line符合要求的剩余连排位置；
   * 提供方法： 1. 锁定与释放从index位置开始的count个位置；
   *          2. 锁定随机位置的count座位数量；
   */

  var Line = function () {
    // 剩余的位置，{ index: 起始点, seatCount: 起始点开始有几个空位 }
    function Line(seatTotalCount) {
      _classCallCheck(this, Line);

      this.seats = [];
      this.lock = false;
      this.seatTotalCount = 0;

      this._init(seatTotalCount);
    }

    /**
     * 获取index位置的座位在seats中的正确插入位置
     * 如果index在this.seats中，返回其在seats中的位置，否则返回其插入后应当在的位置
     * @param {*} index
     * @param {Array} seats<seat>
     */


    _createClass(Line, [{
      key: "_init",
      value: function _init(seatTotalCount) {
        this.seatTotalCount = seatTotalCount;
        this.seats = [{
          seatCount: seatTotalCount,
          index: 0
        }];
      }
    }, {
      key: "_addLock",
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
      key: "getPropertySeatIndex",
      value: function getPropertySeatIndex(count) {
        if (this.maxCount < count) return [];

        return this.seats.filter(function (seat) {
          return seat.seatCount >= count;
        }).reduce(function (prev, curr) {
          var arr = [];
          for (var i = curr.index; i <= curr.seatCount - count + curr.index; i++) {
            arr.push(i);
          }return prev.concat(arr);
        }, []);
      }

      /**
       * 锁定随机的长度为count的座位并返回
       * @param {Number} count
       */
      // lockRandomSeat (count) {
      //   if (this.maxCount < count) return false; // TODO
      //   let arr = this.getPropertySeatIndex(count);

      //   return this.lockSeat(arr[random(arr.length)], count);
      // }

      /**
       * 锁定从index开始的count个位置
       * @param {Number} index
       * @param {Number} count
       * @returns {Array} seats<index: Number>
       */
      // FIXME 边界条件处理

    }, {
      key: "lockSeat",
      value: function lockSeat(index, count) {
        var _this = this;

        if (this.lock) return false; // TODO
        this._addLock(function (_) {
          var _seats;

          if (_this.seatCount < index + count) return false; // TODO 超出范围
          if (!_this.getPropertySeatIndex(count).includes(index)) return false; // TODO index位置放不下

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
      key: "releaseSeat",
      value: function releaseSeat(index, count) {
        var _this2 = this;

        if (this.lock) return; // TODO
        this._addLock(function (_) {
          if (_this2.seatCount < index) return false; // TODO 超出范围

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
      key: "releaseAll",
      value: function releaseAll() {
        var _this3 = this;

        if (this.lock) return; // TODO
        this._addLock(function (_) {
          _this3._init(_this3.seatCount);
        });
      }
    }, {
      key: "seatCount",


      // 剩余的空位数量
      get: function get() {
        return this.seats.reduce(function (prev, curr) {
          return prev + curr.seatCount;
        }, 0);
      }

      // 获取最大的连续空位长度

    }, {
      key: "maxCount",
      get: function get() {
        return Math.max.apply(Math, _toConsumableArray(this.seats.map(function (_ref2) {
          var seatCount = _ref2.seatCount;
          return seatCount;
        })));
      }
    }], [{
      key: "getPosition",
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
      key: "seatToArr",
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

  var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Section = function () {
    // 排数据结构
    function Section() {
      var lineCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 26;
      var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
      var gap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

      _classCallCheck$1(this, Section);

      this.lines = [];
      this.lock = false;
      this.lineCount = 0;
      this.start = 50;
      this.gap = 2;

      this._init(lineCount, start, gap);
    }

    // 剩余的空位数量


    _createClass$1(Section, [{
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
        if (this.maxCount < count) return [];

        return this.lines.reduce(function (prev, line, lineIndex) {
          if (line.maxCount >= count) return prev.concat(lineIndex);
          return prev;
        }, []);
      }
    }, {
      key: 'lockSeat',
      value: function lockSeat(index, seatIndex, count) {}
    }, {
      key: 'releaseSeat',
      value: function releaseSeat(index, seatIndex, count) {}
    }, {
      key: 'releaseAll',
      value: function releaseAll() {}
    }, {
      key: 'seatCount',
      get: function get() {
        return this.lines.reduce(function (prev, curr) {
          return prev + curr.seatCount;
        }, 0);
      }
    }, {
      key: 'maxCount',
      get: function get() {
        return Math.max.apply(Math, _toConsumableArray$1(this.lines.map(function (line) {
          return line.maxCount;
        })));
      }
    }]);

    return Section;
  }();

  var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _toConsumableArray$2(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Gym = function () {
    // 扇区
    function Gym() {
      var sectionCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;

      _classCallCheck$2(this, Gym);

      this.sections = [];
      this.lock = false;
      this.sectionCount = 0;

      this._init(sectionCount);
    }

    // 剩余的空位数量


    _createClass$2(Gym, [{
      key: '_init',
      value: function _init(sectionCount) {
        this.sectionCount = sectionCount;
        this.sections = [];
        for (var i = 0; i < sectionCount; i++) {
          this.sections[i] = new Section();
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
        if (this.maxCount < count) return [];

        return this.sections.reduce(function (prev, section, sectionIndex) {
          if (section.maxCount >= count) return prev.concat(sectionIndex);
          return prev;
        }, []);
      }

      // lockSeat (index, seatIndex, count) {

      // }

      // releaseSeat (index, seatIndex, count) {

      // }

      // releaseAll () {

      // }

    }, {
      key: 'seatCount',
      get: function get() {
        return this.sections.reduce(function (prev, curr) {
          return prev + curr.seatCount;
        }, 0);
      }
    }, {
      key: 'maxCount',
      get: function get() {
        return Math.max.apply(Math, _toConsumableArray$2(this.sections.map(function (section) {
          return section.maxCount;
        })));
      }
    }]);

    return Gym;
  }();

  /**
   * get random number from [0, number)
   * @param {Number} number
   */
  function random(number) {
    return Math.floor(number * Math.random());
  }

  function error(msg) {
    return function () {
      throw new Error(msg);
    };
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

  var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var illegalInput = error('【出票失败】输入票据数量非法');
  var noEnoughPos = error('【出票失败】无足够的可选位置');

  var Allocation = function () {
    function Allocation() {
      _classCallCheck$3(this, Allocation);
    }

    _createClass$3(Allocation, [{
      key: 'allocate',
      value: function allocate(gym, count) {
        if (count < 1 || count > 5) illegalInput();
        if (gym.seatCount < count) noEnoughPos();
      }
    }, {
      key: 'printSeats',
      value: function printSeats(sectionIndex, lineIndex, seatIndex) {
        console.log('\u3010\u51FA\u7968\u6210\u529F\u3011 \u4F4D\u7F6E\uFF1A ' + numToLetter(sectionIndex) + '\u533A ' + numToLetter(lineIndex) + '\u6392 ' + (seatIndex + 1) + '\u53F7 ');
      }
    }]);

    return Allocation;
  }();

  var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var HalfRandomAllocation = function (_Allocation) {
    _inherits(HalfRandomAllocation, _Allocation);

    function HalfRandomAllocation() {
      _classCallCheck$4(this, HalfRandomAllocation);

      return _possibleConstructorReturn(this, (HalfRandomAllocation.__proto__ || Object.getPrototypeOf(HalfRandomAllocation)).call(this));
    }

    /**
     * 半随机在gym里锁定count个位置
     * 随机扇区 -> 随机行 -> 随机连续count位置
     * @param {Object} gym
     * @param {Number} count
     */


    _createClass$4(HalfRandomAllocation, [{
      key: 'allocate',
      value: function allocate(gym, count) {
        var _this2 = this;

        _get(HalfRandomAllocation.prototype.__proto__ || Object.getPrototypeOf(HalfRandomAllocation.prototype), 'allocate', this).call(this, gym, count);

        var propertySectionArr = gym.getPropertySectionIndex(count);
        var sectionIndex = propertySectionArr[random(propertySectionArr.length)];
        var section = gym.getSection(sectionIndex);

        var propertyLineArr = section.getPropertyLineIndex(count);
        var lineIndex = propertyLineArr[random(propertyLineArr.length)];
        var line = section.getLine(lineIndex);

        var propertySeatArr = line.getPropertySeatIndex(count);
        var seatIndex = propertySeatArr[random(propertySeatArr.length)];
        var seats = line.lockSeat(seatIndex, count);

        seats.forEach(function (seatIndex) {
          // this.printSeats(sectionIndex, lineIndex, seatIndex);
          _get(HalfRandomAllocation.prototype.__proto__ || Object.getPrototypeOf(HalfRandomAllocation.prototype), 'printSeats', _this2).call(_this2, sectionIndex, lineIndex, seatIndex); // FIXME rollup这个版本的babel对class打包貌似有问题
        });
      }
    }]);

    return HalfRandomAllocation;
  }(Allocation);

  /**
   * 库代码入口
   */
  var allocation = new HalfRandomAllocation();
  var gym = new Gym(4);

  // let gym = new Gym(4);
  // halfRandom(gym, 5);

  exports.default = Gym;
  exports.allocation = allocation;
  exports.gym = gym;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
