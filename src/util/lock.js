/**
 * 加锁，悲观锁
 * 被锁的操作进入缓存队列等待执行
 */

let lock = false;
const cacheQueue = [];

export function exec (callback) {
  return new Promise((resolve) => {
    if (lock) {
      cacheQueue.push(_ => {
        resolve(callback());
      });
    } else {
      addLock(_ => {
        resolve(callback());
      });
    }
  });
}

function addLock (callback) {
  lock = true;

  try {
    callback(); // TODO 因为没有db操作，所以此处简单处理均采用同步编写，之后可采用promise或者async改写
  } finally {
    // 清空cacheQueue
    if (cacheQueue.length) {
      addLock(cacheQueue.shift());
    }

    lock = false;
  }
}
