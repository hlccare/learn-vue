import { createVNode } from "./vnode";

// 封装createApp，传入具体的render函数
export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 先 vnode
        // component =》 vnode
        // 所有的逻辑操作，都会基于vnode做处理
        const vnode = createVNode(rootComponent);
        render(vnode, rootContainer);
      },
    };
  };
}
