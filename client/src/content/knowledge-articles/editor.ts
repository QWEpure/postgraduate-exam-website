import type { KnowledgeArticleRegistration } from './registry'
import type { KnowledgeArticleBlock, KnowledgeSourceImport } from './types'

type EditableBlockBase = {
  key: string
  id: string
}

export type EditableKnowledgeBlock =
  | (EditableBlockBase & { type: 'paragraph'; text: string })
  | (EditableBlockBase & { type: 'html'; html: string })
  | (EditableBlockBase & { type: 'formula'; formula: string; caption: string })
  | (EditableBlockBase & { type: 'callout'; title: string; text: string; tone: 'blue' | 'orange' })
  | (EditableBlockBase & { type: 'image'; alt: string; caption: string; sourceImport: KnowledgeSourceImport })
  | (EditableBlockBase & { type: 'animation'; sourceImport: KnowledgeSourceImport })

export type EditableKnowledgeSubpoint = {
  key: string
  id: string
  title: string
  blocks: EditableKnowledgeBlock[]
}

export type EditableKnowledgeArticle = {
  pointId: string
  directory: string
  fileName: string
  exportName: string
  subpoints: EditableKnowledgeSubpoint[]
}

export type EditableBlockType = EditableKnowledgeBlock['type']

let editorKey = 0

function nextKey(prefix: string) {
  editorKey += 1
  return `${prefix}-${editorKey}`
}

function cloneSourceImport(sourceImport: KnowledgeSourceImport | undefined, fallback: KnowledgeSourceImport) {
  return sourceImport ? { ...sourceImport } : fallback
}

export function createEditableBlock(type: EditableBlockType): EditableKnowledgeBlock {
  const key = nextKey('block')
  const id = `kb-new-block-${editorKey}`

  switch (type) {
    case 'paragraph':
      return { key, id, type, text: '' }
    case 'html':
      return { key, id, type, html: '<p>在这里填写 HTML 内容。</p>' }
    case 'formula':
      return { key, id, type, formula: '', caption: '' }
    case 'callout':
      return { key, id, type, title: '', text: '', tone: 'blue' }
    case 'image':
      return {
        key,
        id,
        type,
        alt: '',
        caption: '',
        sourceImport: {
          path: '@/assets/example.svg',
          localName: 'exampleDiagram',
          kind: 'default',
        },
      }
    case 'animation':
      return {
        key,
        id,
        type,
        sourceImport: {
          path: '@/animations/computer-networks/example',
          localName: 'exampleAnimation',
          kind: 'named',
        },
      }
  }
}

function toEditableBlock(block: KnowledgeArticleBlock): EditableKnowledgeBlock {
  const key = nextKey('block')

  switch (block.type) {
    case 'paragraph':
      return { key, id: block.id, type: block.type, text: block.text }
    case 'html':
      return { key, id: block.id, type: block.type, html: block.html }
    case 'formula':
      return { key, id: block.id, type: block.type, formula: block.formula, caption: block.caption ?? '' }
    case 'callout':
      return { key, id: block.id, type: block.type, title: block.title, text: block.text, tone: block.tone ?? 'blue' }
    case 'image':
      return {
        key,
        id: block.id,
        type: block.type,
        alt: block.alt,
        caption: block.caption ?? '',
        sourceImport: cloneSourceImport(block.sourceImport, {
          path: '',
          localName: 'imageAsset',
          kind: 'default',
        }),
      }
    case 'animation':
      return {
        key,
        id: block.id,
        type: block.type,
        sourceImport: cloneSourceImport(block.sourceImport, {
          path: '',
          localName: 'animation',
          kind: 'named',
        }),
      }
  }
}

export function createEditableArticle(registration?: KnowledgeArticleRegistration): EditableKnowledgeArticle {
  if (registration) {
    return {
      pointId: registration.article.pointId,
      directory: registration.directory,
      fileName: registration.fileName,
      exportName: registration.exportName,
      subpoints: registration.article.subpoints.map((subpoint) => ({
        key: nextKey('subpoint'),
        id: subpoint.id,
        title: subpoint.title,
        blocks: subpoint.blocks.map(toEditableBlock),
      })),
    }
  }

  return {
    pointId: 'kp-new-point',
    directory: 'computer-networks/application-layer',
    fileName: 'new-point.ts',
    exportName: 'newPointArticle',
    subpoints: [
      {
        key: nextKey('subpoint'),
        id: 'new-point-overview',
        title: '第一个小知识点',
        blocks: [{ key: nextKey('block'), id: 'kb-new-point-overview-1', type: 'paragraph', text: '在这里填写知识点正文。' }],
      },
    ],
  }
}

export function createEditableSubpoint(article: EditableKnowledgeArticle): EditableKnowledgeSubpoint {
  const sequence = article.subpoints.length + 1
  const baseId = article.pointId.replace(/^kp-/, '') || 'knowledge-point'
  return {
    key: nextKey('subpoint'),
    id: `${baseId}-part-${sequence}`,
    title: `第 ${sequence} 个小知识点`,
    blocks: [{ ...createEditableBlock('paragraph'), id: `kb-${baseId}-part-${sequence}-1` }],
  }
}

function quote(value: string) {
  return `'${value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')}'`
}

function serializeBlock(block: EditableKnowledgeBlock, depth: number) {
  const indent = '  '.repeat(depth)
  const propertyIndent = '  '.repeat(depth + 1)
  const lines = [`${indent}{`, `${propertyIndent}id: ${quote(block.id)},`, `${propertyIndent}type: ${quote(block.type)},`]

  switch (block.type) {
    case 'paragraph':
      lines.push(`${propertyIndent}text: ${quote(block.text)},`)
      break
    case 'html':
      lines.push(`${propertyIndent}html: ${quote(block.html)},`)
      break
    case 'formula':
      lines.push(`${propertyIndent}formula: ${quote(block.formula)},`)
      if (block.caption) lines.push(`${propertyIndent}caption: ${quote(block.caption)},`)
      break
    case 'callout':
      lines.push(
        `${propertyIndent}title: ${quote(block.title)},`,
        `${propertyIndent}text: ${quote(block.text)},`,
        `${propertyIndent}tone: ${quote(block.tone)},`,
      )
      break
    case 'image':
      lines.push(`${propertyIndent}src: ${block.sourceImport.localName},`, `${propertyIndent}alt: ${quote(block.alt)},`)
      if (block.caption) lines.push(`${propertyIndent}caption: ${quote(block.caption)},`)
      break
    case 'animation':
      lines.push(`${propertyIndent}animation: ${block.sourceImport.localName},`)
      break
  }

  lines.push(`${indent}},`)
  return lines
}

function collectSourceImports(article: EditableKnowledgeArticle) {
  const imports: KnowledgeSourceImport[] = []
  const seen = new Set<string>()

  for (const subpoint of article.subpoints) {
    for (const block of subpoint.blocks) {
      if (block.type !== 'image' && block.type !== 'animation') continue
      const sourceImport = block.sourceImport
      const key = [sourceImport.kind, sourceImport.path, sourceImport.importedName, sourceImport.localName].join('|')
      if (!seen.has(key)) {
        seen.add(key)
        imports.push(sourceImport)
      }
    }
  }

  return imports
}

function serializeImport(sourceImport: KnowledgeSourceImport) {
  if (sourceImport.kind === 'default') {
    return `import ${sourceImport.localName} from ${quote(sourceImport.path)}`
  }

  const importedName = sourceImport.importedName || sourceImport.localName
  const binding = importedName === sourceImport.localName
    ? importedName
    : `${importedName} as ${sourceImport.localName}`
  return `import { ${binding} } from ${quote(sourceImport.path)}`
}

export function generateKnowledgeArticleTs(article: EditableKnowledgeArticle) {
  const lines = collectSourceImports(article).map(serializeImport)
  if (lines.length) lines.push('')
  lines.push(`import type { KnowledgeArticleData } from '@/content/knowledge-articles/types'`, '')
  lines.push(`export const ${article.exportName}: KnowledgeArticleData = {`, `  pointId: ${quote(article.pointId)},`, '  subpoints: [')

  for (const subpoint of article.subpoints) {
    lines.push('    {', `      id: ${quote(subpoint.id)},`, `      title: ${quote(subpoint.title)},`, '      blocks: [')
    for (const block of subpoint.blocks) lines.push(...serializeBlock(block, 4))
    lines.push('      ],', '    },')
  }

  lines.push('  ],', '}', '')
  return lines.filter((line): line is string => line !== undefined).join('\n')
}

const identifierPattern = /^[A-Za-z_$][\w$]*$/
const kebabFilePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/
const pointIdPattern = /^kp-[a-z0-9]+(?:-[a-z0-9]+)*$/
const blockIdPattern = /^kb-[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateEditableArticle(article: EditableKnowledgeArticle) {
  const errors: string[] = []
  if (!pointIdPattern.test(article.pointId)) errors.push('Point ID 需要使用 kp- 开头的短横线命名。')
  if (!kebabFilePattern.test(article.fileName)) errors.push('文件名需要使用 kebab-case，并以 .ts 结尾。')
  if (!identifierPattern.test(article.exportName)) errors.push('导出变量名必须是合法的 TypeScript 标识符。')
  if (!article.directory || article.directory.startsWith('/') || article.directory.includes('..')) errors.push('目录需要填写 knowledge-articles 下的相对路径。')
  if (!article.subpoints.length) errors.push('一页知识点至少需要一个小知识点。')

  const subpointIds = new Set<string>()
  const blockIds = new Set<string>()
  for (const subpoint of article.subpoints) {
    if (!subpoint.id.trim()) errors.push('小知识点 ID 不能为空。')
    if (subpointIds.has(subpoint.id)) errors.push(`小知识点 ID 重复：${subpoint.id}`)
    subpointIds.add(subpoint.id)
    if (!subpoint.title.trim()) errors.push(`小知识点 ${subpoint.id || '未命名'} 缺少标题。`)
    if (!subpoint.blocks.length) errors.push(`小知识点 ${subpoint.id || '未命名'} 至少需要一个内容块。`)

    for (const block of subpoint.blocks) {
      if (!blockIdPattern.test(block.id)) errors.push(`${subpoint.title} 中的 Block ID 格式错误：${block.id || '空'}`)
      if (blockIds.has(block.id)) errors.push(`Block ID 重复：${block.id}`)
      blockIds.add(block.id)
      if (block.type !== 'image' && block.type !== 'animation') continue
      if (!block.sourceImport.path.trim()) errors.push(`${subpoint.title} 中的 ${block.type} 缺少 import 路径。`)
      if (!identifierPattern.test(block.sourceImport.localName)) errors.push(`${subpoint.title} 中的引用变量名不合法。`)
      if (block.sourceImport.importedName && !identifierPattern.test(block.sourceImport.importedName)) errors.push(`${subpoint.title} 中的导入成员名不合法。`)
    }
  }

  return [...new Set(errors)]
}

export function getKnowledgeArticleOutputPath(article: EditableKnowledgeArticle) {
  return `client/src/content/knowledge-articles/${article.directory.replace(/^\/+|\/+$/g, '')}/${article.fileName}`
}
