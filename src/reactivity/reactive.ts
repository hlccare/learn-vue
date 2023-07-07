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
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers);
}

export function isReactive(value) {
  // !!用于将undefined转换为布尔值false
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  // !!用于将undefined转换为布尔值false
  return !!value[ReactiveFlags.IS_READONLY];
}

export function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}
