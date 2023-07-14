import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    console.log(props);
    const emitAdd = () => {
      console.log("emitAdd");
      emit("add", 1, 2);
      emit("add-foo");
    };
    return { emitAdd };
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd "
    );
    const foo = h("p", {}, "foo");
    // 在render中可通过this访问props中的值
    return h("div", {}, [foo, btn]);
  },
};
