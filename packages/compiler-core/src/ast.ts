import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

export const enum NodeTypes {
  INTERPOLATION, // 插值
  SIMPLE_EXPRESSION,
  ELEMENT, // DOM元素
  TEXT, // 文本
  ROOT, // 根节点
  COMPOUND_EXPRESSION, // 复合类型
}

export function createVNodeCall(context, tag, props, children) {
  context.helper(CREATE_ELEMENT_VNODE);

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
