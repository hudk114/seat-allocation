export function error (msg) {
  return function () {
    throw new Error(msg);
  };
}

export const illegalInputError = error('【出票失败】 输入票据数量非法');
export const noEnoughPosError = error('【出票失败】 无足够的可选位置');
export const innerError = error('【出票失败】 内部错误');
