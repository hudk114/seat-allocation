(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.row = {})));
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

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
      key: '_init',
      value: function _init(seatTotalCount) {
        this.seatTotalCount = seatTotalCount;
        this.seats = [{
          seatCount: seatTotalCount,
          index: 0
        }];
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
          }return prev.concat(arr);
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
          if (0 > index || index > _this2.seatTotalCount - 1) innerError();

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
        if (this.maxConSeatCount < count) return [];

        return this.lines.reduce(function (prev, line, lineIndex) {
          if (line.maxConSeatCount >= count) return prev.concat(lineIndex);
          return prev;
        }, []);
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

  var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _toConsumableArray$2(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Gym = function () {
    // 扇区
    function Gym() {
      var sectionCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;
      var lineCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 26;
      var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 50;
      var gap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;

      _classCallCheck$2(this, Gym);

      this.sections = [];
      this.lock = false;
      this.sectionCount = 0;

      this._init(sectionCount, lineCount, start, gap);
    }

    // 剩余的空位数量


    _createClass$2(Gym, [{
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

  var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Allocation = function () {
    function Allocation() {
      _classCallCheck$3(this, Allocation);
    }

    _createClass$3(Allocation, [{
      key: 'allocate',
      value: function allocate(gym, count) {
        if (count < 1 || count > 5) illegalInputError();
        if (gym.emptySeatCount < count) noEnoughPosError();
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
     * 想要达到类似全随机的效果调用count次allocate(gym, 1)即可
     * @param {Object} gym
     * @param {Number} count
     */


    _createClass$4(HalfRandomAllocation, [{
      key: 'allocate',
      value: function allocate(gym, count) {
        var _this2 = this;

        _get(HalfRandomAllocation.prototype.__proto__ || Object.getPrototypeOf(HalfRandomAllocation.prototype), 'allocate', this).call(this, gym, count);
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

        seats.forEach(function (seatIndex) {
          // this.printSeats(sectionIndex, lineIndex, seatIndex);
          _get(HalfRandomAllocation.prototype.__proto__ || Object.getPrototypeOf(HalfRandomAllocation.prototype), 'printSeats', _this2).call(_this2, sectionIndex, lineIndex, seatIndex); // FIXME rollup这个版本的babel对class打包貌似有问题
        });
      }
    }]);

    return HalfRandomAllocation;
  }(Allocation);

  var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get$1 = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var AllRandomAllocation = function (_Allocation) {
    _inherits$1(AllRandomAllocation, _Allocation);

    function AllRandomAllocation() {
      _classCallCheck$5(this, AllRandomAllocation);

      return _possibleConstructorReturn$1(this, (AllRandomAllocation.__proto__ || Object.getPrototypeOf(AllRandomAllocation)).call(this));
    }

    // TODO 写得太丑陋了...


    _createClass$5(AllRandomAllocation, [{
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
        var _this2 = this;

        _get$1(AllRandomAllocation.prototype.__proto__ || Object.getPrototypeOf(AllRandomAllocation.prototype), 'allocate', this).call(this, gym, count);

        var seatIndexs = random(gym.emptySeatCount, count);

        seatIndexs.forEach(function (index) {
          var _AllRandomAllocation$ = AllRandomAllocation.lockPostionByIndex(index, gym),
              sectionIndex = _AllRandomAllocation$.sectionIndex,
              lineIndex = _AllRandomAllocation$.lineIndex,
              seatIndex = _AllRandomAllocation$.seatIndex;

          // this.printSeats(sectionIndex, lineIndex, seatIndex);


          _get$1(AllRandomAllocation.prototype.__proto__ || Object.getPrototypeOf(AllRandomAllocation.prototype), 'printSeats', _this2).call(_this2, sectionIndex, lineIndex, seatIndex); // FIXME rollup这个版本的babel对class打包貌似有问题
        });
      }
    }], [{
      key: 'lockPostionByIndex',
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

  var _createClass$6 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  var _get$2 = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

  function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var OrderAllocation = function (_Allocation) {
    _inherits$2(OrderAllocation, _Allocation);

    function OrderAllocation() {
      _classCallCheck$6(this, OrderAllocation);

      return _possibleConstructorReturn$2(this, (OrderAllocation.__proto__ || Object.getPrototypeOf(OrderAllocation)).call(this));
    }

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


    _createClass$6(OrderAllocation, [{
      key: 'allocate',
      value: function allocate(gym, count) {
        var _this2 = this;

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

        seats.forEach(function (seatIndex) {
          // this.printSeats(sectionIndex, lineIndex, seatIndex);
          _get$2(OrderAllocation.prototype.__proto__ || Object.getPrototypeOf(OrderAllocation.prototype), 'printSeats', _this2).call(_this2, sectionIndex, lineIndex, seatIndex); // FIXME rollup这个版本的babel对class打包貌似有问题
        });
      }
    }]);

    return OrderAllocation;
  }(Allocation);

  /**
   * 库代码入口
   */
  var allocation = new OrderAllocation();
  var gym = new Gym(4);

  /**
   * TODO 最外层加锁及等待队列
   * TODO UI
   */

  exports.default = Gym;
  exports.allocation = allocation;
  exports.gym = gym;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
