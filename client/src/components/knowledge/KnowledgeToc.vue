<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { KnowledgeArticleData } from '@/content/knowledge-articles/types'

export type KnowledgeTocEntry = {
  id: string
  title: string
  article: KnowledgeArticleData
}

const props = defineProps<{
  entries: KnowledgeTocEntry[]
  pinned?: boolean
}>()

defineEmits<{ togglePin: [] }>()

const activeId = ref('')
const pendingNavigationId = ref('')
const tocElement = ref<HTMLElement | null>(null)
let observedSections: HTMLElement[] = []
let resizeObserver: ResizeObserver | undefined
let navigationUnlockTimer: number | undefined
let updateFrame: number | undefined

const READING_LINE_RATIO = 0.42

const observedIds = computed(() => props.entries.flatMap((entry) => [
  `article-${entry.id}`,
  ...entry.article.subpoints.map((subpoint) => subpoint.id),
]))

function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return

  activeId.value = id
  pendingNavigationId.value = id
  const targetTop = window.scrollY + target.getBoundingClientRect().top - getReadingLine()
  window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
  window.clearTimeout(navigationUnlockTimer)
  navigationUnlockTimer = window.setTimeout(releaseNavigationLock, 1200)
}

function releaseNavigationLock() {
  if (!pendingNavigationId.value) return
  pendingNavigationId.value = ''
  window.clearTimeout(navigationUnlockTimer)
  scheduleActiveUpdate()
}

function entryIsActive(entry: KnowledgeTocEntry) {
  return activeId.value === `article-${entry.id}`
    || entry.article.subpoints.some((subpoint) => subpoint.id === activeId.value)
}

async function observeSections() {
  resizeObserver?.disconnect()
  await nextTick()

  observedSections = observedIds.value
    .map((id) => document.getElementById(id))
    .filter((section): section is HTMLElement => Boolean(section))

  if (!observedSections.length) return

  activeId.value = observedSections[0].id
  resizeObserver = new ResizeObserver(scheduleActiveUpdate)
  observedSections.forEach((section) => resizeObserver?.observe(section))
  scheduleActiveUpdate()
}

function getReadingLine() {
  return Math.min(
    window.innerHeight - 120,
    Math.max(160, window.innerHeight * READING_LINE_RATIO),
  )
}

function updateActiveSection() {
  updateFrame = undefined
  if (pendingNavigationId.value || !observedSections.length) return

  const pageBottom = window.scrollY + window.innerHeight
  const scrollHeight = document.documentElement.scrollHeight
  if (pageBottom >= scrollHeight - 2) {
    activeId.value = observedSections[observedSections.length - 1].id
    return
  }

  const readingLine = getReadingLine()
  let current = observedSections[0]
  for (const section of observedSections) {
    // 给平滑滚动后的亚像素取整留出余量，避免目标刚好落在判定线时又高亮上一项。
    if (section.getBoundingClientRect().top > readingLine + 2) break
    current = section
  }

  activeId.value = current.id
}

function scheduleActiveUpdate() {
  if (updateFrame !== undefined) return
  updateFrame = window.requestAnimationFrame(updateActiveSection)
}

async function keepActiveItemVisible() {
  await nextTick()
  const container = tocElement.value
  const activeLink = container?.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(activeId.value)}"]`)
  if (!container || !activeLink) return

  const containerRect = container.getBoundingClientRect()
  const activeRect = activeLink.getBoundingClientRect()
  const visibleTop = containerRect.top + 64
  const visibleBottom = containerRect.bottom - 16

  if (activeRect.top < visibleTop) {
    container.scrollBy({ top: activeRect.top - visibleTop, behavior: 'smooth' })
  } else if (activeRect.bottom > visibleBottom) {
    container.scrollBy({ top: activeRect.bottom - visibleBottom, behavior: 'smooth' })
  }
}

watch(() => props.entries, observeSections)
watch(activeId, keepActiveItemVisible)
onMounted(() => {
  void observeSections()
  window.addEventListener('scroll', scheduleActiveUpdate, { passive: true })
  window.addEventListener('resize', scheduleActiveUpdate)
  window.addEventListener('scrollend', releaseNavigationLock)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('scroll', scheduleActiveUpdate)
  window.removeEventListener('resize', scheduleActiveUpdate)
  window.removeEventListener('scrollend', releaseNavigationLock)
  window.clearTimeout(navigationUnlockTimer)
  if (updateFrame !== undefined) window.cancelAnimationFrame(updateFrame)
})
</script>

<template>
  <aside
    ref="tocElement"
    data-testid="knowledge-toc"
    class="h-full overflow-y-auto px-5 pb-10 pt-6"
  >
    <header class="mb-6 flex items-center justify-between gap-3 border-b border-[#dce3ec] pb-5">
      <div>
        <p class="mb-1 mt-0 font-mono text-[9px] font-bold tracking-[.16em] text-[#31559e]">ON THIS PAGE</p>
        <h2 class="m-0 text-[15px] font-semibold tracking-[-.015em] text-[#071225]">本节目录</h2>
      </div>
      <button
        type="button"
        class="grid h-9 w-9 place-items-center border transition"
        :class="pinned ? 'border-[#12327f] bg-[#12327f] text-white' : 'border-[#cbd5e1] bg-white text-slate-500 hover:border-[#12327f] hover:text-[#12327f]'"
        :aria-label="pinned ? '取消固定本节目录' : '固定本节目录'"
        :title="pinned ? '取消固定' : '固定目录'"
        @click="$emit('togglePin')"
      >
        <svg class="h-4 w-4 transition-transform" :class="pinned ? '-rotate-45' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M12 17v5M7 3h10M8 3l1 7-3 4h12l-3-4 1-7" stroke-linecap="square" stroke-linejoin="miter" />
        </svg>
      </button>
    </header>

    <ol class="m-0 list-none space-y-7 p-0">
      <li v-for="entry in entries" :key="entry.id">
        <a
          :href="`#article-${entry.id}`"
          :data-toc-id="`article-${entry.id}`"
          :aria-current="activeId === `article-${entry.id}` ? 'location' : undefined"
          class="block origin-left text-[14px] font-semibold leading-6 tracking-[-.01em] transition duration-200 hover:scale-[1.055]"
          :class="entryIsActive(entry) ? 'text-[#12327f]' : 'text-slate-700 hover:text-[#071225]'"
          @click.prevent="scrollToSection(`article-${entry.id}`)"
        >
          {{ entry.title }}
        </a>

        <ol class="mb-0 ml-0 mt-2.5 list-none space-y-0.5 border-l border-[#dce3ec] p-0">
          <li v-for="subpoint in entry.article.subpoints" :key="subpoint.id">
            <a
              :href="`#${subpoint.id}`"
              :data-toc-id="subpoint.id"
              :aria-current="activeId === subpoint.id ? 'location' : undefined"
              class="-ml-px block origin-left border-l-2 py-1.5 pl-3 text-[13px] leading-5 transition duration-200 hover:scale-[1.055]"
              :class="activeId === subpoint.id
                ? 'border-[#12327f] bg-[#f2f6ff] font-semibold text-[#12327f]'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-[#071225]'"
              @click.prevent="scrollToSection(subpoint.id)"
            >
              {{ subpoint.title }}
            </a>
          </li>
        </ol>
      </li>
    </ol>
  </aside>
</template>
