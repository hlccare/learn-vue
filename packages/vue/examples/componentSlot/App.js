import { h, createTextVNode } from "../../dist/learn-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");
    const foo = h(
      Foo,
      {},
      // slot使用函数
      {
        // 作用域插槽，函数调用传参，在实际渲染的组件中进行
        header: ({ age }) => [
          h("p", {}, "header" + age),
          createTextVNode("Text节点"),
        ],
        footer: () => h("p", {}, "footer"),
      }
    );

    return h("div", {}, [app, foo]);
  },
  setup() {},
};
