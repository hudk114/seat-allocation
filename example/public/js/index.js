var seatAllocation = window['seat-allocation'];

function getDOM (id) {
  return document.getElementById(id);
}

function addEvent (id, eventName, callback) {
  getDOM(id) && getDOM(id).addEventListener(eventName, callback);
}

/**
 * 0 -> A， 26 -> AA
 */
function numToLetter (number) {
  if (number > 25) {
    var count = Math.floor(number / 26);
    return numToLetter(count - 1) + numToLetter(number - count * 26);
  }

  return String.fromCharCode(number + 65);
}

function ticketToStr (ticket) {
  return `${numToLetter(ticket.sectionIndex)}区 ${numToLetter(ticket.lineIndex)}排 ${ticket.seatIndex + 1}号`;
}

function refreshOrders () {
  let orders = seatAllocation.getAllOrders();
  getDOM('orders').innerHTML =
    orders.reduce((prev, order) => {
      // title显示订单对应的票，随便一种实现模式...
      let title = order.tickets.reduce((prev, ticket) => prev + `${ticketToStr(ticket)}\n`, '');
      return prev + `<div title="${title}" class="${order.valid || 'order_invalid'}" style="float: left;">订单${order.id} 时间：${order.time.toLocaleString()} 票数：${order.tickets.length} ${order.valid ? '有效' : '无效'}</div>
        <button class="order_cancel" data-id=${order.id} ${order.valid || 'disabled'}>取消</button>
        <button class="order_delete" data-id=${order.id}>删除</button>
        <br>`;
    }, '');
}

function refreshTickets () {
  let orders = seatAllocation.getAllOrders();

  getDOM('tickets').innerHTML =
    orders.filter(order => order.isValid).reduce((prev, order) => {
      let str = order.tickets.reduce((prev, ticket, ticketIndex) => {
        return prev + `票${ticketIndex + 1} 位置： ${ticketToStr(ticket)}<br>`;
      }, '');

      return `${prev}订单${order.id}  -----<br>${str}`;
    }, '');
}

function refreshAll () {
  refreshOrders();
  refreshTickets();
}

// 锁票
addEvent('lockTicket', 'click', function (e) {
  var ticketCount = Number(getDOM('ticketCount').value);
  var rule = getDOM('ticketRule').value;

  seatAllocation.createOrder(rule, ticketCount).then(refreshAll);
});

// 订单取消与删除
addEvent('orders', 'click', function (e) {
  let ele = e.target;
  let className = ele.className;
  let orderId = Number(ele.dataset && ele.dataset.id);

  if (className === 'order_cancel') {
    seatAllocation.cancelOrder(orderId).then(refreshAll);
  }

  if (className === 'order_delete') {
    seatAllocation.deleteOrder(orderId).then(refreshAll);
  }
});

// 获取用户信息
seatAllocation.getUserInfo().then(function (userInfo) {
  getDOM('user').innerHTML = userInfo.name;
});
