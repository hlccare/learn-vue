import { camelize, toHandlerKey } from "@learn-vue/shared";

export function emit(instance, event, ...args) {
  console.log(event);

  // instance.props-> event
  const { props } = instance;

  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];
  handler && handler(...args);
}
