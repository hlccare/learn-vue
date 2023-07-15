import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup() {},
  render() {
    const foo = h("p", {}, "foo");
    console.log(this.$slots);
    // renderSlots
    // 具名插槽
    // 1. 获取要渲染的元素
    // 2. 获取要渲染的位置
    return h("div", {}, [
      renderSlots(this.$slots, "header"),
      foo,
      renderSlots(this.$slots, "footer"),
    ]);
  },
};
