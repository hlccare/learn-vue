import { ShapeFlags } from "../shared/shapeFlags";

export const Fragment = Symbol("Fragment");

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null, // 根节点DOM元素
  };

  // // children处理:string | array
  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN; // 使用或运算符进行修改
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  // children是否为slot：必须为组件 且 children为object
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}

function getShapeFlag(type: any) {
  // 通过vnode.type来判断vnode是不是element
  // 1. element：type为string，如”div“
  // 2. component： type为object，如{render: {...}, setup: {...} }
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
