import { h, ref } from "../../dist/learn-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(1);
    return {
      message: "mini-vue",
      count,
    };
  },
  template: `<div>hi,{{count}}</div>`,
};
