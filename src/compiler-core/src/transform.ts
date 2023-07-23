export function transform(root, options = {}) {
  const context = createTransformContext(root, options);

  // 1. 遍历-深度优先搜索
  traverseNode(root, context);

  createRootCodegen(root);
}

function createRootCodegen(root) {
  root.codegenNode = root.children[0];
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
  return context;
}

// 递归，深度优先搜索
export function traverseNode(node, context) {
  const nodeTransforms = context.nodeTransforms;
  // 对每个节点调用插件进行处理
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node);
  }
  traverseChildren(node, context);
}

function traverseChildren(node: any, context: any) {
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      // 递归调用
      traverseNode(node, context);
    }
  }
}
