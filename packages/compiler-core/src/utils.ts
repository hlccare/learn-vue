import { NodeTypes } from "./ast";

// 判断是否为文本或插值类型
export function isText(node) {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION;
}
