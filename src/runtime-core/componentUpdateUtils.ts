export function shouldUpdateComponent(prevVNode, nextVNode) {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;
  // 遍历新props，若同名键在旧props中值不同，则需要更新组件
  for (const key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}
