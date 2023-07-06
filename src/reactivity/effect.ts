import { extend } from "../shared";

// 全局变量，用来标识当前执行的effect
let activeEffect;
// shouldTrack用于控制 fn 执行时，其中的响应式对象是否收集依赖，默认不收集
let shouldTrack;

class ReactiveEffect {
  private _fn: any;
  onStop?: () => void;
  scheduler?: Function;
  active = true;
  deps: Set<ReactiveEffect>[] = [];
  constructor(fn, scheduler) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    if (!this.active) {
      return this._fn();
    }

    // active为true，则允许进行依赖收集
    shouldTrack = true;
    activeEffect = this; // 调用run，修改activeEffect指向，并调用fn

    const result = this._fn();

    // 执行完 fn 后，重置shouldTrack为false
    shouldTrack = false;

    return result;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) this.onStop();
      this.active = false;
    }
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
}

// targetMap，以目标对象为健，值为一个depsMap
const targetMap = new Map();
export function track(target, key) {
  if (!isTracking()) return;

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

  if (dep.has(activeEffect)) return; // 避免重复收集
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  // 遍历调用
  for (const effect of dep) {
    // 判断effect是否有scheduler，有则执行scheduler，不执行fn
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options?: { scheduler?; onStop? }) {
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  // extend
  extend(_effect, options);

  _effect.run();

  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
