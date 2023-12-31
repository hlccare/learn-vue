import { h, ref } from "../../dist/learn-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    const onClick = () => {
      count.value++;
    };
    const props = ref({
      foo: "foo",
      bar: "bar",
    });
    const onChangePropsDemo1 = () => {
      props.value.foo = "new-foo"; // 情况1：更新
    };
    const onChangePropsDemo2 = () => {
      props.value.foo = undefined; // 情况2：undefined || null
    };
    const onChangePropsDemo3 = () => {
      props.value = {
        foo: "foo", // 情况3：删除bar
      };
    };
    return {
      count,
      props,
      onClick,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
    };
  },
  render() {
    console.log(this.props);
    return h("div", { id: "root", ...this.props }, [
      h("div", {}, "count:" + this.count),
      h("button", { onClick: this.onClick }, "click"),
      h("button", { onClick: this.onChangePropsDemo1 }, "changeProps-修改"),
      h(
        "button",
        { onClick: this.onChangePropsDemo2 },
        "changeProps-undefined"
      ),
      h("button", { onClick: this.onChangePropsDemo3 }, "changeProps-删除"),
    ]);
  },
};
