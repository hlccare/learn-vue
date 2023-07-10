export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null, // 根节点DOM元素
  };
  return vnode;
}
