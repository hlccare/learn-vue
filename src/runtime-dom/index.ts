import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, prevVal, nextVal) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextVal);
  } else {
    if (nextVal === undefined || nextVal === null) {
      // 新属性值为undefined或null时，应移除属性
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}

function insert(el, parent) {
  parent.append(el);
}

// 创建实际的渲染器
const renderer: any = createRenderer({ createElement, patchProp, insert });

// 导出实际渲染器的createApp函数
export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";
