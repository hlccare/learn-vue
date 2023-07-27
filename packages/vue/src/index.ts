// 出口
export * from "@learn-vue/runtime-dom";

import { baseCompile } from "@learn-vue/compiler-core";
import * as runtimeDom from "@learn-vue/runtime-dom";
import { registerRuntimeCompiler } from "@learn-vue/runtime-dom";

// 出于依赖关系分离的需要，不选择在runtime-dom直接引入compile-core，将运行时和编译分开
// 以方便打包时提前将template进行编译，在浏览器中需要引入运行时的部分即可
function compileToFunction(template) {
  // code：... return function render(_ctx, _cache){} code实际运行后会返回一个函数
  const { code } = baseCompile(template);
  // 形参字符串，functionBody为code
  const render = new Function("Vue", code)(runtimeDom);
  return render;
}
registerRuntimeCompiler(compileToFunction);
