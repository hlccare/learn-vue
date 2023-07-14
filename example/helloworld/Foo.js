import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props) {
    console.log(props);
  },
  render() {
    // 在render中可通过this访问props中的值
    return h("div", {}, "foo: " + this.count);
  },
};
