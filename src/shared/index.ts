export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const hasChanged = (val, newVal) => !Object.is(val, newVal);

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);
