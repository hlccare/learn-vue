import { isObject } from "./../shared/index";
import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { queueJobs } from "./scheduler";

export function createRenderer(options) {
  // option控制renderer具体的渲染方法
  // 闭包
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;
  function render(vnode, container) {
    // patch
    patch(null, vnode, container, null, null);
  }

  // n1 -> 旧的虚拟节点
  // n2 -> 新的虚拟节点
  // n1 为 null 时，则为初始化
  function patch(n1, n2, container, parentComponent, anchor) {
    const { type, shapeFlag } = n2;

    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        // 使用与运算符来进行判断
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
    }
  }

  function processText(n1, n2: any, container: any) {
    // children 为文本节点字符串
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log("patchElement");
    console.log("n1", n1);
    console.log("n2", n2);

    //TODO

    // props
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    // 更新时，n2的el为空，需要赋值
    const el = (n2.el = n1.el);
    // children
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    const c1 = n1.children;
    const { shapeFlag } = n2;
    const c2 = n2.children;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新children为text
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 旧children为array，清空旧children
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      // 新children为array
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 旧children为text
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // 旧children为array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    function isSameVNodeType(n1, n2) {
      // type
      // key
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      i++;
    }

    // 右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    // 3. 新的比老的多，创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 4. 老的比新的多，删除
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间对比
      let s1 = i;
      let s2 = i;

      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      const keyToNewIndexMap = new Map(); // 存放新children中间部分节点的映射，key =》 index

      // 存放新children中间部分，各节点的旧index
      // a b (c d e) f g
      // a b (e c d) f g
      // [4, 2, 3] => 整体加1 => [5, 3, 4] ==> 最长递增序列（index）=> [1, 2]（即 c 和 d）
      const newIndexToOldIndexMap = new Array(toBePatched);
      let moved = false; // 新children中间部分是否有旧children移动而来
      let maxNewIndexSoFar = 0;

      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0;
      }

      // 遍历新children中间部分，保存map，key =》index
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      // 遍历旧children中间部分
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          // 已patch节点数达到新children中间节点数，则后续旧children节点直接删除
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        if (prevChild.key !== null) {
          // 旧节点有key，获取对应的新index
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // 旧节点没key，遍历新children中间部分，将该节点与新节点比对，若相同，则取新节点index
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        if (newIndex === undefined) {
          // 在新children中没找到，则删除
          hostRemove(prevChild.el);
        } else {
          // 在新children中间部分找到，则进行下一步patch操作

          // newIndex一旦非递增，则说明出现了移动，修改moved标志
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }

          // newIndex为在整体中的index，需转换处理
          newIndexToOldIndexMap[newIndex - s2] = i + 1; // i从0开始，但该map中0表示该新节点在旧children中间部分不存在，故+1避开
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      // j用于获取序列中的值，即递增节点的index（从后往前）
      let j = increasingNewIndexSequence.length - 1;
      // 遍历新children中间部分（从后往前）
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

        if (newIndexToOldIndexMap[i] === 0) {
          // 新节点在旧children中未找到，走增加逻辑
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          // 移动逻辑
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            // 非递增序列中的节点，查到新children中下一个节点元素之前
            hostInsert(nextChild.el, container, anchor);
          } else {
            // 是递增序列中的节点，则不处理
            j--;
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 遍历新props的键
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];

        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }
    }
    if (oldProps !== EMPTY_OBJ) {
      // 便利旧props的键
      for (const key in oldProps) {
        if (!(key in newProps)) {
          // key被删除（旧props中有，而新props中无）
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  }

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    // const el = (vnode.el = document.createElement(vnode.type));
    const el = (vnode.el = hostCreateElement(vnode.type));

    const { children, props, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.innerText = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    // props处理
    for (const key in props) {
      const val = props[key];

      hostPatchProp(el, key, null, val);
    }
    // container.append(el);
    hostInsert(el, container, anchor);
  }

  function mountChildren(children, container, parentComponent, anchor) {
    // 遍历children，进行patch
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ));
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }
  function setupRenderEffect(instance, initialVNode, container, anchor) {
    // 更新重点：使用effect进行依赖收集
    instance.update = effect(
      () => {
        // 区分 初始化 与 更新
        if (!instance.isMounted) {
          console.log("init");

          const { proxy } = instance;
          // 使用call，指定render函数的this为proxy
          // subTree为组件根节点的虚拟节点
          const subTree = (instance.subTree = instance.render.call(
            proxy,
            proxy
          ));
          console.log(subTree);

          // vnode -> patch
          // vnode -> element -> mountElement
          patch(null, subTree, container, instance, anchor);

          // 此处element已mount完成，mountElement中将subTree的el赋值为根节点的dom元素
          initialVNode.el = subTree.el;
          instance.isMounted = true;
        } else {
          console.log("update");

          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }
          const { proxy } = instance;
          const subTree = instance.render.call(proxy, proxy);
          const preSubTree = instance.subTree;
          instance.subTree = subTree;
          patch(preSubTree, subTree, container, instance, anchor);
        }
      },
      {
        scheduler() {
          console.log("scheduler");
          queueJobs(instance.update);
        },
      }
    );
  }

  return {
    createApp: createAppAPI(render),
  };
}

function updateComponentPreRender(instance, nextVNode) {
  instance.props = nextVNode.props;
  instance.next = null;

  instance.vnode = nextVNode;
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
