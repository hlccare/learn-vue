import { h } from "../../lib/guide-mini-vue.esm.js";
export const App = {
  // .vue
  // <template></template>
  // render
  render() {
    return h("div", "hi, mini-vue");
  },
  setup() {
    // composition api
    return {
      msg: "mini-vue",
    };
  },
};
