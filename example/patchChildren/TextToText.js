import { h, ref } from "../../lib/guide-mini-vue.esm.js";
const nextChildren = "oldChildren"; // text
const prevChildren = "newChilldren"; //text
export default {
  name: "TextToText",
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
