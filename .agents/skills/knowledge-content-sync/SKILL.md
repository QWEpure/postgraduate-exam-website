---
name: knowledge-content-sync
description: Maintain this 408 project's knowledge hierarchy, Section-to-KnowledgePoint manifests, article registry, stable kb-* block IDs, cross-book shared articles, and static exam-to-block links. Use for adding, moving, splitting, merging, registering, or deleting structural knowledge entries; repairing IDs or links; or changing the two-level Chapter → Section navigation. Do not use it to write article prose, formulas, diagrams, or animations.
---

# Knowledge Content Sync

Keep navigation, article registration, stable IDs, shared sources, and exam links consistent. Do not write or polish article content here.

## Responsibility boundary

- This skill owns structure and references.
- Use `content-expression` for `KnowledgeArticleData` prose, Markdown, formulas, callouts, tables, and article block composition.
- Use `knowledge-visual-authoring` for SVG, image, and HTML visual blocks.
- Use `stepwise-teaching-animation` for manim-web definitions and animation blocks.
- Use `knowledge-authoring-workflow` when a request spans more than one responsibility.

During a structure-only task, do not edit Vue components, global CSS, dependencies, or renderers.

## Sources of truth

- `client/src/content/knowledge-tree.ts`: Book → Chapter → Section → KnowledgePoint hierarchy.
- Visible left navigation: Chapter → Section only.
- `Section.points`: ordered manifest of articles rendered on one page.
- `client/src/content/knowledge-articles/registry.ts`: `pointId` to article file registration.
- One KnowledgePoint maps to one `KnowledgeArticleData` file.
- `KnowledgeArticleData.subpoints[].blocks[]`: owns stable globally unique `kb-*` IDs.
- `client/public/exams/{year}/paper.json`: parent question owns `knowledgeBlockIds`.

Do not put article text, animation definitions, `examIds`, query rules, or `keywords` in `KnowledgePoint`.

## Two-level page contract

- `/knowledge/:bookId/:sectionId` is canonical.
- Clicking a Section renders all articles in `section.points`, in order.
- Page `<h1>` comes from `section.title`.
- Each article heading comes from the KnowledgePoint title.
- The right TOC comes from article subpoints.
- Adding a point to an existing Section adds an article to the same page; it does not create a sidebar row.
- Add a Section only when the user requests a separate sidebar destination/page.
- Keep point IDs for registry lookup, editor operations, and deep links.

## Cross-book shared articles

These entries are one source shared by computer organization and operating systems:

- `co-source-to-load`
- `co-vm-impl`
- `co-io-method`
- `co-interrupt`
- `co-external-hdd`
- `co-external-ssd`

Rules:

1. Both tree entries reuse the same `pointId` and registry entry.
2. Never create an `os-*` mirror article or duplicate its blocks.
3. A `kb-co-*` block may legally link both `subject: "co"` and `subject: "os"` exams.
4. Never infer the allowed exam subject from a point/block prefix.
5. Before moving or deleting a shared block, scan both `co` and `os` references.
6. Verify both textbook entrances render the same article after structural changes.

## Structural operations

### Edit an existing article's position

1. Locate Chapter → Section → point entry in `knowledge-tree.ts`.
2. Locate the same `pointId` in `registry.ts`.
3. Move only the manifest/registration needed by the request.
4. Preserve the article export, point ID, subpoint IDs, and block IDs unless explicitly changing them.

### Add an article to an existing page

1. Add one KnowledgePoint entry to the target Section's `points` array.
2. Let `content-expression` create the article file.
3. Register the article in `registry.ts`.
4. Do not add a third visible navigation level.

### Add a new page

1. Add a Section under the correct Chapter.
2. Give it at least one point/article.
3. Register every point.
4. Confirm the canonical Section route.

### Split or merge articles

- Split when separately maintained KnowledgePoints should remain on one Section page.
- Merge only after mapping every retained subpoint/block and every exam reference.
- Remove obsolete files only after content and references have moved.

## Stable block IDs

Before renaming, moving, or deleting a block:

```bash
rg -n "<block-id>" client/src/content client/public/exams
```

- Preserve an existing `kb-*` ID when its semantic unit remains the same.
- Create a new ID for a genuinely new independently linkable concept.
- Never reuse an old ID for different content.
- Do not silently rewrite exam links because a file moved.

Check uniqueness:

```bash
npm run validate:content
```

## Exam-link contract

- The static exam bank under `client/public/exams/` is the only exam-data source; do
  not recreate `/api/exams`, server-side exam JSON, controllers, repositories, or
  database tables.
- The parent question owns `knowledgeBlockIds`.
- Subquestions do not own knowledge IDs.
- Link only blocks that genuinely participate in solving the question.
- Deduplicate IDs and keep at most four per parent question.
- Prefer a missing link over an incorrect link.
- A subpoint's visible exam count is the deduplicated union of its blocks' linked questions; do not duplicate links merely to affect display counts.
- When editing a yearly `paper.json`, update the corresponding `index.json` item and
  `manifest.json` counts when affected. The validator treats paper files as canonical
  and rejects stale derived indexes.
- Keep papers, manifest years, and `index.json` in ascending `year → number` order.
- Browser-side editing cannot write the deployed JSON. Export a corrected static file
  for repository replacement instead of pretending to save to a deleted backend.

## Full-site search index

- `client/public/search/search-index.json` is **auto-generated** by
  `scripts/build-search-index.cjs` (runs on every `npm run build` / `npm run dev`).
  It is a build artifact: **never hand-edit it**. After adding/editing knowledge
  articles, exams, or registry entries, the index is refreshed by the next build.
  To refresh it without a full build run `npm run build:search-index`.
- `client/public/search/synonyms.json` is **hand-maintained**: add search aliases/
  abbreviations there (e.g. `["慢开始","慢启动"]`, `["CPU","处理器"]`). Keep it a flat
  array of string groups; it is consumed by the synonym expansion in search.
- Knowledge search matches at **section / point / subpoint / body** granularity
  (book and chapter titles are intentionally excluded because they are too broad).
  Each subpoint may appear at most once in a result list.

## Mutation boundary

- Edit `knowledge-tree.ts` only for an explicit hierarchy change.
- Edit `registry.ts` only for registration or relocation.
- Edit static exam JSON in `client/public/exams/` only for an explicit link/correction request.
- Do not change article wording under this skill; route that part to `content-expression`.
- Do not solve missing renderer capabilities during a sync task; report them and wait for explicit frontend authorization.

## Completion checklist

1. Every tree point resolves through `registry.ts`.
2. Every registered point has one article source.
3. No visible third-level sidebar entry was introduced.
4. All `kb-*` IDs remain unique and intended exam links survive.
5. Shared articles still have one source and both textbook entrances work.
6. Run `npm run validate:content` to validate the hierarchy, registry, and block IDs.
7. Run `npm run validate:exams` to validate static papers, derived indexes, images,
   ordering, and every exam-to-block reference.
8. Run both through `npm run validate` after any block-ID or exam-link change. Skip
   validation only when the user explicitly requests it, and report the skipped checks.
