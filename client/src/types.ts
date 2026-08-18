export type ExamSubject = 'ds' | 'co' | 'os' | 'cn'

/**
 * 知识文章元数据，不作为左侧目录层级渲染。
 * Section 按 points 顺序聚合对应文章；正文、动画和真题关联由文章块负责。
 */
export type KnowledgePoint = {
  id: string
  title: string
  summary: string
  importance: number
}

/**
 * 左侧目录的第二层，也是知识正文页面的路由与标题单元。
 * 一个 Section 页面按顺序渲染 points 对应的全部文章。
 */
export type Section = {
  id: string
  title: string
  points: KnowledgePoint[]
}

/**
 * 左侧目录的第一层，例如“计算机网络体系结构”。
 */
export type Chapter = {
  id: string
  title: string
  layer: string
  sections: Section[]
}

/**
 * 书籍/教材，整个知识体系的最顶层
 * 例如："408计算机学科专业基础综合"
 */
export type Book = {
  id: string
  title: string
  subtitle: string
  subject: string
  chapters: Chapter[]
}

export type ExamQuestionType = 'choice' | 'comprehensive'
export type ExamOption = { key: string; text: string }
export type ExamSubQuestion = {
  number: number
  score: number | null
  description: string
  tags: string[]
}

export type Exam = {
  id: string
  year: number
  number: number
  score: number
  questionType: ExamQuestionType
  subject: ExamSubject
  chapterName: string
  stem: string
  options: ExamOption[]
  answer?: string
  explanation?: string
  difficulty: number
  tags: string[]
  resourceLinks: string[]
  /** 关联的知识块 ID 列表（kb-*），最多 4 个；选择题与综合题均写在题目上 */
  knowledgeBlockIds: string[]
  subQuestions?: ExamSubQuestion[]
}

export type ExamKnowledgeLink = {
  knowledgeBlockId: string
  examId: string
  year: number
  number: number
  subject: ExamSubject
  score: number | null
  stem: string
}

export type ExamListResponse = {
  items: Exam[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ExamFilters = {
  total: number
  years: number[]
  subjects: Array<{ value: ExamSubject; label: string }>
  questionTypes: Array<{ value: ExamQuestionType; label: string }>
  chapters: string[]
  books: Array<{ subject: ExamSubject; label: string; chapters: Array<{ name: string; count: number }> }>
  tags: string[]
  difficulties: number[]
  scores: number[]
}
