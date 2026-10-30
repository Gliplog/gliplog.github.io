// The site's gate. It shares an origin with the app at /app/, so it must stay script-free:
// any script here could read the app's IndexedDB, and a service worker here would control /app/.
// Also checks links, anchors, image alt text and the markdown em-dash rule.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const site = join(root, 'site')
const EM = '—'
/** External hosts the site may link to; it never loads anything from them. */
const ALLOWED_HOSTS = new Set([
  'github.com',
  'docs.github.com',
  'dailymed.nlm.nih.gov',
  'pepcalc.github.io',
])
/** Paths served by the app repository, not this one. */
const APP_PATHS = /^(\/app\/|app\/)/

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) yield* walk(full)
    else yield full
  }
}

const failures = []
const fail = (file, message) => failures.push(`${relative(root, file)}: ${message}`)

for (const file of walk(root)) {
  if (!/\.(md|html|css|txt)$/.test(file)) continue
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (line.includes(EM) && !line.includes('em-dash-ok')) fail(file, `em-dash on line ${i + 1}`)
    })
}

const pages = [...walk(site)].filter((f) => f.endsWith('.html'))
for (const page of pages) {
  const html = readFileSync(page, 'utf8')
  const csp = /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/.exec(html)?.[1] ?? ''
  if (!csp.includes("script-src 'none'")) fail(page, "missing a CSP with script-src 'none'")
  if (/<script\b/i.test(html)) fail(page, 'contains a <script>')
  if (/\son[a-z]+=/i.test(html)) fail(page, 'contains an inline event handler')
  if (/\sstyle="/i.test(html)) fail(page, 'contains a style attribute (blocked by the CSP)')
  if (/serviceWorker/.test(html)) fail(page, 'mentions serviceWorker')
  if (!/<html lang="/.test(html)) fail(page, 'html has no lang')
  if (!/<title>[^<]+<\/title>/.test(html)) fail(page, 'has no title')

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) fail(page, `image without alt: ${m[0].slice(0, 60)}`)
  }

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
  for (const m of html.matchAll(/\s(?:href|src|srcset)="([^"]+)"/g)) {
    const url = m[1]
    if (url.startsWith('#')) {
      if (!ids.has(url.slice(1))) fail(page, `anchor ${url} has no target`)
      continue
    }
    if (/^https?:/.test(url)) {
      const host = new URL(url).hostname
      if (url.startsWith('http:')) fail(page, `insecure link ${url}`)
      else if (!ALLOWED_HOSTS.has(host)) fail(page, `link to unlisted host ${host}`)
      continue
    }
    if (APP_PATHS.test(url)) continue
    if (/^(mailto|data|javascript):/.test(url)) {
      fail(page, `disallowed URL scheme in ${url}`)
      continue
    }
    const path = url.split('#')[0].split('?')[0]
    const target = path.startsWith('/') ? join(site, path) : join(dirname(page), path)
    const resolved = path === '' || path.endsWith('/') ? join(target, 'index.html') : target
    if (!existsSync(resolved)) fail(page, `broken link ${url}`)
  }
}

if (failures.length) {
  for (const f of failures) console.error(f)
  process.exit(1)
}
console.log(`site: ${pages.length} pages script-free, links and anchors resolve, no em-dashes`)
