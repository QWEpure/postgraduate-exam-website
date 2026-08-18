<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Exam, ExamOption } from '@/types'

const props = defineProps<{ exam: Exam; saving?: boolean; error?: string }>()
const emit = defineEmits<{ close: []; save: [exam: Omit<Exam, 'id'>] }>()

function cloneExam(exam: Exam): Exam {
  return JSON.parse(JSON.stringify(exam)) as Exam
}

const draft = ref<Exam>(cloneExam(props.exam))
const tagsText = ref('')
const resourcesText = ref('')
const knowledgeBlocksText = ref('')

watch(
  () => props.exam,
  (exam) => {
    draft.value = cloneExam(exam)
    tagsText.value = exam.tags.join('，')
    resourcesText.value = exam.resourceLinks.join('\n')
    knowledgeBlocksText.value = (exam.knowledgeBlockIds || []).join('，')
  },
  { immediate: true },
)

const isChoice = computed(() => draft.value.questionType === 'choice')

function addOption() {
  const key = String.fromCharCode(65 + draft.value.options.length)
  draft.value.options.push({ key, text: '' })
}

function removeOption(index: number) {
  draft.value.options.splice(index, 1)
}

function parseList(source: string, separator: RegExp) {
  return [...new Set(source.split(separator).map((item) => item.trim()).filter(Boolean))]
}

function save() {
  const { id: _id, ...payload } = cloneExam(draft.value)
  payload.tags = parseList(tagsText.value, /[,，\n]/)
  payload.resourceLinks = parseList(resourcesText.value, /\n/)
  payload.options = isChoice.value ? payload.options : []
  payload.knowledgeBlockIds = parseList(knowledgeBlocksText.value, /[,，\n]/).slice(0, 4)
  if (isChoice.value) {
    payload.subQuestions = []
  }
  emit('save', payload)
}
</script>

<template>
  <div class="fixed inset-0 z-[100] bg-slate-950/35" role="dialog" aria-modal="true" aria-label="修改真题" @click.self="emit('close')">
    <form class="ml-auto flex h-full w-full max-w-[760px] flex-col bg-white shadow-2xl" @submit.prevent="save">
      <header class="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 px-7">
        <div>
          <p class="m-0 text-[10px] font-black tracking-[.16em] text-blue-700">PAST PAPER EDITOR</p>
          <h2 class="m-0 mt-1 text-lg font-black">修改 {{ exam.year }} 年第 {{ exam.number }} 题</h2>
        </div>
        <button type="button" class="h-9 px-3 text-xl text-slate-500 hover:text-slate-950" aria-label="关闭编辑器" @click="emit('close')">×</button>
      </header>

      <div class="flex-1 overflow-y-auto px-7 py-6">
        <div class="grid grid-cols-4 gap-4 max-sm:grid-cols-2">
          <label class="grid gap-2 text-xs font-bold text-slate-600">年份<input v-model.number="draft.year" type="number" min="2009" class="h-10 border border-slate-300 px-3 text-sm outline-none focus:border-blue-700" /></label>
          <label class="grid gap-2 text-xs font-bold text-slate-600">题号<input v-model.number="draft.number" type="number" min="1" class="h-10 border border-slate-300 px-3 text-sm outline-none focus:border-blue-700" /></label>
          <label class="grid gap-2 text-xs font-bold text-slate-600">分值<input v-model.number="draft.score" type="number" min="0" step="0.5" class="h-10 border border-slate-300 px-3 text-sm outline-none focus:border-blue-700" /></label>
          <label class="grid gap-2 text-xs font-bold text-slate-600">难度<input v-model.number="draft.difficulty" type="number" min="1" max="5" class="h-10 border border-slate-300 px-3 text-sm outline-none focus:border-blue-700" /></label>
        </div>

        <div class="mt-5 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
          <label class="grid gap-2 text-xs font-bold text-slate-600">科目
            <select v-model="draft.subject" class="h-10 border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700"><option value="ds">数据结构</option><option value="co">计算机组成原理</option><option value="os">操作系统</option><option value="cn">计算机网络</option></select>
          </label>
          <label class="grid gap-2 text-xs font-bold text-slate-600">题型
            <select v-model="draft.questionType" class="h-10 border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-700"><option value="choice">选择题</option><option value="comprehensive">综合题</option></select>
          </label>
          <label class="grid gap-2 text-xs font-bold text-slate-600">章节<input v-model="draft.chapterName" class="h-10 border border-slate-300 px-3 text-sm outline-none focus:border-blue-700" /></label>
        </div>

        <label class="mt-6 grid gap-2 text-xs font-bold text-slate-600">题干（支持 Markdown）
          <textarea v-model="draft.stem" rows="10" required class="resize-y border border-slate-300 p-3 font-mono text-sm leading-6 outline-none focus:border-blue-700"></textarea>
        </label>

        <section v-if="isChoice" class="mt-7 border-t border-slate-200 pt-6">
          <div class="mb-3 flex items-center justify-between"><h3 class="m-0 text-sm font-black">选项</h3><button type="button" class="text-xs font-bold text-blue-700" @click="addOption">＋ 添加选项</button></div>
          <div class="grid gap-3">
            <div v-for="(option, index) in draft.options" :key="index" class="grid grid-cols-[62px_1fr_36px] gap-2">
              <input v-model="(option as ExamOption).key" maxlength="10" class="border border-slate-300 px-3 text-center font-bold outline-none focus:border-blue-700" aria-label="选项标识" />
              <textarea v-model="(option as ExamOption).text" rows="2" class="resize-y border border-slate-300 p-3 text-sm outline-none focus:border-blue-700" aria-label="选项内容"></textarea>
              <button type="button" class="text-slate-400 hover:text-red-600" aria-label="删除选项" @click="removeOption(index)">×</button>
            </div>
          </div>
          <label class="mt-5 grid gap-2 text-xs font-bold text-slate-600">
            关联知识块（逗号分隔，最多 4 个）
            <input
              v-model="knowledgeBlocksText"
              class="h-10 border border-slate-300 px-3 font-mono text-xs font-normal outline-none focus:border-blue-700"
              placeholder="kb-gbn-err-1，kb-gbn-num-2"
            />
          </label>
        </section>

        <label class="mt-6 grid gap-2 text-xs font-bold text-slate-600">标准答案<input v-model="draft.answer" class="h-10 border border-slate-300 px-3 text-sm outline-none focus:border-blue-700" /></label>
        <label class="mt-6 grid gap-2 text-xs font-bold text-slate-600">解析（支持 Markdown）
          <textarea v-model="draft.explanation" rows="14" class="resize-y border border-slate-300 p-3 font-mono text-sm leading-6 outline-none focus:border-blue-700"></textarea>
        </label>
        <label class="mt-6 grid gap-2 text-xs font-bold text-slate-600">知识标签（逗号分隔）<textarea v-model="tagsText" rows="3" class="resize-y border border-slate-300 p-3 text-sm outline-none focus:border-blue-700"></textarea></label>
        <label class="mt-6 grid gap-2 text-xs font-bold text-slate-600">资源链接（每行一条）<textarea v-model="resourcesText" rows="3" class="resize-y border border-slate-300 p-3 text-sm outline-none focus:border-blue-700"></textarea></label>

      </div>

      <footer class="shrink-0 border-t border-slate-200 bg-white px-7 py-4">
        <p v-if="error" class="mb-3 mt-0 text-sm text-red-600">{{ error }}</p>
        <div class="flex justify-end gap-3">
          <button type="button" class="border border-slate-300 px-5 py-2.5 text-sm font-bold" @click="emit('close')">取消</button>
          <button type="submit" class="bg-blue-700 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50" :disabled="saving">{{ saving ? '正在保存…' : '保存修改' }}</button>
        </div>
      </footer>
    </form>
  </div>
</template>
