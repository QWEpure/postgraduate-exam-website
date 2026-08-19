<script setup lang="ts">
/* ============================================================
 * AppFooter —— 全站公共页脚
 *  - 备案信息：ICP 备案 + 公安备案（点击跳转工信部）
 *  - 联系方式：B站 / 抖音 / 小红书（点击跳转作者主页）
 * 挂载位置：App.vue，所有页面底部统一显示
 * ============================================================ */

type Social = { name: string; url: string; icon: string }

const BILIBILI_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.143.142.214.213h4.267l3.013-3.04c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.4.551.4.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.124-.933-.373c-.25-.25-.383-.57-.4-.96V12.44c0-.373.129-.689.387-.947.258-.257.574-.386.946-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.124-.933-.373c-.25-.25-.383-.57-.4-.96V12.44c0-.373.129-.689.387-.947.258-.257.574-.386.946-.386z"/></svg>`
const DOUYIN_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.589 9.186a8.122 8.122 0 0 1-4.876-1.614v7.294a6.068 6.068 0 1 1-6.068-6.068c.124 0 .246.012.368.024v3.058a3.012 3.012 0 1 0 2.13 2.887V2h2.965a4.528 4.528 0 0 0 4.527 4.527v2.659z"/></svg>`
const XHS_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3.6 7.2c0-.99.81-1.8 1.8-1.8h13.2c.99 0 1.8.81 1.8 1.8v9.6c0 .99-.81 1.8-1.8 1.8H5.4c-.99 0-1.8-.81-1.8-1.8V7.2zm2.4 1.2v7.2h12V8.4h-12zm2.4 2.4h7.2v2.4H8.4v-2.4zm0 3.6h4.8v.6H8.4v-.6zm0-4.8h7.2v.6H8.4v-.6z"/></svg>`

const socials: Social[] = [
  { name: 'bilibili', url: 'https://space.bilibili.com/385409016', icon: BILIBILI_ICON },
]
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <!-- 联系方式 -->
      <div class="footer-row social-row">
        <span class="row-label">联系作者</span>
        <a
          v-for="s in socials"
          :key="s.name"
          :href="s.url"
          target="_blank"
          rel="noopener noreferrer"
          class="social-item"
          :title="s.name"
        >
          <span class="social-icon" v-html="s.icon"></span>
          <span class="social-name">{{ s.name }}</span>
        </a>
      </div>

      <!-- 备案信息 -->
      <!-- <div class="footer-row filing-row">
        <span>© 2026 408 简纲</span>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="filing-link"
        >京ICP备2026000000号-1</a>
        <a
          href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11000000000000"
          target="_blank"
          rel="noopener noreferrer"
          class="filing-link"
        >
          <span class="ga-badge">京</span>
          京公网安备 11000002000000 号
        </a>
      </div> -->

      <div class="footer-row tagline-row">
        <span>极简 · 精炼 · 可视化</span>
        <span class="dot">·</span>
        <span>开源共享 · 持续更新 · 一起进步</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  width: 100%;
  background: linear-gradient(180deg, #fbfdff, #f4f8ff);
  border-top: 1px solid #edf1f5;
  padding: 24px 20px 28px;
  font-size: 12px;
  color: #8492a9;
  text-align: center;
}
.footer-inner {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.footer-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

/* 联系方式行 */
.social-row {
  gap: 12px;
}
.row-label {
  letter-spacing: 0.2em;
  color: #74809a;
  margin-right: 4px;
}
.social-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(219, 228, 239, 0.8);
  text-decoration: none;
  color: #445675;
  transition: all 0.2s ease;
}
.social-item:hover {
  transform: translateY(-1px);
  border-color: #2d68ef;
  box-shadow: 0 4px 10px rgba(45, 104, 239, 0.12);
}
.social-item:nth-child(2) .social-icon { color: #fb7299; }   /* B站 粉 */
.social-item:nth-child(3) .social-icon { color: #000; }       /* 抖音 黑 */
.social-item:nth-child(4) .social-icon { color: #ff2741; }   /* 小红书 红 */
.social-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
}

/* 备案信息行 */
.filing-row {
  gap: 16px;
  color: #9aa6bd;
}
.filing-link {
  color: #9aa6bd;
  text-decoration: none;
  transition: color 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.filing-link:hover {
  color: #2d68ef;
}
.ga-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: #2d68ef;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

/* 标语行 */
.tagline-row {
  color: #b4bdce;
  font-size: 11px;
}
.dot {
  color: #cfd6e4;
}
</style>
