# Zbot Global Trust Rebuild Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. This master plan controls sequencing. Each child plan is independently reviewable and must be completed before moving to the next batch.

**Goal:** Rebuild the existing static Zbot Global website into a trust-first, AI-readable B2B global trade consulting and growth service website that clearly explains what Zbot Global is, what it is not, what it delivers, and how it can be verified.

**Architecture:** One PR, split into four implementation batches. The current repo is a static HTML/CSS/JS website, so the implementation must preserve the static architecture and current visual style instead of migrating to Next.js. Shared navigation/footer patterns, JSON-LD blocks, sitemap, robots, `llms.txt`, and QA scripts must be updated consistently across static pages.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, existing assets, lightweight Node QA scripts, Playwright browser checks, GitHub PR workflow.

---

## Locked Decisions

- **Repo and PR:** Real repo is `https://github.com/JHSHdhb/Zbot.git`. Work in the cloned repo at `/Users/nianliu/Desktop/Zbot/ZbotWebsite/repo`.
- **Hard repo gate:** First施工 step must run `pwd`, `git status`, `git branch --show-current`, `git remote -v`, and `git status --short`. If the repo is not `JHSHdhb/Zbot`, stop.
- **Base branch and dirty state:** Before branch creation, record base branch, remote URL, and all dirty files. Preserve user changes; do not overwrite or revert unrelated edits.
- **PR shape:** One PR only, implemented in four batches with separate plan files and checkpoint reviews.
- **Implementation style:** Static site in-place rebuild. Do not migrate to Next.js, add a CMS, add a backend, or replace the visual identity.
- **Primary positioning:** Use `AI-powered B2B Global Trade Consulting & Growth Service`.
- **Chinese positioning:** Use `AI 驱动的 B2B 出海增长咨询与服务商`.
- **Product naming:** Do not use `AI 外贸员` as the primary website identity. It may appear only as a capability/product module with clear service boundaries.
- **Target customers:** Chinese manufacturers, B2B export brands, foreign-trade factories, and companies building overseas lead-generation systems.
- **Excluded audiences:** Individual investors, crypto projects, trading-tool users, grey-market traffic buyers, spam operators, and anyone seeking guaranteed outcomes.
- **Legal entity:** Use `Shenzhen Zbot Global Technology Co., Ltd.` / `深圳智博出海科技有限公司`. Do not invent registration numbers, licenses, addresses, or official certifications.
- **Founder proof:** Include founder LinkedIn links as public, user-provided references:
  - `https://www.linkedin.com/in/nian-sherry-liu-07a7a5138/`
  - `https://www.linkedin.com/in/yusong-lin/`
- **Founder experience:** State named employer history only if visible public profile content verifies it and the proof-claim allowlist records the source. If LinkedIn blocks unauthenticated verification, link the profiles without stating employer history.
- **Research evidence:** Include a restrained public reference section using user-provided links:
  - `https://scholar.google.com/citations?hl=zh-CN&user=auhnI1MAAAAJ`
  - `https://scholar.google.com/citations?view_op=view_citation&hl=en&user=B-b0_4gAAAAJ&sortby=pubdate&citation_for_view=B-b0_4gAAAAJ:p2g8aNsByqUC`
  - `https://www.jmir.org/2023/1/e46084/`
- **Research fallback:** Do not imply founder authorship or team authorship unless visible source names support it. If source verification fails, list links as user-provided public research references without additional claims.
- **Evidence policy:** Conservative and verifiable. No fabricated customer logos, fake customer names, fake metrics, fake awards, fake review schema, or unsupported employer/customer/partner endorsement. Any visible proof claim involving employers, universities, advisors, certifications, partners, metrics, percentages, accuracy claims, awards, publications, or customers must have an allowlist source note.
- **High-risk copy:** Remove or rewrite claims such as `不封号`, `100%安全`, `保证回复率`, `高触达`, `百万数据上传`, `1 人顶 10 人`. These terms may appear only in explicit negative/boundary contexts.
- **Design direction:** Preserve current website style, logo treatment, color direction, and overall brand feeling. Improve hierarchy, copy clarity, responsiveness, accessibility, and trust signals without making it feel like a different website.
- **Visual constraints:** No AI-purple glow aesthetic, fake dashboards, fake team photos, fake customer logos, oversized motion, or full visual rebrand.
- **Language:** Chinese visible copy first. English appears in the main positioning, page titles, metadata, schema, and concise AI-readable summaries.
- **Contact/CTA:** Static only. Before rewriting pages, inventory all current email, phone, WeChat, WhatsApp, LinkedIn, and form links. Use one approved contact set consistently. Unverified or inconsistent contact data is a hard PR blocker.
- **Approved contact set:** Keep `customer@zbotglobal.com`, `+1 647-864-5968`, `+86 173-3618-8628`, WhatsApp on `+1 647-864-5968`, and the company LinkedIn link. Change public WeChat ID to `zbotglobal`.
- **Article rollout:** Do not publish all 12 insights at once. Publish the highest-priority 6 insight pages and keep additional future topics outside deployable public files. Do not commit future-topic slugs or titles into public HTML/XML/TXT/JS/CSS or public docs served with the site.
- **SEO/GEO:** Create a route manifest and update `sitemap.xml`, `robots.txt`, `llms.txt`, page metadata, canonical links, Open Graph tags, and JSON-LD from that manifest. Do not add `aggregateRating`, `review`, `award`, or customer organization schema without proof.
- **Deployment:** This PR does not deploy by default. Vercel CLI is not installed; recommend `npm i -g vercel` before preview deployment, env pull, deploy, or log inspection.
- **PR authority:** The implementation branch may be pushed and a PR may be created after final verification. The PR must not be merged by the agent; supervisor/主管 review and merge is required.

## Pre-Construction Hard Gates

Construction may not begin until these are recorded in working notes:

- Correct repo path: `/Users/nianliu/Desktop/Zbot/ZbotWebsite/repo`.
- `git status` confirms the directory is a clean or understood git repo.
- Current base branch.
- Remote URL.
- Dirty worktree inventory.
- Whether there are user-owned changes that must be preserved.
- Baseline desktop/mobile screenshots of current production or local homepage, FAQ, and About pages.
- Baseline desktop/mobile screenshots of current service and contact page families.

## Child Plans

Implement in this order:

1. [Batch 1: Repo Safety, Static Site Audit, QA Contracts](./2026-06-04-zbot-global-trust-rebuild-01-foundation.md)
2. [Batch 2: Homepage, Trust Pages, FAQ, Brand Boundaries](./2026-06-04-zbot-global-trust-rebuild-02-trust-pages.md)
3. [Batch 3: Services, Case Studies or Scenarios, Research Proof, Insights Rollout](./2026-06-04-zbot-global-trust-rebuild-03-services-content.md)
4. [Batch 4: AI Entry Points, Browser QA, Subagent Review, PR Prep](./2026-06-04-zbot-global-trust-rebuild-04-qa-pr.md)

## Batch Gates

- Each batch must run its listed checks before moving on.
- After each batch, request subagent review against that batch plan before starting the next batch.
- If any verified public source contradicts a planned claim, remove the claim.
- Case studies may be created only from existing site content or user-provided factual notes. If no factual source is available, use `representative service scenarios` and label them as non-client examples.
- `sitemap.xml`, `robots.txt`, `llms.txt`, canonical links, and route tests must be generated or validated from `docs/site-route-manifest.json`.
- Risky terms may appear only inside markup with `data-risk-context="boundary"`.
- Proof claims may appear only when allowed by `docs/proof-claim-allowlist.json`. The proof scanner must inspect visible or AI-readable copy only, not CSS layout syntax or private planning docs.
- Before every commit, run `git status --short`, use path-specific `git add`, inspect `git diff --cached --stat`, and confirm user-owned dirty files are excluded.

## Final Acceptance Criteria

- Homepage answers in the first viewport: what Zbot Global is, who it serves, what it delivers, what it does not do, and how to contact it.
- Existing `.html` URLs remain valid or intentionally redirect/point to replacement pages without breaking navigation.
- Brand and service boundary, legal entity, service scope, and what-we-do-not-do pages are crawlable. The boundary page uses the nested path `trust/brand-clarification.html` and appears only in low-weight footer/trust-center links, not primary navigation or homepage hero CTA.
- FAQ no longer contains high-risk automation guarantees.
- Four service pages exist with deliverables, process, boundaries, and FAQ.
- Six initial insights are public and included in `sitemap.xml` / `llms.txt`; future topics are not committed as public slugs/titles in deployable or served files.
- Founder LinkedIn and research links are included only as public references, not endorsements.
- Existing visual style is preserved while improving readability, accessibility, and AI-readable structure.
- Contact information is verified before PR; otherwise the PR is blocked.
- `zbot-linkedin-landing.html` is hidden from sitemap/nav/llms and marked noindex unless rewritten in a future approved scope.
- `client-request.html` remains public if its copy passes risk/proof checks.
- `demo.html` and `zbot-landing.html` should be unlinked/noindex unless they are rewritten and approved for public GEO.
- All public routes pass browser smoke tests, internal-link checks, asset checks, and console-error checks.
- `npm run test`, `npm run lint`, `npm run test:e2e`, and manual screenshot review pass before PR creation.
