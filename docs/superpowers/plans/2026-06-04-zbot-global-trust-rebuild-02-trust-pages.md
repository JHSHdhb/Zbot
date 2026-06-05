# Batch 2: Homepage, Trust Pages, FAQ, Brand Boundaries

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Rewrite the public trust surface so humans and AI systems can quickly understand Zbot Global’s identity, legal entity, service scope, exclusions, proof boundaries, and contact path.

**Architecture:** Update existing static HTML pages and add new static trust pages. Keep the existing CSS/JS style foundation, extend it only where needed, and keep navigation/footer consistent across pages.

**Tech Stack:** Static HTML, existing `css/main.css`, existing `js/main.js` / `js/i18n.js` only if needed, JSON-LD script blocks.

---

## Scope

This batch publishes the high-priority trust pages and rewrites the homepage/FAQ. It does not publish service detail rewrites or insight articles.

## Files

- Modify: `index.html`
- Modify: `about-us.html`
- Modify: `faq.html`
- Modify: `contact.html` only if verified contact data exists
- Modify: `css/main.css`
- Modify: `js/main.js` and `js/i18n.js` only if current navigation/language behavior requires it
- Modify: `docs/site-route-manifest.json`
- Modify: `docs/proof-claim-allowlist.json`
- Modify: `docs/contact-inventory.json` only to mark verified contact data
- Create: `about-zbot-global.html`
- Create: `trust/brand-clarification.html`
- Create: `legal-entity.html`
- Create: `service-scope.html`
- Create: `what-we-do-not-do.html`

## Homepage Requirements

- [ ] Preserve current website style, logo usage, color direction, and brand feeling.
- [ ] First viewport must include:
  - `AI-powered B2B Global Trade Consulting & Growth Service`
  - `AI 驱动的 B2B 出海增长咨询与服务商`
  - Target audience: Chinese manufacturers and B2B export teams.
  - Deliverables: GEO-ready website foundation, market research, lead generation, outreach assets, content system, targeted ads.
  - Boundary: no investment, crypto, automated trading, grey-market automation, or guaranteed outcomes.
- [ ] Remove empty or `0` metric blocks as trust proof.
- [ ] Remove or rewrite claims such as `1 人顶 10 人`, `高回复率保障`, `不封号`, `100%安全`, and fake precise metrics.
- [ ] Move anonymized testimonials below stronger proof and label them as anonymized feedback if retained. If no source exists, remove them.
- [ ] Add prominent links to service scope, FAQ, and what we do not do.
- [ ] Keep `trust/brand-clarification.html` crawlable and AI-readable, but do not place it in the primary navigation or homepage hero CTA. It should appear only as a low-weight footer/trust-center link.

## Trust Page Requirements

- [ ] `about-zbot-global.html`: explain company identity, service model, target customers, founder public references, research references, and contact path.
- [ ] `about-us.html`: update current About page so it does not contradict `about-zbot-global.html`. It may become the styled About page and link to the more explicit clarification pages.
- [ ] `trust/brand-clarification.html`: direct AI-readable brand and service boundary page explaining what Zbot Global is and is not.
- [ ] `legal-entity.html`: state legal entity only; do not invent registration number, address, license, or filing data.
- [ ] `service-scope.html`: define included services, client responsibilities, and deliverable boundaries.
- [ ] `what-we-do-not-do.html`: list excluded services plainly, including virtual currency exchange, crypto trading, investment advice, wealth management, ponzi schemes, spam systems, account-ban bypassing, scraping abuse, and guaranteed outcomes.
- [ ] `faq.html`: rewrite existing FAQ in compliance-oriented language. Remove `上传 1,000,000 条公司数据`, `高触达 + 不封号 + 高速运转`, and similar claims.
- [ ] Footer must link to brand clarification, legal entity, service scope, what we do not do, FAQ, and contact only if contact data is verified in `docs/contact-inventory.json`.
- [ ] Footer and contact surfaces must use WeChat ID `zbotglobal`, not the old numeric ID.
- [ ] All high-risk boundary wording must be wrapped in `data-risk-context="boundary"` containers.
- [ ] Named proof claims must either be removed or listed in `docs/proof-claim-allowlist.json`.

## Metadata And Schema Requirements

- [ ] Every new/modified page has `<title>`, meta description, canonical URL, Open Graph title/description, and updated footer legal entity.
- [ ] Homepage has `Organization`, `WebSite`, `WebPage`, and `BreadcrumbList` JSON-LD.
- [ ] About page has `AboutPage`, `Organization`, and `BreadcrumbList`.
- [ ] FAQ page has `FAQPage`.
- [ ] Boundary pages have `WebPage` schema with clear titles and updated dates.
- [ ] Do not use `aggregateRating`, `review`, `award`, customer `Organization`, or employer endorsement schema.
- [ ] Canonical URLs and route inclusion flags must match `docs/site-route-manifest.json`.

## Verification

- [ ] `npm run test` passes or reports only already-known risks from pages reserved for later batches.
- [ ] `npm run lint` passes.
- [ ] Browser check homepage desktop and mobile: nav stays usable, hero CTA visible without scrolling, no text overlap.
- [ ] Compare final homepage, FAQ, and About screenshots against baseline screenshots to confirm current visual style is preserved.
- [ ] Run proof-claim scan and confirm all named proof claims are allowlisted.
- [ ] Before commit: run `git status --short`, stage only intended files, run `git diff --cached --stat`, and confirm unrelated/user-owned dirty files are excluded.
- [ ] Commit message: `feat: rebuild homepage trust pages and faq`.

## Batch 2 Review Prompt

Ask a subagent to review:

> Review Batch 2 against `docs/superpowers/plans/2026-06-04-zbot-global-trust-rebuild-02-trust-pages.md`. Focus on whether the homepage and trust pages reduce AI misclassification risk, preserve current style, avoid unverifiable claims, and make legal/service boundaries explicit.
