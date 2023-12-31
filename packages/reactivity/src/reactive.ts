import { isObject } from "@learn-vue/shared";
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers);
}

export function isReactive(value) {
  // !!用于将undefined转换为布尔值false
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  // !!用于将undefined转换为布尔值false
  return !!value[ReactiveFlags.IS_READONLY];
}

// 检测一个对象是否为通过reactive或readonly创建的代理
export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}

export function createReactiveObject(target, baseHandlers) {
  if (!isObject(target)) {
    console.warn(`target ${target} 必须是一个对象`);
    return;
  }
  return new Proxy(target, baseHandlers);
}
