export * from "./toDisplayString";

export const extend = Object.assign;

export const EMPTY_OBJ = {};

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const isString = (value) => typeof value === "string";

export const hasChanged = (val, newVal) => !Object.is(val, newVal);

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

// add -> Add
// add-foo -> AddFoo
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};

export { ShapeFlags } from "./shapeFlags";
