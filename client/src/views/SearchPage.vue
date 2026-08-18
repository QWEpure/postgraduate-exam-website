<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearch } from '@/search/composables/useSearch'
import type { SearchResult } from '@/search/types/index'
import { highlightText } from '@/search/composables/useSearch'
import BrandLogo from '@/components/BrandLogo.vue'

/** 输入字符上限：超过自动截断到前 20 字（含中文 / 英文 / 数字，按 UTF-16 code unit 计） */
const MAX_QUERY_LEN = 20

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const results = ref<SearchResult[]>([])
const exacts = ref<SearchResult[]>([])
const page = ref(1)
const PAGE_SIZE = 10

const { query, search, dispose } = useSearch({ topK: 8 })

// 输入超过 MAX_QUERY_LEN 字时自动截断（粘贴 / URL 同步 / 直接输入都会触发）
watch(query, (v) => {
  if (v && v.length > MAX_QUERY_LEN) {
    query.value = v.slice(0, MAX_QUERY_LEN)
  }
})

// 真题精确命中放最前，再拼接知识结果，统一分页展示
const merged = computed<SearchResult[]>(() => [...exacts.value, ...results.value])
const total = computed(() => merged.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

const pagedResults = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return merged.value.slice(start, start + PAGE_SIZE)
})

/** 最小 loading 显示时间：避免 spinner 一闪而过，让用户感受到"正在检索" */
const MIN_LOADING_MS = 500

async function run(q: string) {
  if (!q.trim()) {
    results.value = []
    exacts.value = []
    return
  }
  loading.value = true
  const t0 = Date.now()
  try {
    const outcome = await search(q)
    if (outcome) {
      exacts.value = outcome.exact
      results.value = outcome.results
      page.value = 1
    }
  } finally {
    const elapsed = Date.now() - t0
    if (elapsed < MIN_LOADING_MS) {
      await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed))
    }
    loading.value = false
  }
}

async function runLiveSearch() {
  // 实时搜索（带防抖）：useSearch.search() 内部 180ms 防抖
  const q = query.value.trim()
  if (!q) {
    results.value = []
    exacts.value = []
    loading.value = false
    return
  }
  loading.value = true
  const t0 = Date.now()
  try {
    const outcome = await search()
    if (outcome) {
      exacts.value = outcome.exact
      results.value = outcome.results
      page.value = 1
    }
  } finally {
    const elapsed = Date.now() - t0
    if (elapsed < MIN_LOADING_MS) {
      await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed))
    }
    loading.value = false
  }
}

function onSubmit() {
  const q = query.value.trim()
  if (!q) return
  // 实时搜索已经把结果算出来了，回车只更新 URL（持久化）
  router.replace({ name: 'search', query: { q } })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    onSubmit()
  }
}

function goto(r: SearchResult) {
  router.push(r.route)
}

function gotoPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

let initialized = false
onMounted(() => {
  const q = String(route.query.q || '').trim()
  if (q) {
    query.value = q
    run(q).finally(() => { initialized = true })
  } else {
    initialized = true
  }
})

// 输入实时触发搜索（useSearch 内置 180ms 防抖丢弃过期结果）
watch(query, () => {
  if (!initialized) return
  void runLiveSearch()
})

// 浏览器前进/后退时同步 query 并触发搜索
watch(() => route.query.q, (newQ) => {
  if (typeof newQ === 'string' && newQ !== query.value) {
    query.value = newQ
    // query 变化会被上面的 watch(query) 接管，触发实时搜索
  }
})

onBeforeUnmount(dispose)
</script>

<template>
  <div class="min-h-screen font-sans text-[#0a1d40] bg-white">
    <header class="app-header">
      <div class="header-inner">
        <div class="header-left">
          <RouterLink to="/" class="logo-link">
            <BrandLogo />
          </RouterLink>
        </div>

        <form class="search-form" @submit.prevent="onSubmit">
          <span class="search-icon">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="9" cy="9" r="6" />
              <path d="m14 14 4 4" />
            </svg>
          </span>
          <input
            v-model="query"
            :maxlength="MAX_QUERY_LEN"
            aria-label="搜索"
            placeholder="搜索知识点或章节"
            autocomplete="off"
            class="search-input"
            @keydown="onKeydown"
          />
          <button
            v-if="query"
            type="button"
            class="clear-btn"
            aria-label="清空"
            @click="query = ''"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="m3 3 10 10M13 3 3 13" />
            </svg>
          </button>
        </form>

        <nav class="header-nav">
          <RouterLink to="/knowledge" class="nav-link">知识简纲</RouterLink>
          <RouterLink to="/exams" class="nav-link">历年真题</RouterLink>
        </nav>
      </div>
    </header>

    <main class="w-full max-w-[1080px] mx-auto px-5 py-[42px] pb-16">
      <template v-if="loading">
        <div class="py-20 flex flex-col items-center gap-4">
          <div class="spinner"></div>
          <div class="text-[#7587a8] text-sm">正在检索…</div>
        </div>
      </template>

      <template v-else-if="query">
        <section class="mb-[22px]">
          <h1 class="m-0 mb-2 text-[30px] leading-[1.25] tracking-[-0.02em]">
            “<span class="text-[#2259d6]">{{ query }}</span>” 的搜索结果
          </h1>
          <div v-if="total" class="text-sm text-[#7587a8]">共 {{ total }} 条相关内容</div>
        </section>

        <section v-if="total" class="border border-[#e4eaf2] rounded-[14px] overflow-hidden bg-white">
          <article
            v-for="(r, i) in pagedResults"
            :key="r.route"
            class="result-item relative px-[26px] py-[18px] pr-14 border-b border-[#e4eaf2] last:border-b-0 transition-colors duration-150 hover:bg-[#f7f9fd] cursor-pointer max-[820px]:pl-[18px] max-[820px]:pr-[42px]"
            :style="{ '--delay': i * 80 + 'ms' }"
            @click="goto(r)"
          >
            <div class="text-xs text-[#7082a1] mb-1.5 flex items-center gap-2">
              <span v-if="r.type === 'exam'" class="inline-block px-[7px] py-[1px] rounded-[4px] bg-[#fff1e0] text-[#c25700] text-[11px] font-semibold leading-[1.5]">真题</span>{{ r.subtitle }}
            </div>
            <h2
              v-if="r.type === 'knowledge'"
              class="m-0 mb-[5px] text-[17px] leading-[1.35]"
              v-html="highlightText(r.title, query)"
            ></h2>
            <h2 v-else class="m-0 mb-[5px] text-[17px] leading-[1.35]">{{ r.title }}</h2>
            <p
              v-if="r.snippet"
              class="m-0 text-[#445675] text-sm leading-[1.65] line-clamp-2 overflow-hidden"
              v-html="highlightText(r.snippet, query)"
            ></p>
            <span class="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-[#153a72]">›</span>
          </article>
        </section>

        <div v-else class="py-20 text-center text-[#7587a8]">
          <p class="m-0 mb-2 text-base">未找到匹配结果</p>
          <p class="m-0 text-[13px] text-[#9aa9c3]">试试更精准的关键词，或换个角度描述</p>
        </div>

        <div v-if="total > PAGE_SIZE" class="flex justify-center gap-2.5 my-5 mb-2.5">
          <button :disabled="page === 1" class="w-[34px] h-[34px] rounded-full border border-[#dfe6ef] bg-white text-[#50627f] cursor-pointer text-sm transition-colors duration-150 hover:border-[#2259d6] hover:text-[#2259d6] disabled:opacity-40 disabled:cursor-not-allowed" @click="gotoPage(page - 1)">‹</button>
          <button
            v-for="p in totalPages"
            :key="p"
            :class="{ 'bg-[#2259d6] text-white border-[#2259d6]': p === page, 'border border-[#dfe6ef] bg-white text-[#50627f] hover:border-[#2259d6] hover:text-[#2259d6]': p !== page }"
            class="w-[34px] h-[34px] rounded-full cursor-pointer text-sm transition-colors duration-150"
            @click="gotoPage(p)"
          >{{ p }}</button>
          <button :disabled="page === totalPages" class="w-[34px] h-[34px] rounded-full border border-[#dfe6ef] bg-white text-[#50627f] cursor-pointer text-sm transition-colors duration-150 hover:border-[#2259d6] hover:text-[#2259d6] disabled:opacity-40 disabled:cursor-not-allowed" @click="gotoPage(page + 1)">›</button>
        </div>
      </template>

      <div v-else class="py-20 text-center text-[#7587a8]">
        <p class="m-0 text-base">在上方搜索框输入关键词开始搜索</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ============================================================
 * Header：高级感的搜索页头部
 *  - 渐变玻璃背景 + 底部细线发光
 *  - 搜索框聚焦时蓝色光晕扩散
 *  - 导航链接 hover 下划线滑入
 * ============================================================ */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 72px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(244, 248, 255, 0.88));
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(219, 228, 239, 0.6);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 4px 20px rgba(34, 89, 214, 0.04);
}
.header-inner {
  max-width: 1500px;
  height: 100%;
  margin: 0 auto;
  padding: 0 28px;
  display: grid;
  grid-template-columns: 220px 1fr 280px;
  align-items: center;
  gap: 24px;
}
.logo-link {
  display: inline-flex;
  text-decoration: none;
  transition: opacity 0.2s ease;
}
.logo-link:hover {
  opacity: 0.85;
}

/* 搜索框 */
.search-form {
  position: relative;
  width: 100%;
  max-width: 560px;
  height: 44px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1.5px solid #e0e7f2;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  transition: all 0.25s ease;
}
.search-form:focus-within {
  border-color: #2259d6;
  background: #fff;
  box-shadow:
    0 0 0 4px rgba(34, 89, 214, 0.1),
    0 4px 14px rgba(34, 89, 214, 0.08);
}
.search-icon {
  display: inline-flex;
  color: #9aa9c3;
  flex-shrink: 0;
  transition: color 0.2s ease;
}
.search-form:focus-within .search-icon {
  color: #2259d6;
}
.search-input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 15px;
  color: #0a1d40;
}
.search-input::placeholder {
  color: #9aa9c3;
}
.clear-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 50%;
  background: #eef2f7;
  color: #7082a1;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.clear-btn:hover {
  background: #2259d6;
  color: #fff;
  transform: rotate(90deg);
}

/* 导航 */
.header-nav {
  display: flex;
  justify-content: flex-end;
  gap: 28px;
}
.nav-link {
  position: relative;
  font-size: 14px;
  font-weight: 600;
  color: #516887;
  text-decoration: none;
  padding: 6px 2px;
  transition: color 0.2s ease;
}
.nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #2259d6, #38bdf8);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s ease;
  border-radius: 1px;
}
.nav-link:hover {
  color: #2259d6;
}
.nav-link:hover::after {
  transform: scaleX(1);
}
.nav-link.router-link-active {
  color: #2259d6;
}
.nav-link.router-link-active::after {
  transform: scaleX(1);
}

/* 响应式 */
@media (max-width: 820px) {
  .app-header {
    height: auto;
  }
  .header-inner {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 12px 16px;
  }
  .header-nav {
    display: none;
  }
}

:deep(.hit),
:deep(mark) {
  color: #b04a00;
  font-weight: 700;
  background: #fff09a;
  padding: 0 3px;
  border-radius: 3px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/* 加载旋转圈圈 */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e4eaf2;
  border-top-color: #2259d6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 搜索结果依次从上到下淡入出现 */
.result-item {
  opacity: 0;
  transform: translateY(-8px);
  animation: result-in 0.8s ease-out forwards;
  animation-delay: var(--delay, 0ms);
}
@keyframes result-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>