/**
 * Rebuild sidebar + rewrites from docs/NN.标题 trees.
 * Supports section → page, and section → group-dir → page.
 * In-page ## headings use the outline ("本页内容"), not sidebar nesting.
 * Public URL:
 *   flat  01.项目介绍/01.项目概述.md → /pages/0101
 *   group 07.现货手册/05.核心交易流程/01.业务流程.md → /pages/070501
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const docs = join(root, 'docs')
const structurePath = join(docs, '.vitepress/structure.json')
const navPath = join(docs, '.vitepress/navigation.json')
const mapPath = join(root, 'content-map.json')
const NUMBERED = /^(\d+)\.(.+)$/
const H2 = /^##\s+(.+?)\s*$/gm

function stripNumber(name) {
  const m = name.match(NUMBERED)
  return m ? m[2] : name
}

function numberedSortKey(name) {
  const base = name.endsWith('.md') ? name.slice(0, -3) : name
  return Number(base.match(NUMBERED)?.[1] || 0)
}

/** Match VitePress: custom {#id}, else keep Chinese/ASCII heading text as id. */
function parseHeading(raw) {
  const custom = raw.match(/^(.*?)\s*\{#([a-zA-Z0-9_-]+)\}\s*$/)
  if (custom) {
    return { text: custom[1].trim(), id: custom[2] }
  }
  const text = raw.replace(/\s*\{#.*?\}\s*$/, '').trim()
  return { text, id: text }
}

async function extractH2(filePath) {
  const md = await readFile(filePath, 'utf8')
  const body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
  const items = []
  for (const match of body.matchAll(H2)) {
    const { text, id } = parseHeading(match[1])
    if (!text || !id) continue
    items.push({ text, id })
  }
  return items
}

async function registerPage({
  sourceRel,
  title,
  group,
  code,
  rewrites,
  pages
}) {
  const publicMd = `pages/${code}.md`
  const publicPath = `/pages/${code}`
  rewrites[sourceRel] = publicMd
  const headings = await extractH2(join(docs, sourceRel))
  pages.push({
    path: publicPath,
    title,
    group,
    source: sourceRel,
    code,
    headings: headings.map((h) => h.id)
  })
  return { text: title, link: publicPath }
}

async function main() {
  const sectionDirs = (await readdir(docs, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && NUMBERED.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => numberedSortKey(a) - numberedSortKey(b))

  const rewrites = {}
  const sidebar = []
  const pages = []
  let groupCount = 0

  for (const sectionDir of sectionDirs) {
    const sectionNo = sectionDir.match(NUMBERED)[1]
    const sectionTitle = stripNumber(sectionDir)
    const entries = await readdir(join(docs, sectionDir), { withFileTypes: true })
    const ordered = entries
      .filter((e) => {
        if (e.isDirectory()) return NUMBERED.test(e.name)
        return e.isFile() && e.name.endsWith('.md') && NUMBERED.test(e.name.slice(0, -3))
      })
      .sort((a, b) => numberedSortKey(a.name) - numberedSortKey(b.name))

    const items = []
    for (const entry of ordered) {
      if (entry.isFile()) {
        const pageNo = entry.name.match(NUMBERED)[1]
        const title = stripNumber(entry.name.slice(0, -3))
        const sourceRel = `${sectionDir}/${entry.name}`
        const code = `${sectionNo}${pageNo}`
        items.push(
          await registerPage({
            sourceRel,
            title,
            group: sectionTitle,
            code,
            rewrites,
            pages
          })
        )
        continue
      }

      // Numbered subdirectory → sidebar level-2 group
      groupCount++
      const groupNo = entry.name.match(NUMBERED)[1]
      const groupTitle = stripNumber(entry.name)
      const groupDir = join(docs, sectionDir, entry.name)
      const childFiles = (await readdir(groupDir))
        .filter((name) => name.endsWith('.md') && NUMBERED.test(name.slice(0, -3)))
        .sort((a, b) => numberedSortKey(a) - numberedSortKey(b))

      const childItems = []
      for (const file of childFiles) {
        const pageNo = file.match(NUMBERED)[1]
        const title = stripNumber(file.slice(0, -3))
        const sourceRel = `${sectionDir}/${entry.name}/${file}`
        const code = `${sectionNo}${groupNo}${pageNo}`
        childItems.push(
          await registerPage({
            sourceRel,
            title,
            group: `${sectionTitle} / ${groupTitle}`,
            code,
            rewrites,
            pages
          })
        )
      }

      items.push({
        text: groupTitle,
        collapsed: false,
        items: childItems
      })
    }

    sidebar.push({
      text: sectionTitle,
      collapsed: sectionTitle !== '现货手册',
      items
    })
  }

  const sections = sidebar.map((section, index) => ({
    key: `section-${String(index + 1).padStart(2, '0')}`,
    text: section.text,
    items: section.items.map((item) => {
      const node = { text: item.text }
      if (item.link) node.link = item.link
      if (item.items) {
        node.collapsed = item.collapsed ?? false
        node.items = item.items.map((child) => ({ text: child.text, link: child.link }))
      }
      return node
    })
  }))

  await writeFile(structurePath, JSON.stringify({ rewrites, pages }, null, 2) + '\n')
  await writeFile(navPath, JSON.stringify(sidebar, null, 2) + '\n')
  await writeFile(mapPath, JSON.stringify({ sections, pages }, null, 2) + '\n')
  console.log(
    `Generated structure for ${pages.length} pages / ${sidebar.length} sections (${groupCount} groups)`
  )
  console.log(`Example: ${pages[0]?.source} -> ${pages[0]?.path}`)
}

await main()
