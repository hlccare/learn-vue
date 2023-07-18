import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

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
    patch(null, vnode, container, null);
  }

  // n1 -> 旧的虚拟节点
  // n2 -> 新的虚拟节点
  // n1 为 null 时，则为初始化
  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlag } = n2;

    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        // 使用与运算符来进行判断
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
    }
  }

  function processText(n1, n2: any, container: any) {
    // children 为文本节点字符串
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2.children, container, parentComponent);
  }

  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container, parentComponent);
    }
  }

  function patchElement(n1, n2, container, parentComponent) {
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
    patchChildren(n1, n2, el, parentComponent);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(n1, n2, container, parentComponent) {
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
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent);
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

  function mountElement(vnode: any, container: any, parentComponent) {
    // const el = (vnode.el = document.createElement(vnode.type));
    const el = (vnode.el = hostCreateElement(vnode.type));

    const { children, props, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.innerText = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent);
    }

    // props处理
    for (const key in props) {
      const val = props[key];

      hostPatchProp(el, key, null, val);
    }
    // container.append(el);
    hostInsert(el, container);
  }

  function mountChildren(children, container, parentComponent) {
    // 遍历children，进行patch
    children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent);
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }
  function setupRenderEffect(instance, initialVNode, container) {
    // 更新重点：使用effect进行依赖收集
    effect(() => {
      // 区分 初始化 与 更新
      if (!instance.isMounted) {
        console.log("init");

        const { proxy } = instance;
        // 使用call，指定render函数的this为proxy
        // subTree为组件根节点的虚拟节点
        const subTree = (instance.subTree = instance.render.call(proxy));
        console.log(subTree);

        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance);

        // 此处element已mount完成，mountElement中将subTree的el赋值为根节点的dom元素
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        console.log("update");
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(preSubTree, subTree, container, instance);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
