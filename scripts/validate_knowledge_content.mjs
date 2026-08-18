import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const treePath = path.join(projectRoot, 'client/src/content/knowledge-tree.ts')
const registryPath = path.join(projectRoot, 'client/src/content/knowledge-articles/registry.ts')
const articlesRoot = path.join(projectRoot, 'client/src/content/knowledge-articles')

function collectArticleFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectArticleFiles(target)
    return entry.isFile() && entry.name.endsWith('.ts') ? [target] : []
  })
}

function collectMatches(source, pattern) {
  return [...source.matchAll(pattern)].map((match) => match[1])
}

function assertUnique(values, label) {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${label} 重复：${value}`)
    seen.add(value)
  }
  return seen
}

const treeSource = fs.readFileSync(treePath, 'utf8')

/**
 * 从知识树源码中提取所有 pointId。
 * 同一 point 允许在多个 book 中重复出现（"共用点"，如 OS 与计组共用的
 * co-vm-impl / co-io-method / co-external-*）；也允许在同一 book 的多个
 * section 中重复出现（"复用点"，如查找章节复用树章节的 BST/AVL）。
 * 唯一性约束收紧到同一 section 内必须唯一。
 * 实现：按 "id: '<bookId>'" 的 export 边界切分各 book，再按 "points: [" 切分各 section。
 */
const bookBlocks = treeSource.split(/export const \w+Book: Book = \{/)
  .filter((block) => block.includes("id: '"))
const treePointIds = new Set()
for (const block of bookBlocks) {
  const sectionParts = block.split(/\bpoints: \[/)
  // sectionParts[0] 是 book 头部（chapters/sections 定义），不含 point id
  for (let i = 1; i < sectionParts.length; i++) {
    const ids = collectMatches(sectionParts[i], /\bid:\s*['"]((?:kp|ds|co|os)-(?!chapter|section)[a-z0-9]+(?:-[a-z0-9]+)*)['"]/g)
    assertUnique(ids, '同一 section 内 KnowledgePoint ID')
    for (const id of ids) treePointIds.add(id)
  }
}

const articleRecords = collectArticleFiles(articlesRoot)
  .filter((filePath) => path.relative(articlesRoot, filePath).includes(path.sep))
  .map((filePath) => {
  const source = fs.readFileSync(filePath, 'utf8')
  const pointIds = collectMatches(source, /\bpointId:\s*['"]((?:kp|ds|co|os)-(?!chapter|section)[a-z0-9]+(?:-[a-z0-9]+)*)['"]/g)
  const exportNames = collectMatches(source, /export\s+const\s+([A-Za-z_$][\w$]*)\s*:\s*KnowledgeArticleData/g)

  if (pointIds.length !== 1 || exportNames.length !== 1) {
    throw new Error(`${path.relative(projectRoot, filePath)} 必须且只能导出一个 KnowledgeArticleData`)
  }

    return { filePath, pointId: pointIds[0], exportName: exportNames[0] }
  })

assertUnique(articleRecords.map((record) => record.pointId), 'KnowledgeArticle pointId')

const articleBlockIds = collectArticleFiles(articlesRoot)
  .flatMap((filePath) => collectMatches(
    fs.readFileSync(filePath, 'utf8'),
    /\bid:\s*['"](kb-[a-z0-9]+(?:-[a-z0-9]+)*)['"]/g,
  ))

assertUnique(articleBlockIds, 'Knowledge Block ID')

const registrySource = fs.readFileSync(registryPath, 'utf8')
const registeredExports = new Set(
  collectMatches(registrySource, /\[([A-Za-z_$][\w$]*)\.pointId\]\s*:/g),
)
const importedExports = new Set(
  collectMatches(registrySource, /import\s*\{\s*([A-Za-z_$][\w$]*)\s*\}\s*from\s*['"]/g),
)

const articleByPointId = new Map(articleRecords.map((record) => [record.pointId, record]))

for (const pointId of treePointIds) {
  const article = articleByPointId.get(pointId)
  if (!article) throw new Error(`KnowledgePoint ${pointId} 缺少独立 KnowledgeArticleData 文件`)
  if (!importedExports.has(article.exportName)) throw new Error(`${article.exportName} 未被 registry.ts 导入`)
  if (!registeredExports.has(article.exportName)) throw new Error(`${article.exportName} 未在 registry.ts 注册`)
}

for (const article of articleRecords) {
  if (!treePointIds.has(article.pointId)) {
    throw new Error(`${path.relative(projectRoot, article.filePath)} 的 pointId ${article.pointId} 不存在于 knowledge-tree`)
  }
}

console.log(`知识内容校验通过：${treePointIds.size} 个 KnowledgePoint 均有独立文章并已注册。`)
