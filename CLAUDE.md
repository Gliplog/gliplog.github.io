# gliplog.github.io

The static, script-free project site for Gliplog, published from `site/` to
`https://gliplog.com/`. The app is the separate `Gliplog/app` repository at `/app/` on
the same origin; its CLAUDE.md and front-end skill hold the design system this site mirrors.

## Commands

| Command        | Purpose                                                                        |
| -------------- | ------------------------------------------------------------------------------ |
| `make install` | `npm ci`                                                                       |
| `make serve`   | Serve `site/` at `http://localhost:4174/`                                      |
| `make build`   | Rebuild `site/dosing/` and `site/sitemap.xml` from `scripts/dosing-data.mjs`   |
| `make check`   | Prettier, generated pages up to date, then `scripts/check-site.mjs` (the gate) |

Format with `make format` and run `make check` before calling a change done; CI runs the same
gate on every push and pull request.

## Non-negotiables

- No `<script>`, inline handlers, `style` attributes or service worker: the app shares this
  origin, and every page's CSP is `script-src 'none'`.
- No third-party requests: fonts and images live in `site/`; external links go only to hosts
  listed in `scripts/check-site.mjs`.
- Colours mirror the app's tokens (`site/styles.css` `:root`), light and dark from the device.
- Copy follows the app's voice: warm, plain, inclusive, never recommending a dose. Brand names
  appear only to identify medicines, always with the trademark and non-affiliation line.
- Markdown and HTML contain no em-dashes (U+2014).
- Dosing pages are generated: edit `scripts/dosing-data.mjs` (figures only from the DailyMed
  label, section 2, with the label's revision date and `CHECKED` updated), run `make build`,
  and commit the output. Never edit `site/dosing/` by hand; the gate fails on drift.
- Every indexable page has a description, a canonical `https://gliplog.com/` URL matching its
  path, Open Graph and Twitter card tags, and a `sitemap.xml` entry; the 404 page is noindex.
