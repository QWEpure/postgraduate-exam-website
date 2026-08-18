# 知识文章公式排版规范

本项目的知识文章使用 Markdown 承载正文，使用 LaTeX 描述数学表达式。目标是得到与教材一致的自然字形、上下标、分数、根号和公式间距，而不是用普通文本模拟公式。

## 先检查渲染能力

写公式前检查：

- `KnowledgeMarkdown.vue` 能识别 Markdown 中的 `$...$` 和 `$$...$$`
- `KnowledgeArticle.vue` 的 `formula` block 使用数学排版组件，而不是 `font-mono` 纯文本
- callout 中需要公式时，`callout.text` 也经过 `KnowledgeMarkdown`
- 页面已加载 KaTeX 样式

如果任意一项不满足，只报告缺失项并停止。内容编写任务不得修改组件、入口文件、依赖或构建配置；只有用户明确要求“实现/修复公式渲染”时才能补齐渲染链路。

获得明确授权后，安全顺序应为：先用 DOMPurify 净化 Markdown HTML，再在净化后的内容中生成可信的 KaTeX 输出。不要为了 KaTeX 直接允许用户输入任意 `class`、`style` 或原始 HTML。

推荐配置：

```ts
renderMathInElement(container, {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true },
  ],
  throwOnError: false,
  trust: false,
})
```

`$$` 必须排在 `$` 前面，避免双美元符号被行内规则提前匹配。

## TypeScript 字符串

只要公式中出现反斜杠，就使用 `String.raw` 模板字符串：

```ts
text: String.raw`信道利用率为 $U = \frac{T_s}{T_s + RTT}$。`
```

不要写：

```ts
text: '信道利用率为 $U = \frac{T_s}{T_s + RTT}$。'
```

普通字符串可能把 `\f`、`\t` 等内容当成 JavaScript 转义序列。

## 行内公式

公式是句子的一部分时，放在 `paragraph` block 中并使用 `$...$`：

```ts
{
  id: 'kb-hamming-inline',
  type: 'paragraph',
  text: String.raw`对于 $k = 4$ 位数据，满足条件的最小校验位数 $r$ 为 $3$。`,
}
```

适合行内公式的内容：

- 单个变量：`$k$`、`$r$`
- 简短关系：`$n = k + r$`
- 单位和取值：`$R = 100\ \mathrm{Mb/s}$`
- 句子中的短分数：`$\frac{L}{R}$`

行内公式前后保留自然中文语序，不要把每个变量都拆成独立 formula block。

## 独立公式

需要视觉停顿、后续解释或多步推导的公式使用 `formula` block。`formula` 字段只写原始 LaTeX，不带 `$` 或 `$$`：

```ts
{
  id: 'kb-hamming-condition',
  type: 'formula',
  formula: String.raw`2^r \geq k + r + 1`,
}
```

变量意义、单位、成立条件放在紧随其后的 paragraph block：

```ts
{
  id: 'kb-hamming-condition-note',
  type: 'paragraph',
  text: '其中额外的 1 表示无差错状态也必须占用一个编码。',
}
```

不要给 formula block 添加 `caption`。

在 paragraph 内确实需要一整行公式时，可以使用 `$$...$$`：

```ts
{
  id: 'kb-hamming-proof',
  type: 'paragraph',
  text: String.raw`校验位需要覆盖全部数据位、校验位和无差错状态，因此：

$$
2^r \geq k + r + 1
$$`,
}
```

优先规则：正文中单独出现且需要被真题精确链接的公式使用 formula block；只为保持一段推导完整时才在 paragraph 中使用 `$$...$$`。

## Callout 中的公式

callout 的 `text` 按 Markdown 处理。短公式使用 `$...$`，需要居中的公式使用 `$$...$$`：

```ts
{
  id: 'kb-hamming-warning',
  type: 'callout',
  tone: 'orange',
  title: '校验位还要覆盖自身和无差错状态',
  text: String.raw`不能只比较 $2^r$ 与 $k$，完整条件是：

$$
2^r \geq k + r + 1
$$`,
}
```

不要为了放公式而创建 callout。Callout 仍只用于边界条件、易混点或例题后的点拨。

## 常用写法

```text
上下标：W_t、2^n、p_i
分数：\frac{L}{R}
根号：\sqrt{n}
不等式：\leq、\geq、\neq
求和：\sum_{i=1}^{n} x_i
对数：\log_2 V
最小值：\min_v \{c(x,v) + D_v(y)\}
单位：100\ \mathrm{Mb/s}
中文：\text{发送时延} = \frac{\text{数据长度}}{\text{发送速率}}
```

## 禁止事项

- 不用 `2ⁿ`、`p₁`、`Wₜ` 等 Unicode 上下标模拟 LaTeX
- 不用 `` `L / R` `` 代码样式表示数学公式
- 不用普通斜体代替变量排版
- 不把公式截图当作正文公式
- 不在公式中手动塞大量空格来调整位置
- 不在 formula block 内加入“公式如下”“其中”等解释性文字
- 不在未验证页面渲染效果时宣称公式支持已经完成

## 完成检查

在实际知识页面检查：

1. `$`、`$$`、`\frac` 等源码没有原样显示
2. 行内公式与中文基线对齐，没有单独顶高行距
3. 独立公式居中，并能在窄屏横向滚动或自然换行
4. 分数、根号、上下标没有被裁切
5. callout 中的公式与正文使用同一套数学字体
6. 公式错误时页面不中断，并能显示可定位的错误内容
