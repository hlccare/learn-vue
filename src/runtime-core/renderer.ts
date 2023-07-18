import { effect } from "../reactivity/effect";
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
    mountChildren(n2, container, parentComponent);
  }

  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container);
    }
  }

  function patchElement(n1, n2, container) {
    console.log("patchElement");
    console.log("n1", n1);
    console.log("n2", n2);

    //TODO
    // props
    // children
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    // const el = (vnode.el = document.createElement(vnode.type));
    const el = (vnode.el = hostCreateElement(vnode.type));

    const { children, props, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.innerText = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }

    // props处理
    for (const key in props) {
      const val = props[key];

      hostPatchProp(el, key, val);
    }
    // container.append(el);
    hostInsert(el, container);
  }

  function mountChildren(vnode, container, parentComponent) {
    // 遍历children，进行patch
    vnode.children.forEach((v) => {
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
