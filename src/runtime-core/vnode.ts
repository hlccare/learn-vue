import { ShapeFlags } from "../shared/shapeFlags";

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