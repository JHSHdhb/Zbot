import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  ...fs.readdirSync(root).filter((file) => /\.(html|xml|txt|css)$/i.test(file)),
  ...walk(path.join(root, "js")).filter((file) => /\.(js|json)$/i.test(file)).map((file) => path.relative(root, file)),
  ...walk(path.join(root, "css")).filter((file) => /\.css$/i.test(file)).map((file) => path.relative(root, file)),
];

const riskyPatterns = [
  /不封号/g,
  /100%\s*安全/g,
  /100%\s*官方通道/g,
  /100%\s*Safe/gi,
  /Absolutely\s*Safe/gi,
  /绝对安全/g,
  /保证回复率/g,
  /高触达/g,
  /百万数据(?:上传)?/g,
  /1\s*人\s*顶\s*10\s*人/g,
  /虚拟币/g,
  /自动炒币/g,
  /投资(?:理财|收益|项目|建议|回报)?/g,
  /自动交易/g,
  /资金盘/g,
  /返利项目/g,
  /刷量/g,
  /外挂/g,
  /规避(?:审核|规则|平台规则)?/g,
  /绕过(?:审核|规则|平台规则)?/g,
  /平台规避/g,
  /交易(?:工具|平台|服务|项目)?/g,
  /固定(?:成交|回复率|询盘|转化率|结果|答案|效果)/g,
  /承诺收益/g,
  /稳赚/g,
  /保收益/g,
  /account[-\s]?ban bypass/gi,
  /guarantee(?:d|s)?/gi,
  /fixed\s+(?:deal|deals|reply|replies|outcome|outcomes|result|results|ranking|rankings)/gi,
  /crypto(?:\s+trading)?/gi,
  /trading/gi,
  /investment advice/gi,
  /investment/gi,
  /automated trading/gi,
  /platform[-\s]?bypass/gi,
  /review\s+bypass/gi,
  /traffic\s+manipulation/gi,
];

const findings = [];

for (const file of files) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) continue;
  const text = fs.readFileSync(fullPath, "utf8");
  for (const pattern of riskyPatterns) {
    for (const match of text.matchAll(pattern)) {
      if (!isAllowedBoundary(text, match.index ?? 0, file)) {
        findings.push(`${file}: risky copy "${match[0]}" is outside data-risk-context="boundary"`);
      }
    }
  }
}

if (findings.length) {
  console.error("Risk-copy findings:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("Risk-copy scan passed.");

function isAllowedBoundary(text, index, file) {
  if (/\.html$/i.test(file)) return isInsideHtmlBoundary(text, index);
  const line = getLineAt(text, index);
  return /\b(?:does\s+not|do\s+not|is\s+not|are\s+not|not\s+(?:provide|offer|do|involve|support)|no\s+)\b/i.test(line)
    || /(?:不是|不做|不提供|不涉及|不从事|不承诺|不会)/.test(line);
}

function isInsideHtmlBoundary(text, index) {
  const stack = [];
  const tagPattern = /<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi;
  let match;
  while ((match = tagPattern.exec(text)) && match.index < index) {
    const tag = match[1].toLowerCase();
    const source = match[0];
    if (source.startsWith("</")) {
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        const current = stack.pop();
        if (current?.tag === tag) break;
      }
      continue;
    }
    const selfClosing = /\/>$/.test(source) || isVoidTag(tag);
    const inheritedBoundary = stack.some((item) => item.boundary);
    const boundary = inheritedBoundary || /\sdata-risk-context=["']boundary["']/i.test(source);
    if (!selfClosing) stack.push({ tag, boundary });
  }
  return stack.some((item) => item.boundary);
}

function isVoidTag(tag) {
  return new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]).has(tag);
}

function getLineAt(text, index) {
  const start = text.lastIndexOf("\n", index) + 1;
  const end = text.indexOf("\n", index);
  return text.slice(start, end === -1 ? text.length : end);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
