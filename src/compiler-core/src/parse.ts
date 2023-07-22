import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

function parseChildren(context) {
  const nodes: any = [];

  let node;
  const s = context.source;
  if (s.startsWith("{{")) {
    // 插值
    node = parseInterpolation(context);
  } else if (s[0] === "<") {
    // element
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }

  if (!node) {
    node = parseText(context);
  }

  nodes.push(node);

  return nodes;
}

function parseText(context) {
  const content = parseTextData(context, context.source.length);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseTextData(context: any, length) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);

  return content;
}

function parseElement(context) {
  const element = parseTag(context, TagType.Start);
  parseTag(context, TagType.End);

  return element;
}

function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  // 结束标签不返回内容
  if (type === TagType.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}

function parseInterpolation(context) {
  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  // 第二个参数表示从哪个索引开始找起
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );

  // 删去{{
  advanceBy(context, openDelimiter.length);

  const rawContentLength = closeIndex - openDelimiter.length;
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();

  // 删除 str}}
  advanceBy(context, rawContentLength + closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}

// 将context.source切除掉前面的length长度
function advanceBy(context, length: number) {
  context.source = context.source.slice(length);
}

function createRoot(children) {
  return {
    children,
  };
}

export function createParserContext(content: string) {
  return {
    source: content,
  };
}
