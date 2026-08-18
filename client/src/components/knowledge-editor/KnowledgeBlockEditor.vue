<script setup lang="ts">
import { createEditableBlock, type EditableBlockType, type EditableKnowledgeBlock } from '@/content/knowledge-articles/editor'

defineProps<{
  index: number
  total: number
}>()

const emit = defineEmits<{
  moveUp: []
  moveDown: []
  remove: []
}>()

const block = defineModel<EditableKnowledgeBlock>({ required: true })

function changeType(event: Event) {
  block.value = {
    ...createEditableBlock((event.target as HTMLSelectElement).value as EditableBlockType),
    id: block.value.id,
  }
}
</script>

<template>
  <div class="border border-slate-200 bg-white">
    <div class="flex min-h-11 items-center gap-3 border-b border-slate-200 bg-slate-50 px-3">
      <span class="font-mono text-[10px] font-black text-slate-400">{{ String(index + 1).padStart(2, '0') }}</span>
      <select
        :value="block.type"
        class="h-8 border-0 bg-transparent pr-6 text-xs font-bold text-slate-700 outline-none"
        aria-label="内容块类型"
        @change="changeType"
      >
        <option value="paragraph">正文（Markdown）</option>
        <option value="formula">公式</option>
        <option value="callout">提示</option>
        <option value="html">HTML</option>
        <option value="image">图片</option>
        <option value="animation">Manim 动画</option>
      </select>
      <div class="ml-auto flex items-center gap-1">
        <button
          type="button"
          class="h-7 w-7 border border-slate-200 bg-white text-xs text-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
          :disabled="index === 0"
          aria-label="上移内容块"
          @click="emit('moveUp')"
        >↑</button>
        <button
          type="button"
          class="h-7 w-7 border border-slate-200 bg-white text-xs text-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
          :disabled="index === total - 1"
          aria-label="下移内容块"
          @click="emit('moveDown')"
        >↓</button>
        <button
          type="button"
          class="h-7 border border-transparent px-2 text-xs font-bold text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          @click="emit('remove')"
        >删除</button>
      </div>
    </div>

    <div class="grid gap-4 p-4">
      <label class="grid gap-2 text-xs font-bold text-slate-600">
        Block ID（真题精确关联使用）
        <input
          v-model.trim="block.id"
          class="h-10 border border-slate-300 px-3 font-mono text-xs font-normal outline-none focus:border-blue-600"
          placeholder="kb-gbn-send-window-1"
        />
      </label>

      <label v-if="block.type === 'paragraph'" class="grid gap-2 text-xs font-bold text-slate-600">
        正文（Markdown）
        <textarea
          v-model="block.text"
          rows="5"
          class="w-full resize-y border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal leading-7 text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
          placeholder="支持标题、列表、引用、链接、粗体、代码和 Markdown 图片"
        ></textarea>
      </label>

      <label v-else-if="block.type === 'html'" class="grid gap-2 text-xs font-bold text-slate-600">
        HTML 内容
        <textarea
          v-model="block.html"
          rows="6"
          class="w-full resize-y border border-slate-300 bg-slate-950 px-3 py-2.5 font-mono text-xs font-normal leading-6 text-cyan-100 outline-none transition focus:border-blue-600"
          spellcheck="false"
        ></textarea>
      </label>

      <template v-else-if="block.type === 'formula'">
        <label class="grid gap-2 text-xs font-bold text-slate-600">
          公式
          <input v-model="block.formula" class="h-10 border border-slate-300 px-3 font-mono text-sm font-normal outline-none focus:border-blue-600" placeholder="C = W log₂(1 + S/N)" />
        </label>
        <label class="grid gap-2 text-xs font-bold text-slate-600">
          公式说明（可选）
          <input v-model="block.caption" class="h-10 border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600" />
        </label>
      </template>

      <template v-else-if="block.type === 'callout'">
        <div class="grid grid-cols-[1fr_150px] gap-4 max-sm:grid-cols-1">
          <label class="grid gap-2 text-xs font-bold text-slate-600">
            提示标题
            <input v-model="block.title" class="h-10 border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600" />
          </label>
          <label class="grid gap-2 text-xs font-bold text-slate-600">
            强调色
            <select v-model="block.tone" class="h-10 border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-blue-600">
              <option value="blue">蓝色</option>
              <option value="orange">橙色</option>
            </select>
          </label>
        </div>
        <label class="grid gap-2 text-xs font-bold text-slate-600">
          提示正文
          <textarea v-model="block.text" rows="3" class="w-full resize-y border border-slate-300 px-3 py-2.5 text-sm font-normal leading-7 outline-none focus:border-blue-600"></textarea>
        </label>
      </template>

      <template v-else-if="block.type === 'image' || block.type === 'animation'">
        <div class="grid grid-cols-[1fr_180px] gap-4 max-sm:grid-cols-1">
          <label class="grid gap-2 text-xs font-bold text-slate-600">
            import 路径
            <input v-model="block.sourceImport.path" class="h-10 border border-slate-300 px-3 font-mono text-xs font-normal outline-none focus:border-blue-600" placeholder="@/assets/example.svg" />
          </label>
          <label class="grid gap-2 text-xs font-bold text-slate-600">
            导入方式
            <select v-model="block.sourceImport.kind" class="h-10 border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-blue-600">
              <option value="default">default import</option>
              <option value="named">named import</option>
            </select>
          </label>
        </div>
        <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <label class="grid gap-2 text-xs font-bold text-slate-600">
            本地变量名
            <input v-model="block.sourceImport.localName" class="h-10 border border-slate-300 px-3 font-mono text-xs font-normal outline-none focus:border-blue-600" />
          </label>
          <label v-if="block.sourceImport.kind === 'named'" class="grid gap-2 text-xs font-bold text-slate-600">
            原导出名（相同时可留空）
            <input v-model="block.sourceImport.importedName" class="h-10 border border-slate-300 px-3 font-mono text-xs font-normal outline-none focus:border-blue-600" />
          </label>
        </div>
      </template>

      <template v-if="block.type === 'image'">
        <label class="grid gap-2 text-xs font-bold text-slate-600">
          图片替代文本
          <input v-model="block.alt" class="h-10 border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600" />
        </label>
        <label class="grid gap-2 text-xs font-bold text-slate-600">
          图片说明（可选）
          <input v-model="block.caption" class="h-10 border border-slate-300 px-3 text-sm font-normal outline-none focus:border-blue-600" />
        </label>
      </template>
    </div>
  </div>
</template>
