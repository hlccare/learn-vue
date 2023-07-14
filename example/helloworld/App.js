import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self = null; // test
export const App = {
  name: "App",
  // .vue
  // <template></template>
  // render
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
        onClick: () => console.log("onclick"),
        onMousedown: () => console.log("onmousedown"),
      },
      // [h("div", {}, "hi")]
      [
        h("div", {}, "hi, " + this.msg),
        h(Foo, {
          count: 1,
        }),
      ]
      // string
      // "hi, mini-vue"
      // array
      // [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
      // "hi, " + this.msg
    );
  },
  setup() {
    // composition api
    return {
      msg: "mini-vue-xx",
    };
  },
};
