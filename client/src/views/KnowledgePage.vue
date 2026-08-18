<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { content, knowledgeBooks } from '@/content'
import { resolveKnowledgeArticle } from '@/content/knowledge-articles/registry'
import type { KnowledgeArticleData } from '@/content/knowledge-articles/types'
import type { Book, ExamKnowledgeLink, KnowledgePoint, Section } from '@/types'
import KnowledgeSidebar from '@/components/knowledge/KnowledgeSidebar.vue'
import KnowledgeArticle from '@/components/knowledge/KnowledgeArticle.vue'
import KnowledgeToc from '@/components/knowledge/KnowledgeToc.vue'
import DoubleChevronIcon from '@/components/icons/DoubleChevronIcon.vue'
import BrandLogo from '@/components/BrandLogo.vue'

type SectionArticleEntry = {
  point: KnowledgePoint
  article: KnowledgeArticleData
  examLinks: ExamKnowledgeLink[]
}

const route = useRoute()
const router = useRouter()
const book = ref<Book>()
const section = ref<Section>()
const articleEntries = ref<SectionArticleEntry[]>([])
const loading = ref(true)
const error = ref('')
const leftHovered = ref(false)
const rightHovered = ref(false)
const leftPinned = ref(false)
const rightPinned = ref(false)
const compactLayout = ref(false)
const sidebarQuery = ref('')
// 回车跳转到搜索页并展示该关键词的搜索结果
function onSearchKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  e.preventDefault()
  const q = sidebarQuery.value.trim()
  if (!q) return
  router.push({ name: 'search', query: { q } })
}
const LEFT_DRAWER_WIDTH = 304
const RIGHT_DRAWER_WIDTH = 270
// 有搜索内容时也保持侧栏展开，避免失焦后侧栏收回
const leftOpen = computed(() => leftPinned.value || leftHovered.value || !!sidebarQuery.value.trim())
const rightOpen = computed(() => rightPinned.value || rightHovered.value)
const readerColumns = computed(() => compactLayout.value
  ? 'minmax(0,1fr)'
  : `${leftOpen.value ? LEFT_DRAWER_WIDTH : 0}px minmax(0,1fr) ${rightOpen.value ? RIGHT_DRAWER_WIDTH : 0}px`)

const routeContentId = computed(() => String(route.params.sectionId || ''))
const bookId = computed(() => String(route.params.bookId || knowledgeBooks[0]?.id || 'computer-network'))
const books = knowledgeBooks
const tocEntries = computed(() => articleEntries.value.map((entry) => ({
  id: entry.point.id,
  title: entry.point.title,
  article: entry.article,
})))

/** 本节所有文章的关联真题（跨文章去重），用于「本节真题」入口 */
const sectionExam = computed(() => {
  const blockIds = new Set<string>()
  const examIds = new Set<string>()
  for (const entry of articleEntries.value) {
    for (const link of entry.examLinks) {
      blockIds.add(link.knowledgeBlockId)
      examIds.add(link.examId)
    }
  }
  return { blockIds: Array.from(blockIds), examCount: examIds.size }
})
function findSelectedSection(id: string) {
  if (!book.value) return undefined
  for (const chapter of book.value.chapters) {
    for (const candidate of chapter.sections) {
      if (candidate.id === id || candidate.points.some((point) => point.id === id)) {
        return candidate
      }
    }
  }
  return undefined
}

const activeSectionId = computed(() =>
  findSelectedSection(routeContentId.value)?.id || section.value?.id || '',
)
async function loadSection(id: string) {
  if (!book.value) return
  loading.value = true
  error.value = ''

  try {
    const nextSection = findSelectedSection(id)
    if (!nextSection) {
      const firstSection = book.value.chapters[0]?.sections[0]
      if (firstSection) {
        await router.replace({
          name: 'knowledge',
          params: { bookId: bookId.value, sectionId: firstSection.id },
          query: route.query,
        })
      }
      return
    }

    // 兼容旧的 KnowledgePoint 链接，并把地址统一到两层目录的 Section。
    if (id !== nextSection.id) {
      await router.replace({
        name: 'knowledge',
        params: { bookId: bookId.value, sectionId: nextSection.id },
        query: route.query,
      })
      return
    }

    const nextEntries = nextSection.points.map((point) => ({
      point,
      article: resolveKnowledgeArticle(point),
    }))
    const blockIds = nextEntries.flatMap(({ article }) =>
      article.subpoints.flatMap((subpoint) => subpoint.blocks.map((block) => block.id)),
    )

    let links: ExamKnowledgeLink[] = []
    try {
      links = await content.getKnowledgeLinks(blockIds)
    } catch {
      // 真题接口不可用时仍然优先显示静态知识正文。
    }

    section.value = nextSection
    articleEntries.value = nextEntries.map(({ point, article }) => {
      const articleBlockIds = new Set(
        article.subpoints.flatMap((subpoint) => subpoint.blocks.map((block) => block.id)),
      )
      return {
        point,
        article,
        examLinks: links.filter((link) => articleBlockIds.has(link.knowledgeBlockId)),
      }
    })
  } catch {
    error.value = '本节内容没有加载出来，请检查知识目录与文章注册。'
  } finally {
    loading.value = false
    await nextTick()
    scrollToRequestedBlock()
  }
}

const requestedBlock = computed(() => String(route.query.block || ''))

function scrollToRequestedBlock(retry = 0) {
  const id = requestedBlock.value
  if (!id) return
  const el = document.getElementById(id)
  if (el) {
    // 使用 scrollTop 直接设置，比 scrollIntoView 更可靠（不受 smooth 滚动打断影响）
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2
    document.documentElement.scrollTop = Math.max(0, top)
  } else if (retry < 5) {
    // 元素还没渲染出来，延迟重试
    setTimeout(() => scrollToRequestedBlock(retry + 1), 100)
  }
}

// loading 变为 false 时，如果有 block 参数则滚动（处理 watch 触发时 loading 为 true 被跳过的情况）
watch(loading, (isLoading) => {
  if (!isLoading && section.value && requestedBlock.value) {
    nextTick().then(() => scrollToRequestedBlock(0))
  }
})

watch(requestedBlock, () => {
  if (!section.value) return
  if (loading.value) return // 等 loading 变为 false 时由上面的 watch 接管
  nextTick().then(() => scrollToRequestedBlock(0))
})

function selectSection(id: string) {
  router.push({ name: 'knowledge', params: { bookId: bookId.value, sectionId: id } })
}

function selectBook(id: string) {
  router.push({ name: 'knowledge', params: { bookId: id, sectionId: undefined } })
}

function toggleLeftPin() {
  leftPinned.value = !leftPinned.value
}

function toggleRightPin() {
  rightPinned.value = !rightPinned.value
}

function updateLayoutMode() {
  compactLayout.value = window.innerWidth < 1024
}

async function loadBook() {
  loading.value = true
  error.value = ''
  try {
    book.value = await content.getBook(bookId.value)
    if (!routeContentId.value) {
      const firstSection = book.value.chapters[0]?.sections[0]
      if (firstSection) {
        await router.replace({
          name: 'knowledge',
          params: { bookId: bookId.value, sectionId: firstSection.id },
        })
      }
      return
    }
    await loadSection(routeContentId.value)
  } catch {
    error.value = '知识目录没有加载出来，请检查 content/knowledge-tree.ts。'
    loading.value = false
  }
}

watch(bookId, () => {
  void loadBook()
})
watch(routeContentId, (id) => {
  if (!id || !book.value || book.value.id !== bookId.value) return
  void loadSection(id)
})
onMounted(() => {
  updateLayoutMode()
  window.addEventListener('resize', updateLayoutMode, { passive: true })
  void loadBook()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateLayoutMode)
})
</script>

<template>
  <div
    class="relative grid min-h-screen overflow-x-clip bg-[#e9eef5] transition-[grid-template-columns] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
    :style="{ gridTemplateColumns: readerColumns }"
  >
    <div
      class="fixed inset-y-0 left-0 z-50 w-7 cursor-e-resize"
      aria-label="悬停展开书籍目录"
      @mouseenter="leftHovered = true"
      @click="leftPinned = true"
    >
      <span
        v-if="!leftOpen"
        class="absolute left-0 top-1/2 grid h-20 w-6 -translate-y-1/2 place-items-center border border-l-0 border-[#cbd5e1] bg-white/90 text-[#31559e] shadow-lg backdrop-blur rounded-r-sm"
      >
        <DoubleChevronIcon class="h-4 w-4" />
      </span>
    </div>

    <aside
      class="sticky top-0 z-30 flex h-screen min-w-0 flex-col overflow-hidden border-r border-[#d3dce8] bg-[#f6f8fb] transition-[opacity,transform] duration-300 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-[min(304px,88vw)] max-lg:shadow-[20px_0_70px_rgba(15,23,42,.18)]"
      :class="leftOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none opacity-0 max-lg:-translate-x-full'"
      @mouseenter="leftHovered = true"
      @mouseleave="leftHovered = false"
    >
      <header class="shrink-0 border-b border-[#d8e0eb] px-5 pb-5 pt-6">
        <div class="mb-5 flex items-center justify-between gap-3">
          <BrandLogo />
          <button
            type="button"
            class="grid h-9 w-9 place-items-center border transition"
            :class="leftPinned ? 'border-[#12327f] bg-[#12327f] text-white' : 'border-[#cbd5e1] bg-white text-slate-500 hover:border-[#12327f] hover:text-[#12327f]'"
            :aria-label="leftPinned ? '取消固定书籍目录' : '固定书籍目录'"
            :title="leftPinned ? '取消固定' : '固定目录'"
            @click="toggleLeftPin"
          >
            <svg class="h-4 w-4 transition-transform" :class="leftPinned ? '-rotate-45' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M12 17v5M7 3h10M8 3l1 7-3 4h12l-3-4 1-7" stroke-linecap="square" stroke-linejoin="miter" />
            </svg>
          </button>
        </div>
        <label class="relative mb-5 block">
          <span class="sr-only">搜索知识目录</span>
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
          <input
            v-model="sidebarQuery"
            type="search"
            class="h-10 w-full rounded-xl border border-[#d5deea] bg-white pl-9 pr-3 text-[13px] outline-none transition placeholder:text-slate-400 hover:border-[#aebbd0] focus:border-[#6686c7]"
            placeholder="搜索知识点（回车前往搜索页）"
            autocomplete="off"
            spellcheck="false"
            @keydown="onSearchKeydown"
          />
        </label>
        <p class="mb-2 mt-0 text-[11px] font-semibold tracking-[.08em] text-slate-500">选择书籍</p>
        <label class="group relative block min-w-0 cursor-pointer">
          <select
            class="w-full cursor-pointer appearance-none truncate border-0 bg-transparent py-0 pr-7 text-[20px] font-semibold tracking-[-.03em] text-[#071225] outline-none"
            :value="bookId"
            aria-label="选择教材"
            @change="selectBook(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="bookItem in books" :key="bookItem.id" :value="bookItem.id">{{ bookItem.title }}</option>
          </select>
          <span class="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-xs text-slate-400">⌄</span>
        </label>
      </header>
      <KnowledgeSidebar
        v-if="book"
        class="min-h-0 flex-1"
        :chapters="book.chapters"
        :active-section-id="activeSectionId"
        :open="leftOpen"
        @select-section="selectSection"
      />
      <div v-else class="px-5 py-10 text-sm text-slate-500">正在建立知识目录…</div>
    </aside>

    <main class="min-w-0 px-[clamp(12px,3vw,46px)] py-[clamp(12px,3vw,38px)] transition-[padding] duration-500 ease-[cubic-bezier(.22,1,.36,1)]">
      <div class="mx-auto min-h-[calc(100vh-32px)] max-w-[1180px] border border-[#d9e1eb] bg-white px-[clamp(24px,5vw,76px)] pb-24 pt-[clamp(34px,5vw,66px)] shadow-[0_24px_80px_rgba(25,39,61,.07)] max-sm:px-5">
        <div v-if="error" class="border-l-[3px] border-orange-400 bg-orange-50 px-5 py-4 text-orange-800">{{ error }}</div>
        <template v-else-if="section">
          <header class="mb-10 border-b border-[#dce3ec] pb-7 flex items-baseline gap-4">
            <h1 class="m-0 text-[clamp(1.7rem,3vw,2.25rem)] font-semibold leading-tight tracking-[-.045em] text-[#071225]">{{ section.title }}</h1>
            <RouterLink
              v-if="sectionExam.examCount"
              :to="{ name: 'exams', query: { knowledgeBlockIds: sectionExam.blockIds.join(',') } }"
              class="group mt-3 inline-flex items-baseline gap-1.5 border-b border-[#8ea7d9] pb-0.5 text-[13px] font-semibold tracking-wide text-[#31559e] transition-colors hover:border-[#12327f] hover:text-[#12327f]"
            >
              <span class="font-bold text-[#12327f]">{{ sectionExam.examCount }}</span>
              <span>道关联真题</span>
              <span class="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true">→</span>
            </RouterLink>
          </header>

          <div data-testid="knowledge-article-column" class="min-w-0">
            <section
              v-for="(entry, index) in articleEntries"
              :key="entry.point.id"
              class="border-t border-[#dce3ec] py-16 first:border-t-0 first:pt-0"
            >
              <header :id="`article-${entry.point.id}`" class="mb-10 scroll-mt-16">
                <h2 class="m-0 text-[clamp(2.15rem,4vw,3.1rem)] font-semibold leading-tight tracking-[-.055em] text-[#071225]">
                  <span class="mb-2 block font-mono text-[.34em] font-bold tracking-[.16em] text-[#31559e]">ARTICLE {{ String(index + 1).padStart(2, '0') }}</span>
                  {{ entry.point.title }}
                </h2>
              </header>
              <KnowledgeArticle :article="entry.article" :exam-links="entry.examLinks" />
            </section>
          </div>
        </template>
        <div v-else-if="loading" class="py-24 text-center text-sm text-slate-500">知识内容正在加载…</div>
      </div>
    </main>

    <aside
      class="sticky top-0 z-30 h-screen min-w-0 overflow-hidden border-l border-[#d3dce8] bg-[#f6f8fb] transition-[opacity,transform] duration-300 max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:w-[min(270px,84vw)] max-lg:shadow-[-20px_0_70px_rgba(15,23,42,.18)]"
      :class="rightOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none opacity-0 max-lg:translate-x-full'"
      @mouseenter="rightHovered = true"
      @mouseleave="rightHovered = false"
    >
      <KnowledgeToc
        v-if="section"
        :entries="tocEntries"
        :pinned="rightPinned"
        class="h-full"
        @toggle-pin="toggleRightPin"
      />
    </aside>

    <div
      class="fixed inset-y-0 right-0 z-50 w-7 cursor-w-resize"
      aria-label="悬停展开本节目录"
      @mouseenter="rightHovered = true"
      @click="rightPinned = true"
    >
      <span
        v-if="!rightOpen"
        class="absolute right-0 top-1/2 grid h-20 w-6 -translate-y-1/2 place-items-center border border-r-0 border-[#cbd5e1] bg-white/90 text-[#31559e] shadow-lg backdrop-blur rounded-l-sm"
      >
        <DoubleChevronIcon class="h-4 w-4 rotate-180" />
      </span>
    </div>
  </div>
</template>
