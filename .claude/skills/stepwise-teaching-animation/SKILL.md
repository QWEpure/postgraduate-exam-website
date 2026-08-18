---
name: stepwise-teaching-animation
description: Design, create, review, or refactor step-by-step teaching animations whose state changes are continuous, traceable, causally ordered, and understandable to learners. Use for manim-web animations and other interactive visual explanations of algorithms, data structures, network protocols, operating-system processes, hardware behavior, timing diagrams, mathematical derivations, or any concept where a learner advances through steps and must see where each value, object, or state came from.
---

# Stepwise Teaching Animation

Turn an abstract process into a sequence the learner can reconstruct, not merely watch.

## Start from the learner's questions

Before coding, list what the learner must be able to answer after every step:

1. What is present now?
2. Where did each new object or value come from?
3. What operation changed it?
4. Along what path did it move?
5. Where was the result stored or used?
6. Why is the next action allowed?

If the animation cannot answer one of these visually, revise the step design before implementing it.

## Write an animation contract

Define the animation as explicit states and transitions. Do not start from drawing commands.

```ts
type TeachingStep<State> = {
  id: string
  before: State
  action: string
  after: State
  learningGoal: string
}
```

For each transition, write one sentence in this form:

> Read **source** → perform **operation** → move through **path** → write **destination** → obtain **next condition**.

The implementation must follow that order. Validate `after` from `before` in code when the transition is deterministic.

## Treat the initial screen as a real state

- Show a recognizable but uninitialized structure before the learner interacts. Never use a featureless blank canvas unless the user explicitly requests one.
- Match the structure to the subject: an empty circuit with named components, empty array cells, a tree or graph skeleton, protocol endpoints and links, a blank timeline, or the starting expression of a derivation.
- Keep dynamic values, active highlights, packets, tokens, and computed results absent from this initial structure.
- When the user expects to initiate the explanation, show this structure with progress `0 / N`.
- The first click must perform the first instructional action. Do not count a fake blank frame as step 1.
- The learner must know what will be explained before clicking, but must still see initialization happen. Do not show a fully initialized final state before explaining initialization.
- Keep the initial structure geometrically identical to the first step so that clicking does not make the whole scene blink or redraw.
- Make reset return to the same initial state and make backward navigation reconstruct a valid earlier state.

In this project, use the optional `initialState` renderer on `ManimWebAnimation` for the uninitialized structure. Do not add a fake step to the instructional step count.

## Make every change traceable

Use the four-part transition rule:

1. **Source**: briefly highlight the value, node, packet, term, pointer, or state being read.
2. **Transformation**: show the comparison, calculation, rule, or control decision that acts on it.
3. **Movement**: move a copy or the original object continuously toward its destination.
4. **Commit**: only after arrival, update the destination and expose the next state.

Never create an unexplained result at the destination. Never remove a source before the learner has seen what consumed it.

When copying is semantically correct, copy from the visible source and leave the source intact. Examples include reading an array value, sampling a bit, sending a packet while retaining the buffer, or feeding an operand into a calculation.

Do not invent a duplicate display or proxy variable merely to show a condition that can be read directly from visible state. Highlight and sample the authoritative source itself—for example, inspect the current last bit of a register, the current queue head, or the current tree node. Introduce a separate latch, buffer, snapshot, or derived field only when it is genuinely part of the taught mechanism; if it is not, omit its box, wire, arrow, label, and state-update logic together.

## Preserve object identity

- Move the same visual object when the same conceptual object changes position.
- Use transformation only when one visible representation genuinely becomes another.
- When overwriting state, let the old value leave or fade while the new value arrives; do not leave an unexplained empty interval.
- Keep persistent state visible across the whole step: register contents, array cells, queue items, tree nodes, protocol endpoints, counters, and control conditions must not flicker.
- Do not redraw the whole scene for a local change.
- If connections must change, move nodes first, then update only the affected edges.

### Never use a transient effect as the final state

In this project, `ManimCodePlayer.vue` clears the scene before rendering every selected step. Treat every step renderer as a reconstruction of a valid state, not as a continuation that can rely on objects left by the previous renderer.

- Rebuild the complete previous end state first, then animate only the current delta, then commit the current end state.
- `Indicate`, pulse, scale, flash, and temporary color effects do not create persistent state. Never use one of them as the only evidence that a row, node, edge, packet, or condition was selected.
- Create the final frame/highlight/changed value as a real scene object and keep it in the completed frame. If emphasis is useful, run `Indicate` on that already-added persistent object.
- Include the same persistent object in the non-animated reconstruction used by previous/next/reset navigation.
- Never call `Indicate` on a newly constructed copy that was not added to the scene. Emphasize the authoritative object already visible in the current frame.
- After any highlight animation, inspect the state at the exact end of `scene.play(...)`: the learner must still be able to point to what was selected and what conclusion followed.

Use this rendering pattern:

```ts
scene.add(...buildPreviousState())
const persistentFrame = buildSelectionFrame()
scene.add(persistentFrame)
if (animate) await scene.play(new Indicate(persistentFrame, options))
scene.add(...buildCommittedState())
scene.render()
```

Reject a step if its important border, selection, changed value, packet destination, or decision disappears when the animation promise resolves.

## Show causality, not simultaneous decoration

Actions that are causally ordered must not animate at the same time.

Use this default rhythm:

1. highlight the input;
2. move it to the operation site;
3. perform or expose the operation;
4. move the result to storage;
5. update the counter, pointer, condition, or next input;
6. pause on the completed state.

Parallelize only actions that are truly simultaneous in the concept, such as all bits shifting on one clock edge or two independent comparisons.

## Choose motion by meaning

- Use `linear` for data travelling along a wire, packet path, timeline, queue, array shift, or other uniform movement.
- Use `smooth` for emphasis, reveal, grouping, and non-physical layout adjustment.
- Use several short path segments when the route turns. The learner should see the route, not a diagonal shortcut through unrelated objects.
- Use position, color, or scale emphasis sparingly. Color means current role or active path, not decoration.
- Keep the final state visible. Do not fade the scene to white.

## Apply the method across subjects

The rules are domain-independent:

- **Sorting**: lift the compared values from their cells, show the comparison, move them to their new cells, then update indices.
- **Tree rotation**: identify the pivot, move the same nodes, update affected edges afterward, then show the restored invariant.
- **Network protocol**: create a frame at the sender, move it across the link, commit receipt, then generate the acknowledgement from the receiver.
- **Operating system**: move a process between visible state queues; update CPU ownership only after the dispatch event.
- **Formula derivation**: move or transform the actual term being substituted; do not replace the entire equation with an unrelated final formula.
- **Timing diagram**: extend signals and intervals from their actual event boundaries; labels remain attached to the interval they describe.
- **Hardware**: load operands from visible sources, move them through the datapath, write results to visible storage, then sample the next control condition.

Do not let the example domain narrow the method. The invariant is always source → rule → path → destination → next state.

### Make no-op decisions visible

A step that checks a condition but does not move or exchange anything is still an instructional step. Never show only a ring, border, or highlight and expect the learner to infer why the structure stayed unchanged.

- Identify the values or objects being compared.
- State briefly that no exchange, move, rotation, write, or update is needed.
- Attach that conclusion to the compared local structure instead of placing it in a detached page-level callout.
- Keep the compared objects, their enclosing local frame, and the conclusion visible until the next step.
- If the condition causes a mutation, motion may carry the explanation; if it causes no mutation, a short visible conclusion is mandatory.

For heap adjustment, frame the current node together with its children and label that local subtree `无需交换`. Do not use a detached green box below the whole animation, and do not leave only a bare circle around one node.

## Keep the scene readable

- Divide the canvas into stable semantic zones before placing objects.
- Reserve separate space for the main structure, transient movement paths, and short explanations.
- Keep text horizontal unless the convention requires vertical labels.
- Prevent text-text, text-line, text-box, and moving-object collisions at every intermediate frame, not just the final frame.
- Prefer a larger canvas or fewer simultaneous labels over smaller text.
- Use short instructional sentences. Let motion carry the explanation.
- Do not place a paragraph below the animation that merely repeats what the animation already shows.

## One click should complete one learning unit

A click may contain several sub-animations, but they must answer one coherent question.

Good units:

- “Where are the two inputs stored, and how is the first condition obtained?”
- “Why are these two elements swapped?”
- “How does this packet produce that acknowledgement?”
- “Which term is substituted to obtain the next equation?”

Split a step when it contains two independent decisions. Combine micro-actions only when separating them would hide one causal chain.

## Teach one representative cycle completely

Do not equate completeness with animating the entire algorithm. When later rounds repeat the same rule:

1. choose a representative input large enough to expose the important branches;
2. animate one complete cycle without skipping its decisions;
3. stop after the cycle establishes its invariant/result;
4. state that the remaining subproblems or rounds repeat the same process.

This avoids two opposite failures: a tiny example that hides the rule, and dozens of repetitive clicks that bury it.

Group motion by the learner's decision, not by every variable assignment. Pointer increments, loop-counter updates, and routine bookkeeping do not need independent clicks when they only prepare the next repeated decision. Fold them into the end of the current transition or the start state of the next transition without giving them a separate explanatory heading.

### Quick-sort partition pattern

For the right-pivot, two-pointer partition used in this project, teach exactly one complete partition with a reasonably long array:

1. choose the rightmost element as `pivot`; place `i` at the left edge and `j` immediately left of `pivot`;
2. one click: `i` scans right and stops at the first element greater than `pivot`;
3. one click: `j` scans left and stops at the first element less than `pivot`;
4. one click: exchange the elements selected by `i` and `j`; incorporate routine inward pointer movement into this exchange, not a separate step;
5. repeat the preceding `i search → j search → exchange` learning units until the pointers cross;
6. dedicate one click to the visible condition `i > j` and explain why ordinary exchanges stop;
7. dedicate one click to moving the rightmost `pivot` into position by exchanging it with the element at **i**, not j;
8. keep the fixed pivot visible and state that the left and right subarrays recursively repeat the same partition; do not animate all recursive partitions unless explicitly requested.

Use enough values to require at least two ordinary `i/j` exchanges before crossing. Keep scan highlights visible at the end of each search step. The learner should be able to point to the exact first-too-large value, first-too-small value, crossing positions, and final pivot index.

## Project implementation boundary

- Put animation definitions under `client/src/animations/**` and keep article data responsible only for referencing them.
- Reuse `ManimCodePlayer.vue`; change the player only when the required interaction semantics cannot be expressed by animation data.
- Keep step data declarative and keep rendering helpers separate from subject data.
- Do not edit unrelated article renderers, global CSS, or dependencies to solve a local animation problem.
- Preserve existing user-approved visual conventions unless the user explicitly requests a redesign.

## Mandatory validation

1. Run `npm run validate:content` after mounting or changing the article animation block.
2. Run `npm run validate:exams` too if any `kb-*` ID or exam link changed.
3. Run the client build and fix all type errors.
4. Open the actual knowledge page, not an isolated mock.
5. Verify the initial state and progress semantics.
6. Play every step forward and backward.
7. Reset from the first, middle, and final steps.
8. Capture at least one intermediate frame for every complex transition.
9. Check that no persistent value disappears, no result appears without a source, and no label collides during motion.
10. Confirm the final state matches the declared `after` state.

Skip automated checks only when the user explicitly asks, and report which checks were
not run.

Do not declare success after inspecting only the final frame.

## Reject these failure patterns

- The learner initially sees a featureless white canvas and cannot tell what the animation will explain.
- A fully initialized scene appears before the learner clicks.
- Numbers or objects blink out and reappear elsewhere.
- A destination changes before the source reaches it.
- Two arrows appear but their execution order is unknown.
- An entire scene is replaced to explain one local update.
- Explanatory text claims a transition that the animation does not show.
- The animation is technically correct but the learner cannot say where the next state came from.

When any pattern appears, fix the state model and transition sequence first. Do not hide it with more labels, colors, or effects.
