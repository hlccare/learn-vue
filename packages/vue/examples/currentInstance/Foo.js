import { h, renderSlots } from "../../dist/learn-vue.esm.js";

export const Foo = {
  name: "Foo",
  setup() {
    const instance = getCurrentInstance();
    console.log("Foo: ", instance);
  },
  render() {
    return h("div", {}, foo);
  },
};
