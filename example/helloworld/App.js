import { h } from "../../lib/guide-mini-vue.esm.js";
export const App = {
  // .vue
  // <template></template>
  // render
  render() {
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      // string
      // "hi, mini-vue"
      // array
      [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
    );
  },
  setup() {
    // composition api
    return {
      msg: "mini-vue",
    };
  },
};
