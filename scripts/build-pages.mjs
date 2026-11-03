// Builds the dosing pages (site/dosing/) from scripts/dosing-data.mjs, and site/sitemap.xml
// from every page. The output is committed, because Pages publishes site/ as it is; with
// --check it builds in memory and fails if a committed file differs, so the pages can't drift
// from the data. Pages are formatted with the repository's prettier settings.
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import * as prettier from 'prettier'
import { CHECKED, GROUPS, MEDICINES } from './dosing-data.mjs'

const ORIGIN = 'https://gliplog.com'
const root = new URL('..', import.meta.url).pathname
const site = join(root, 'site')
const check = process.argv.includes('--check')

const bySlug = new Map(MEDICINES.map((m) => [m.slug, m]))

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
const mg = (n) => `${n} mg`

const CSP =
  "default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; script-src 'none'; base-uri 'none'; form-action 'none'"

const TRADEMARKS =
  'Ozempic, Wegovy, Rybelsus, and Saxenda are trademarks of Novo Nordisk A/S. Mounjaro, Zepbound, and Foundayo are trademarks of Eli Lilly and Company. Gliplog is not affiliated with Novo Nordisk or Eli Lilly.'

/** The shared head: CSP, description, canonical, and Open Graph and Twitter card tags. */
function head({ title, description, path, type = 'website' }) {
  const url = ORIGIN + path
  return `<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Content-Security-Policy" content="${CSP}" />
<meta name="referrer" content="no-referrer" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="${type}" />
<meta property="og:site_name" content="Gliplog" />
<meta property="og:locale" content="en_US" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${ORIGIN}/assets/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Gliplog: a private GLP-1 journal" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="color-scheme" content="light dark" />
<meta name="theme-color" content="#fbf8f3" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#15120e" media="(prefers-color-scheme: dark)" />
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
<link rel="stylesheet" href="/styles.css" />
</head>`
}

function header() {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
<div class="wrap">
<a class="brand" href="/" aria-label="Gliplog home">
<img src="/assets/favicon.svg" alt="" width="36" height="36" />
<span>Glip<span class="brand__accent">log</span></span>
</a>
<nav class="site-nav" aria-label="Site">
<a class="optional" href="/">Home</a>
<a href="/dosing/" aria-current="page">Dosing</a>
<a href="/app/">Open app</a>
</nav>
</div>
</header>`
}

function footer() {
  return `<footer class="site-footer">
<div class="wrap stack">
<nav aria-label="Footer">
<a href="/">Home</a>
<a href="/dosing/">Dosing schedules</a>
<a href="/app/">Open the app</a>
<a href="/privacy.html">Privacy policy</a>
<a href="https://github.com/Gliplog/app" rel="noopener noreferrer">Source code</a>
</nav>
<p>Gliplog is not medical advice and does not recommend doses. ${TRADEMARKS}</p>
</div>
</footer>`
}

function page({ title, description, path, type, body }) {
  return `<!doctype html>
<html lang="en">
${head({ title, description, path, type })}
<body>
${header()}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>`
}

/** Bar heights are classes in 5% steps, because the CSP blocks style attributes. */
function heightClass(dose, max) {
  return `h-${Math.max(5, Math.round((dose / max) * 20) * 5)}`
}

function ladder(m) {
  const rungs = m.rungs.filter((r) => r.chart !== false)
  const max = Math.max(...rungs.map((r) => r.dose))
  const items = rungs
    .map((r) => {
      const cls = ['rung', `rung--${r.kind}`, r.option ? 'rung--option' : '']
        .filter(Boolean)
        .join(' ')
      return `<li class="${cls}">
<span class="rung__top">
<span class="rung__dose">${mg(r.dose)}</span>
<span class="rung__bar ${heightClass(r.dose, max)}"></span>
</span>
<span class="rung__when">${esc(r.when)}</span>
</li>`
    })
    .join('\n')
  return `<ol class="ladder" aria-label="${esc(m.fullName)} schedule">
${items}
</ol>`
}

function legend(medicines) {
  const rungs = medicines.flatMap((m) => m.rungs.filter((r) => r.chart !== false))
  const has = (test) => rungs.some(test)
  const items = [
    ['start', 'Starting dose', has((r) => r.kind === 'start')],
    ['step', 'A step on the way', has((r) => r.kind === 'step')],
    ['keep', 'A dose the label allows staying on', has((r) => r.kind === 'keep')],
    ['option', 'Dashed ring: only if the prescriber steps up', has((r) => r.option)],
  ]
  return `<ul class="legend" aria-label="How to read the chart">
${items
  .filter(([, , shown]) => shown)
  .map(([kind, text]) => `<li><span class="swatch swatch--${kind}"></span>${text}</li>`)
  .join('\n')}
</ul>`
}

const chartNote = (m) =>
  m.weeksNote ??
  (m.unit === 'week' ? 'Weeks on each dose, from the first injection' : 'Days on each dose')

function appCard(m) {
  const points = [
    m.app.catalog
      ? `Pick a strength from ${esc(m.name)}'s label in a tap`
      : `Add ${esc(m.name)} by name, with its strength and schedule`,
    'Log each dose and see when the next one is due',
    ...(m.app.levels ? ['See an estimate of the medicine in your body between doses'] : []),
    'Free, private, and offline. Nothing leaves your device.',
  ]
  return `<div class="card stack">
<h2 class="h3">Log your ${esc(m.name)} doses in Gliplog</h2>
<ul class="checks">
${points.map((p) => `<li>${p}</li>`).join('\n')}
</ul>
<p><a class="button button--primary" href="/app/">Open Gliplog</a></p>
</div>`
}

function medicinePage(m) {
  const path = `/dosing/${m.slug}.html`
  const title = `${m.fullName} dose schedule: titration chart from the label · Gliplog`
  const description = `${m.fullName} (${m.generic}) dosing from the US label: the starting dose, each step up, the ongoing dose, and what to do about a missed dose.`
  const per = m.form.startsWith('Weekly') ? 'Weekly dose' : 'Daily dose'
  const rows = m.rungs
    .map(
      (r) => `<tr>
<td>${esc(r.when)}</td>
<td class="num">${mg(r.dose)}</td>
<td>${esc(r.note)}</td>
</tr>`,
    )
    .join('\n')
  const related = m.related.map((s) => bySlug.get(s))
  const body = `<section class="hero hero--page">
<div class="wrap stack">
<nav class="crumbs" aria-label="Breadcrumb">
<ol itemscope itemtype="https://schema.org/BreadcrumbList">
<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="/"><span itemprop="name">Home</span></a><meta itemprop="position" content="1" /></li>
<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="/dosing/"><span itemprop="name">Dosing schedules</span></a><meta itemprop="position" content="2" /></li>
<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page"><span itemprop="name">${esc(m.fullName)}</span><meta itemprop="position" content="3" /></li>
</ol>
</nav>
<p class="eyebrow">${esc(m.generic)} · ${esc(m.form.toLowerCase())}</p>
<h1>${esc(m.fullName)} dose schedule</h1>
<p class="small muted">US label revised ${m.label.revised} · Checked ${CHECKED}</p>
<div class="card quick stack">
<p class="eyebrow">Quick answer</p>
<p>${esc(m.quick)}</p>
</div>
</div>
</section>

<section class="section section--band" aria-labelledby="schedule">
<div class="wrap stack--loose stack">
<div class="section-head stack">
<h2 id="schedule">${esc(m.fullName)} titration schedule</h2>
<p class="muted">${esc(m.approvedFor)}</p>
</div>
<div class="dosing-grid">
<div class="card stack">
<p class="small muted">${esc(chartNote(m))}</p>
${ladder(m)}
${legend([m])}
</div>
<div class="table-scroll">
<table>
<thead><tr><th scope="col">When</th><th scope="col">${per}</th><th scope="col">From the label</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</div>
</div>
<p>${esc(m.maintenance)}</p>
</div>
</section>

<section class="section" aria-labelledby="good-to-know">
<div class="wrap split split--top">
<div class="stack">
<h2 id="good-to-know">Good to know</h2>
<ul class="dose-notes">
${m.goodToKnow.map((g) => `<li>${esc(g)}</li>`).join('\n')}
</ul>
<h3>If a dose is missed</h3>
<p class="muted">${esc(m.missed)}</p>
${m.changeDay ? `<h3>Changing the dose day</h3>\n<p class="muted">${esc(m.changeDay)}</p>` : ''}
</div>
${appCard(m)}
</div>
</section>

<section class="section section--band" aria-labelledby="questions">
<div class="wrap">
<div class="section-head stack">
<h2 id="questions">Questions about ${esc(m.fullName)} dosing</h2>
</div>
${m.faq.map((f) => `<details>\n<summary>${esc(f.q)}</summary>\n<p>${esc(f.a)}</p>\n</details>`).join('\n')}
</div>
</section>

<section class="section" aria-labelledby="more">
<div class="wrap stack">
<h2 id="more" class="h3">Other dosing schedules</h2>
<ul class="related">
${related.map((r) => `<li><a href="/dosing/${r.slug}.html">${esc(r.fullName)} dose schedule</a></li>`).join('\n')}
<li><a href="/dosing/">All dosing schedules</a></li>
</ul>
<p class="small muted spaced">Source: <a href="${m.label.url}" rel="noopener noreferrer">${esc(m.label.title)}</a> US prescribing information, section 2 (revised ${m.label.revised}). Not medical advice; Gliplog never recommends a dose. Ask your prescriber or pharmacist.</p>
</div>
</section>`
  return page({ title, description, path, type: 'article', body })
}

function hub() {
  const glance = MEDICINES.map(
    (m) => `<tr>
<th scope="row"><a href="/dosing/${m.slug}.html">${esc(m.fullName)}</a> <span class="muted">(${esc(m.generic)})</span></th>
<td>${m.glance.often}</td>
<td class="num">${m.glance.start}</td>
<td>${m.glance.steps}</td>
<td class="num">${m.glance.ongoing}</td>
<td class="num">${m.glance.highest}</td>
</tr>`,
  ).join('\n')

  const groups = GROUPS.map((g, i) => {
    const meds = g.medicines.map((s) => bySlug.get(s))
    return `<section id="${g.id}" class="section${i % 2 ? ' section--band' : ''}">
<div class="wrap stack--loose stack">
<h2>${esc(g.title)}</h2>
<div class="dosing-grid${meds.length > 2 ? ' dosing-grid--three' : ''}">
${meds
  .map(
    (m) => `<article id="${m.slug}" class="card stack">
<div>
<h3><a href="/dosing/${m.slug}.html">${esc(m.fullName)}</a></h3>
<p class="small muted">${esc(m.generic)} · ${esc(m.form.toLowerCase())}</p>
</div>
${ladder(m)}
<p><a href="/dosing/${m.slug}.html">Full ${esc(m.fullName)} schedule</a></p>
</article>`,
  )
  .join('\n')}
</div>
${legend(meds)}
</div>
</section>`
  }).join('\n\n')

  const missed = MEDICINES.map(
    (m) => `<tr>
<th scope="row"><a href="/dosing/${m.slug}.html">${esc(m.fullName)}</a></th>
<td>${esc(m.missed)}</td>
</tr>`,
  ).join('\n')

  const sources = [...new Map(MEDICINES.map((m) => [m.label.url, m.label])).values()]
    .map(
      (l) =>
        `<li><a href="${l.url}" rel="noopener noreferrer">${esc(l.title)}</a>, revised ${l.revised}</li>`,
    )
    .join('\n')

  const body = `<section class="hero hero--page">
<div class="wrap stack">
<p class="eyebrow">From the US prescribing information</p>
<h1>GLP-1 dosing schedules</h1>
<p class="lead lead--wide">Starting doses and step-ups from each medicine's US label. For reference only: your prescriber sets your dose.</p>
<p class="small muted">Checked against the labels ${CHECKED}</p>
<nav class="jump" aria-label="On this page">
<a href="#at-a-glance">At a glance</a>
${GROUPS.map((g) => `<a href="#${g.id}">${esc(g.title)}</a>`).join('\n')}
<a href="#missed-doses">Missed doses</a>
<a href="#compounded">Compounded</a>
<a href="#sources">Sources</a>
</nav>
</div>
</section>

<section id="at-a-glance" class="section section--band">
<div class="wrap">
<div class="section-head stack">
<h2>At a glance</h2>
<p class="muted">Doses in mg can't be compared between medicines, or between tablets and injections.</p>
</div>
<div class="table-scroll">
<table class="table--wide">
<thead><tr><th scope="col">Medicine</th><th scope="col">How often</th><th scope="col">Starting dose</th><th scope="col">Steps</th><th scope="col">Label's ongoing doses</th><th scope="col">Highest</th></tr></thead>
<tbody>
${glance}
</tbody>
</table>
</div>
<p class="small muted spaced">Highest doses are for adults. Wegovy 7.2 mg (Wegovy HD) follows at least 4 weeks on 2.4 mg.</p>
</div>
</section>

${groups}

<section id="missed-doses" class="section section--band">
<div class="wrap">
<div class="section-head stack">
<h2>Missed doses</h2>
<p class="muted">From each label.</p>
</div>
<div class="table-scroll">
<table>
<thead><tr><th scope="col">Medicine</th><th scope="col">If a dose is missed</th></tr></thead>
<tbody>
${missed}
</tbody>
</table>
</div>
</div>
</section>

<section id="compounded" class="section">
<div class="wrap split split--top">
<div class="stack">
<h2>Compounded semaglutide and tirzepatide</h2>
<p class="muted">Pharmacy-made vials aren't FDA-approved and have no label. Follow your prescriber and pharmacy.</p>
<p class="muted">The units to draw depend on your vial's strength in mg per mL. Gliplog works them out for a U-100 syringe.</p>
</div>
<div class="card stack">
<h3>Log your doses in Gliplog</h3>
<ul class="checks">
<li>Pick a strength from your medicine's label in a tap</li>
<li>See when your next dose is due</li>
<li>Free, private, and offline. Nothing leaves your device.</li>
</ul>
<p><a class="button button--primary" href="/app/">Open Gliplog</a></p>
</div>
</div>
</section>

<section id="sources" class="section section--band">
<div class="wrap">
<div class="section-head stack">
<h2>Sources</h2>
<p class="muted">From section 2 of each US prescribing label on DailyMed. If a label changes, the label is right.</p>
</div>
<ul class="sources">
${sources}
</ul>
<p class="small muted spaced">A summary of each label's adult dosing.</p>
</div>
</section>`
  return page({
    title: 'GLP-1 dosing schedules: semaglutide, tirzepatide and more · Gliplog',
    description:
      'Starting doses, step-ups and missed-dose rules for Wegovy, Ozempic, Rybelsus, Zepbound, Mounjaro, Saxenda and Foundayo, as printed in each US prescribing label.',
    path: '/dosing/',
    body,
  })
}

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) yield* htmlFiles(full)
    else if (name.endsWith('.html')) yield full
  }
}

/** The public URL of a page file: index.html is its directory. */
function urlPathOf(file) {
  const rel = '/' + relative(site, file).split('\\').join('/')
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel
}

/** Every page except the 404, which is noindex. */
function sitemap(paths) {
  const urls = [...paths]
    .sort()
    .map((p) => `  <url><loc>${ORIGIN}${p}</loc></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

const options = { ...(await prettier.resolveConfig(join(site, 'index.html'))), parser: 'html' }
const outputs = new Map()
outputs.set(join(site, 'dosing', 'index.html'), await prettier.format(hub(), options))
for (const m of MEDICINES) {
  outputs.set(
    join(site, 'dosing', `${m.slug}.html`),
    await prettier.format(medicinePage(m), options),
  )
}
const handWritten = [...htmlFiles(site)].filter((f) => !f.includes(`${join(site, 'dosing')}/`))
const pagePaths = [...handWritten, ...outputs.keys()]
  .filter((f) => !f.endsWith('404.html'))
  .map(urlPathOf)
outputs.set(join(site, 'sitemap.xml'), sitemap(new Set(pagePaths)))

const stale = []
let written = 0
for (const [file, content] of outputs) {
  let current = null
  try {
    current = readFileSync(file, 'utf8')
  } catch {
    // A missing file is stale.
  }
  if (current === content) continue
  if (check) stale.push(relative(root, file))
  else {
    mkdirSync(join(file, '..'), { recursive: true })
    writeFileSync(file, content)
    written++
  }
}
const extra = [...htmlFiles(join(site, 'dosing'))].filter((f) => !outputs.has(f))
if (check && (stale.length || extra.length)) {
  for (const f of stale) console.error(`${f}: out of date; run npm run build`)
  for (const f of extra)
    console.error(`${relative(root, f)}: not built from scripts/dosing-data.mjs`)
  process.exit(1)
}
console.log(
  check
    ? 'pages: generated files are up to date'
    : `pages: wrote ${written} of ${outputs.size} files`,
)
