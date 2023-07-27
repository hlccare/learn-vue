import {
  h,
  ref,
  getCurrentInstance,
  nextTick,
} from "../../dist/learn-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    const onClick = () => {
      for (let i = 0; i < 100; i++) {
        console.log("onclick", "update");
        count.value = i;
      }
    };
    const instance = getCurrentInstance();
    debugger;
    console.log(instance);
    nextTick(() => {
      console.log(instance);
    });
    return {
      count,
      onClick,
    };
  },
  render() {
    const button = h("button", { onClick: this.onClick }, "update");
    const p = h("p", {}, "count:" + this.count);
    return h("div", {}, [button, p]);
  },
};
