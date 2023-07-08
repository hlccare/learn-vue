import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
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
