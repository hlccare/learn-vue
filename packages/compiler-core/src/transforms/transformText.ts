import { NodeTypes } from "../ast";
import { isText } from "../utils";

export function transformText(node) {
  // 只有在element元素下才会有文本和插值
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const { children } = node;
      let currentContainer;
      // 处理文本和插值的情况
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isText(child)) {
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j];
            if (isText(next)) {
              // 相邻节点同为插值或文本
              // 初始化currentContainer
              if (!currentContainer) {
                // 同时修改当前的子节点，修改为一个复合表达式
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child],
                };
              }
              // 加入 “+” 符号
              currentContainer.children.push(" +  ");
              currentContainer.children.push(next);
              // 因为j已归入i所创建的复合类型的children中，将j指向的元素删去
              children.splice(j, 1);
              j--;
            } else {
              currentContainer = undefined;
              break;
            }
          }
        }
      }
    };
  }
}
