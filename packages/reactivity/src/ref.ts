import { hasChanged, isObject } from "@learn-vue/shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public __v_isRef = true;
  constructor(value) {
    // 保存原始value，在set时用来与传入的newValue对象进行对比
    this._rawValue = value;
    // 若传入的value为对象，则使用reactive处理,变成proxy
    this._value = convert(value);
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    // 只有newValue与原值不等时，才触发修改
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerEffects(this.dep);
    }
  }
}

// 若value为对象，则使用reactive处理,变成proxy，否则使用原值
function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if (isTracking()) trackEffects(ref.dep);
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}

export function unRef(ref) {
  // 若为ref，则返回ref.value，否则返回值本身
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    // 调用getter时，所访问对象键值为ref类型，则返回.value，否则返回原来的值
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      // 调用setter时，只需要特殊处理，所set对象键值为ref类型，且value非ref的情况，自动加上.value
      // 若target[key] 和 value 均为ref，则直接赋值
      if (isRef(target[key]) && isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
