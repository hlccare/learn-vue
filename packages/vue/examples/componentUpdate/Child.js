import { h } from "../../dist/learn-vue.esm.js";

export default {
  name: "Child",
  setup() {},
  render() {
    console.log(this.$props);
    return h("div", {}, [h("div", {}, "child-prop-msg" + this.$props.msg)]);
  },
};
