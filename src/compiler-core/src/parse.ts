import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, []));
}

function parseChildren(context, ancestors) {
  const nodes: any = [];

  while (!isEnd(context, ancestors)) {
    let node;
    const s = context.source;
    if (s.startsWith("{{")) {
      // 插值
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      // element
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }

    // 文本
    if (!node) {
      node = parseText(context);
    }

    nodes.push(node);
  }

  return nodes;
}

// 判断字符处理是否已经结束
function isEnd(context, ancestors) {
  const s = context.source;
  // 2. 遇到结束标签时候
  if (s.startsWith("</")) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (startsWithEndTagOpen(s, tag)) {
        return true;
      }
    }
  }
  // 1. source有值的时候
  return !context.source;
}

function parseText(context) {
  // 文本结束范围
  let endIndex = context.source.length;
  // 文本中需要识别 element 和 插值
  let endTokens = ["<", "{{"];

  // 遍历endTokens数组
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    // 若存在，尽量取小的index，靠左
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }

  const content = parseTextData(context, endIndex);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}

// 处理context中的纯文本
function parseTextData(context: any, length) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);

  return content;
}

function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagType.Start);
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();
  // 处理结束标签部分 </div?
  // 在source中截取，与element.tag进行比较，相同则处理，不同则报错
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End);
  } else {
    throw new Error(`缺少结束标签：${element.tag}`);
  }

  return element;
}

// 判断是否为关闭标签，且是否匹配
function startsWithEndTagOpen(source, tag) {
  return (
    source.startsWith("</") &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  );
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

  // 提取插值内容
  const rawContentLength = closeIndex - openDelimiter.length;
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();

  // 删除 str}}
  advanceBy(context, closeDelimiter.length);

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
