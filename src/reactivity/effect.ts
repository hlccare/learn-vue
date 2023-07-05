class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    // 调用run，修改activeEffect指向，并调用fn
    activeEffect = this;
    return this._fn();
  }
}

// targetMap，以目标对象为健，值为一个depsMap
const targetMap = new Map();
export function track(target, key) {
  // target -> key -> dep
  // depsMap，以key为键，值为dep，effect的集合
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  // 遍历调用
  for (const effect of dep) {
    effect.run();
  }
}

// 全局变量，用来标识当前执行的effect
let activeEffect;
export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();

  return _effect.run.bind(_effect);
}
