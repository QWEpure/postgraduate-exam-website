/**
 * 搜索 pipeline 调试脚本（脱离浏览器，直接调 searchKnowledge / searchExam）。
 *
 * 用法：
 *   npm run debug:search -- "TCP 可靠传输"
 *   npm run debug:search -- "2019 01"           # 真题题号
 *   npm run debug:search -- "prim算法" 20       # 第二个参数是 topK
 *   npm run debug:search -- rare-report         # 稀有词全局报告 + 典型查询命中统计
 *
 * 实现：jiti 直接跑 .ts，无需 ts-node / 编译。alias 通过 --tsconfig tsconfig.app.json 解析。
 */
import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LoadedCorpus } from '../src/search/shared'
import type { SearchCorpus, SearchExamItem } from '../src/search/types'
import { searchKnowledge, diagnoseRareTerm, type RareTermDiagnosis } from '../src/search/composables/searchKnowledge'
import { searchExam } from '../src/search/composables/searchExam'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const searchDir = join(__dirname, '..', 'src', 'search')

/** rare-report 扫描的典型查询：覆盖 4 门课的"稀有词+泛词"模式查询（最常触发 collapseRareTerm） */
const RARE_REPORT_QUERIES = [
  // 数据结构（算法/查找/排序是最常见的泛词后缀）
  'prim算法', 'kruskal算法', 'dijkstra算法', 'floyd算法',
  'KMP算法', 'AVL树', '红黑树', '哈夫曼树',
  '拓扑排序', '快速排序', '冒泡排序', '二分查找',
  // 操作系统
  '银行家算法', 'LRU置换', 'FIFO置换', '最佳置换',
  '生产者消费者', '哲学家进餐', '读者写者',
  // 计网
  'CSMA/CD协议', 'CSMA/CA协议', '三次握手',
  // 组成
  'RISC指令', '海明码校验',
]

/** 从 408-terms.txt 读取词典（与 shared.ts 用同一个源文件） */
async function loadExam408Dict(): Promise<string> {
  const raw = await readFile(join(searchDir, '408-terms.txt'), 'utf8')
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .join('\n')
}

/** 复制 shared.ts buildSynonymLookup 逻辑（该函数未导出，本地复制一份） */
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

/** 从 public/search/*.json 构造 LoadedCorpus（复刻 shared.ts ensureCorpusLoaded 的逻辑，但走文件系统） */
async function buildCorpusFromDisk(): Promise<LoadedCorpus> {
  const [corpusJson, synonymsJson] = await Promise.all([
    readFile(join(publicDir, 'search', 'search-index.json'), 'utf8').then((s) => JSON.parse(s) as SearchCorpus),
    readFile(join(publicDir, 'search', 'synonyms.json'), 'utf8').then((s) => JSON.parse(s) as string[][]),
  ])

  const examYearNumberMap = new Map<string, SearchExamItem>()
  for (const exam of corpusJson.exams) {
    examYearNumberMap.set(`${exam.year}-${exam.number}`, exam)
  }

  // segmentit 懒加载 + 408 领域词典（任一环节失败回退 undefined，搜索仍可用）
  let segment: ((input: string) => string[]) | undefined
  let term408 = new Set<string>()
  try {
    const [modAny, dictText] = await Promise.all([
      import('segmentit') as unknown as Promise<Record<string, unknown>>,
      loadExam408Dict(),
    ])
    // 同步 parse408Terms 逻辑：每行 "词|POS|词频" 取第 1 段 lowerCase
    for (const raw of dictText.split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const first = line.split('|')[0]?.trim()
      if (first && first.length >= 2) term408.add(first.toLowerCase())
    }
    const mod = modAny as {
      default?: { Segment?: new () => unknown; useDefault?: (s: unknown) => unknown }
      Segment?: new () => unknown
      useDefault?: (s: unknown) => unknown
    }
    const SegmentCtor = mod.Segment ?? mod.default?.Segment
    const useDefaultFn = mod.useDefault ?? mod.default?.useDefault
    if (SegmentCtor && useDefaultFn) {
      const seg = useDefaultFn(new SegmentCtor()) as {
        doSegment?: (s: string, o?: object) => string[] | Array<{ w?: string }>
        loadDict?: (dict: string) => void
      }
      if (typeof seg?.doSegment === 'function') {
        if (typeof seg.loadDict === 'function') seg.loadDict(dictText)
        const doSegment = seg.doSegment.bind(seg)
        segment = (input: string): string[] => {
          const out = doSegment(String(input), { simple: true })
          return Array.isArray(out) ? out.map((x) => (typeof x === 'string' ? x : (x.w ?? ''))) : []
        }
      }
    }
  } catch {
    segment = undefined
  }

  return {
    knowledgeDocs: corpusJson.knowledgeDocs || [],
    invertedK: corpusJson.invertedK || {},
    chapterSignatures: corpusJson.chapterSignatures || {},
    synonyms: buildSynonymLookup(synonymsJson),
    examYearNumberMap,
    segment,
    term408,
  }
}

/** 打印全 invertedK 的 df 分布 */
function printGlobalDfReport(loaded: LoadedCorpus) {
  const buckets = { df0: 0, df1: 0, df2: 0, df3: 0, rareSum: 0, mid: 0, generic: 0 }
  let totalDf1 = 0
  const df1Terms: string[] = []
  for (const [term, list] of Object.entries(loaded.invertedK)) {
    const df = (list || []).length
    totalDf1 += df
    if (df === 0) buckets.df0++
    else if (df === 1) { buckets.df1++; if (df1Terms.length < 30) df1Terms.push(term) }
    else if (df === 2) buckets.df2++
    else if (df === 3) buckets.df3++
    if (df <= 3 && df >= 1) buckets.rareSum++
    else if (df >= 40) buckets.generic++
    else buckets.mid++
  }
  const totalTerms = Object.keys(loaded.invertedK).length
  const avgDf = totalTerms ? (totalDf1 / totalTerms).toFixed(2) : '0'

  console.log('\n' + '━'.repeat(72))
  console.log('  📊 稀有词全局分布报告（倒排索引词级 df 分布）')
  console.log('━'.repeat(72))
  console.log(`  总词数           : ${totalTerms}`)
  console.log(`  知识文档数 N     : ${loaded.knowledgeDocs.length}`)
  console.log(`  平均 df          : ${avgDf}  （每词平均出现在多少篇知识文档的标题/正文里）`)
  console.log('')
  console.log(`  df=0 （查无此文）: ${buckets.df0.toString().padStart(6)} 个 占 ${((buckets.df0/totalTerms)*100).toFixed(1)}%`)
  console.log(`  df=1 （唯一词）  : ${buckets.df1.toString().padStart(6)} 个 占 ${((buckets.df1/totalTerms)*100).toFixed(1)}%`)
  console.log(`  df=2             : ${buckets.df2.toString().padStart(6)} 个 占 ${((buckets.df2/totalTerms)*100).toFixed(1)}%`)
  console.log(`  df=3             : ${buckets.df3.toString().padStart(6)} 个 占 ${((buckets.df3/totalTerms)*100).toFixed(1)}%`)
  console.log(`  ────────────────────────────────────────────────────────────────────`)
  console.log(`  稀有词合计 df≤3  : ${buckets.rareSum.toString().padStart(6)} 个 占 ${((buckets.rareSum/totalTerms)*100).toFixed(1)}%  ← 这些词一旦命中就是核心概念`)
  console.log(`  普通词 4≤df≤39   : ${buckets.mid.toString().padStart(6)} 个 占 ${((buckets.mid/totalTerms)*100).toFixed(1)}%`)
  console.log(`  泛词   df≥40     : ${buckets.generic.toString().padStart(6)} 个 占 ${((buckets.generic/totalTerms)*100).toFixed(1)}%  ← "算法/方式/控制/协议" 这类高频后缀`)
  console.log('')
  if (df1Terms.length) {
    console.log(`  30 个 df=1 典型词（唯一词 = 高度专业/只在某一节里出现过）：`)
    console.log(`    ${df1Terms.slice(0, 30).map(t => `"${t}"`).join('  ')}`)
  }
}

/** 打印典型查询里 collapseRareTerm 触发情况 */
function printRareTermHitReport(loaded: LoadedCorpus) {
  type Row = {
    query: string
    termLines: string[]
    rareCount: number
    genericCount: number
    rareTerm: string | null
    collapsed: boolean
    before: number
    after: number
    reduced: number
  }
  const rows: Row[] = []
  for (const q of RARE_REPORT_QUERIES) {
    const d: RareTermDiagnosis = diagnoseRareTerm(q, loaded, 10)
    const termLines: string[] = []
    for (const t of d.collapseTerms) {
      const tags = [
        t.rare ? '稀有' : '',
        t.generic ? '泛词' : '',
      ].filter(Boolean).join(',')
      termLines.push(`${t.term}(df=${t.df}${tags ? '｜' + tags : ''})`)
    }
    rows.push({
      query: q,
      termLines,
      rareCount: d.rareCount,
      genericCount: d.genericCount,
      rareTerm: d.rareTerm,
      collapsed: d.collapsed,
      before: d.before,
      after: d.after,
      reduced: d.before - d.after,
    })
  }

  console.log('\n' + '━'.repeat(72))
  console.log(`  🗂  典型查询稀有词命中（${RARE_REPORT_QUERIES.length} 条）`)
  console.log('━'.repeat(72))
  const hit = rows.filter((r) => r.collapsed).length
  const totalReduced = rows.reduce((a, r) => a + r.reduced, 0)
  console.log(`  触发折叠 ${hit}/${rows.length} 次  合计减少 ${totalReduced} 条噪声命中`)
  console.log('')
  console.log('  ' + [
    '查询'.padEnd(18, ' '),
    'Rare'.padStart(4),
    '泛词'.padStart(4),
    '触发?'.padEnd(5),
    '稀有词'.padEnd(12),
    'before→after(减少)'.padStart(16),
    '判定词(df,tag)',
  ].join(' │ '))
  console.log('  ' + '─'.repeat(140))
  for (const r of rows) {
    const base = [
      r.query.padEnd(18, ' '),
      r.rareCount.toString().padStart(4),
      r.genericCount.toString().padStart(4),
      (r.collapsed ? '✅' : '·').padEnd(5),
      (r.rareTerm || '—').padEnd(12),
      `${r.before} → ${r.after} (-${r.reduced})`.padStart(16),
      r.termLines.join('  '),
    ].join(' │ ')
    console.log('  ' + base)
  }

  // 附录：每个触发折叠的查询，列出被它过滤掉的标题
  const collapsedRows = rows.filter((r) => r.collapsed)
  if (collapsedRows.length) {
    console.log('\n' + '━'.repeat(72))
    console.log('  🧹 被折叠过滤掉的噪声命中明细（典型）')
    console.log('━'.repeat(72))
    for (const r of collapsedRows) {
      const d = diagnoseRareTerm(r.query, loaded, 10)
      console.log(`\n  ▸ 查询 "${r.query}"（稀有词="${r.rareTerm}"，过滤 ${d.filteredTitles.length} 条）:`)
      for (const f of d.filteredTitles.slice(0, 6)) {
        console.log(`      ✗ ${f}`)
      }
      if (d.filteredTitles.length > 6) console.log(`      …等共 ${d.filteredTitles.length} 条`)
    }
  }
}

async function main() {
  const firstArg = process.argv[2]

  console.log('━'.repeat(60))
  console.log('  加载语料...')
  const t0 = Date.now()
  const loaded = await buildCorpusFromDisk()
  console.log(`  耗时: ${Date.now() - t0}ms`)
  console.log(`  knowledgeDocs : ${loaded.knowledgeDocs.length} 条`)
  console.log(`  invertedK     : ${Object.keys(loaded.invertedK).length} 个词`)
  console.log(`  examYearNumber: ${loaded.examYearNumberMap.size} 道真题`)
  console.log(`  synonyms      : ${loaded.synonyms.size} 个映射项`)
  console.log(`  segment       : ${loaded.segment ? '已加载' : '未加载（将降级为 bigram）'}`)
  console.log(`  term408       : ${loaded.term408.size} 个 408 专有名词`)

  /* ========== 子命令：rare-report ========== */
  if (firstArg === 'rare-report') {
    printGlobalDfReport(loaded)
    printRareTermHitReport(loaded)
    return
  }

  /* ========== 默认行为：单查询调试 ========== */
  const query = firstArg || 'TCP 可靠传输'
  const topK = Number(process.argv[3] || 10)

  console.log('\n' + '━'.repeat(60))
  console.log(`  查询: "${query}"   topK=${topK}`)
  console.log('━'.repeat(60))

  // 稀有词诊断（先打报告再打结果，一眼能看折叠效果）
  const diag = diagnoseRareTerm(query, loaded, topK)
  console.log('\n▼ 稀有词分析')
  for (const t of diag.collapseTerms) {
    const tags = [t.rare ? '稀有' : '', t.generic ? '泛词' : ''].filter(Boolean)
    console.log(`  - ${t.term.padEnd(14)} df=${String(t.df).padEnd(4)} ${tags.join(' ')}`)
  }
  console.log(`  rare=${diag.rareCount} generic=${diag.genericCount} rareTerm=${diag.rareTerm || '—'}`)
  console.log(`  折叠: ${diag.collapsed ? `✅ 触发（${diag.before} → ${diag.after}，减少 ${diag.before - diag.after}）` : '· 未触发'}`)

  // 真题精确命中
  console.log('\n▼ 真题精确命中 (searchExam)')
  const exact = searchExam(query, loaded)
  if (exact.length) {
    for (const r of exact) {
      console.log(`  ✓ ${r.title}  [${r.subtitle}]`)
      console.log(`    snippet: ${r.snippet}`)
      console.log(`    route  : ${r.route}`)
    }
  } else {
    console.log('  (无命中)')
  }

  // 知识检索
  console.log('\n▼ 知识检索 (searchKnowledge)')
  const t1 = Date.now()
  const results = searchKnowledge(query, loaded, topK)
  console.log(`  耗时: ${Date.now() - t1}ms  返回 ${results.length} 条`)
  if (!results.length) {
    console.log('  (无命中)')
    return
  }
  results.forEach((r, i) => {
    console.log(`\n  ─── [${i + 1}] [${r.matchField}] ${r.title} ───`)
    console.log(`      score        : ${r.score.toFixed(2)}`)
    console.log(`      路径        : ${r.subtitle}`)
    console.log(`      snippet     : ${r.snippet}`)
    console.log(`      blockId     : ${r.blockId}`)
    console.log(`      examCount   : ${r.examCount}`)
    console.log(`      highlightQuery: ${r.highlightQuery}`)
    console.log(`      route       : ${r.route}`)
  })
}

main().catch((e) => {
  console.error('调试脚本异常:', e)
  process.exit(1)
})
