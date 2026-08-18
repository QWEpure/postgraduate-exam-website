---
name: knowledge-visual-authoring
description: Create, revise, insert, and validate static visuals for this 408 project's knowledge articles, including inline SVG, image blocks, HTML blocks, circuit and structure diagrams, and network timing diagrams. Use when article content needs a non-animated figure. It owns visual geometry and asset insertion, not prose, hierarchy/IDs/exam links, manim-web animation, or Vue renderer implementation.
---

# Knowledge Visual Authoring

Produce textbook-like static figures that remain readable inside the real knowledge page.

## Responsibility boundary

- Use `content-expression` for surrounding prose, captions, and article teaching order.
- Use `knowledge-content-sync` for point/block IDs, registry, hierarchy, and exam links.
- Use `stepwise-teaching-animation` when the visual must change across clicks.
- Do not change Vue renderers, CSS, or dependencies unless the user explicitly requests renderer work.

## Required reference

For sender/receiver, frame/ACK, RTT, propagation, processing, or other time-axis diagrams, read
[`references/timing-diagrams.md`](references/timing-diagrams.md) completely before drawing.

## Workflow

1. Read the target article and determine the exact concept the figure must explain.
2. Choose one representation: inline SVG/HTML for editable vectors, or image block for an existing raster/vector asset.
3. Reserve semantic zones and write a coordinate table before SVG markup.
4. Calculate all mathematical values before assigning coordinates.
5. Draw structural geometry first, labels last.
6. Insert the resulting block at the intended article position.
7. Validate the isolated SVG and the actual knowledge page.

Do not turn a static figure request into an infographic. Keep explanatory paragraphs outside the figure.

## SVG geometry rules

- Keep text at least 4 px from its containing border and 8 px from unrelated lines.
- Keep any two text bounding boxes at least 10 px apart; use 12 px for adjacent rows.
- Body labels are at least 16 px, key labels at least 18 px, titles at least 22 px.
- Expand the `viewBox` when space is insufficient; never solve crowding with tiny text.
- Center labels mathematically inside boxes using shared column coordinates and consistent anchors.
- Align peer boxes, nodes, rows, and columns to a deliberate grid.
- Let line lengths match their semantic scope. Do not extend brackets, division bars, buses, or axes across unrelated regions.
- Attach a connector to the actual component boundary, not an outer container.
- Give each color one semantic role. Do not add decorative color that competes with meaning.
- Keep figures compact; eliminate large unused margins and oversized boxes.

## Figure-content boundary

Keep only structural content inside a figure:

- nodes, registers, gates, chips, arrays, values, axes, arrows, buses, and essential short labels;
- no `步骤1`, generic tips, exam-frequency claims, side explanations, conclusion banners, or paragraph-length legends;
- no duplicate annotation when position/shape already communicates the meaning;
- no invented labels or control wires absent from the concept being taught.

Put assumptions, derivations, examples, and conclusions in adjacent article blocks through `content-expression`.

## Vertical text

- Prefer horizontal labels.
- When a convention requires vertical text, use one independent `<text>` element per character with explicit `x`, `y`, and `dominant-baseline="middle"`.
- Never stack characters with cumulative `<tspan dy>` offsets; the accumulated baseline error makes the column visibly skew.

## Mathematical and circuit diagrams

- Compute truth-table values, checksum rows, division rows, register contents, or timing points before drawing.
- Keep buses, control signals, data paths, and arrow directions semantically accurate.
- Route orthogonal paths in explicit segments; do not draw diagonal shortcuts through unrelated components.
- When reproducing a reference, preserve topology first, then apply restrained project colors.
- Remove labels the user excludes; do not replace them with inferred labels.

## Image and HTML blocks

- Copy reusable assets into the project's owned asset/content location; do not reference Downloads or temporary paths.
- Use stable, descriptive filenames.
- Keep article block IDs stable when replacing only the visual contents.
- Put an imported SVG inside an HTML block only when inline editability is required; otherwise prefer the project's normal image representation.
- Let the article/container determine responsive width. Avoid hard-coded page-width values that force overflow.

## Mandatory SVG validation

Render the SVG through a local HTTP page and run `getBBox()` checks:

1. every text box stays inside the `viewBox`;
2. text boxes do not overlap and satisfy the required gaps;
3. nearby text stays clear of non-associated lines;
4. peer labels share exact column/row coordinates;
5. arrows, markers, and brackets remain within bounds;
6. the figure remains readable at the article's actual rendered width.

Then open the real knowledge page and confirm CSS scaling or overflow did not introduce new defects.

After inserting or replacing the article block, run `npm run validate:content`. If the
work also changes a `kb-*` ID or an exam link, run `npm run validate:exams` as well;
static exam JSON may still point at the old block. Skip these checks only when the user
explicitly asks, and report the omission.

## Reject and revise

Do not deliver a visual when:

- text touches a border, line, arrow, or other text;
- a label leaves the viewBox;
- a line extends beyond the concept it represents;
- the figure needs prose inside it to be understood;
- the font was reduced below the minimum to make content fit;
- a diagram was checked only as source code, not in the browser;
- a dynamic causal process was compressed into an unreadable static picture instead of being routed to `stepwise-teaching-animation`.
