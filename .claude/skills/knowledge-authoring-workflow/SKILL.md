---
name: knowledge-authoring-workflow
description: Orchestrate end-to-end knowledge-content work in this 408 project. Use as the primary entry point when a request may involve article writing, hierarchy or registry changes, stable block IDs, exam links, static diagrams, images, formulas, or stepwise manim-web animations. It routes each phase to focused child skills and prevents structural, editorial, visual, and animation responsibilities from being mixed.
---

# Knowledge Authoring Workflow

Use this skill as the front door. It decides which focused skill owns each part; it does not duplicate their detailed rules.

## Available focused skills

| Need | Required skill |
|---|---|
| Write/edit article prose, blocks, Markdown, formulas, tables, callouts | `content-expression` |
| Change Chapter/Section/point structure, registry, stable IDs, shared articles, exam links | `knowledge-content-sync` |
| Create or insert static SVG, image, HTML figure, timing diagram | `knowledge-visual-authoring` |
| Create or revise click-through manim-web teaching animation | `stepwise-teaching-animation` |
| Remove AI-like wording after content is technically complete | `no-ai-slop` through `content-expression` |

Before acting, read every selected child skill's `SKILL.md` completely. Read only the references that child skill declares relevant.

## Route the request

Classify requested changes independently:

1. **Structure**: navigation, Section/point placement, new article registration, file move, ID/link repair.
2. **Content**: learner-facing wording, subpoints, paragraphs, formulas, tables, examples, callouts.
3. **Static visual**: SVG, image, HTML figure, circuit/structure/timing diagram.
4. **Animation**: stateful, click-by-click, causal motion.
5. **Renderer/infrastructure**: Vue components, Markdown/KaTeX renderer, player, CSS, dependencies.

Use only the focused skills required by the request. A prose-only edit should not load or modify structure, visuals, or renderers.

Renderer/infrastructure work is outside these content skills. Perform it only when the user explicitly authorizes frontend implementation.

## End-to-end sequence

### 1. Discover

- Locate the target through tree, registry, article file, animation/asset import, and existing exam links.
- Inspect current user changes and preserve unrelated work.
- Identify shared articles before assuming one textbook owns the content.

### 2. Plan the ownership of each change

Write a short internal handoff map, for example:

```text
new Section + registry       -> knowledge-content-sync
two new KnowledgePoints      -> content-expression
one formula                  -> content-expression/math reference
one timing SVG               -> knowledge-visual-authoring/timing reference
one click animation          -> stepwise-teaching-animation
exam links                   -> knowledge-content-sync
```

Do not let one child skill silently expand into another responsibility.

### 3. Apply structural prerequisites

If new points/pages/files are required, use `knowledge-content-sync` to establish the manifest and registration contract. Preserve existing IDs and links.

### 4. Author content

Use `content-expression` to scan relevant exams, design subpoints/blocks, write Markdown/LaTeX, and apply the required `no-ai-slop` pass.

### 5. Add optional visuals

- Use `knowledge-visual-authoring` for a static figure.
- Use `stepwise-teaching-animation` when the learner must see state or causality change over clicks.
- Reference the finished visual/animation from article data; do not embed its implementation in the tree.

### 6. Repair links and shared-source constraints

Return to `knowledge-content-sync` for stable block IDs and static exam links. Shared computer-organization/operating-system articles must remain one source and may link exams from both subjects.

### 7. Validate proportionally

The knowledge tree/articles and the static exam bank form one reference graph: articles
own `kb-*` IDs and exams point to those IDs. After any knowledge-content or exam-link
change, run both validators unless the user explicitly asks to skip checks:

```bash
npm run validate:content
npm run validate:exams
npm run build -w client
```

`validate:content` checks the knowledge hierarchy, one-file-per-article registry, and
globally unique block IDs. `validate:exams` checks every static paper, manifest/index
consistency, ascending year/question order, image paths, and whether every
`knowledgeBlockIds` entry resolves to a real article block. Use `npm run validate` when
both are required without an intervening repair step.

Also perform the focused validation required by any visual or animation skill. If the user explicitly says not to run checks/builds, do not run them; report that clearly.

## Conflict priorities

1. User's explicit request and technical correctness.
2. Stable content schema, IDs, links, and shared-source contracts.
3. Focused skill rules.
4. Style polish.

Never sacrifice formulas, conditions, algorithm steps, IDs, or mount information to make prose shorter or more natural.

## Completion report

Report:

- which focused skills were used;
- which files/responsibilities changed;
- whether IDs, shared sources, and exam links changed;
- which validation was run or intentionally skipped.

Keep the report concise. Do not paste the workflow into article content.
