<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { content as contentApi } from '@/content'
import { findSubpointLocationByBlockId } from '@/content/knowledge-articles/registry'
import type { Exam, ExamFilters, ExamQuestionType, ExamSubject } from '@/types'
import ExamPaperItem from '@/components/exams/ExamPaperItem.vue'
import BrandLogo from '@/components/BrandLogo.vue'
import DoubleChevronIcon from '@/components/icons/DoubleChevronIcon.vue'

const route = useRoute()
const router = useRouter()

const filters = ref<ExamFilters>()
const exams = ref<Exam[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const total = ref(0)
const totalPages = ref(0)
const drawerHovered = ref(false)
const drawerPinned = ref(false)
const rightHovered = ref(false)
const rightPinned = ref(false)
const compactLayout = ref(false)
const activeExamId = ref('')
// 有搜索内容时也保持侧栏展开，避免失焦后侧栏收回
const drawerOpen = computed(() => drawerPinned.value || drawerHovered.value || !!keyword.value.trim())
const rightOpen = computed(() => rightHovered.value || rightPinned.value)
const drawerColumns = computed(() => compactLayout.value
  ? 'minmax(0,1fr)'
  : `${drawerOpen.value ? 300 : 0}px minmax(0,1fr) ${rightOpen.value ? 244 : 0}px`)
const pageSize = 50

const keyword = ref('')
// 回车跳转到搜索页并展示该关键词的搜索结果
function onExamSearchKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  e.preventDefault()
  const q = keyword.value.trim()
  if (!q) return
  router.push({ name: 'search', query: { q } })
}
const openToolsId = ref('')
const openBookId = ref('')
const selectedYear = ref<number | undefined>(route.query.year ? Number(route.query.year) : undefined)
const selectedSubject = ref<ExamSubject | ''>((route.query.subject as ExamSubject) || '')
const selectedType = ref<ExamQuestionType | ''>((route.query.questionType as ExamQuestionType) || '')
const selectedChapter = ref(String(route.query.chapter || ''))
const selectedTag = ref(String(route.query.tag || ''))
const selectedDifficulty = ref<number | undefined>()
const selectedKnowledgeBlockId = ref(String(route.query.knowledgeBlockId || route.query.knowledgeBlockIds || ''))
let keywordTimer: number | undefined

const selectedKnowledgeNames = computed(() => {
  const names = selectedKnowledgeBlockId.value
    .split(',')
    .map((id) => findSubpointLocationByBlockId(id.trim())?.subpointTitle)
    .filter((name): name is string => Boolean(name))
  return [...new Set(names)]
})

const currentFilterText = computed(() => {
  const conditions = [
    selectedYear.value ? `${selectedYear.value} 年` : '',
    filters.value?.subjects.find((item) => item.value === selectedSubject.value)?.label || '',
    filters.value?.questionTypes.find((item) => item.value === selectedType.value)?.label || '',
    selectedChapter.value,
    selectedTag.value,
    ...selectedKnowledgeNames.value,
    keyword.value ? `搜索“${keyword.value}”` : '',
  ].filter(Boolean)
  return conditions.length ? [...new Set(conditions)].join(' · ') : '全部真题'
})

const hasActiveFilters = computed(() => {
  return Boolean(
    keyword.value
    || selectedYear.value
    || selectedSubject.value
    || selectedType.value
    || selectedChapter.value
    || selectedTag.value
    || selectedDifficulty.value
    || selectedKnowledgeBlockId.value
  )
})
function queryPayload() {
  return {
    keyword: keyword.value || undefined,
    year: selectedYear.value,
    subject: selectedSubject.value || undefined,
    questionType: selectedType.value || undefined,
    chapter: selectedChapter.value || undefined,
    tag: selectedTag.value || undefined,
    difficulty: selectedDifficulty.value,
    knowledgeBlockIds: selectedKnowledgeBlockId.value || undefined,
    page: page.value,
    pageSize,
  }
}

async function load(preferredId?: string) {
  loading.value = true
  error.value = ''
  openToolsId.value = ''
  try {
    const data = await contentApi.getExams(queryPayload())
    exams.value = data.items
    total.value = data.total
    totalPages.value = data.totalPages
    const requested = preferredId || String(route.query.exam || '')
    await nextTick()
    if (requested) scrollToExam(requested, false)
    else window.scrollTo({ top: 0 })
    activeExamId.value = requested || exams.value[0]?.id || ''
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '真题没有加载出来，请确认后端服务已启动。'
  } finally {
    loading.value = false
  }
}

function scheduleLoad() {
  window.clearTimeout(keywordTimer)
  keywordTimer = window.setTimeout(() => {
    page.value = 1
    void load()
  }, 260)
}

function scrollToExam(id: string, smooth = true) {
  activeExamId.value = id
  document.getElementById(`exam-${id}`)?.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block: 'start',
  })
  router.replace({ query: { ...route.query, exam: id } })
}

function updateActiveExam() {
  if (!exams.value.length) return
  let current = exams.value[0]
  for (const exam of exams.value) {
    const element = document.getElementById(`exam-${exam.id}`)
    if (!element || element.getBoundingClientRect().top > 220) break
    current = exam
  }
  activeExamId.value = current.id
}

function resetFilters() {
  keyword.value = ''
  selectedYear.value = undefined
  selectedSubject.value = ''
  selectedType.value = ''
  selectedChapter.value = ''
  selectedTag.value = ''
  selectedDifficulty.value = undefined
  selectedKnowledgeBlockId.value = ''
  page.value = 1
  router.replace({ query: {} })
  void load()
}

function changePage(next: number) {
  if (next < 1 || next > totalPages.value || next === page.value) return
  page.value = next
  void load()
}

function toggleBook(subject: string) {
  openBookId.value = openBookId.value === subject ? '' : subject
}

function selectChapter(subject: ExamSubject, chapter: string) {
  selectedSubject.value = subject
  selectedChapter.value = chapter
}

function bookTotal(book: { chapters: Array<{ count: number }> }) {
  return book.chapters.reduce((sum, chapter) => sum + chapter.count, 0)
}

function updateLayoutMode() {
  compactLayout.value = window.innerWidth < 1024
}

watch([selectedYear, selectedSubject, selectedType, selectedChapter, selectedTag, selectedDifficulty], () => {
  page.value = 1
  void load()
})
watch(
  () => String(route.query.knowledgeBlockId || route.query.knowledgeBlockIds || ''),
  (value) => {
    selectedKnowledgeBlockId.value = value
    page.value = 1
    void load()
  },
)
watch(keyword, scheduleLoad)
watch(selectedSubject, (subject) => {
  if (subject) openBookId.value = subject
})
// 路由参数变化（组件复用，如从搜索结果跳转到另一道真题）时同步筛选与定位。
// 之前缺这段：在真题页内跳转 /exams?year=...&exam=... 不会更新列表、也不会滚动，
// 用户看到的一直是旧列表顶部（2009 年第 1 题）。
// 只同步 year（触发上方 watch 重新 load，load 内部按 route.query.exam 定位）；
// 同一年内切题（exam 变化、year 不变）时直接滚动定位。
watch(
  () => [route.query.year, String(route.query.exam || '')] as const,
  ([newYear, newExam], [oldYear, oldExam]) => {
    const yearParam = route.query.year
    const nextYear = yearParam != null && !Number.isNaN(Number(yearParam)) ? Number(yearParam) : undefined
    if (nextYear !== selectedYear.value) {
      selectedYear.value = nextYear // 触发上方 watch → load() → 按 route.query.exam 定位
    } else if (newExam && newExam !== oldExam) {
      nextTick(() => scrollToExam(String(newExam), false))
    }
  },
)

onMounted(async () => {
  updateLayoutMode()
  window.addEventListener('resize', updateLayoutMode, { passive: true })
  window.addEventListener('scroll', updateActiveExam, { passive: true })
  try {
    filters.value = await contentApi.getExamFilters()
    await load()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '无法连接真题服务。'
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateLayoutMode)
  window.removeEventListener('scroll', updateActiveExam)
  window.clearTimeout(keywordTimer)
})
</script>

<template>
  <div
    class="relative grid min-h-screen overflow-x-clip bg-[#edf1f6] text-[#071225] transition-[grid-template-columns] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
    :style="{ gridTemplateColumns: drawerColumns }"
  >
    <div class="fixed inset-y-0 left-0 z-50 w-7 cursor-e-resize" aria-label="悬停展开真题筛选" @mouseenter="drawerHovered = true" @click="drawerPinned = true">
      <span v-if="!drawerOpen" class="absolute left-0 top-1/2 grid h-20 w-6 -translate-y-1/2 place-items-center border border-l-0 border-[#cbd5e1] bg-white/95 text-[#31559e] shadow-lg rounded-r-sm">
        <DoubleChevronIcon class="h-4 w-4" />
      </span>
    </div>

    <aside
      class="sticky top-0 z-30 flex h-screen min-w-0 flex-col overflow-hidden border-r border-[#d4dce7] bg-[#f8fafc] transition-[opacity,transform] duration-300 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-[min(300px,88vw)] max-lg:shadow-[20px_0_70px_rgba(15,23,42,.16)]"
      :class="drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0 max-lg:-translate-x-full'"
      @mouseenter="drawerHovered = true"
      @mouseleave="drawerHovered = false"
    >
      <header class="px-5 pb-5 pt-6">
        <div class="mb-7 flex items-center justify-between">
          <BrandLogo />
          <button type="button" class="grid h-9 w-9 place-items-center border transition" :class="drawerPinned ? 'border-[#12327f] bg-[#12327f] text-white' : 'border-[#cbd5e1] bg-white text-slate-500'" :aria-label="drawerPinned ? '取消固定真题筛选' : '固定真题筛选'" @click="drawerPinned = !drawerPinned">
            <svg class="h-4 w-4 transition-transform" :class="drawerPinned ? '-rotate-45' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 17v5M7 3h10M8 3l1 7-3 4h12l-3-4 1-7" stroke-linecap="square" stroke-linejoin="miter" /></svg>
          </button>
        </div>
        <label class="relative block">
          <span class="sr-only">搜索真题</span>
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="keyword"
            class="h-10 w-full rounded-xl border border-[#d5deea] bg-white pl-9 pr-3 text-[13px] outline-none transition placeholder:text-slate-400 hover:border-[#aebbd0] focus:border-[#6686c7]"
            placeholder="搜索知识点（回车前往搜索页）"
            autocomplete="off"
            spellcheck="false"
            type="search"
            @keydown="onExamSearchKeydown"
          />
        </label>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto px-3 pb-10 pt-3">
        <!-- 当前筛选（与右侧共享 currentFilterText） -->
        <section class="mb-1 px-3" aria-live="polite" aria-label="当前筛选">
          <p class="current-filter-summary__label">当前筛选</p>
          <p class="current-filter-summary__value">{{ currentFilterText }}</p>
          <button
            v-if="hasActiveFilters"
            type="button"
            class="current-filter-summary__clear"
            aria-label="清除全部真题筛选"
            @click="resetFilters"
          >
            清除全部筛选 <span aria-hidden="true">×</span>
          </button>
        </section>

        <!-- 年份 + 题型 -->
        <div class="space-y-5 px-3 py-3">
          <div>
            <p class="mb-2.5 text-[11px] font-semibold tracking-[.06em] text-slate-500">年份</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                class="rounded-[6px] px-2.5 py-1 text-[12px] font-semibold transition"
                :class="selectedYear === undefined ? 'bg-[#12327f] text-white' : 'bg-[#eef2f8] text-slate-600 hover:bg-[#e3e9f2]'"
                @click="selectedYear = undefined"
              >全部</button>
              <button
                v-for="year in filters?.years"
                :key="year"
                type="button"
                class="rounded-[6px] px-2.5 py-1 text-[12px] font-semibold transition"
                :class="selectedYear === year ? 'bg-[#12327f] text-white' : 'bg-[#eef2f8] text-slate-600 hover:bg-[#e3e9f2]'"
                @click="selectedYear = year"
              >{{ year }}</button>
            </div>
          </div>

          <div>
            <p class="mb-2.5 text-[11px] font-semibold tracking-[.06em] text-slate-500">题型</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                class="rounded-[6px] px-2.5 py-1 text-[12px] font-semibold transition"
                :class="selectedType === '' ? 'bg-[#12327f] text-white' : 'bg-[#eef2f8] text-slate-600 hover:bg-[#e3e9f2]'"
                @click="selectedType = ''"
              >全部</button>
              <button
                v-for="item in filters?.questionTypes"
                :key="item.value"
                type="button"
                class="rounded-[6px] px-2.5 py-1 text-[12px] font-semibold transition"
                :class="selectedType === item.value ? 'bg-[#12327f] text-white' : 'bg-[#eef2f8] text-slate-600 hover:bg-[#e3e9f2]'"
                @click="selectedType = item.value"
              >{{ item.label }}</button>
            </div>
          </div>
        </div>

        <!-- 书本树 -->
        <nav class="px-3 py-4" aria-label="按书本与章节筛选">
          <div class="mb-2 px-3 font-mono text-[10px] font-bold tracking-[.15em] text-slate-400">BOOKS / 书本</div>
          <ol class="m-0 list-none space-y-1 p-0">
            <li
              v-for="book in filters?.books"
              :key="book.subject"
              class="overflow-hidden rounded-[6px]"
              :class="openBookId === book.subject ? 'bg-white ring-1 ring-[#e3e9f1]' : ''"
            >
              <button
                type="button"
                class="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-[13px] text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#12327f]"
                :class="openBookId === book.subject
                  ? 'rounded-t-[6px] bg-[#eef2f8] text-[#071225]'
                  : 'rounded-[6px] text-slate-600 hover:bg-[#eef2f8] hover:text-[#071225]'"
                :aria-expanded="openBookId === book.subject"
                @click="toggleBook(book.subject)"
              >
                <span class="min-w-0 text-[16px] font-semibold leading-6 tracking-[-.018em]">{{ book.label }}</span>
                <span class="flex items-center gap-1.5">
                  <span class="font-mono text-[11px] font-semibold text-slate-400">{{ bookTotal(book) }}</span>
                  <span class="text-sm font-light text-slate-400" aria-hidden="true">{{ openBookId === book.subject ? '−' : '+' }}</span>
                </span>
              </button>

              <ul v-if="openBookId === book.subject" class="m-0 list-none px-1.5 pb-2 pt-1">
                <li v-for="chapter in book.chapters" :key="chapter.name">
                  <button
                    type="button"
                    class="flex w-full items-center justify-between gap-2 rounded-[4px] px-3 py-2 text-left text-[15px] leading-6 tracking-[-.012em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#12327f]"
                    :class="selectedSubject === book.subject && selectedChapter === chapter.name
                      ? 'bg-[#e6eefb] font-semibold text-[#12327f]'
                      : 'font-normal text-slate-600 hover:bg-[#f2f5f9] hover:text-[#071225]'"
                    :aria-current="selectedSubject === book.subject && selectedChapter === chapter.name ? 'page' : undefined"
                    @click="selectChapter(book.subject, chapter.name)"
                  >
                    <span class="min-w-0 truncate">{{ chapter.name }}</span>
                    <span class="shrink-0 font-mono text-[11px] font-semibold text-slate-400">{{ chapter.count }}</span>
                  </button>
                </li>
              </ul>
            </li>
          </ol>
        </nav>
      </div>
    </aside>

    <div class="min-w-0">
      <main class="mx-auto max-w-[1200px] px-[clamp(12px,3vw,40px)] pb-24 pt-[clamp(12px,3vw,38px)]">
        <p v-if="error" class="border-l-[3px] border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

        <section class="bg-white px-[clamp(22px,6vw,82px)] shadow-[0_22px_70px_rgba(25,39,61,.06)]">
          <ExamPaperItem
            v-for="exam in exams"
            :key="exam.id"
            :exam="exam"
            :menu-open="openToolsId === exam.id"
            @toggle-tools="openToolsId = openToolsId === exam.id ? '' : exam.id"
            @close-tools="openToolsId = openToolsId === exam.id ? '' : openToolsId"
          />
          <div v-if="loading" class="py-24 text-center text-sm text-slate-500">正在整理试卷…</div>
          <div v-else-if="!exams.length" class="py-24 text-center text-sm text-slate-500">没有符合条件的题目，请调整筛选条件。</div>
        </section>

        <nav class="mt-7 flex items-center justify-between px-2" aria-label="试卷分页"><button class="text-sm font-semibold text-slate-600 hover:text-[#12327f] disabled:opacity-25" :disabled="page <= 1" @click="changePage(page - 1)">← 上一页</button><button class="text-sm font-semibold text-slate-600 hover:text-[#12327f] disabled:opacity-25" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页 →</button></nav>
      </main>
    </div>

    <aside
      class="sticky top-0 z-30 h-screen min-w-0 overflow-hidden border-l border-[#d3dce8] bg-[#f7f9fc] transition-[opacity,transform] duration-300 max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:w-[min(270px,84vw)] max-lg:shadow-[-20px_0_70px_rgba(15,23,42,.18)]"
      :class="rightOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none opacity-0 max-lg:translate-x-full'"
      @mouseenter="rightHovered = true"
      @mouseleave="rightHovered = false"
    >
      <header class="flex items-center justify-between border-b border-[#dce3ec] px-5 py-6">
        <div>
          <p class="mb-1.5 mt-0 text-[10px] font-semibold tracking-[.08em] text-slate-400">当前筛选</p>
          <h2 class="m-0 max-w-[160px] text-[15px] font-semibold leading-6 tracking-[-.02em]">{{ currentFilterText }}</h2>
        </div>
        <button type="button" class="grid h-9 w-9 place-items-center border transition" :class="rightPinned ? 'border-[#12327f] bg-[#12327f] text-white' : 'border-[#cbd5e1] bg-white text-slate-500 hover:border-[#12327f] hover:text-[#12327f]'" :aria-label="rightPinned ? '取消固定题目目录' : '固定题目目录'" @click="rightPinned = !rightPinned">
          <svg class="h-4 w-4 transition-transform" :class="rightPinned ? '-rotate-45' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 17v5M7 3h10M8 3l1 7-3 4h12l-3-4 1-7" stroke-linecap="square" stroke-linejoin="miter" /></svg>
        </button>
      </header>
      <ol class="m-0 h-[calc(100vh-86px)] list-none space-y-1 overflow-y-auto px-3 py-4">
        <li v-for="exam in exams" :key="exam.id">
          <button
            type="button"
            class="flex w-full items-baseline justify-between gap-3 border-l-2 px-3 py-3 text-left transition hover:bg-white"
            :class="activeExamId === exam.id ? 'border-[#12327f] bg-white text-[#12327f]' : 'border-transparent text-slate-500 hover:text-[#071225]'"
            @click="scrollToExam(exam.id)"
          >
            <span class="font-mono text-[11px] font-semibold tracking-[.04em]">{{ exam.year }}</span>
            <span class="text-[13px] font-semibold">第 {{ exam.number }} 题</span>
          </button>
        </li>
      </ol>
    </aside>

    <div class="fixed inset-y-0 right-0 z-50 w-7 cursor-w-resize" aria-label="悬停展开题目目录" @mouseenter="rightHovered = true" @click="rightPinned = true">
      <span v-if="!rightOpen" class="absolute right-0 top-1/2 grid h-20 w-6 -translate-y-1/2 place-items-center border border-r-0 border-[#cbd5e1] bg-white/95 text-[#31559e] shadow-lg rounded-l-sm">
        <DoubleChevronIcon class="h-4 w-4 rotate-180" />
      </span>
    </div>
  </div>
</template>

<style scoped>
/* 当前筛选区块：仿知识页侧栏——留白分区 + 无横线 */
.current-filter-summary__label {
  margin: 0 0 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .1em;
  color: #94a3b8;
}

.current-filter-summary__value {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  color: #172033;
  word-break: break-word;
}

.current-filter-summary__clear {
  margin-top: 8px;
  padding: 0;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: color 0.12s ease;
}
.current-filter-summary__clear:hover {
  color: #12327f;
}
</style>
