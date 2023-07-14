import { h } from "../../lib/guide-mini-vue.esm.js";

window.self = null; // test
export const App = {
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
      // string
      // "hi, mini-vue"
      // array
      // [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
      "hi, " + this.msg
    );
  },
  setup() {
    // composition api
    return {
      msg: "mini-vue-xx",
    };
  },
};
