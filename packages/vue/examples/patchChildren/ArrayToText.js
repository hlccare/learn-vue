import { h, ref } from "../../dist/learn-vue.esm.js";
const nextChildren = "newChildren"; // text
const prevChildren = [h("div", {}, "A"), h("div", {}, "B")]; //array

export default {
  name: "ArrayToText",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;

    return { isChange };
  },
  render() {
    const self = this;

    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
