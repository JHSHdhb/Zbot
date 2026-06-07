import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, ".github/scheduled-posts/Zbotglobal_GEO_SEO_bilingual_blogs_5_posts_2026-06-07.md");
const statePath = path.join(root, "docs/scheduled-blog-state.json");
const args = new Set(process.argv.slice(2));
const publishDate = process.env.PUBLISH_DATE || new Date().toISOString().slice(0, 10);
const shouldPublishNext = args.has("--publish-next");
const shouldRegenerate = args.has("--regenerate");
const allowedArgs = new Set(["--publish-next", "--regenerate"]);
const boundaryRiskPatterns = [
  /不封号/i,
  /100%\s*安全/i,
  /100%\s*官方通道/i,
  /100%\s*Safe/i,
  /Absolutely\s*Safe/i,
  /绝对安全/i,
  /保证回复率/i,
  /高触达/i,
  /百万数据(?:上传)?/i,
  /1\s*人\s*顶\s*10\s*人/i,
  /虚拟币/i,
  /自动炒币/i,
  /投资(?:理财|收益|项目|建议|回报)?/i,
  /自动交易/i,
  /资金盘/i,
  /返利项目/i,
  /刷量/i,
  /外挂/i,
  /规避(?:审核|规则|平台规则)?/i,
  /绕过(?:审核|规则|平台规则)?/i,
  /平台规避/i,
  /交易(?:工具|平台|服务|项目)?/i,
  /固定(?:成交|回复率|询盘|转化率|结果|答案|效果)/i,
  /承诺收益/i,
  /稳赚/i,
  /保收益/i,
  /account[-\s]?ban bypass/i,
  /guarantee(?:d|s)?/i,
  /fixed\s+(?:deal|deals|reply|replies|outcome|outcomes|result|results|ranking|rankings)/i,
  /crypto(?:\s+trading)?/i,
  /trading/i,
  /investment advice/i,
  /investment/i,
  /automated trading/i,
  /platform[-\s]?bypass/i,
  /review\s+bypass/i,
  /traffic\s+manipulation/i
];

const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));
if (unknownArgs.length || (!shouldPublishNext && !shouldRegenerate) || (shouldPublishNext && shouldRegenerate)) {
  console.error("Usage: node .github/scripts/publish-scheduled-blog.mjs --publish-next | --regenerate");
  process.exit(1);
}

const posts = parsePosts(fs.readFileSync(sourcePath, "utf8"));
const state = normalizeState(readJson(statePath, {
  source: ".github/scheduled-posts/Zbotglobal_GEO_SEO_bilingual_blogs_5_posts_2026-06-07.md",
  publishedSlugs: [],
  publishedDates: {},
  lastPublishedAt: null
}), publishDate);

let nextPost = null;
if (shouldPublishNext && state.lastPublishedAt === publishDate) {
  console.log(`No-op: one scheduled blog was already published on ${publishDate}.`);
  process.exit(0);
}

if (shouldPublishNext) {
  nextPost = posts.find((post) => !state.publishedSlugs.includes(post.slug));
}

if (shouldPublishNext && !nextPost) {
  console.log("No-op: all scheduled blog posts have already been published.");
  process.exit(0);
}

if (nextPost) {
  state.publishedSlugs.push(nextPost.slug);
  state.publishedDates[nextPost.slug] = publishDate;
  state.lastPublishedAt = publishDate;
}
state.updatedAt = publishDate;

const publishedPosts = posts
  .filter((post) => state.publishedSlugs.includes(post.slug))
  .map((post) => ({
    ...post,
    datePublished: state.publishedDates[post.slug] || publishDate,
    dateModified: state.publishedDates[post.slug] || publishDate
  }));

for (const post of publishedPosts) writeBlogPost(post, publishDate);
writeBlogIndex(publishedPosts, publishDate);
updateRouteManifest(publishedPosts);
updateSitemap(publishedPosts, publishDate);
updateLlms(publishedPosts, publishDate);
writeJson(statePath, state);

if (nextPost) {
  console.log(`Published scheduled blog: ${nextPost.titleZh} (${nextPost.fileName})`);
} else {
  console.log(`Regenerated ${publishedPosts.length} scheduled blog post(s).`);
}

function parsePosts(source) {
  const matches = [...source.matchAll(/^# Blog\s+(\d+)｜(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index;
    const end = matches[index + 1]?.index ?? source.length;
    const section = source.slice(start, end).trim();
    const zhStart = section.indexOf("## 中文正文");
    const enStart = section.indexOf("## English Version");
    if (zhStart === -1 || enStart === -1) throw new Error(`Missing bilingual body markers in blog ${match[1]}`);
    const meta = extractMeta(section.slice(0, zhStart));
    const slug = cleanBackticks(meta["建议 slug"] || meta["Suggested slug"] || `/blog/post-${match[1]}`).replace(/^\/blog\//, "");
    const zhBody = section.slice(zhStart + "## 中文正文".length, enStart).replace(/^\s*---\s*$/gm, "").trim();
    const enBody = section.slice(enStart + "## English Version".length).trim();
    const titleZh = match[2].trim();
    return {
      order: Number(match[1]),
      slug,
      fileName: `blog-${slug}.html`,
      canonicalUrl: `https://www.zbotglobal.com/blog-${slug}.html`,
      titleZh,
      titleEn: extractEnglishTitle(enBody),
      metaTitle: cleanBackticks(meta["Meta Title"] || `${titleZh} | Zbot Global`),
      metaDescription: cleanBackticks(meta["Meta Description"] || firstSentence(zhBody)),
      keywords: cleanBackticks(meta["目标关键词"] || ""),
      internalLinks: cleanBackticks(meta["推荐内部链接"] || ""),
      zhBody,
      enBody: stripEnglishMeta(enBody)
    };
  });
}

function extractMeta(section) {
  const meta = {};
  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^\*\*(.+?)\*\*[：:]\s*(.+)$/);
    if (match) meta[match[1].trim()] = match[2].trim();
  }
  return meta;
}

function writeBlogPost(post, currentDate) {
  const datePublished = post.datePublished || currentDate;
  const dateModified = post.dateModified || datePublished;
  const articleHtml = `
                    <h2>中文正文</h2>
                    ${renderMarkdown(post.zhBody, "zh")}
                    <div class="trust-note">English version follows the Chinese article and keeps the same factual structure for bilingual GEO / SEO visibility.</div>
                    <h2>English Version</h2>
                    ${renderMarkdown(post.enBody, "en")}
                    <div class="trust-actions">
                        <a class="btn-primary" href="blog.html">返回博客</a>
                        <a class="btn-outline" href="service-scope.html">查看服务范围</a>
                    </div>`;

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="description" content="${escapeAttr(post.metaDescription)}"/>
    <meta name="keywords" content="${escapeAttr(post.keywords)}"/>
    <meta property="og:title" content="${escapeAttr(post.metaTitle)}"/>
    <meta property="og:description" content="${escapeAttr(post.metaDescription)}"/>
    <title>${escapeHtml(post.metaTitle)}</title>
    <link rel="canonical" href="${post.canonicalUrl}"/>
    <link rel="icon" type="image/svg+xml" href="media/zbot-logo-sm.svg"/>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;900&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
    <link rel="stylesheet" href="css/main.css"/>
    <script src="js/main.js" defer></script>
    <script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.titleZh,
      alternativeHeadline: post.titleEn,
      description: post.metaDescription,
      datePublished,
      dateModified,
      author: {"@type": "Organization", name: "Zbot Global"},
      publisher: {"@type": "Organization", name: "Zbot Global", legalName: "Shenzhen Zbot Global Technology Co., Ltd."},
      mainEntityOfPage: post.canonicalUrl,
      keywords: post.keywords
    }, null, 6)}
    </script>
</head>
<body>
    <div class="preloader" id="preloader"><div class="spinner"></div></div>
    ${siteHeader("blog.html")}
    <main>
        <section class="trust-hero">
            <div class="container">
                <span class="trust-kicker"><i class="fa-solid fa-book-open"></i> Bilingual GEO / SEO Article</span>
                <h1>${escapeHtml(post.titleZh)}</h1>
                <p>${escapeHtml(post.metaDescription)}</p>
                <div class="trust-meta"><span>Published ${datePublished}</span><span>中文 + English · Zbot Global Blog</span></div>
            </div>
        </section>
        <section class="trust-section is-white">
            <div class="container">
                <article class="trust-card trust-card--feature">
${articleHtml}
                </article>
            </div>
        </section>
    </main>
    ${siteFooter('<a href="blog.html">博客</a> · <a href="service-scope.html">服务范围</a> · <a href="contact.html">联系我们</a>')}
</body>
</html>
`;

  assertBoundaryCompliance(html, post.fileName);
  fs.writeFileSync(path.join(root, post.fileName), html);
}

function writeBlogIndex(publishedPosts, currentDate) {
  const legacyPosts = [
    {
      title: "为什么 B2B 出海企业需要 GEO-ready 官网与 AI 可读知识库",
      url: "blog-post-2.html",
      datePublished: "2026-06-06",
      label: "GEO & AI Visibility · 中文",
      icon: "fa-layer-group",
      description: "说明公司身份、服务范围、FAQ、案例和方法论如何组成客户、搜索引擎和 AI 系统都能核对的知识系统。",
      secondaryHref: "service-geo-ai-knowledge-content-visibility.html",
      secondaryText: "查看 GEO 服务"
    },
    {
      title: "From Search Traffic to AI-Generated Demand",
      url: "blog-post-1.html",
      datePublished: "2026-05-11",
      label: "GEO & AI Outreach · English",
      icon: "fa-magnifying-glass-chart",
      description: "Why export companies need GEO, company knowledge systems, AI-generated buyer demand, and agent-assisted outreach.",
      secondaryHref: "insights.html",
      secondaryText: "查看 Insights"
    }
  ];

  const scheduledCards = [...publishedPosts].reverse().map((post) => ({
    title: post.titleZh,
    url: post.fileName,
    datePublished: post.datePublished || currentDate,
    label: `Scheduled GEO / SEO · Post ${post.order}`,
    icon: "fa-book-open",
    description: post.metaDescription,
    secondaryHref: "service-geo-ai-knowledge-content-visibility.html",
    secondaryText: "查看 GEO 服务"
  }));
  const cards = [...scheduledCards, ...legacyPosts];
  const count = cards.length;

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="description" content="Zbot Global 博客围绕 GEO、AI 可见度、B2B 出海增长、内容系统和合规主动获客发布文章。"/>
    <meta property="og:title" content="Zbot Global 博客 | GEO与B2B出海增长"/>
    <meta property="og:description" content="GEO、AI 可见度、B2B 出海增长、内容系统和合规主动获客文章。"/>
    <title>Zbot Global 博客 | GEO与B2B出海增长</title>
    <link rel="canonical" href="https://www.zbotglobal.com/blog.html"/>
    <link rel="icon" type="image/svg+xml" href="media/zbot-logo-sm.svg"/>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;900&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
    <link rel="stylesheet" href="css/main.css"/>
    <script src="js/main.js" defer></script>
    <script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Zbot Global 博客 | GEO与B2B出海增长",
      url: "https://www.zbotglobal.com/blog.html",
      dateModified: currentDate,
      publisher: {"@type": "Organization", name: "Zbot Global", legalName: "Shenzhen Zbot Global Technology Co., Ltd."},
      mainEntity: cards.map((card) => ({
        "@type": "BlogPosting",
        headline: card.title,
        url: absoluteUrl(card.url),
        datePublished: card.datePublished,
        author: {"@type": "Organization", name: "Zbot Global"}
      }))
    }, null, 6)}
    </script>
</head>
<body>
    <div class="preloader" id="preloader"><div class="spinner"></div></div>
    ${siteHeader("blog.html")}
    <main>
        <section class="trust-hero">
            <div class="container">
                <span class="trust-kicker"><i class="fa-solid fa-book-open"></i> Zbot Global 博客 | GEO与B2B出海增长</span>
                <h1>博客</h1>
                <p>发布 GEO、AI 可见度、B2B 出海增长、内容系统和合规主动获客相关文章，帮助客户和 AI 系统更准确理解 Zbot Global 的方法与服务边界。</p>
                <div class="trust-meta"><span>Updated ${currentDate}</span><span>Legal entity: Shenzhen Zbot Global Technology Co., Ltd.</span></div>
            </div>
        </section>
        <section class="trust-section is-white">
            <div class="container">
                <div class="section-header">
                    <span>Latest Articles</span>
                    <h2>最新博客文章</h2>
                    <p>当前博客公开收录 ${count} 篇文章，包括既有 GEO / AI outreach 内容和按日发布的中英文 GEO / SEO 主题文章。</p>
                </div>
                <div class="trust-grid">
                    ${cards.map(renderBlogCard).join("\n                    ")}
                </div>
            </div>
        </section>
    </main>
    ${siteFooter('<a href="blog.html">博客</a> · <a href="insights.html">Insights</a> · <a href="contact.html">联系我们</a>')}
</body>
</html>
`;

  fs.writeFileSync(path.join(root, "blog.html"), html);
}

function renderBlogCard(card) {
  return `<article class="trust-card trust-card--feature">
                        <div class="trust-card__icon"><i class="fa-solid ${card.icon}"></i></div>
                        <span class="experience-eyebrow">${escapeHtml(card.label)}</span>
                        <h3><a href="${card.url}">${escapeHtml(card.title)}</a></h3>
                        <p>${escapeHtml(card.description)}</p>
                        <div class="trust-actions">
                            <a class="btn-primary" href="${card.url}">阅读文章</a>
                            <a class="btn-outline" href="${card.secondaryHref}">${card.secondaryText}</a>
                        </div>
                    </article>`;
}

function updateRouteManifest(publishedPosts) {
  const manifestPath = path.join(root, "docs/site-route-manifest.json");
  const manifest = readJson(manifestPath, []);
  for (const post of publishedPosts) {
    const route = {
      path: post.fileName,
      canonicalUrl: post.canonicalUrl,
      title: post.metaTitle,
      includeInSitemap: true,
      includeInLlms: true,
      pageType: "article",
      compatibilityTarget: null,
      status: "public"
    };
    const index = manifest.findIndex((entry) => entry.path === post.fileName);
    if (index === -1) manifest.splice(findInsertIndex(manifest), 0, route);
    else manifest[index] = {...manifest[index], ...route};
  }
  writeJson(manifestPath, manifest);
}

function updateSitemap(publishedPosts, currentDate) {
  const sitemapPath = path.join(root, "sitemap.xml");
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  for (const post of publishedPosts) {
    const lastmod = post.dateModified || post.datePublished || currentDate;
    if (!sitemap.includes(`<loc>${post.canonicalUrl}</loc>`)) {
      sitemap = sitemap.replace(
        "</urlset>",
        `  <url><loc>${post.canonicalUrl}</loc><lastmod>${lastmod}</lastmod><priority>0.65</priority></url>\n</urlset>`
      );
    } else {
      sitemap = sitemap.replace(
        new RegExp(`(<loc>${escapeRegExp(post.canonicalUrl)}<\\/loc><lastmod>)(\\d{4}-\\d{2}-\\d{2})(<\\/lastmod>)`),
        `$1${lastmod}$3`
      );
    }
  }
  sitemap = sitemap.replace(/(<loc>https:\/\/www\.zbotglobal\.com\/blog\.html<\/loc><lastmod>)(\d{4}-\d{2}-\d{2})(<\/lastmod>)/, `$1${currentDate}$3`);
  fs.writeFileSync(sitemapPath, sitemap);
}

function updateLlms(publishedPosts, currentDate) {
  const llmsPath = path.join(root, "llms.txt");
  let llms = fs.readFileSync(llmsPath, "utf8").replace(/Updated:\s+\d{4}-\d{2}-\d{2}/, `Updated: ${currentDate}`);
  for (const post of publishedPosts) {
    const line = `- ${post.canonicalUrl}`;
    if (!llms.includes(line)) {
      llms = llms.replace("- https://www.zbotglobal.com/blog-post-2.html\n", `- https://www.zbotglobal.com/blog-post-2.html\n${line}\n`);
    }
  }
  fs.writeFileSync(llmsPath, llms);
}

function siteHeader(activeHref) {
  const active = (href) => href === activeHref ? ' class="is-active"' : "";
  return `<header class="site-header">
        <div class="nav-bar">
            <a class="brand" href="index.html" aria-label="Zbot Global home"><img src="media/zbot-logo-sm.svg" alt="Zbot Global 标志" class="brand-logo"/></a>
            <nav class="nav-links" id="primaryNav">
                <a href="index.html"${active("index.html")}>首页</a>
                <a href="about-zbot-global.html"${active("about-zbot-global.html")}>关于我们</a>
                <div class="nav-dropdown" data-dropdown><button class="dropdown-toggle" type="button" aria-expanded="false">服务范围 <i class="fa-solid fa-chevron-down"></i></button><div class="dropdown-menu"><a href="service-scope.html">服务范围总览</a><a href="service-geo-ready-b2b-infrastructure.html">GEO-ready 数字基建</a><a href="service-ai-market-research-lead-generation.html">AI 市场调研与主动获客</a><a href="service-geo-ai-knowledge-content-visibility.html">GEO 内容可见度</a><a href="service-ai-ads-growth-amplification.html">AI 定向投流与放大</a></div></div>
                <a href="blog.html"${active("blog.html")}>博客</a>
                <a href="faq.html"${active("faq.html")}>常见问题</a>
                <a href="contact.html"${active("contact.html")}>联系我们</a>
            </nav>
            <div class="nav-actions"><a class="btn-outline" href="client-request.html">提交需求</a><a class="btn-primary" href="contact.html">预约咨询</a></div>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation"><i class="fa-solid fa-bars"></i></button>
        </div>
    </header>`;
}

function siteFooter(linksHtml) {
  return `<footer id="footer">
        <div class="container">
            <div class="footer-bottom">
                <span>© 2025 Shenzhen Zbot Global Technology Co., Ltd. All rights reserved. | 深圳智博出海科技有限公司</span>
                <span>${linksHtml}</span>
            </div>
        </div>
    </footer>`;
}

function renderMarkdown(markdown, lang) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i += 1;
      continue;
    }
    if (/^\|.+\|$/.test(line) && /^\|[\s\-:|]+$/.test(lines[i + 1]?.trim() || "")) {
      const tableLines = [];
      while (/^\|.+\|$/.test(lines[i]?.trim() || "")) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      out.push(renderTable(tableLines));
      continue;
    }
    if (/^-\s+/.test(line)) {
      const items = [];
      while (/^-\s+/.test(lines[i]?.trim() || "")) {
        items.push(lines[i].trim().replace(/^-\s+/, ""));
        i += 1;
      }
      out.push(`<ul class="trust-list"${boundaryAttr(items.join(" "))}>${items.map((item) => `<li${boundaryAttr(item)}>${inline(item)}</li>`).join("")}</ul>`);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const sourceLevel = heading[1].length;
      const level = lang === "en" ? Math.min(sourceLevel + 1, 4) : Math.max(sourceLevel - 1, 2);
      out.push(`<h${level}${boundaryAttr(heading[2])}>${inline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }
    const paragraph = [];
    while (lines[i] && !/^\s*(#{1,6}\s+|-\s+|\|.+\|$)/.test(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    const text = paragraph.join(" ");
    out.push(`<p${boundaryAttr(text)}>${inline(text)}</p>`);
  }
  return out.join("\n                    ");
}

function renderTable(lines) {
  const rows = lines.filter((_, index) => index !== 1).map((line) =>
    line.slice(1, -1).split("|").map((cell) => inline(cell.trim()))
  );
  const [head, ...body] = rows;
  return `<div class="trust-table-wrap"${boundaryAttr(lines.join(" "))}><table class="trust-table"><thead><tr>${head.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function inline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function boundaryAttr(value) {
  return boundaryRiskPatterns.some((pattern) => pattern.test(String(value))) ? ' data-risk-context="boundary"' : "";
}

function assertBoundaryCompliance(html, fileName) {
  const findings = [];
  for (const pattern of boundaryRiskPatterns) {
    const globalPattern = new RegExp(pattern.source, pattern.flags.includes("i") ? "gi" : "g");
    for (const match of html.matchAll(globalPattern)) {
      if (!isInsideHtmlBoundary(html, match.index ?? 0)) {
        findings.push(`${fileName}: risky copy "${match[0]}" is outside data-risk-context="boundary"`);
      }
    }
  }
  if (findings.length) {
    throw new Error(`Generated blog boundary audit failed:\n${findings.map((finding) => `- ${finding}`).join("\n")}`);
  }
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

function extractEnglishTitle(markdown) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || "";
}

function stripEnglishMeta(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => !/^\*\*(Suggested slug|Meta Title|Meta Description)\*\*/.test(line.trim()))
    .join("\n")
    .trim();
}

function findInsertIndex(manifest) {
  const firstLegacy = manifest.findIndex((entry) => entry.pageType === "service-legacy");
  return firstLegacy === -1 ? manifest.length : firstLegacy;
}

function firstSentence(markdown) {
  return markdown.replace(/[#*_`|>-]/g, "").split(/[。.!?]/)[0].trim();
}

function cleanBackticks(value) {
  return String(value).replace(/^`|`$/g, "").trim();
}

function absoluteUrl(url) {
  return url.startsWith("http") ? url : `https://www.zbotglobal.com/${url}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function normalizeState(state, fallbackDate) {
  if (!Array.isArray(state.publishedSlugs)) state.publishedSlugs = [];
  if (!state.publishedDates || typeof state.publishedDates !== "object" || Array.isArray(state.publishedDates)) {
    state.publishedDates = {};
  }
  for (const slug of state.publishedSlugs) {
    if (!state.publishedDates[slug]) state.publishedDates[slug] = state.lastPublishedAt || fallbackDate;
  }
  return state;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
