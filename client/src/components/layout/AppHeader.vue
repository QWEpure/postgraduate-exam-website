<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-[74px] items-center gap-10 border-b border-slate-200/80 bg-[#f4f7fb]/80 px-7 backdrop-blur-2xl max-sm:h-[62px] max-sm:px-4 md:px-[max(28px,calc((100vw-1260px)/2+28px))]"
  >
    <RouterLink class="group flex items-center gap-3 text-xl font-black tracking-[-.03em]" to="/" aria-label="链路 408 首页">
      <span class="relative block h-8 w-8 transition-transform duration-300 group-hover:scale-110">
        <span class="absolute left-0 top-3 h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,.7)]"></span>
        <span class="absolute right-0 top-0.5 h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,.7)]"></span>
        <span class="absolute bottom-0.5 right-0 h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,.7)]"></span>
        <span class="absolute left-1 top-3.5 h-px w-6 origin-left -rotate-[25deg] bg-blue-600"></span>
        <span class="absolute left-1 top-3.5 h-px w-6 origin-left rotate-[28deg] bg-blue-600"></span>
      </span>
      <span class="tracking-[-.02em]">链路 <b class="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">408</b></span>
    </RouterLink>

    <button class="ml-auto hidden border-0 bg-transparent text-xl max-sm:block" aria-label="打开导航" @click="open = !open">☰</button>
    <nav
      :class="[
        'flex items-center gap-9 text-sm font-bold max-sm:absolute max-sm:left-0 max-sm:right-0 max-sm:top-[62px] max-sm:flex-col max-sm:items-stretch max-sm:bg-white/95 max-sm:px-6 max-sm:py-4 max-sm:shadow-2xl max-sm:backdrop-blur-xl',
        open ? 'max-sm:flex' : 'max-sm:hidden',
      ]"
      @click="open = false"
    >
      <RouterLink
        class="group relative py-[27px] pb-6 text-slate-600 transition-colors hover:text-slate-950 [&.router-link-active]:text-blue-700 [&.router-link-active]:after:scale-x-100 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-blue-600 after:to-cyan-500 after:transition-transform after:duration-200 hover:after:scale-x-100 max-sm:py-2 max-sm:after:hidden"
        to="/knowledge"
      >知识体系</RouterLink>
      <RouterLink
        class="group relative py-[27px] pb-6 text-slate-600 transition-colors hover:text-slate-950 [&.router-link-active]:text-blue-700 [&.router-link-active]:after:scale-x-100 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-blue-600 after:to-cyan-500 after:transition-transform after:duration-200 hover:after:scale-x-100 max-sm:py-2 max-sm:after:hidden"
        to="/exams"
      >408 真题</RouterLink>
    </nav>
    <div class="ml-auto hidden items-center gap-3 max-md:hidden">
      <span class="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[11px] font-bold tracking-[.06em] text-amber-700">
        <span class="relative inline-flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
        </span>
        公测中 · 功能尚不稳定
      </span>
    </div>
  </header>
</template>
