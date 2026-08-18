<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { contributors as ALL_CONTRIBUTORS, type Contributor } from "@/content/contributors";

const router = useRouter();
const query = ref("");

/** 输入字符上限：超过自动截断到前 20 字 */
const MAX_QUERY_LEN = 20;
watch(query, (v) => {
  if (v && v.length > MAX_QUERY_LEN) {
    query.value = v.slice(0, MAX_QUERY_LEN);
  }
});

function onSearchKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    submit();
  }
}

function submit() {
  const q = query.value.trim();
  if (!q) return;
  router.push({ name: "search", query: { q } });
}

function gotoKnowledge() {
  router.push("/knowledge");
}

function gotoExams() {
  router.push("/exams");
}

/* ============================================================
 * 打字机副标题：循环展示多句话
 *  - 进页面先显示空 + 闪烁光标
 *  - 一个字一个字打出来（节奏 70-130ms 模拟人类打字）
 *  - 完整停留 1.8s
 *  - 倒退删除（每字 35ms）
 *  - 句间停 400ms 再打下一句
 * ============================================================ */
const ROTATING_LINES = [
  "用更少的内容，建立更清晰的知识体系",
  "开源 · 共建 · 共享，新时代的 AI 原生电子教材",
  "Less is more ：只收录 408 应试知识最小集",
  "用图像和交互式动画，帮助你快速掌握复杂的知识",
];

const typedText = ref("");
type TypePhase = "typing" | "holding" | "deleting" | "wait";
let typePhase: TypePhase = "typing";
let typeIdx = 0;
let typeChar = 0;
let typeTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleType(delay: number) {
  if (typeTimer) clearTimeout(typeTimer);
  typeTimer = setTimeout(typeStep, delay);
}

function typeStep() {
  const full = ROTATING_LINES[typeIdx];
  if (typePhase === "typing") {
    typeChar += 1;
    typedText.value = full.slice(0, typeChar);
    if (typeChar >= full.length) {
      typePhase = "holding";
      scheduleType(2500);
    } else {
      scheduleType(70 + Math.random() * 60);
    }
  } else if (typePhase === "holding") {
    typePhase = "deleting";
    scheduleType(80);
  } else if (typePhase === "deleting") {
    typeChar -= 1;
    typedText.value = full.slice(0, typeChar);
    if (typeChar <= 0) {
      typeIdx = (typeIdx + 1) % ROTATING_LINES.length;
      typePhase = "wait";
      scheduleType(400);
    } else {
      scheduleType(35);
    }
  } else {
    // wait
    typePhase = "typing";
    typeStep();
  }
}

/* ============================================================
 * 鼠标跟随背景：把鼠标坐标写到 CSS 变量 --mx / --my
 *  - 顶部 radial-gradient 光斑跟随
 *  - 底部 grid 网格的径向 mask 跟随
 * ============================================================ */
const bgStyle = ref<Record<string, string>>({
  "--mx": "50%",
  "--my": "33%",
});
let mouseRaf = 0;
function onMouseMove(e: MouseEvent) {
  if (mouseRaf) return;
  mouseRaf = requestAnimationFrame(() => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    bgStyle.value = {
      "--mx": x.toFixed(2) + "%",
      "--my": y.toFixed(2) + "%",
    };
    mouseRaf = 0;
  });
}

onMounted(() => {
  scheduleType(220); // 进页面 220ms 后开始打第一句
  window.addEventListener("mousemove", onMouseMove, { passive: true });
});

onBeforeUnmount(() => {
  if (typeTimer) clearTimeout(typeTimer);
  if (mouseRaf) cancelAnimationFrame(mouseRaf);
  window.removeEventListener("mousemove", onMouseMove);
});

/* ============================================================
 * 共建者区域：数据源来自 @/content/contributors.ts
 * 两行数据源互不重复，按 row 字段拆分
 * ============================================================ */
// 平台图标（统一蓝灰色，hover 时恢复品牌色）
const ICON_BILIBILI = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44h4.694l3.013-3.04c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.4.551.4.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.124-.933-.373c-.25-.25-.383-.57-.4-.96V12.44c0-.373.129-.689.387-.947.258-.257.574-.386.946-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.124-.933-.373c-.25-.25-.383-.57-.4-.96V12.44c0-.373.129-.689.387-.947.258-.257.574-.386.946-.386z"/></svg>`
const ICON_DOUYIN = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19.589 9.186a8.122 8.122 0 0 1-4.876-1.614v7.294a6.068 6.068 0 1 1-6.068-6.068c.124 0 .246.012.368.024v3.058a3.012 3.012 0 1 0 2.13 2.887V2h2.965a4.528 4.528 0 0 0 4.527 4.527v2.659z"/></svg>`
const ICON_XHS = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3.6 7.2c0-.99.81-1.8 1.8-1.8h13.2c.99 0 1.8.81 1.8 1.8v9.6c0 .99-.81 1.8-1.8 1.8H5.4c-.99 0-1.8-.81-1.8-1.8V7.2zm2.4 1.2v7.2h12V8.4h-12zm2.4 2.4h7.2v2.4H8.4v-2.4zm0 3.6h4.8v.6H8.4v-.6z"/></svg>`
const ICON_GITHUB = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.207 3.438 9.624 8.205 11.181.6.111.82-.254.82-.564 0-.278-.01-1.017-.015-1.998-3.338.71-4.042-1.58-4.042-1.58-.546-1.361-1.333-1.724-1.333-1.724-1.089-.731.083-.716.083-.716 1.205.083 1.838 1.215 1.838 1.215 1.071 1.797 2.811 1.278 3.497.977.109-.762.419-1.278.762-1.571-2.667-.298-5.471-1.302-5.471-5.791 0-1.278.464-2.322 1.222-3.14-.123-.294-.53-1.474.115-3.072 0 0 .996-.312 3.262 1.2a11.46 11.46 0 0 1 2.97-.393c1.005.005 2.018.135 2.96.393 2.265-1.512 3.26-1.2 3.26-1.2.646 1.598.24 2.778.117 3.072.76.818 1.221 1.862 1.221 3.14 0 4.501-2.808 5.488-5.484 5.778.43.362.814 1.078.814 2.173 0 1.571-.014 2.838-.014 3.223 0 .313.216.682.824.564C20.565 21.91 24 17.496 24 12.292 24 5.78 18.627.5 12 .5z"/></svg>`
/* 外部链接图标：窗口轮廓 + 右上角飞出箭头（Heroicons 风格）*/
const ICON_EXTERNAL_LINK = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>`
const GITHUB_REPO_URL = 'https://github.com/liangbohan/postgraduate-exam-website'

const PLATFORM_ICON: Record<Contributor['platform'], string> = {
  bilibili: ICON_BILIBILI,
  douyin: ICON_DOUYIN,
  xhs: ICON_XHS,
  github: ICON_GITHUB,
}

// 数据源按奇偶拆成两行
const row1Raw: Contributor[] = []
const row2Raw: Contributor[] = []
for (let i = 0; i < ALL_CONTRIBUTORS.length; i++) {
  if (i % 2 === 0) row1Raw.push(ALL_CONTRIBUTORS[i]);
  else row2Raw.push(ALL_CONTRIBUTORS[i]);
}

// 贡献者较少时，循环重复同一个人把行铺满，确保滚动条始终有内容可滚
const MIN_PER_ROW = 8;
function fillRow(row: Contributor[]): Contributor[] {
  if (row.length === 0) return [];
  if (row.length >= MIN_PER_ROW) return [...row];
  const out: Contributor[] = [];
  let i = 0;
  while (out.length < MIN_PER_ROW) {
    out.push(row[i % row.length]);
    i++;
  }
  return out;
}

const contributorsRow1 = fillRow(row1Raw);
const contributorsRow2 = fillRow(row2Raw);

</script>

<template>
  <main
    class="home-page relative min-h-screen overflow-hidden px-6 py-14 pb-18 font-sans text-[#0b1f45] md:py-16 lg:py-[56px]"
    :style="bgStyle"
  >
    <!-- 鼠标跟随的光斑层 -->
    <div class="bg-spot" aria-hidden="true"></div>
    <!-- 鼠标跟随的网格层（用径向 mask 只在鼠标附近显示） -->
    <div class="bg-grid" aria-hidden="true"></div>

    <section class="relative z-[1] w-full max-w-[980px] mx-auto text-center">
      <div class="text-sm tracking-[0.28em] text-[#5c6f94] font-bold">
        极简 · 精炼 · 可视化
      </div>

      <div class="inline-flex items-center gap-[14px] mt-[22px]">
        <svg
          class="logo-svg h-14 w-16 overflow-visible"
          viewBox="0 0 34 28"
          aria-hidden="true"
        >
          <path
            d="M6 14 26 5M6 14l20 9"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            opacity=".72"
          />
          <circle class="logo-dot logo-dot-1" cx="6" cy="14" r="4" fill="#1d4ed8" />
          <circle class="logo-dot logo-dot-2" cx="26" cy="5" r="4" fill="#38bdf8" />
          <circle class="logo-dot logo-dot-3" cx="26" cy="23" r="4" fill="#06b6d4" />
        </svg>
        <div class="brand-text text-[34px] font-extrabold tracking-[-1px] font-mono">
          408 简纲
        </div>
      </div>

      <h1 class="mt-[42px] mb-[18px] text-[clamp(63px,7vw,102px)] leading-[1.05] tracking-[-0.045em] font-[850]">
        把<span class="text-[#1B3FA1] font-mono mx-6">408</span>学薄一点
      </h1>

      <!-- 打字机副标题：固定高度的容器避免抖动 -->
      <div class="typed-wrap">
        <p class="typed-line">
          <span>{{ typedText }}</span><span class="caret">|</span>
        </p>
      </div>

      <a
        :href="GITHUB_REPO_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="github-repo-link mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-[#4f6aa0] hover:text-[#1d4ed8] hover:border-[#b9cdf0] hover:bg-white transition-all duration-200 hover:-translate-y-px hover:shadow-md"
      >
        <span v-html="ICON_GITHUB" class="inline-flex items-center justify-center" />
        <span>Github 开源仓库</span>
        <span v-html="ICON_EXTERNAL_LINK" class="inline-flex items-center justify-center opacity-80" />
      </a>

      <form
        class="h-[78px] mt-[38px] mx-auto w-full max-w-[920px] border border-[#dbe4ef] rounded-[28px] flex items-center px-[14px] pl-7 bg-white/94 shadow-[0_18px_45px_rgba(52,87,150,0.1)]"
        @submit.prevent="submit"
      >
        <input
          v-model="query"
          :maxlength="MAX_QUERY_LEN"
          name="q"
          placeholder="搜索知识点或章节（如 CPU 流水线 / GBN / 中断隐指令）"
          autocomplete="off"
          class="flex-1 border-0 outline-0 bg-transparent text-xl text-[#0b1f45] placeholder:text-[#9aa9c3]"
          @keydown="onSearchKeydown"
        />
        <button
          type="submit"
          class="search-btn w-[52px] h-[52px] border-0 rounded-full bg-gradient-to-b from-[#2d68ef] to-[#2455da] text-white text-2xl cursor-pointer"
        >
          →
        </button>
      </form>

      <div class="flex justify-center gap-[18px] mt-[34px] max-md:flex-col max-md:items-center">
        <a
          class="cta-btn cta-btn-primary h-[62px] min-w-[235px] px-[34px] rounded-[999px] border border-[#3260df] inline-flex items-center justify-center gap-7 no-underline text-lg font-bold cursor-pointer bg-[#1f49ba] text-white shadow-[0_14px_28px_rgba(31,73,186,0.18)] max-md:w-full max-md:max-w-[420px]"
          href="javascript:void(0)"
          @click="gotoKnowledge"
        >
          <span>浏览知识简纲</span>
          <span class="cta-arrow">→</span>
        </a>
        <a
          class="cta-btn cta-btn-ghost h-[62px] min-w-[235px] px-[34px] rounded-[999px] border border-[#3260df] inline-flex items-center justify-center gap-7 no-underline text-lg font-bold cursor-pointer bg-white text-[#1845ad] max-md:w-full max-md:max-w-[420px]"
          href="javascript:void(0)"
          @click="gotoExams"
        >
          <span>查看历年真题</span>
          <span class="cta-arrow">→</span>
        </a>
      </div>
    </section>

    <!-- 共建者区域：两行横向无限循环滚动 -->
    <section class="contributors-section">
      <h2 class="contributors-title">一起把 408 学薄一点</h2>
      <p class="contributors-subtitle">感谢每一位参与共建、纠错与分享的朋友</p>

      <div class="contributors-viewport">
        <div class="contributors-row contributors-row-left">
          <a
            v-for="(c, i) in [...contributorsRow1, ...contributorsRow1]"
            :key="'r1-' + i"
            :href="c.url"
            target="_blank"
            rel="noopener noreferrer"
            class="contributor-pill"
            :class="'platform-' + c.platform"
          >
            <span class="contributor-icon" v-html="PLATFORM_ICON[c.platform]"></span>
            <span class="contributor-name">{{ c.name }}</span>
          </a>
        </div>
        <div class="contributors-row contributors-row-right">
          <a
            v-for="(c, i) in [...contributorsRow2, ...contributorsRow2]"
            :key="'r2-' + i"
            :href="c.url"
            target="_blank"
            rel="noopener noreferrer"
            class="contributor-pill"
            :class="'platform-' + c.platform"
          >
            <span class="contributor-icon" v-html="PLATFORM_ICON[c.platform]"></span>
            <span class="contributor-name">{{ c.name }}</span>
          </a>
        </div>
      </div>

      <a href="https://github.com/" target="_blank" rel="noopener noreferrer" class="contributors-more">
        查看全部贡献者 →
      </a>
    </section>
  </main>
</template>

<style scoped>
/* ============================================================
 * 背景：底层 radial-gradient 鼠标跟随
 * ============================================================ */
.home-page {
  background:
    radial-gradient(
      circle at var(--mx, 50%) var(--my, 33%),
      rgba(94, 179, 178, 0.12),
      transparent 28%
    ),
    linear-gradient(180deg, #fbfdff, #f6faff);
  transition: background 0.4s ease-out;
}

/* 鼠标附近的光斑（更聚焦的小圆）—— 改用柔和的雾青色，护眼 */
.bg-spot {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    420px circle at var(--mx, 50%) var(--my, 33%),
    rgba(122, 184, 196, 0.12),
    transparent 60%
  );
  transition: background 0.2s ease-out;
  z-index: 0;
}

/* 鼠标附近的网格（径向 mask 只在鼠标周围显示）—— 线条也用柔和雾青 */
.bg-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(122, 184, 196, 0.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(122, 184, 196, 0.10) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(
    circle at var(--mx, 50%) var(--my, 33%),
    black 0%,
    transparent 35%
  );
  mask-image: radial-gradient(
    circle at var(--mx, 50%) var(--my, 33%),
    black 0%,
    transparent 35%
  );
  z-index: 0;
}

/* ============================================================
 * Logo：三个圆点呼吸 + 颜色循环
 * ============================================================ */
.logo-svg {
  color: #2c5de0;
}
.logo-dot {
  transform-origin: center;
  animation: logo-pulse 2.4s ease-in-out infinite;
}
.logo-dot-1 {
  animation-delay: 0s;
}
.logo-dot-2 {
  animation-delay: 0.3s;
}
.logo-dot-3 {
  animation-delay: 0.6s;
}
@keyframes logo-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(0.85);
  }
}

/* ============================================================
 * "408 简纲" 渐变流动
 * ============================================================ */
.brand-text {
  background: linear-gradient(
    90deg,
    #16a7d2 0%,
    #1557b8 25%,
    #2c5de0 50%,
    #16a7d2 75%,
    #1557b8 100%
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradient-flow 5s linear infinite;
}
@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 300% 50%;
  }
}

/* ============================================================
 * 打字机副标题
 * ============================================================ */
.typed-wrap {
  min-height: calc(25px * 1.7 + 4px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.typed-line {
  margin: 0;
  font-size: clamp(18px, 1.8vw, 25px);
  line-height: 1.7;
  color: #465979;
  white-space: nowrap;
  overflow: visible;
}
.typed-line .caret {
  display: inline-block;
  margin-left: 2px;
  color: #2c5de0;
  font-weight: 400;
  animation: caret-blink 1s steps(1, end) infinite;
}
@keyframes caret-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* ============================================================
 * CTA 按钮：上浮 + 箭头位移 + 流光扫过
 * ============================================================ */
.cta-btn {
  position: relative;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    background-color 0.18s ease;
}
.cta-btn .cta-arrow {
  display: inline-block;
  transition: transform 0.2s ease;
}
.cta-btn:hover {
  transform: translateY(-2px);
}
.cta-btn:hover .cta-arrow {
  transform: translateX(6px);
}
.cta-btn-primary:hover {
  background-color: #1a3fa0;
  box-shadow: 0 18px 36px rgba(31, 73, 186, 0.28);
}
.cta-btn-ghost:hover {
  background-color: #f0f4ff;
  box-shadow: 0 14px 28px rgba(45, 104, 239, 0.14);
}
/* 鼠标移上去时一道流光从左到右扫过 */
.cta-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  pointer-events: none;
}
.cta-btn:hover::before {
  transform: translateX(100%);
}

/* ============================================================
 * 搜索按钮：放大 + 阴影
 * ============================================================ */
.search-btn {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.search-btn:hover {
  transform: scale(1.06);
  box-shadow: 0 8px 18px rgba(45, 104, 239, 0.32);
}
.search-btn:active {
  transform: scale(0.96);
}

/* ============================================================
 * 共建者区域：两行横向无限循环滚动
 *  - 极简、克制，蓝白配色
 *  - 第一行向左，第二行向右，错位
 *  - hover 区域暂停滚动
 *  - 左右渐隐 mask
 * ============================================================ */
.contributors-section {
  position: relative;
  z-index: 1;
  max-width: 980px;
  margin: 110px auto 0;
  padding: 36px 0 28px;
  text-align: center;
}
.contributors-title {
  margin: 0 0 10px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #0b1f45;
}
.contributors-subtitle {
  margin: 0 0 24px;
  font-size: 14px;
  color: #74809a;
}

/* 滚动视口：左右渐隐 mask */
.contributors-viewport {
  position: relative;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    #000 10%,
    #000 90%,
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    #000 10%,
    #000 90%,
    transparent
  );
}

/* 两行各自横向滚动，hover 时暂停 */
.contributors-row {
  display: flex;
  gap: 14px;
  width: max-content;
  padding: 6px 0;
}
.contributors-row-left {
  animation: scroll-left 48s linear infinite;
}
.contributors-row-right {
  animation: scroll-right 56s linear infinite;
  /* 第二行错位：往右偏移半个 pill 宽度 */
  transform: translateX(40px);
}
.contributors-section:hover .contributors-row {
  animation-play-state: paused;
}
@keyframes scroll-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes scroll-right {
  from { transform: translateX(40px); }
  to { transform: translateX(calc(-50% + 40px)); }
}

/* 单个 pill */
.contributor-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(219, 228, 239, 0.7);
  text-decoration: none;
  color: #536987;
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
  transition: all 0.2s ease;
  cursor: pointer;
}
.contributor-pill:hover {
  background: #fff;
  border-color: #2d68ef;
  transform: translateY(-1px);
  color: #2259d6;
}
.contributor-icon {
  display: inline-flex;
  color: #9aa9c3;
  transition: color 0.2s ease;
}
/* hover 时恢复品牌色 */
.contributor-pill:hover .contributor-icon { color: #9aa9c3; }
.contributor-pill.platform-bilibili:hover .contributor-icon { color: #fb7299; }
.contributor-pill.platform-douyin:hover .contributor-icon { color: #000; }
.contributor-pill.platform-xhs:hover .contributor-icon { color: #ff2741; }
.contributor-pill.platform-github:hover .contributor-icon { color: #0b1f45; }

/* 底部"查看全部"链接 */
.contributors-more {
  display: inline-block;
  margin-top: 24px;
  font-size: 13px;
  color: #2259d6;
  text-decoration: none;
  opacity: 0.85;
  transition: opacity 0.2s ease;
}
.contributors-more:hover {
  opacity: 1;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .contributors-title { font-size: 22px; }
  .contributors-row { gap: 10px; }
  .contributor-pill { height: 32px; padding: 0 12px; font-size: 12px; }
}
</style>
