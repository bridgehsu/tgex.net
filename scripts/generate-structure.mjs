/**
 * Rebuild sidebar + rewrites from docs/NN.标题 trees only.
 * Sidebar is section → page only; in-page ## headings use the outline ("本页内容").
 * Public URL: /pages/{sectionNo}{pageNo}  e.g. 01.项目介绍/01.项目概述 → /pages/0101
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
  // Drop frontmatter so --- blocks don't confuse matching
  const body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
  const items = []
  for (const match of body.matchAll(H2)) {
    const { text, id } = parseHeading(match[1])
    if (!text || !id) continue
    items.push({ text, id })
  }
  return items
}

async function main() {
  const sectionDirs = (await readdir(docs, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && NUMBERED.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => Number(a.match(NUMBERED)[1]) - Number(b.match(NUMBERED)[1]))

  const rewrites = {}
  const sidebar = []
  const pages = []

  for (const sectionDir of sectionDirs) {
    const sectionNo = sectionDir.match(NUMBERED)[1]
    const sectionTitle = stripNumber(sectionDir)
    const files = (await readdir(join(docs, sectionDir)))
      .filter((name) => name.endsWith('.md') && NUMBERED.test(name.slice(0, -3)))
      .sort((a, b) => Number(a.match(NUMBERED)[1]) - Number(b.match(NUMBERED)[1]))

    const items = []
    for (const file of files) {
      const pageNo = file.match(NUMBERED)[1]
      const sourceRel = `${sectionDir}/${file}`
      const title = stripNumber(file.slice(0, -3))
      const code = `${sectionNo}${pageNo}`
      const publicMd = `pages/${code}.md`
      const publicPath = `/pages/${code}`
      rewrites[sourceRel] = publicMd

      // H2 headings stay in page outline ("本页内容") only — not as sidebar level-3.
      const headings = await extractH2(join(docs, sectionDir, file))
      items.push({ text: title, link: publicPath })
      pages.push({
        path: publicPath,
        title,
        group: sectionTitle,
        source: sourceRel,
        code,
        headings: headings.map((h) => h.id)
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
    items: section.items.map((item) => ({ text: item.text, link: item.link }))
  }))

  await writeFile(structurePath, JSON.stringify({ rewrites, pages }, null, 2) + '\n')
  await writeFile(navPath, JSON.stringify(sidebar, null, 2) + '\n')
  await writeFile(mapPath, JSON.stringify({ sections, pages }, null, 2) + '\n')
  console.log(`Generated structure for ${pages.length} pages / ${sidebar.length} sections (sidebar: section → page)`)
  console.log(`Example: ${pages[0]?.source} -> ${pages[0]?.path}`)
}

await main()
