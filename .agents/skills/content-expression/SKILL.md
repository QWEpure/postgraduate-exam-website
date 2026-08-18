---
name: content-expression
description: Write, edit, split, merge, and polish this 408 project's KnowledgeArticleData article content. Use for paragraph, formula, callout, table, subpoint, and block composition; Markdown and LaTeX authoring; exam-driven teaching structure; concise human Chinese; and removing AI-like prose. It owns article wording and block-level teaching design, not the knowledge tree, registry, exam links, SVG drawing, animation implementation, or Vue renderers.
---

# Content Expression

Write complete 408 knowledge articles that are technically accurate, easy to scan, and natural to read.

## Responsibility boundary

- Default writable scope: `client/src/content/knowledge-articles/**` article files.
- Use `knowledge-content-sync` for tree entries, registry changes, stable ID migration, shared-source structure, and exam links.
- Use `knowledge-visual-authoring` for SVG/image/HTML visual creation.
- Use `stepwise-teaching-animation` for manim-web animation code.
- Do not edit Vue components, global CSS, dependencies, or rendering infrastructure during an article-writing task.
- If a requested block type cannot render, report the missing capability; implement it only with explicit frontend authorization.

## Required references

Read only the references needed for the task, but read each selected file completely:

- Article file/schema/example: [`references/knowledge-article-template.md`](references/knowledge-article-template.md)
- Any inline or display mathematics: [`references/math-formulas.md`](references/math-formulas.md)
- Teaching voice and example quality: [`references/teaching-style.md`](references/teaching-style.md)

## Article editing workflow

### 1. Locate the real article

Read:

- `client/src/content/knowledge-tree.ts`
- `client/src/content/knowledge-articles/registry.ts`
- `client/src/content/knowledge-articles/types.ts`
- the target article file

Trace `Chapter → Section → pointId → registry entry → article file`. Do not infer the file solely from the visible title.

If the task needs a new point, Section, registry entry, or ID migration, invoke `knowledge-content-sync` for that structural part.

### 2. Scan relevant exams before writing

Use `client/public/exams/` (static bank, e.g. `{year}/paper.json` and `index.json`) to identify:

1. frequently tested sub-concepts;
2. definition, calculation, comparison, or scenario angles;
3. common wrong choices or wrong calculation paths;
4. existing block links that must be preserved.

For shared computer-organization/operating-system articles, scan both `subject: "co"` and `subject: "os"`.

Do not write years/question numbers into article prose. Exam references stay in static exam links.

### 3. Design the article before wording it

- One `KnowledgePoint` file represents one article.
- One subpoint answers one concrete learner question.
- One block contains one independently understandable/linkable teaching unit.
- Use exam angles to choose subpoints; do not create an encyclopedia outline.
- Reuse accurate blocks. Preserve stable IDs when their semantics remain unchanged.
- Ask `knowledge-content-sync` to create new IDs or repair links when structure changes.

### 4. Choose the smallest suitable block type

- `paragraph`: prose, Markdown lists, Markdown tables, inline formulas.
- `formula`: one standalone raw-LaTeX expression; no caption.
- `callout`: one boundary, confusion point, or example-specific warning.
- `image`/`html`: reference a visual prepared with `knowledge-visual-authoring`.
- animation block: reference an existing animation module prepared with `stepwise-teaching-animation`.

Do not invent imports, file paths, animation IDs, or unsupported fields.

### 5. Write, then simplify

1. Establish facts, conditions, formulas, terminology, and teaching order.
2. Apply the rules below.
3. Load and execute `no-ai-slop` on only the user-visible text changed in this task.
4. Read `../no-ai-slop/eval.md` completely and pass every item.
5. Confirm formulas, numbers, conditions, IDs, references, and animation mounts did not change during polishing.

`no-ai-slop` is a final editor, not a source of facts.

## Block and Markdown rules

- Paragraph text supports Markdown.
- Put a complete ordered list in one paragraph block; splitting it across blocks resets every item to `1.`.
- For short bullet judgments, use full sentences, not keyword fragments.
- Use Markdown tables when several peer items have several comparable attributes.
- Never use `~` for ranges; use `到`, `–`, or `—`.
- Bold only the core term: `**PC**（程序计数器）`, never `**PC（程序计数器）**`.
- A subpoint title is a concise concept title, not a title plus explanatory slogan.
- Do not repeat the Section title or KnowledgePoint title inside blocks.
- Use at most 1–2 bolded terms per line (or per independent semantic unit). Do not overuse bold for emphasis; reserve it solely for introducing core terms or highlighting the single most critical distinction.


## Formula rules

- Read `references/math-formulas.md` before editing any formula.
- Use `String.raw` whenever a TypeScript string contains LaTeX backslashes.
- Use `$...$` inside paragraph text for inline mathematics.
- Use a `formula` block for an independently linkable display equation.
- A formula block contains only raw LaTeX, without `$`, `$$`, caption, or prose.
- Put variables, units, assumptions, and ignored terms in the following paragraph.
- Do not imitate mathematics with Unicode superscripts/subscripts or code formatting.

## Paragraph structure

- Prefer at most two sentences per prose paragraph.
- Split conditional branches into numbered points.
- Split two or more parallel definitions/methods/cases into points or separate paragraphs.
- Preserve algorithmic branches and step order even if `no-ai-slop` prefers fewer lists.
- Use the same technical term consistently; do not rotate synonyms for variety.
- Define abbreviations at first use.

## Branching and parallelism trigger rules

Be highly sensitive to the following Chinese patterns. They typically indicate **if-else branches** or **parallel viewpoints**, and **must be split into separate points or separate paragraphs**, not written as one prose block.

### Trigger phrases that require split into points

If any of the following appears, split the content into separate bullet points, subpoints, or paragraphs (do not keep it as a single prose paragraph):

- `若…则…`, `若…反之…`, `如果…否则…` (if‑then‑else)
- `当…时…；当…时…` (when A; when B)
- `要么…要么…`, `不是…而是…` (either‑or, not‑A‑but‑B — treat the contrast as two branches)
- `XX 时 …；YY 时 …` (case A; case B)
- `有 X 个特点：`, `有 X 种情况：`, `分 X 种`, `分为 X 和 Y`, `分为 X、Y、Z` (X features/cases/categories)
- `X 与 Y 的区别` (differences between X and Y — must be split into aligned rows or points)
- `两个不同的维度`, `从两个角度看`, `分别从…和…` (two dimensions/perspectives)
- `一是…二是…`, `一方面…另一方面…` (first…second…, on one hand…on the other…)
- `xxx（表示几个动作）几个 yyy：（然后开始介绍 yyy）` (introducing a list of items after a colon)

### Trigger phrases that require a line break

If either of the following appears, **insert a line break** (i.e., separate into distinct paragraphs or points):

- `xxx是xxx。yyy是yyy` — when two different concepts are introduced in the same sentence
- `xxx如何如何了。yyy如何如何了` — when two different concepts are described in the same sentence

### Examples

**Example 1 — before (prose block — incorrect):**
> `**多体交叉存储器**：用多个存储体并行工作。**高位交叉编址**（高位选体）——整个存储体连续存一段地址空间，多体串行工作，无法提升带宽，也称高位连续编址。**低位交叉编址**（低位选体）——相邻地址分散在不同存储体，多体可并行交替处理连续访存，每个存储体需配自己的地址寄存器和数据寄存器。`

**Example 1 — after (split into separate paragraphs — correct):**
> `**多体交叉存储器**：用多个存储体并行工作。\n\n**高位交叉编址**（高位选体）——整个存储体连续存一段地址空间，多体串行工作，无法提升带宽，也称高位连续编址。\n\n**低位交叉编址**（低位选体）——相邻地址分散在不同存储体，多体可并行交替处理连续访存，每个存储体需配自己的地址寄存器和数据寄存器。`

---

**Example 2 — before (prose block — incorrect):**
> `**多道批处理**：内存同时装入多道程序，采用**中断和通道技术**。实现方式：一道程序因 I/O 阻塞时，通过中断通知操作系统，**通道**独立完成 I/O 传输，CPU 趁机切换到另一道程序执行。多道程序交替占用 CPU，减少了 CPU 等待 I/O 的时间，提高了 CPU 利用率。同时，中断系统的引入也增加了系统开销。`

**Example 2 — after (split into separate paragraphs — correct):**
> `**多道批处理**：内存同时装入多道程序，采用**中断和通道技术**。\n\n实现方式：一道程序因 I/O 阻塞时，通过中断通知操作系统，**通道**独立完成 I/O 传输，CPU 趁机切换到另一道程序执行。多道程序交替占用 CPU，减少了 CPU 等待 I/O 的时间，提高了 CPU 利用率。\n\n同时，中断系统的引入也增加了系统开销。`

## Examples and callouts

Use an example only when it teaches one of these:

1. a multi-step calculation whose outputs feed later steps;
2. a distinction that is unclear without contrast;
3. a formula whose variables are commonly substituted incorrectly.

Limit one example per subpoint. Use `例 → 已知/求 → 解 → 答` only when the problem needs that structure.

Callouts:

- blue: one example-specific insight;
- orange: one boundary, prerequisite, or confusion point;
- keep titles concrete, never merely `注意`, `提示`, or `点拨`;
- keep callout text plain; do not use Markdown emphasis, lists, links, code, or tables;
- do not add `408 常考`, `真题速判`, or unsupported exam-frequency claims.

## Teaching voice

- Write for a 408 candidate, not a domain researcher.
- State the object, condition, action, and result directly.
- Prefer one concrete, solvable example over several abstract claims.
- Explain why a step is valid; do not merely announce that it is important.
- Stop when the concept is complete. Do not append a generic summary, importance claim, or repeated paraphrase.
- Do not manufacture symmetry: not every subpoint needs a formula, image, callout, example, or animation.

## Definition precision

For terms involving maximal/minimal properties, state both:

1. the property the object itself satisfies;
2. the dimension in which it is maximal/minimal.

Do not reduce a definition to a memorized slogan when its boundary is examinable.

## Completion checklist

1. Did each subpoint answer one learner question?
2. Did each block contain one linkable unit?
3. Are multi-branch and parallel concepts visibly separated?
4. Are formulas natural LaTeX with explicit assumptions?
5. Are callouts concrete and plain text?
6. Did the prose avoid generic importance claims, repeated summaries, and invented exam patterns?
7. Was `no-ai-slop` applied and `eval.md` passed?
8. Were all technical facts, numbers, conditions, IDs, and mounts preserved?
9. Run `npm run validate:content` after article changes.
10. Run `npm run validate:exams` as well when a block was added, removed, renamed, or
    semantically reassigned, because static exams may reference it. For ordinary prose
    edits with unchanged IDs, `validate:content` is sufficient. Skip checks only when
    the user explicitly requests it, and report that omission.
