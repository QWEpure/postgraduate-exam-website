/**
 * search/shared —— 真题搜索与知识搜索共用的底层工具。
 *
 *  - 语料加载：从 /search/*.json 拉取并构建运行时索引结构（全局 Promise 缓存）
 *  - 文本归一化：normalizeIo、CJK_RE
 *  - 高亮候选词抽取：extractHighlightTerms（拉丁整词 + CJK 整段 + bigram）
 *  - snippet 截取：以首个命中 token 为中心
 *  - 高亮：highlightText
 */
import type {
  ChapterSignatures,
  InvertedIndex,
  SearchCorpus,
  SearchExamItem,
  SearchKnowledgeDoc,
} from '@/search/types'

/* ========================================================================== *
 * 文本归一化
 * ========================================================================== */

/** 把 "I/O" / "i / o" 归一为 "io"，让 "IO" 查询能命中 "I/O" 文档 */
export function normalizeIo(text: string): string {
  return String(text).replace(/i\s*\/\s*o/gi, 'io')
}

/** CJK 连续段正则（含扩展 CJK / 假名 / 谚文 / 全角符号） */
export const CJK_RE = /[\u3400-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\uFF00-\uFFEF]+/g

/* ========================================================================== *
 * 词法分析：从查询抽取匹配项与权重
 * ========================================================================== */

/* ========================================================================== *
 * 语料加载（Promise 缓存 + segmentit 懒加载）
 * ========================================================================== */

/** 运行时语料：真题与知识各自取需要的字段 */
export type LoadedCorpus = {
  /** 子点级知识文档（倒排索引单位），下标即 docIdx */
  knowledgeDocs: SearchKnowledgeDoc[]
  /** 倒排索引：词 -> [[docIdx, tier], ...]，tier 0=标题层，1=正文层 */
  invertedK: InvertedIndex
  /** 章节专属短语：chapterTitle -> 该章高频/专属词（用于查询领域归属） */
  chapterSignatures: ChapterSignatures
  /** 同义词查找表：word → 同组全部变体 */
  synonyms: Map<string, string[]>
  /** 真题 "年份-题号" -> exam，用于精确题号命中 */
  examYearNumberMap: Map<string, SearchExamItem>
  /** 中文分词器（segmentit，懒加载；失败退化为 bigram） */
  segment?: (input: string) => string[]
  /** 408 专有名词集合：从 408-terms.txt 解析，命中这些词时评分加权重（×TERM408_WEIGHT） */
  term408: Set<string>
}

/* ========================================================================== *
 * 公共路径工具（GitHub Pages 二级目录部署适配）
 * ========================================================================== */

/**
 * 拼上 Vite 部署的 base 路径，让二级目录部署下也能正确请求静态资源。
 *   - base = '/postgraduate-exam-website/'，
 *     withBase('/search/search-index.json') → '/postgraduate-exam-website/search/search-index.json'
 *   - base = '/' 时直接原样返回。
 * 完整 URL（http(s):// / //:）和相对路径不拼接，直接返回。
 */
export function withBase(path: string): string {
  if (!path) return ''
  if (/^(https?:)?\/\//i.test(path)) return path // 完整 URL / protocol-relative
  if (!path.startsWith('/')) return path          // 相对路径直接返回
  const base = import.meta.env?.BASE_URL ?? '/'
  if (!base || base === '/') return path
  return `${base.replace(/\/$/, '')}${path}`
}

let corpusPromise: Promise<LoadedCorpus> | null = null
let segmentPromise: Promise<((input: string) => string[]) | undefined> | null = null

/* ========================================================================== *
 * 语料加载（Promise 缓存 + segmentit 懒加载）
 * ========================================================================== */

/**
 * 读取 408 领域专业词典（与 debug-search.ts / public/search 共用同一个 408-terms.txt 源文件）。
 *  - 浏览器：fetch(withBase('/search/408-terms.txt'))（适配 GitHub Pages 二级目录）
 *  - Node jiti：fetch(file:///...)，fallback 到 fs 读 src/search/408-terms.txt 源
 */
async function loadExam408Dict(): Promise<string> {
  const browserPath = withBase('/search/408-terms.txt')
  try {
    const res = await fetch(browserPath)
    if (res.ok) {
      const txt = await res.text()
      return txt
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
        .join('\n')
    }
  } catch {
    /* 浏览器 fetch 失败（非 HTTP 环境，如 Node/jiti），继续尝试 Node fs 路径 */
  }
  // Node/jiti fallback：直接读源文件
  try {
    // 动态 import，浏览器端不需要这俩也不会执行到这里
    const { readFileSync } = await import('node:fs') as typeof import('node:fs')
    const { dirname, join } = await import('node:path') as typeof import('node:path')
    const { fileURLToPath } = await import('node:url') as typeof import('node:url')
    const here = dirname(fileURLToPath(import.meta.url))
    const raw = readFileSync(join(here, '408-terms.txt'), 'utf8')
    return raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .join('\n')
  } catch {
    return ''
  }
}

/** 懒加载 segmentit 分词器，注入 408 领域词典。任一步失败回退 undefined（降级 bigram） */
function loadSegmentit(): Promise<((input: string) => string[]) | undefined> {
  if (segmentPromise) return segmentPromise
  segmentPromise = (async () => {
    try {
      const [modAny, dictText] = await Promise.all([
        import('segmentit') as unknown as Promise<Record<string, unknown>>,
        loadExam408Dict(),
      ])
      const mod = modAny as {
        default?: { Segment?: new () => unknown; useDefault?: (s: unknown) => unknown }
        Segment?: new () => unknown
        useDefault?: (s: unknown) => unknown
      }
      const SegmentCtor = mod.Segment ?? mod.default?.Segment
      const useDefaultFn = mod.useDefault ?? mod.default?.useDefault
      if (!SegmentCtor || !useDefaultFn) return undefined
      const seg = useDefaultFn(new SegmentCtor()) as {
        doSegment?: (s: string, o?: object) => string[] | Array<{ w?: string }>
        loadDict?: (dict: string) => void
      }
      if (typeof seg?.doSegment !== 'function') return undefined
      // 注入 408 领域词典（词频 4000-5500 高于默认词典，保证专业词义优先）
      if (dictText && typeof seg.loadDict === 'function') seg.loadDict(dictText)
      const doSegment = seg.doSegment.bind(seg)
      return (input: string): string[] => {
        const out = doSegment(String(input), { simple: true })
        return Array.isArray(out) ? out.map((x) => (typeof x === 'string' ? x : (x.w ?? ''))) : []
      }
    } catch {
      return undefined
    }
  })()
  return segmentPromise
}

/** 把同义词组二维数组转为 word → 同组全部变体 的查找表 */
function buildSynonymLookup(groups: string[][]): Map<string, string[]> {
  const lookup = new Map<string, string[]>()
  for (const group of groups) {
    const normGroup = group.map((w) => w.trim()).filter(Boolean)
    for (const word of normGroup) {
      const key = word.toLowerCase()
      const prior = lookup.get(key) || []
      const merged = Array.from(new Set([...prior, ...normGroup]))
      for (const w of merged) lookup.set(w.toLowerCase(), merged)
    }
  }
  return lookup
}

/** 把 408-terms.txt 的每行 "词|POS|词频" 解析成词名集合（词的大小写归一用 lowerCase 后比对） */
function parse408Terms(dictText: string): Set<string> {
  const set = new Set<string>()
  for (const raw of dictText.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const first = line.split('|')[0]?.trim()
    if (first && first.length >= 2) set.add(first.toLowerCase())
  }
  return set
}

/** 加载搜索语料 JSON + 同义词 + 分词器，构建运行时索引结构（全局缓存） */
export async function ensureCorpusLoaded(): Promise<LoadedCorpus> {
  if (corpusPromise) return corpusPromise
  corpusPromise = (async () => {
    const [corpusJson, synonymsJson, dictText, segment]: [SearchCorpus, string[][], string, ((i: string) => string[]) | undefined] = await Promise.all([
      fetch(withBase('/search/search-index.json')).then((r) => r.json()),
      fetch(withBase('/search/synonyms.json')).then((r) => r.json()),
      loadExam408Dict(),
      loadSegmentit(),
    ])

    const examYearNumberMap = new Map<string, SearchExamItem>()
    for (const exam of corpusJson.exams) {
      examYearNumberMap.set(`${exam.year}-${exam.number}`, exam)
    }

    return {
      knowledgeDocs: corpusJson.knowledgeDocs || [],
      invertedK: corpusJson.invertedK || {},
      chapterSignatures: corpusJson.chapterSignatures || {},
      synonyms: buildSynonymLookup(synonymsJson),
      examYearNumberMap,
      segment,
      term408: parse408Terms(dictText),
    }
  })()
  return corpusPromise
}

/* ========================================================================== *
 * snippet 截取：以匹配位置为中心
 * ========================================================================== */

/** 以首个命中 token 为中心截取 maxLen 长度的片段，前后加 … */
export function extractSnippet(text: string, rawQuery: string, maxLen = 70): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLen) return clean

  const rawTokens = rawQuery.replace(/\p{P}/gu, ' ').split(/\s+/).filter(Boolean).map((t) => t.toLowerCase())
  const cjkBigrams: string[] = []
  for (const m of rawQuery.matchAll(/[\u3400-\u9FFF]+/g)) {
    const seg = m[0]
    for (let i = 0; i < seg.length - 1; i++) cjkBigrams.push(seg.slice(i, i + 2).toLowerCase())
  }
  const allTokens = [...rawTokens, ...cjkBigrams].filter((t) => t.length >= 2).sort((a, b) => b.length - a.length)

  const lower = clean.toLowerCase()
  let hit = -1
  for (const t of allTokens) {
    const idx = lower.indexOf(t)
    if (idx >= 0) { hit = idx; break }
  }
  if (hit < 0) hit = 0

  const half = Math.floor(maxLen / 2)
  let start = Math.max(0, hit - half)
  if (start + maxLen > clean.length) start = Math.max(0, clean.length - maxLen)

  const prefix = start > 0 ? '…' : ''
  const suffix = start + maxLen < clean.length ? '…' : ''
  return `${prefix}${clean.slice(start, start + maxLen)}${suffix}`
}

/* ========================================================================== *
 * 高亮工具
 * ========================================================================== */

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 抽取高亮候选词：拉丁整词 + CJK 整段 + CJK bigram（复用原 lexMatchTerms 的词抽取逻辑） */
function extractHighlightTerms(rawQuery: string): string[] {
  const text = 
  normalizeIo(String(rawQuery)).normalize('NFKC').toLowerCase()
  const terms = new Set<string>()
  for (const m of text.matchAll(/[a-z0-9]+/g)) {
    const w = m[0]
    if (w) terms.add(w)
  }
  for (const m of text.matchAll(CJK_RE)) {
    const seg = m[0]
    if (seg.length >= 2) {
      terms.add(seg)
      for (let i = 0; i < seg.length - 1; i++) terms.add(seg.slice(i, i + 2))
    }
  }
  return Array.from(terms)
}

/**
 * 高亮查询命中：按查询抽取的词（整词/整段 + bigram）在文本里插 <mark>。
 *  - 长匹配项优先，避免短项先插入 <mark> 干扰长项匹配。
 *  - "io" 允许匹配 "I/O"（斜杠可选），让 "IO方式" 能高亮正文里的 "I/O"。
 */
export function highlightText(text: string, rawQuery: string): string {
  if (!text) return ''
  const terms = extractHighlightTerms(rawQuery)
  if (!terms.length) return escapeHtml(text)
  const sorted = terms.sort((a, b) => b.length - a.length)
  let result = escapeHtml(text)
  for (const term of sorted) {
    const patternSource = escapeRegExp(escapeHtml(term)).replace(/io/gi, 'i[/]?o')
    result = result.replace(
      new RegExp(`(?!<mark[^>]*>)([^<]*?)(${patternSource})([^<]*?)(?![^<]*</mark>)`, 'ig'),
      '$1<mark>$2</mark>$3',
    )
  }
  return result
}
