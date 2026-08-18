/**
 * searchKnowledge —— 知识文档检索（按 section 算分）。
 *
 * 设计：
 *   1. 算分单位是 section，subpoint/point 不再独立算分。
 *   2. section 总分 = section 内所有 snippet 候选得分之和：
 *      - section 标题命中 ×3
 *      - subpoint 标题命中 ×2
 *      - 正文句子命中 ×1
 *      命中越多 / 命中词越长 / 是 408 术语 / 是精准短语整段，分数越高。
 *   3. snippet 是 section 内得分最高的那一句（或标题），高亮展示给用户。
 *
 * 流程：
 *   buildQueryContext  → 词权重 / IDF / 408 术语 / 领域归属 / 精准短语
 *   scanInvertedIndex  → 倒排查表，找出所有命中 section（性能优化：跳过完全没命中的 section）
 *   scoreSections      → 对每个命中 section 算总分 + 挑最佳 snippet 候选
 *   排序取 topK → 构造 SearchResult
 */
import type {
  KnowledgeMatchField,
  SearchKnowledgeDoc,
  SearchResult,
} from '@/search/types'
import type { LoadedCorpus } from '@/search/shared'
import {
  CJK_RE,
  extractSnippet,
  normalizeIo,
} from '@/search/shared'

/* ========================================================================== *
 * 1. 同义词扩展（保留原逻辑）
 * ========================================================================== */

/** ASCII 同义词按整词边界匹配，避免 "IM" 误命中 "prim"、"CA" 误命中 "cache" */
function asciiWordMatch(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`).test(text)
}

/**
 * 同义词展开：对查询做"词级匹配"展开。
 *  - 保留原文 token（按空白切）。
 *  - 中文同义词用子串匹配（中文无词边界）；ASCII 同义词用整词边界匹配。
 *  - 命中的同义词组把所有变体加入展开集。
 */
export function expandWithSynonyms(rawQuery: string, synonyms: Map<string, string[]>): string {
  const text = String(rawQuery)
  const expanded = new Set<string>()
  text.replace(/[\p{P}]/gu, ' ').split(/\s+/).filter(Boolean).forEach((t) => expanded.add(t))

  const lowerText = normalizeIo(text).toLowerCase()
  for (const [word, group] of synonyms) {
    if (!word) continue
    const matched = /[\u3400-\u9FFF]/.test(word)
      ? lowerText.includes(word)
      : asciiWordMatch(lowerText, word)
    if (matched) group.forEach((g) => expanded.add(g))
  }
  return Array.from(expanded).join(' ')
}

/** 抽取精准短语候选：整句 + 各连续 CJK 段。任一作为子串出现即视为精准命中。 */
function exactPhraseCandidates(expanded: string): string[] {
  const trimmed = normalizeIo(expanded).toLowerCase().trim().replace(/\s+/g, ' ')
  const out: string[] = []
  if (trimmed.length >= 2) out.push(trimmed)
  for (const m of trimmed.matchAll(CJK_RE)) {
    const seg = m[0].toLowerCase()
    if (seg.length >= 2 && !out.includes(seg)) out.push(seg)
  }
  return out
}

/* ========================================================================== *
 * 2. 查询上下文：词权重 / IDF / 408 术语 / 领域 / 精准短语
 * ========================================================================== */

/** segmentit 切词后的位置加权：越靠前的词越是用户强调的核心 */
const SEG_POS_WEIGHTS = [1.2, 1.0, 0.8, 0.7, 0.7, 0.7]

/** 408 专有名词命中时的额外加权重 */
const TERM408_WEIGHT = 1.8

/**
 * 词长因子：纯按字符数线性加权，与 CJK/df/408 无关。
 *  2 字 = 1.0，每多 1 字 +0.15。长词 = 整词专业术语，应获得独立加成。
 */
const LEN_FACTOR_BASE = 2
const LEN_FACTOR_SLOPE = 0.15
function lenFactor(w: string): number {
  return 1 + Math.max(0, w.length - LEN_FACTOR_BASE) * LEN_FACTOR_SLOPE
}

type QueryContext = {
  rawQuery: string
  expanded: string
  termWeights: Map<string, number>
  queryTerms: Array<[string, number]>
  phrases: string[]
  termIdf: Map<string, number>
  domainChapters: Set<string>
  hasDomainTerm: boolean
}

function buildQueryContext(query: string, loaded: LoadedCorpus): QueryContext {
  const expanded = expandWithSynonyms(query, loaded.synonyms)
  const termWeights = new Map<string, number>()

  if (loaded.segment) {
    let pos = 0
    for (const w of loaded.segment(query)) {
      const W = (w || '').trim().toLowerCase()
      if (W.length >= 2) {
        const posWeight = SEG_POS_WEIGHTS[Math.min(pos, SEG_POS_WEIGHTS.length - 1)]
        const t408 = loaded.term408.has(W) ? TERM408_WEIGHT : 1
        termWeights.set(W, Math.max(termWeights.get(W) || 0, 4 * posWeight * t408 * lenFactor(W)))
        pos++
      }
    }
  }

  const expandedNorm = normalizeIo(expanded).normalize('NFKC').toLowerCase()
  for (const m of expandedNorm.matchAll(/[a-z0-9]+/g)) {
    const w = m[0]
    if (w) {
      const t408 = loaded.term408.has(w) ? TERM408_WEIGHT : 1
      termWeights.set(w, Math.max(termWeights.get(w) || 0, 4 * t408 * lenFactor(w)))
    }
  }
  for (const m of expandedNorm.matchAll(CJK_RE)) {
    const seg = m[0]
    if (seg.length >= 2) {
      const t408 = loaded.term408.has(seg) ? TERM408_WEIGHT : 1
      termWeights.set(seg, Math.max(termWeights.get(seg) || 0, 5 * t408 * lenFactor(seg)))
    }
  }

  const queryTerms = Array.from(termWeights.entries()).filter(([t]) => t.length >= 1)
  const phrases = exactPhraseCandidates(expanded)

  const N = Math.max(1, loaded.knowledgeDocs.length)
  const termIdf = new Map<string, number>()
  for (const [term] of termWeights) {
    const df = (loaded.invertedK[term] || []).length
    termIdf.set(term, Math.log((N + 1) / (df + 1)) + 1)
  }

  const signatureEntries = Object.entries(loaded.chapterSignatures)
  const domainChapters = new Set<string>()
  for (const [term] of termWeights) {
    const t = term.toLowerCase()
    const hitChapters: string[] = []
    for (const [chapter, words] of signatureEntries) {
      if (words.some((w) => w.includes(t) || t.includes(w))) hitChapters.push(chapter)
      if (hitChapters.length > 3) break
    }
    if (hitChapters.length >= 1 && hitChapters.length <= 3) {
      hitChapters.forEach((c) => domainChapters.add(c))
    }
  }

  return { rawQuery: query, expanded, termWeights, queryTerms, phrases, termIdf, domainChapters, hasDomainTerm: domainChapters.size > 0 }
}

/* ========================================================================== *
 * 3. 倒排查表：找出所有命中过的 doc（性能优化，跳过完全无命中的 section）
 * ========================================================================== */

type DocHit = { docIdx: number; words: Set<string> }

function scanInvertedIndex(ctx: QueryContext, loaded: LoadedCorpus): Map<number, DocHit> {
  const acc = new Map<number, DocHit>()

  for (const [term] of ctx.queryTerms) {
    const entries = loaded.invertedK[term]
    if (!entries) continue
    for (const [docIdx] of entries) {
      let h = acc.get(docIdx)
      if (!h) { h = { docIdx, words: new Set() }; acc.set(docIdx, h) }
      h.words.add(term)
    }
  }

  // 兜底：倒排未收录的词做全文扫描（覆盖"重定位"这类被分词切裂的术语）
  for (const [term] of ctx.queryTerms) {
    const lowerTerm = term.toLowerCase()
    if (loaded.invertedK[lowerTerm]?.length) continue
    for (const doc of loaded.knowledgeDocs) {
      const titleHit = doc.sectionTitle?.toLowerCase().includes(lowerTerm)
        || doc.pointTitle?.toLowerCase().includes(lowerTerm)
        || doc.subpointTitle?.toLowerCase().includes(lowerTerm)
      // body 字段已不在 build 产物里输出，用 blockTexts 拼接做兜底扫描
      const bodyHit = doc.blockTexts.some((bt) => bt.toLowerCase().includes(lowerTerm))
      if (!titleHit && !bodyHit) continue
      let h = acc.get(doc.docIdx)
      if (!h) { h = { docIdx: doc.docIdx, words: new Set() }; acc.set(doc.docIdx, h) }
      h.words.add(term)
    }
  }

  return acc
}

/* ========================================================================== *
 * 4. section 聚合 + 候选评分
 * ========================================================================== */

type SectionGroup = {
  sectionId: string
  bookId: string
  bookTitle: string
  chapterTitle: string
  sectionTitle: string
  route: string
  docs: SearchKnowledgeDoc[]
}

/** 按 sectionId 聚合 docs */
function groupDocsBySection(docs: SearchKnowledgeDoc[]): Map<string, SectionGroup> {
  const groups = new Map<string, SectionGroup>()
  for (const doc of docs) {
    let g = groups.get(doc.sectionId)
    if (!g) {
      g = {
        sectionId: doc.sectionId,
        bookId: doc.bookId,
        bookTitle: doc.bookTitle,
        chapterTitle: doc.chapterTitle,
        sectionTitle: doc.sectionTitle,
        route: doc.route,
        docs: [],
      }
      groups.set(doc.sectionId, g)
    }
    g.docs.push(doc)
  }
  return groups
}

/** 把正文文本切成句子（中文标点 / 英文标点 / 换行） */
function splitSentences(text: string): string[] {
  return text
    .split(/[。？！；\n.?!;]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4)
}

type Candidate = {
  text: string
  kind: 'sectionTitle' | 'pointTitle' | 'subpointTitle' | 'sentence'
  doc: SearchKnowledgeDoc
}

/** 收集 section 内所有 snippet 候选：section 标题 + point 标题 + subpoint 标题 + 各 block 的句子 */
function collectCandidates(section: SectionGroup): Candidate[] {
  const out: Candidate[] = []

  if (section.sectionTitle) {
    out.push({ text: section.sectionTitle, kind: 'sectionTitle', doc: section.docs[0] })
  }

  // pointTitle 在 section 级别去重，避免同一个 point 标题被多个 subpoint doc 重复计入总分
  const seenPointTitles = new Set<string>()
  for (const doc of section.docs) {
    if (doc.pointTitle && !seenPointTitles.has(doc.pointTitle)) {
      seenPointTitles.add(doc.pointTitle)
      out.push({ text: doc.pointTitle, kind: 'pointTitle', doc })
    }
  }

  for (const doc of section.docs) {
    if (doc.subpointTitle) {
      out.push({ text: doc.subpointTitle, kind: 'subpointTitle', doc })
    }
    // block 级文本：用 blockTexts（与 blockIds 一一对应）切句子
    for (let i = 0; i < doc.blockTexts.length; i++) {
      const text = String(doc.blockTexts[i] || '').trim()
      if (!text) continue
      const sentences = splitSentences(text)
      if (sentences.length === 0) {
        out.push({ text, kind: 'sentence', doc })
      } else {
        for (const s of sentences) {
          out.push({ text: s, kind: 'sentence', doc })
        }
      }
    }
  }

  return out
}

/** 候选内部得分：命中词权重 × IDF × 词长因子 × 类型倍率 × 精准短语加成 */
function scoreCandidate(text: string, kind: Candidate['kind'], ctx: QueryContext): {
  score: number
  matchedWords: string[]
  hit: boolean
} {
  const t = normalizeIo(text || '').toLowerCase()
  if (!t) return { score: 0, matchedWords: [], hit: false }

  let score = 0
  const matchedWords: string[] = []

  for (const [term, weight] of ctx.termWeights) {
    const lower = term.toLowerCase()
    if (t.includes(lower)) {
      const idf = ctx.termIdf.get(term) ?? 1
      const lenF = lenFactor(term)
      score += weight * idf * lenF
      matchedWords.push(term)
    }
  }

  if (!matchedWords.length) return { score: 0, matchedWords: [], hit: false }

  // 精准短语整段命中加成 ×1.5
  let exactBonus = 1
  if (ctx.phrases.some((p) => t.includes(p))) {
    exactBonus = 1.5
  }

  // 标题层 / 正文层倍率：section 标题 ×3，point 标题 ×2.5，subpoint 标题 ×2，正文句子 ×1
  const kindMultiplier = kind === 'sectionTitle' ? 3.0
    : kind === 'pointTitle' ? 2.5
    : kind === 'subpointTitle' ? 2.0
    : 1.0

  return {
    score: score * kindMultiplier * exactBonus,
    matchedWords,
    hit: true,
  }
}

/** section 总分 + 最佳 snippet 候选 */
type SectionScore = {
  section: SectionGroup
  totalScore: number
  best: { candidate: Candidate; score: number; matchedWords: string[] } | null
  matchedWords: string[]
}

function scoreSection(section: SectionGroup, ctx: QueryContext): SectionScore {
  const candidates = collectCandidates(section)
  const allMatchedWords = new Set<string>()
  let totalScore = 0
  let best: { candidate: Candidate; score: number; matchedWords: string[] } | null = null

  for (const candidate of candidates) {
    const r = scoreCandidate(candidate.text, candidate.kind, ctx)
    if (!r.hit) continue
    totalScore += r.score
    r.matchedWords.forEach((w) => allMatchedWords.add(w))
    if (!best || r.score > best.score) {
      best = { candidate, score: r.score, matchedWords: r.matchedWords }
    }
  }

  return { section, totalScore, best, matchedWords: Array.from(allMatchedWords) }
}

/* ========================================================================== *
 * 5. 主入口
 * ========================================================================== */

/**
 * 知识搜索主入口：检索 + 构造 SearchResult[]。
 *  - 算分单位是 section：section 内部命中越多、越精准、越长，得分越高。
 *  - snippet 是 section 内得分最高的候选（标题或正文句子），高亮展示给用户。
 */
export function searchKnowledge(query: string, loaded: LoadedCorpus, topK: number): SearchResult[] {
  const ctx = buildQueryContext(query, loaded)
  const docHits = scanInvertedIndex(ctx, loaded)

  // 找出所有命中过的 doc，按 sectionId 聚合
  const hitDocs: SearchKnowledgeDoc[] = []
  for (const docIdx of docHits.keys()) {
    const doc = loaded.knowledgeDocs[docIdx]
    if (doc) hitDocs.push(doc)
  }
  if (hitDocs.length === 0) return []

  const sections = groupDocsBySection(hitDocs)

  // 领域一致性加成：查询领域明确时，该领域章下 section ×1.6，跨领域 ×0.7
  const scored: SectionScore[] = []
  for (const section of sections.values()) {
    const result = scoreSection(section, ctx)
    if (result.totalScore <= 0) continue

    const domainFactor = ctx.hasDomainTerm
      ? (ctx.domainChapters.has(section.chapterTitle) ? 1.6 : 0.7)
      : 1
    result.totalScore *= domainFactor

    scored.push(result)
  }

  scored.sort((a, b) => b.totalScore - a.totalScore)

  return scored.slice(0, topK).map(({ section, totalScore, best, matchedWords }) => {
    const snippetText = best?.candidate.text || ''
    const snippetMatchedWords = best?.matchedWords || matchedWords

    return {
      type: 'knowledge' as const,
      title: section.sectionTitle,
      subtitle: [section.bookTitle, section.chapterTitle, section.sectionTitle].filter(Boolean).join(' › '),
      snippet: extractSnippet(snippetText, snippetMatchedWords.join(' ') || query),
      route: section.route,
      blockId: best?.candidate.doc.blockId,
      blockIds: section.docs.flatMap((d) => d.allBlockIds),
      examCount: section.docs[0]?.examCount || 0,
      matchField: 'section' as KnowledgeMatchField,
      sectionId: section.sectionId,
      matchedBlockId: best?.candidate.doc.blockId,
      bookTitle: section.bookTitle,
      chapterTitle: section.chapterTitle,
      sectionTitle: section.sectionTitle,
      score: totalScore,
      highlightQuery: ctx.expanded,
    }
  })
}
