<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { Scene } from 'manim-web'
import type { ManimWebAnimation } from '@/animations/types'

const props = defineProps<{
  animation: ManimWebAnimation
}>()

const firstIndex = () => props.animation.initialState ? -1 : 0
const current = ref(firstIndex())
const sceneHost = ref<HTMLElement | null>(null)
const sceneRef = shallowRef<Scene | null>(null)
const isRendering = ref(false)
let renderToken = 0

const stepCount = computed(() => props.animation.steps.length)
const progress = computed(() => stepCount.value && current.value >= 0 ? ((current.value + 1) / stepCount.value) * 100 : 0)
const sceneAspectRatio = computed(() => `${props.animation.scene.width} / ${props.animation.scene.height}`)
const stepLabel = computed(() => current.value < 0
  ? '准备开始'
  : `第 ${current.value + 1} / ${stepCount.value} 步`)

async function renderCurrentStep(animate = false) {
  const scene = sceneRef.value
  const step = props.animation.steps[current.value]
  if (!scene) return

  const token = ++renderToken
  isRendering.value = true
  scene.clear({ render: false })
  try {
    if (step) {
      await step.render(scene, animate)
    } else if (current.value === -1 && props.animation.initialState) {
      await props.animation.initialState.render(scene, false)
    } else {
      scene.render()
    }
  } finally {
    if (token === renderToken) isRendering.value = false
  }
}

async function initScene() {
  if (!sceneHost.value) return
  sceneRef.value?.dispose()
  const config = props.animation.scene
  sceneRef.value = new Scene(sceneHost.value, {
    width: config.width,
    height: config.height,
    frameWidth: config.frameWidth,
    frameHeight: config.frameHeight,
    backgroundColor: config.backgroundColor,
  })
  await renderCurrentStep(true)
}

function next() {
  current.value = Math.min(current.value + 1, stepCount.value - 1)
}

function prev() {
  current.value = Math.max(current.value - 1, firstIndex())
}

function reset() {
  const target = firstIndex()
  if (current.value !== target) {
    current.value = target
    return
  }
  current.value = target
  void renderCurrentStep(true)
}

watch(current, () => {
  void renderCurrentStep(true)
})

watch(
  () => props.animation,
  () => {
    current.value = firstIndex()
    void initScene()
  },
)

onMounted(() => {
  void initScene()
})

onUnmounted(() => {
  sceneRef.value?.dispose()
  sceneRef.value = null
})
</script>

<template>
  <div class="overflow-hidden rounded-[4px] border border-[#d6dee9] bg-white" :aria-label="animation.ariaLabel">
    <header class="flex items-center justify-between gap-5 border-b border-[#e0e6ee] px-[clamp(14px,2vw,22px)] py-3">
      <p class="m-0 text-[12px] font-semibold tracking-[.02em] text-slate-500">分步动画</p>
    </header>

    <div class="bg-[#f7f8fa] p-2">
      <div
        class="relative w-full overflow-hidden border border-[#e0e5eb] bg-white"
        :style="{ aspectRatio: sceneAspectRatio }"
        role="img"
        :aria-label="animation.ariaLabel"
      >
        <div ref="sceneHost" class="absolute inset-0 [&_canvas]:!absolute [&_canvas]:!inset-0 [&_canvas]:!h-full [&_canvas]:!w-full"></div>
      </div>
    </div>

    <footer class="border-t border-[#d8e1ec] bg-white">
      <div class="flex items-center justify-between gap-4 px-[clamp(14px,2vw,22px)] py-3 max-sm:items-end">
        <button class="text-[12px] font-semibold text-slate-400 transition hover:text-[#071225] disabled:cursor-not-allowed disabled:opacity-30" type="button" :disabled="isRendering" @click="reset">重置</button>
        <div class="flex shrink-0 items-center gap-5 text-sm">
          <button class="text-[13px] font-semibold text-slate-500 transition hover:text-[#12327f] disabled:cursor-not-allowed disabled:opacity-30" type="button" :disabled="current === firstIndex() || isRendering" @click="prev">← 上一步</button>
          <button class="rounded-md bg-[#12327f] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0b2769] disabled:cursor-not-allowed disabled:opacity-30" type="button" :disabled="current === stepCount - 1 || isRendering" @click="next">下一步 →</button>
        </div>
      </div>
      <div class="h-0.5 bg-[#e7ecf3]"><i class="block h-full bg-[#315fbd] transition-[width] duration-500 ease-out" :style="{ width: `${progress}%` }"></i></div>
    </footer>
  </div>
</template>
