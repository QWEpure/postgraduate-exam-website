export type SearchKnowledgeSubpoint = {
  /** kb-* 稳定块 ID */
  blockId: string
  /** subpoint 标题 */
  title: string
  /** 从 paragraph/callout/formula/image.caption/html 提取的纯文本（去掉 Markdown 语法） */
  text: string
}

export type SearchKnowledgePoint = {
  /** 知识树 point id，如 kp-tcp-reliable */
  pointId: string
  /** 所属 section id，如 cn-transport-tcp */
  sectionId: string
  /** 所属 book id，如 cn */
  bookId: string
  /** point 标题 */
  title: string
  /** 完整面包屑，如 "计算机网络 › 传输层 › TCP 可靠传输" */
  breadcrumb: string
  /** 跳转路由，如 "/knowledge/cn/cn-transport-tcp" */
  route: string
  /** subpoint 列表：正文文本与 blockId 一一对应 */
  subpoints: SearchKnowledgeSubpoint[]
  /** 该 point 下所有 subpoint 关联的真题数量（去重） */
  examCount: number
  /** 该 point 关联的所有知识块 ID（聚合） */
  allBlockIds: string[]
}

/**
 * 子点级可检索文档（倒排索引单位）。
 * 字段按匹配优先级分层：book/chapter/section/point/subpoint 标题属于"标题层"（tier0），
 * 正文 body 与完整路径 breadcrumb 属于"正文层"（tier1）。标题级命中的排最前。
 */
export type SearchKnowledgeDoc = {
  /** 作为倒排索引与 knowledgeDocs 数组下标的唯一索引 */
  docIdx: number
  pointId: string
  sectionId: string
  bookId: string
  bookTitle: string
  chapterTitle: string
  sectionTitle: string
  pointTitle: string
  subpointTitle: string
  /**
   * 子点正文纯文本（无 Markdown），由各 block 文本用空格拼接而成。
   * 历史字段，新构建产物不再输出；运行时如需拼接正文，用 `blockTexts.join(' ')`。
   * 保留为可选字段以兼容旧产物。
   */
  body?: string
  /** 各 block 的纯文本，与 blockIds 一一对应（用于反查 snippet 对应的具体 block） */
  blockTexts: string[]
  /** 当前 subpoint 自己的 block id 数组，与 blockTexts 一一对应 */
  blockIds: string[]
  /** subpoint 在文章里的稳定 id（如 'co-cache-performance'），用于标题命中时跳到 h2 锚点 */
  subpointId: string
  /** 完整面包屑，如 "计算机网络 › 传输层 › TCP 可靠传输" */
  breadcrumb: string
  route: string
  blockId: string
  /** 整个 point 下所有 subpoint 的 block id 聚合（"看相关真题"用） */
  allBlockIds: string[]
  examCount: number
}

export type SearchExamItem = {
  /** 题目 id，如 exam-2020-5 */
  id: string
  year: number
  number: number
  /** 展示标题，如 "2020年第5题" */
  title: string
  /** 科目英文：ds / co / os / cn */
  subject: string
  /** 章节中文，如 "传输层" */
  chapter: string
  /** 题干预览文字（来自 index.json.stemText） */
  stem: string
  /** 标签数组 */
  tags: string[]
  /** 关联的知识块 ID */
  knowledgeBlockIds: string[]
  /** 跳转路由，如 "/exams?year=2020&exam=exam-2020-5" */
  route: string
}

/** 倒排索引：词 -> [[docIdx, 最低tier], ...]，tier0=标题层，tier1=正文层 */
export type InvertedIndex = Record<string, Array<[number, number]>>

/** 章节专属短语：chapterTitle -> 该章高频/专属词（用于查询领域归属判断） */
export type ChapterSignatures = Record<string, string[]>

/** 构建时输出的搜索语料 JSON */
export type SearchCorpus = {
  version: number
  generatedAt: string
  knowledge: SearchKnowledgePoint[]
  knowledgeDocs: SearchKnowledgeDoc[]
  invertedK: InvertedIndex
  chapterSignatures?: ChapterSignatures
  exams: SearchExamItem[]
}

/** 知识结果的匹配层级（用于展示/排序）：数值越小优先级越高 */
export type KnowledgeMatchField =
  | 'subpoint'   // 子点标题
  | 'point'      // 知识点标题
  | 'section'    // section 标题
  | 'chapter'    // 章节标题
  | 'book'       // 书名
  | 'body'       // 正文
  | 'breadcrumb' // 完整路径（冗余召回）

/** 运行时查询返回的单条结果 */
export type SearchResult = {
  /** 结果来源：知识 subpoint 或 真题 */
  type: 'knowledge' | 'exam'
  /** 展示标题 */
  title: string
  /** 副标题：面包屑（知识）/ 科目+章节（真题） */
  subtitle: string
  /** 匹配片段摘要，供前端 <mark> 高亮 */
  snippet?: string
  /** 点击跳转路由 */
  route: string

  /* 知识结果独有 */
  /** 命中的 subpoint 所在 blockId，用于跳转到真题过滤页面 */
  blockId?: string
  /** 此 point/section 级 "看相关真题" 时传递的全部 blockId（可能比 blockId 多） */
  blockIds?: string[]
  /** 关联真题数量（已算好，可直接展示） */
  examCount?: number
  /** 相关真题页路由：/exams?knowledgeBlockId=blockId */
  examRoute?: string
  /** 知识命中的层级（subpoint/point/section/body），用于排序与选择性高亮 */
  matchField?: KnowledgeMatchField
  /** 命中 point 的 id（跳转到该 point 锚点时用） */
  pointId?: string
  /** 命中 section 的 id（跳转到该 section 开头时用） */
  sectionId?: string
  /** subpoint 在文章里的稳定 id（标题命中时跳到该 subpoint 的 h2 锚点） */
  subpointId?: string
  /** 正文命中时精确到具体 block 的 id（用户看到的 snippet 对应的 block） */
  matchedBlockId?: string
  /** 用于高亮的查询串：原始查询 + 同义词展开后的变体（如 "IO方式 IO I/O 输入输出"） */
  highlightQuery?: string
  /** 各级标题（供路径分段渲染与精确高亮） */
  bookTitle?: string
  chapterTitle?: string
  sectionTitle?: string
  pointTitle?: string
  subpointTitle?: string

  /* 真题结果独有 */
  year?: number
  number?: number

  /** 精确题号命中为最高优先级，用于排序加权 */
  isExact?: boolean
  /** 原始得分，仅供调试 */
  score?: number
}
