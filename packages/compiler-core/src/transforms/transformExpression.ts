import { NodeTypes } from "../ast";

// 处理表达式节点，node.content.content = _ctx.${node.content}
export function transformExpression(node) {
  // 只有插值才有表达式
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content);
  }
}
function processExpression(node) {
  node.content = `_ctx.${node.content}`;
  return node;
}
