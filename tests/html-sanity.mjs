import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs/site-route-manifest.json"), "utf8"));
const findings = [];

for (const file of manifest.filter((route) => route.path.endsWith(".html")).map((route) => route.path)) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (!/<title>[^<]{8,}<\/title>/i.test(html)) findings.push(`${file}: missing useful <title>`);
  if (!/<meta\s+name=["']description["']/i.test(html)) findings.push(`${file}: missing meta description`);
  if (!/<link\s+rel=["']canonical["']/i.test(html) && !isExcluded(file)) findings.push(`${file}: missing canonical link`);
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  for (const id of new Set(duplicates)) findings.push(`${file}: duplicate id "${id}"`);
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt=["'][^"']*["']/i.test(match[0])) findings.push(`${file}: image missing alt text: ${match[0].slice(0, 100)}`);
    const alt = match[0].match(/\salt=["']([^"']*)["']/i)?.[1] || "";
    if (alt && !/[\u4e00-\u9fff]/.test(alt)) findings.push(`${file}: image alt should include Chinese SEO text: ${alt}`);
  }
}

if (findings.length) {
  console.error("HTML sanity findings:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("HTML sanity passed.");

function isExcluded(file) {
  return manifest.find((route) => route.path === file)?.status === "excluded";
}
