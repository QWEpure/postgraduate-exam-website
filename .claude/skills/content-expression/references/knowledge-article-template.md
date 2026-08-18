# KnowledgeArticleData template

Use a file path that mirrors the book and content chapter. The visible sidebar stops at Section; the final file still represents one internal KnowledgePoint article:

```text
client/src/content/knowledge-articles/<book>/<chapter>/<knowledge-point>.ts
```

Minimal template:

```ts
import type { KnowledgeArticleData } from '@/content/knowledge-articles/types'

export const exampleArticle: KnowledgeArticleData = {
  pointId: 'kp-example',
  subpoints: [
    {
      id: 'example-definition',
      title: '概念标题',
      blocks: [
        {
          id: 'kb-example-definition-1',
          type: 'paragraph',
          text: '先解释概念、适用条件与它解决的问题。',
        },
        {
          id: 'kb-example-definition-2',
          type: 'formula',
          formula: String.raw`R = \frac{L}{T}`,
        },
        {
          id: 'kb-example-definition-3',
          type: 'paragraph',
          text: '其中 $L$ 表示数据长度，$T$ 表示发送时间。',
        },
      ],
    },
    {
      id: 'example-distinction',
      title: '易混概念与判断方法',
      blocks: [
        {
          id: 'kb-example-distinction-1',
          type: 'callout',
          title: '先看题目描述的对象',
          text: '用一个可执行的判断规则区分相邻概念。',
          tone: 'orange',
        },
      ],
    },
  ],
}
```

Article registration, tree placement, point-ID creation, and exam-link migration belong to the
`knowledge-content-sync` skill. This reference only defines article content.

## Writing checks

- The page title comes from the Section. The grouped article heading comes from the KnowledgePoint; do not repeat either inside article blocks.
- A subpoint title should answer “这一段讲什么”。
- A paragraph block should contain one linkable concept, not an entire chapter.
- A formula block contains raw LaTeX without `$` or `$$` delimiters and never carries a caption.
- Put formula assumptions, units, and variable meanings in a following paragraph block.
- Read `math-formulas.md` before authoring inline or display mathematics.
- A callout carries an exam distinction, boundary, or common mistake.
- Do not invent an animation import. Add an animation block only when a real animation module exists.
- Keep mathematical assumptions explicit, especially when ignoring ACK transmission time, processing delay, or queueing delay.
