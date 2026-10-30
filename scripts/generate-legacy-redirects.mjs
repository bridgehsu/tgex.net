/**
 * Static redirects for previous /SS/SSPP/SSPPPP URLs (00-based)
 * → current /pages/{(SS+1)PP}.
 *
 * Example: /06/0601/060001 (旧·现货) → /pages/0701
 *          /05/0501/050001 (旧·资产) → /pages/0601
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import structure from '../docs/.vitepress/structure.json' with { type: 'json' }

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const dist = join(root, 'dist')

function pad(n, w = 2) {
  return String(n).padStart(w, '0')
}

function html(to) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${to}">
  <link rel="canonical" href="https://tgex.net${to}">
  <title>Redirecting…</title>
  <script>location.replace(${JSON.stringify(to)})</script>
</head>
<body>
  <p>文档地址已更新，正在跳转到 <a href="${to}">${to}</a>。</p>
</body>
</html>
`
}

async function main() {
  const valid = new Set((structure.pages || []).map((p) => p.path))
  let count = 0

  for (let oldSection = 0; oldSection <= 17; oldSection++) {
    for (let page = 1; page <= 20; page++) {
      const ss = pad(oldSection)
      const pp = pad(page)
      const l2 = `${ss}${pp}`
      const l3 = `${ss}${pad(page, 4)}`
      const to = `/pages/${pad(oldSection + 1)}${pp}`
      if (!valid.has(to)) continue

      for (const rel of [
        `${ss}/${l2}/${l3}.html`,
        `${ss}/${l2}/${l3}/index.html`,
        `${ss}/${l2}.html`,
        `${ss}/${l2}/index.html`
      ]) {
        const file = join(dist, rel)
        await mkdir(dirname(file), { recursive: true })
        await writeFile(file, html(to))
        count++
      }
    }
  }

  // Aliases after nesting 现货「核心交易流程」under /pages/0705xx
  const aliases = {
    '/pages/0705': '/pages/070501',
    '/pages/0708': '/pages/070502',
    '/pages/0709': '/pages/070503',
    '/pages/0710': '/pages/070504',
    '/pages/0711': '/pages/070505'
  }
  for (const [from, to] of Object.entries(aliases)) {
    if (!valid.has(to)) continue
    const rel = `${from.replace(/^\//, '')}.html`
    const file = join(dist, rel)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, html(to))
    count++
  }

  console.log(`Wrote ${count} legacy redirect files under dist/`)
}

await main()
