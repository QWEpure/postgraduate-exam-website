<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import KnowledgeBlockEditor from '@/components/knowledge-editor/KnowledgeBlockEditor.vue'
import {
  createEditableArticle,
  createEditableBlock,
  createEditableSubpoint,
  generateKnowledgeArticleTs,
  getKnowledgeArticleOutputPath,
  validateEditableArticle,
  type EditableBlockType,
  type EditableKnowledgeArticle,
} from '@/content/knowledge-articles/editor'
import { getKnowledgeArticleRegistration } from '@/content/knowledge-articles/registry'
import { content } from '@/content'

const route = useRoute()
const article = ref<EditableKnowledgeArticle>(createEditableArticle())
const sourcePointId = ref('')
const feedback = ref('')

const sourceCode = computed(() => generateKnowledgeArticleTs(article.value))
const validationErrors = computed(() => validateEditableArticle(article.value))
const outputPath = computed(() => getKnowledgeArticleOutputPath(article.value))
const isEditingExisting = computed(() => Boolean(sourcePointId.value))
const knowledgePageHref = computed(() => sourcePointId.value
  ? content.getKnowledgePageHref(sourcePointId.value)
  : '/knowledge')
const blockOptions: Array<{ type: EditableBlockType; label: string }> = [
  { type: 'paragraph', label: '正文' },
  { type: 'formula', label: '公式' },
  { type: 'callout', label: '提示' },
  { type: 'html', label: 'HTML' },
  { type: 'image', label: '图片' },
  { type: 'animation', label: 'Manim 动画' },
]

watch(
  () => route.params.pointId,
  (pointId) => {
    const id = typeof pointId === 'string' ? pointId : ''
    const registration = id ? getKnowledgeArticleRegistration(id) : undefined
    article.value = createEditableArticle(registration)
    sourcePointId.value = registration ? id : ''
    feedback.value = id && !registration ? `没有找到 ${id} 的静态文章，已切换到新建模式。` : ''
  },
  { immediate: true },
)

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= items.length) return
  const current = items[index]
  items[index] = items[target]
  items[target] = current
}

function addSubpoint() {
  article.value.subpoints.push(createEditableSubpoint(article.value))
}

function addBlock(subpointIndex: number, type: EditableBlockType) {
  article.value.subpoints[subpointIndex].blocks.push(createEditableBlock(type))
}

async function copySourceCode() {
  if (validationErrors.value.length) return
  await navigator.clipboard.writeText(sourceCode.value)
  feedback.value = 'TS 代码已复制。'
}

function downloadSourceFile() {
  if (validationErrors.value.length) return
  const blob = new Blob([sourceCode.value], { type: 'text/typescript;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = article.value.fileName
  link.click()
  URL.revokeObjectURL(url)
  feedback.value = `${article.value.fileName} 已生成。`
}
</script>

<template>
  <div class="min-h-[calc(100vh-74px)] bg-[#eef3f9] px-6 py-10 max-sm:px-4 max-sm:py-6">
    <div class="mx-auto max-w-[1640px]">
      <header class="mb-8 flex items-end justify-between gap-8 border-b border-slate-300 pb-7 max-lg:block">
        <div>
          <div class="mb-3 flex items-center gap-3 text-xs font-bold text-slate-500">
            <RouterLink :to="knowledgePageHref" class="hover:text-blue-700">← 返回知识体系</RouterLink>
            <span class="text-slate-300">/</span>
            <span>{{ isEditingExisting ? '编辑现有页面' : '创建新页面' }}</span>
          </div>
          <h1 class="m-0 text-[clamp(2rem,4vw,3.2rem)] font-black leading-none tracking-[-.055em] text-slate-950">知识页编辑器</h1>
          <p class="mb-0 mt-4 max-w-[760px] text-sm leading-7 text-slate-600">
            用结构化表单组织小知识点和内容块，右侧会实时生成与项目一致的 TypeScript 文件。
          </p>
        </div>
        <div class="flex gap-2 max-lg:mt-6 max-sm:grid max-sm:grid-cols-2">
          <RouterLink
            v-if="isEditingExisting"
            :to="{ name: 'knowledge-editor' }"
            class="grid h-11 place-items-center border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:border-blue-600 hover:text-blue-700"
          >新建知识页</RouterLink>
          <button
            type="button"
            class="h-11 border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="validationErrors.length > 0"
            @click="copySourceCode"
          >复制 TS</button>
          <button
            type="button"
            class="h-11 border border-blue-700 bg-blue-700 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="validationErrors.length > 0"
            @click="downloadSourceFile"
          >下载 {{ article.fileName }}</button>
        </div>
      </header>

      <div class="grid grid-cols-[minmax(0,1fr)_520px] items-start gap-6 max-xl:grid-cols-1">
        <div class="min-w-0 space-y-6">
          <section class="border border-slate-300 bg-white">
            <div class="border-b border-slate-200 px-5 py-4">
              <h2 class="m-0 text-base font-black text-slate-950">文件信息</h2>
            </div>
            <div class="grid grid-cols-2 gap-5 p-5 max-md:grid-cols-1">
              <label class="grid gap-2 text-xs font-bold text-slate-600">
                Point ID
                <input v-model.trim="article.pointId" class="h-11 border border-slate-300 px-3 font-mono text-sm font-normal outline-none focus:border-blue-600" placeholder="kp-dns" />
              </label>
              <label class="grid gap-2 text-xs font-bold text-slate-600">
                导出变量名
                <input v-model.trim="article.exportName" class="h-11 border border-slate-300 px-3 font-mono text-sm font-normal outline-none focus:border-blue-600" placeholder="dnsQueryArticle" />
              </label>
              <label class="grid gap-2 text-xs font-bold text-slate-600">
                章节目录
                <input v-model.trim="article.directory" class="h-11 border border-slate-300 px-3 font-mono text-sm font-normal outline-none focus:border-blue-600" placeholder="computer-networks/application-layer" />
              </label>
              <label class="grid gap-2 text-xs font-bold text-slate-600">
                文件名
                <input v-model.trim="article.fileName" class="h-11 border border-slate-300 px-3 font-mono text-sm font-normal outline-none focus:border-blue-600" placeholder="dns-query.ts" />
              </label>
              <div class="col-span-2 border-l-2 border-blue-600 bg-blue-50 px-4 py-3 text-xs leading-6 text-slate-600 max-md:col-span-1">
                页面主标题仍由知识树中的 <code class="font-mono font-bold text-blue-800">point.title</code> 提供；这个文件负责页面正文。建议输出到
                <code class="break-all font-mono font-bold text-slate-800">{{ outputPath }}</code>。
              </div>
            </div>
          </section>

          <section
            v-for="(subpoint, subpointIndex) in article.subpoints"
            :key="subpoint.key"
            class="border border-slate-300 bg-white"
          >
            <div class="flex min-h-14 items-center gap-3 border-b border-slate-200 bg-slate-50 px-4">
              <span class="grid h-8 w-8 place-items-center bg-blue-700 font-mono text-xs font-black text-white">{{ subpointIndex + 1 }}</span>
              <strong class="text-sm text-slate-900">小知识点</strong>
              <div class="ml-auto flex gap-1">
                <button type="button" class="h-8 w-8 border border-slate-200 bg-white text-xs disabled:opacity-30" :disabled="subpointIndex === 0" aria-label="上移小知识点" @click="moveItem(article.subpoints, subpointIndex, -1)">↑</button>
                <button type="button" class="h-8 w-8 border border-slate-200 bg-white text-xs disabled:opacity-30" :disabled="subpointIndex === article.subpoints.length - 1" aria-label="下移小知识点" @click="moveItem(article.subpoints, subpointIndex, 1)">↓</button>
                <button type="button" class="h-8 px-3 text-xs font-bold text-slate-400 hover:bg-red-50 hover:text-red-600" @click="article.subpoints.splice(subpointIndex, 1)">删除</button>
              </div>
            </div>

            <div class="grid gap-5 p-5">
              <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 max-md:grid-cols-1">
                <label class="grid gap-2 text-xs font-bold text-slate-600">
                  锚点 ID
                  <input v-model.trim="subpoint.id" class="h-10 border border-slate-300 px-3 font-mono text-xs font-normal outline-none focus:border-blue-600" />
                </label>
                <label class="grid gap-2 text-xs font-bold text-slate-600">
                  小知识点标题
                  <input v-model="subpoint.title" class="h-10 border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600" />
                </label>
              </div>

              <div class="grid gap-4">
                <KnowledgeBlockEditor
                  v-for="(block, blockIndex) in subpoint.blocks"
                  :key="block.key"
                  v-model="subpoint.blocks[blockIndex]"
                  :index="blockIndex"
                  :total="subpoint.blocks.length"
                  @move-up="moveItem(subpoint.blocks, blockIndex, -1)"
                  @move-down="moveItem(subpoint.blocks, blockIndex, 1)"
                  @remove="subpoint.blocks.splice(blockIndex, 1)"
                />
              </div>

              <div class="flex flex-wrap items-center gap-2 border-t border-dashed border-slate-300 pt-4">
                <span class="mr-1 text-xs font-bold text-slate-500">添加内容</span>
                <button
                  v-for="item in blockOptions"
                  :key="item.type"
                  type="button"
                  class="h-8 border border-slate-300 bg-white px-3 text-xs font-bold text-slate-600 hover:border-blue-600 hover:text-blue-700"
                  @click="addBlock(subpointIndex, item.type)"
                >＋ {{ item.label }}</button>
              </div>
            </div>
          </section>

          <button
            type="button"
            class="h-12 w-full border border-dashed border-slate-400 bg-white text-sm font-bold text-slate-600 hover:border-blue-600 hover:text-blue-700"
            @click="addSubpoint"
          >＋ 新增一个小知识点</button>
        </div>

        <aside class="sticky top-[94px] min-w-0 border border-slate-800 bg-[#07101f] text-slate-200 max-xl:static">
          <div class="flex min-h-14 items-center border-b border-slate-700 px-4">
            <div>
              <p class="m-0 font-mono text-[10px] font-bold tracking-[.16em] text-cyan-300">TYPESCRIPT OUTPUT</p>
              <p class="mb-0 mt-1 break-all font-mono text-xs text-slate-400">{{ outputPath }}</p>
            </div>
            <span class="ml-auto text-xs font-bold" :class="validationErrors.length ? 'text-orange-300' : 'text-emerald-300'">
              {{ validationErrors.length ? `${validationErrors.length} 个问题` : '可以生成' }}
            </span>
          </div>

          <div v-if="validationErrors.length" class="border-b border-orange-400/30 bg-orange-400/10 px-4 py-3">
            <ul class="m-0 space-y-1 pl-4 text-xs leading-6 text-orange-100">
              <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            </ul>
          </div>

          <pre class="m-0 max-h-[calc(100vh-230px)] overflow-auto p-5 font-mono text-[12px] leading-6 text-slate-200 max-xl:max-h-[560px]"><code>{{ sourceCode }}</code></pre>
        </aside>
      </div>

      <p v-if="feedback" class="fixed bottom-5 left-1/2 z-50 m-0 -translate-x-1/2 bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-2xl" role="status">
        {{ feedback }}
      </p>
    </div>
  </div>
</template>
