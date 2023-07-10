import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // patch
  patch(vnode, container);
}

function patch(vnode, container) {
  // 通过vnode.type来判断vnode是不是element
  // 1. element：type为string，如”div“
  // 2. component： type为object，如{render: {...}, setup: {...} }
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type));

  // children处理:string | array
  const { children, props } = vnode;
  if (typeof children === "string") {
    el.innerText = children;
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el);
  }

  // props处理
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function mountComponent(initialVNode, container) {
  const instance = createComponentInstance(initialVNode);
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance;
  // 使用call，指定render函数的this为proxy
  // subTree为组件根节点的虚拟节点
  const subTree = instance.render.call(proxy);

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container);

  // 此处element已mount完成，mountElement中将subTree的el赋值为根节点的dom元素
  initialVNode.el = subTree.el;
}
