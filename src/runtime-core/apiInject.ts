import { getCurrentInstance } from "./component";

// provide \ inject 仅能在setup中调用
export function provide(key, value) {
  // 存
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent.provides;

    // init，默认情况下指向父组件的provides
    if (provides === parentProvides) {
      // 原型链
      // 当前组件需要provide时，创建新对象，并将父组件的provides作为原型
      provides = currentInstance.provides = Object.create(parentProvides);
    }

    provides[key] = value;
  }
}

export function inject(key, defaultValue) {
  // 取
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;

    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      // 支持defaultValue为函数
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
