#!/usr/bin/env node
/**
 * 构建全站搜索语料（构建时执行）
 *
 * 思路：
 *   - 使用 jiti 直接 require TS 文件（不自定义 transform，避免影响其 TS 编译）。
 *   - jiti 走 Node CJS require 管线，因此对 .svg/.png 等静态资源，
 *     直接在 require.extensions 上注册 stub handler，返回字符串 URL。
 *
 * 用法：node scripts/build-search-index.cjs
 */
const path = require('node:path')
const { createJiti } = require('jiti')
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('node:fs')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'client')

/* -------- 1.5 中文分词（segmentit，供倒排索引切词） -------- */
let segmenter = null
try {
  const segMod = require('segmentit')
  if (segMod && segMod.useDefault && segMod.Segment) {
    segmenter = segMod.useDefault(new segMod.Segment())
  }
} catch (_e) {
  segmenter = null
}
/**
 * 归一化 I/O 写法：把 "I/O" / "i / o" 归一为 "io"，让 "IO" 查询能命中 "I/O" 文档。
 */
function normalizeIo(text = '') {
  return String(text).replace(/i\s*\/\s*o/gi, 'io')
}
/** 对文本切词，返回小写词列表（去标点；失败/无分词器时退化为过滤后的原文按空白切） */
function tokenizeText(text = '') {
  const clean = normalizeIo(String(text))
  if (segmenter && typeof segmenter.doSegment === 'function') {
    try {
      const out = segmenter.doSegment(clean, { simple: true })
      if (Array.isArray(out)) return out
    } catch (_e) { /* fallthrough */ }
  }
  // 降级：去掉标点按空白与词边界切
  return clean.replace(/\p{P}/gu, ' ').split(/\s+/).filter(Boolean)
}

/* -------- 1. 注册静态资源扩展名 stub（必须在 jiti 加载前做） -------- */
const STUB_EXTS = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.css', '.scss', '.less', '.sass', '.wasm']

// require.extensions 中 .js 默认存在；用同样的 handler 模板注册 stub 扩展
// Node 会把 JS loader 用于 .ts，但 jiti 在拦截阶段就处理了。这里只为 asset 服务。
for (const ext of STUB_EXTS) {
  // eslint-disable-next-line node/no-deprecated-api
  require.extensions[ext] = function stubAssetLoader(module, filename) {
    const fileName = (filename.split(/[\\/]/).pop() || 'asset').replace(/[^A-Za-z0-9_-]/g, '_')
    module.exports = `/_stub_asset/${fileName}`
  }
}

/* -------- 2. 创建 jiti 实例（无自定义 transform，保持其 TS 编译） -------- */
const jitiInstance = createJiti(CLIENT_ROOT, {
  cache: false,
  extensions: ['.ts', '.tsx', '.mjs', '.cjs', '.js', '.json'],
  interopDefault: false,
  alias: {
    '@': path.join(CLIENT_ROOT, 'src'),
  },
})

const knowledgeTreeMod = jitiInstance('./src/content/knowledge-tree.ts')
const registryMod = jitiInstance('./src/content/knowledge-articles/registry.ts')
const books = knowledgeTreeMod.knowledgeBooks || []
const allKnowledgePoints = knowledgeTreeMod.allKnowledgePoints || (
  books.flatMap((b) =>
    b.chapters.flatMap((ch) =>
      ch.sections.flatMap((s) => s.points || [])
    )
  )
)
// registry.ts 把 knowledgeArticleRegistry 作为本地 const，不 export；
// 但它导出了 getKnowledgeArticleRegistration(pointId) 逐个查询
const getRegistration = registryMod.getKnowledgeArticleRegistration

/* ========== 3. 知识树标题索引 ========== */
const bookIdOfSection = new Map()
const bookTitleOfId = new Map()
const sectionTitleOfId = new Map()
const sectionIdOfPoint = new Map()
const chapterTitleOfSection = new Map()
const pointTitleOfId = new Map()

for (const book of books) {
  bookTitleOfId.set(book.id, book.title)
  for (const chapter of book.chapters) {
    for (const section of chapter.sections) {
      bookIdOfSection.set(section.id, book.id)
      sectionTitleOfId.set(section.id, section.title)
      chapterTitleOfSection.set(section.id, chapter.title)
      for (const point of (section.points || [])) {
        sectionIdOfPoint.set(point.id, section.id)
        pointTitleOfId.set(point.id, point.title)
      }
    }
  }
}

/* ========== 4. 提取文章正文 ========== */
/** 把常见 LaTeX 命令转成可读纯文本，避免 \frac、\times、\sqrt、$ 等原样出现在搜索摘要里 */
function latexToPlain(latex = '') {
  return String(latex)
    // 嵌套结构（\text/\frac/\sqrt 各支持一层花括号，覆盖题库正文的写法）
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
    // 常见符号/命令
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\prod/g, 'Π')
    .replace(/\\int/g, '∫')
    .replace(/\\infty/g, '∞')
    .replace(/\\rightarrow|\\to(?![a-z])/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\le(?![a-z])|\\leq/g, '≤')
    .replace(/\\ge(?![a-z])|\\geq/g, '≥')
    .replace(/\\ne(?![a-z])|\\neq/g, '≠')
    .replace(/\\bmod|\\mod/g, 'mod')
    .replace(/\\dots|\\ldots|\\cdots/g, '…')
    .replace(/\\left|\\right/g, '')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/\\\^/g, '^')
    .replace(/\\\\/g, ' ')
    // 残留的其它命令：去掉反斜杠、保留命令名（如 \log → log）
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripMarkdown(text = '') {
  return String(text)
    // LaTeX 公式源：先把 $...$ / $$...$$ / \(...\) / \[...\] 转成纯文本
    .replace(/\$\$([\s\S]+?)\$\$/g, (_m, inner) => latexToPlain(inner))
    .replace(/\$([^$\n]+?)\$/g, (_m, inner) => latexToPlain(inner))
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, inner) => latexToPlain(inner))
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, inner) => latexToPlain(inner))
    .replace(/`{1,3}([^`]+)`{1,3}/g, (_1, w) => w)
    .replace(/\*\*([^*]+)\*\*/g, (_1, w) => w)
    .replace(/\*([^*]+)\*/g, (_1, w) => w)
    .replace(/#{1,6}\s+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, (_1, w) => w)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractBlockText(block) {
  if (!block) return ''
  switch (block.type) {
    case 'paragraph':
      return stripMarkdown(block.text || '')
    case 'callout':
      return [block.title, block.text].filter(Boolean).map((t) => stripMarkdown(t)).join(' ')
    case 'formula':
      return block.caption ? stripMarkdown(block.caption) : ''
    case 'image':
      return [block.alt, block.caption].filter(Boolean).map((t) => stripMarkdown(t)).join(' ')
    case 'html':
      return stripMarkdown(block.html || '')
  }
  return ''
}

function extractBlockTexts(blocks = []) {
  return blocks.map(extractBlockText)
}

function extractSubpointText(blocks = []) {
  return extractBlockTexts(blocks).filter(Boolean).join(' ').trim()
}

const knowledgePoints = []
const knowledgeDocs = []          // 子点级文档（含各层标题字段），docIdx 即数组下标
const invertedK = new Map()       // word -> Map<docIdx, 最低tier>（tier0=标题, tier1=正文）
const seenSubpointDocs = new Set() // 跨书/跨节重复注册的 subpoint 去重
let skipped = 0
for (const point of allKnowledgePoints) {
  const registration = getRegistration(point.id)
  const article = registration?.article
  if (!article || !Array.isArray(article.subpoints)) {
    skipped++
    continue
  }
  const sectionId = sectionIdOfPoint.get(point.id)
  if (!sectionId) {
    skipped++
    continue
  }
  const bookId = bookIdOfSection.get(sectionId) || ''
  const bookTitle = bookTitleOfId.get(bookId) || ''
  const chapterTitle = chapterTitleOfSection.get(sectionId) || ''
  const sectionTitle = sectionTitleOfId.get(sectionId) || ''
  const pointTitle = pointTitleOfId.get(point.id) || point.title || ''
  const breadcrumb = [bookTitle, chapterTitle, sectionTitle, pointTitle].filter(Boolean).join(' › ')
  // blockId / allBlockIds 都用 blocks[] 内的稳定 kb-* 级 ID（exams/index.json 的 knowledgeBlockIds 也是这种格式）
  const subpoints = []
  const allBlockIds = []
  for (const sp of article.subpoints) {
    const blocks = Array.isArray(sp.blocks) ? sp.blocks : []
    const blockIds = blocks.map((b) => b.id).filter(Boolean)
    allBlockIds.push(...blockIds)
    subpoints.push({
      id: sp.id,
      blockId: blockIds[0] || sp.id,
      title: sp.title,
      text: extractSubpointText(blocks),
      // block 级文本，与 blockIds 一一对应（用于运行时反查 snippet 对应的具体 block）
      blockTexts: extractBlockTexts(blocks),
      blockIds: [...blockIds],
    })
  }
  // 子点级倒排文档：每个 subpoint 一个 doc，记录各匹配层级的原始文本与该 doc 的索引位
  // 同一 point 可能因跨书/跨节注册被多次遍历（如 OS 与计组共用的 co-source-to-load），
  // 按 pointId+subpoint 去重，避免搜索结果重复。
  for (let spIdx = 0; spIdx < subpoints.length; spIdx++) {
    const sp = subpoints[spIdx]
    const dedupKey = `${point.id}\u0000${sp.title || ''}`
    if (seenSubpointDocs.has(dedupKey)) continue
    seenSubpointDocs.add(dedupKey)
    const docIdx = knowledgeDocs.length
    // 可检索的标题层只到 section / point / subpoint；book、chapter 概念太大不参与匹配
    const titles = {
      subpoint: sp.title,
      point: pointTitle,
      section: sectionTitle,
    }
    const fields = [
      ...Object.values(titles).filter(Boolean), // tier 0：section/point/subpoint 标题
      sp.text,                                   // tier 1：正文字文
    ].map((t) => String(t))
    knowledgeDocs.push({
      docIdx,
      pointId: point.id,
      sectionId,
      bookId,
      bookTitle,
      chapterTitle,
      sectionTitle,
      pointTitle,
      subpointTitle: sp.title,
      subpointId: subpoints[spIdx].id,
      // body 字段已废弃：与 blockTexts.join(' ') 完全重复，运行时用 blockTexts 代替
      blockTexts: subpoints[spIdx].blockTexts,
      blockIds: subpoints[spIdx].blockIds,
      breadcrumb,
      route: `/knowledge/${bookId}/${sectionId}`,
      blockId: subpoints[spIdx].blockId,
      allBlockIds: [...allBlockIds],
      examCount: 0,
    })
    // 对每层字段切词建立倒排：word → [docIdx, 最低tier]
    fields.forEach((fieldText, fieldIdx) => {
      const tier = fieldIdx < fields.length - 1 ? 0 : 1 // 标题层(前 n-1) tier0；正文(末位) tier1
      for (const rawWord of tokenizeText(fieldText)) {
        const word = rawWord.toLowerCase()
        if (!word) continue
        let entry = invertedK.get(word)
        if (!entry) { entry = new Map(); invertedK.set(word, entry) }
        const prev = entry.get(docIdx)
        if (prev === undefined || tier < prev) entry.set(docIdx, tier)
      }
    })
  }
  knowledgePoints.push({
    pointId: point.id,
    sectionId,
    bookId,
    title: pointTitle,
    breadcrumb,
    route: `/knowledge/${bookId}/${sectionId}`,
    subpoints,
    examCount: 0,
    allBlockIds,
  })
}

/* ========== 5. 真题索引 ========== */
const examsIndexPath = path.join(CLIENT_ROOT, 'public', 'exams', 'index.json')
let examIndexItems = []
if (existsSync(examsIndexPath)) {
  try {
    examIndexItems = JSON.parse(readFileSync(examsIndexPath, 'utf-8'))
  } catch (e) {
    console.error('[search-index] 读取 exams/index.json 失败：', e.message)
  }
}
const examItems = examIndexItems.map((item) => ({
  id: item.id,
  year: item.year,
  number: item.number,
  title: `${item.year}年第${item.number}题`,
  subject: item.subject,
  chapter: item.chapter,
  stem: item.stemText || '',
  tags: item.tags || [],
  knowledgeBlockIds: item.knowledgeBlockIds || [],
  route: `/exams?year=${item.year}&exam=${item.id}`,
}))

/* ========== 6. 关联真题计数 ========== */
const blockToExams = new Map()
for (const exam of examItems) {
  for (const bid of exam.knowledgeBlockIds) {
    const set = blockToExams.get(bid) || new Set()
    set.add(exam.id)
    blockToExams.set(bid, set)
  }
}
function countExamsForBlocks(blockIds) {
  const set = new Set()
  for (const bid of blockIds) {
    const s = blockToExams.get(bid)
    if (s) s.forEach((e) => set.add(e))
  }
  return set.size
}
for (const kp of knowledgePoints) kp.examCount = countExamsForBlocks(kp.allBlockIds)
for (const doc of knowledgeDocs) {
  const set = new Set()
  for (const bid of doc.allBlockIds) {
    const s = blockToExams.get(bid)
    if (s) s.forEach((e) => set.add(e))
  }
  doc.examCount = set.size
}

/* ========== 6.5 序列化倒排索引（Save 体积） ========== */
// invertedK: word -> Map<docIdx, tier>. 序列化为 { word: [[docIdx, tier], ...] }
function serializeInverted(inverted) {
  const out = {}
  for (const [word, entries] of inverted) {
    out[word] = Array.from(entries).map(([docIdx, tier]) => [docIdx, tier])
  }
  return out
}

/* ========== 6.6 章节专属短语（chapterSignatures） ==========
 * 对每个 chapter，用"标题层文本"（section/point/subpoint 标题）统计高频词；
 * 只保留"该章出现 ≥2 次 且 全书占比 ≥60%"的词，作为该章的专属/高频短语。
 * 这些短语代表"这一章真正讲什么"（如 内存管理 → 虚拟/内存/连续/分区；
 * 网络层 → 路由/IP/DHCP；传输层 → 拥塞/TCP/窗口）。
 * 运行时用查询词命中这些专属短语来判定查询的领域归属，做整体相关性加权。
 */
function buildChapterSignatures(docs) {
  const chapterTexts = new Map()
  for (const d of docs) {
    if (!d.chapterTitle) continue
    const text = [d.sectionTitle, d.pointTitle, d.subpointTitle].filter(Boolean).join(' ')
    chapterTexts.set(d.chapterTitle, (chapterTexts.get(d.chapterTitle) || '') + ' ' + text)
  }
  const globalFreq = new Map()
  const perChapterFreq = new Map()
  for (const [chapter, text] of chapterTexts) {
    const freq = new Map()
    for (const w of tokenizeText(text)) {
      if (w.length < 2) continue
      const W = w.toLowerCase()
      globalFreq.set(W, (globalFreq.get(W) || 0) + 1)
      freq.set(W, (freq.get(W) || 0) + 1)
    }
    perChapterFreq.set(chapter, freq)
  }
  const signatures = {}
  for (const [chapter, freq] of perChapterFreq) {
    const words = []
    for (const [w, c] of freq) {
      const g = globalFreq.get(w) || 0
      if (c >= 2 && g >= 2 && c / g >= 0.6) words.push(w)
    }
    if (words.length) signatures[chapter] = words
  }
  return signatures
}

/* ========== 7. 输出 ========== */
const OUT_DIR = path.join(CLIENT_ROOT, 'public', 'search')
mkdirSync(OUT_DIR, { recursive: true })
const output = {
  version: 4,
  generatedAt: new Date().toISOString(),
  // 不再输出 `knowledge`（points 级兼容字段）：运行时 LoadedCorpus 只用 knowledgeDocs，
  // 该字段历史遗留 1.2MB 死字段，2026-08-18 移除。
  knowledgeDocs,                     // 子点级文档（含各层标题字段 + blockTexts）
  invertedK: serializeInverted(invertedK),
  chapterSignatures: buildChapterSignatures(knowledgeDocs),
  exams: examItems,
}
writeFileSync(path.join(OUT_DIR, 'search-index.json'), JSON.stringify(output), 'utf-8')

const subTotal = knowledgePoints.reduce((n, k) => n + k.subpoints.length, 0)
const bytes = Buffer.byteLength(JSON.stringify(output), 'utf-8')
console.log('✓ 搜索语料生成完成')
console.log(`  - 知识: ${knowledgePoints.length} points, ${subTotal} subpoints / ${knowledgeDocs.length} docs`)
console.log(`  - 真题: ${examItems.length} questions`)
console.log(`  - 倒排词条: ${invertedK.size}`)
console.log(`  - 章节签名: ${Object.keys(output.chapterSignatures).length} chapters`)
console.log(`  - 输出大小: ${(bytes / 1024).toFixed(0)} KB`)
