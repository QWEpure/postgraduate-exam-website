import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * GitHub Pages 部署约束（项目仓库二级目录）：
 *   - base: '/postgraduate-exam-website/' — 让产物里所有静态资源引用带上二级路径前缀
 *   - sourcemap: true — AGENTS.md 硬约束（且 vueDevTools 已移除，防止 sourcemap 重复）
 *   - build 后自动写入 .nojekyll / 404.html 以及 Pages 合规的 SPA 404 重定向文件
 *   - 构建期同步 src/search/408-terms.txt → dist/search/408-terms.txt（保证唯一数据源）
 */
export default defineConfig({
  // 约定：
  //   - 本地 `npm run dev`：未传 VITE_BASE_PATH → base=/，直接打开 http://localhost:5173/ 即可
  //   - GitHub Pages 部署：deploy.yml 显式传 VITE_BASE_PATH=/postgraduate-exam-website/
  //   - 自定义域名部署：可自行传 VITE_BASE_PATH=/
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'github-pages-deploy-files',
      apply: 'build',
      closeBundle() {
        const outDir = resolve(__dirname, 'dist')
        mkdirSync(join(outDir, 'search'), { recursive: true })

        // ① GitHub Pages 默认走 Jekyll，会忽略以下划线开头的文件/目录
        writeFileSync(join(outDir, '.nojekyll'), '')
        // ② SPA fallback：404 页直接复用 index.html（hash 路由兜底用）
        copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'))
        console.log('[github-pages] ✓ 写入 .nojekyll 和 404.html（SPA fallback）')

        // ③ 408-terms.txt 唯一数据源在 src/search/，保证搜索词典只改一处
        //    同时复制到 dist/search/（build 产物） 和 public/search/（dev server 与 fetch('public/xxx') 用）
        const srcTerms = resolve(__dirname, 'src/search/408-terms.txt')
        const publicTermsDir = resolve(__dirname, 'public/search')
        const distTermsDir = join(outDir, 'search')
        if (existsSync(srcTerms)) {
          mkdirSync(publicTermsDir, { recursive: true })
          copyFileSync(srcTerms, join(publicTermsDir, '408-terms.txt'))
          copyFileSync(srcTerms, join(distTermsDir, '408-terms.txt'))
          console.log('[terms] ✓ 408-terms.txt 已同步到 public/search/ 和 dist/search/')
        } else {
          console.warn('[terms] ⚠ 找不到 src/search/408-terms.txt，跳过同步')
        }
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
