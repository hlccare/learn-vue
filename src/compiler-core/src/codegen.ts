import { TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers";
import { NodeTypes } from "./ast";

export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;

  genFunctionPreamble(ast, context);

  let functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");

  push(`function ${functionName}(${signature}){`);
  push("return ");

  genNode(ast.codegenNode, context);
  push("}");
  return {
    code: context.code,
  };
}

// 生成前导码
function genFunctionPreamble(ast: any, context) {
  const { push } = context;
  const VueBinging = "Vue";
  const aliasHelper = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelper).join(", ")} } =  ${VueBinging}`
    );
  }
  push("\n");
  push("return ");
}

function genNode(node: any, context) {
  // 处理不同类型节点
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
    default:
      break;
  }
}

function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    // 辅助函数，获取key对应的字符串，并在前面加下划线_
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}

// 生成插值字符串
function genInterpolation(node: any, context: any) {
  const { push, helper } = context;

  push(`${helper(TO_DISPLAY_STRING)}(`);
  // 处理插值内部的表达式节点
  genNode(node.content, context);
  push(")");
}

// 生成表达式字符串
function genExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}
