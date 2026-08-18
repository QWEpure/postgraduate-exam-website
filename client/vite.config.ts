import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

/**
 * GitHub Pages 部署约束（项目仓库二级目录）：
 *   - base: '/postgraduate-exam-website/' — 让产物里所有静态资源引用带上二级路径前缀
 *   - sourcemap: true — AGENTS.md 硬约束（且 vueDevTools 已移除，防止 sourcemap 重复）
 *   - build 后自动写入 .nojekyll / 404.html 以及 Pages 合规的 SPA 404 重定向文件
 */
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/postgraduate-exam-website/',
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'github-pages-deploy-files',
      apply: 'build',
      closeBundle() {
        const outDir = resolve(__dirname, 'dist')
        mkdirSync(outDir, { recursive: true })
        // GitHub Pages 默认走 Jekyll，会忽略以下划线开头的文件/目录（如 _nuxt / Vite 偶尔生成的 _plugin-vue_export-helper）。
        // 加 .nojekyll 彻底禁用 Jekyll 处理，保证 Vite 产物 100% 按原样上传。
        writeFileSync(join(outDir, '.nojekyll'), '')
        // GitHub Pages SPA fallback：所有 404 落到 404.html，内容同 index.html。
        // 已用 hash 路由，正常情况下不会触发；此文件为兜底（用户手动粘贴 history 风格链接仍能进入入口）。
        copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'))
        console.log('[github-pages] ✓ 写入 .nojekyll 和 404.html（SPA fallback）')
      },
    },
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  build: {
    sourcemap: true,
  },
})
