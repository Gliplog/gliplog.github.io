# gliplog.github.io

The static, script-free project site for Gliplog, published from `site/` to
`https://gliplog.com/`. The app is the separate `Gliplog/app` repository at `/app/` on
the same origin; its CLAUDE.md and front-end skill hold the design system this site mirrors.

## Commands

| Command        | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `make install` | `npm ci`                                           |
| `make serve`   | Serve `site/` at `http://localhost:4174/`          |
| `make check`   | Prettier, then `scripts/check-site.mjs` (the gate) |

## Non-negotiables

- No `<script>`, inline handlers, `style` attributes or service worker: the app shares this
  origin, and every page's CSP is `script-src 'none'`.
- No third-party requests: fonts and images live in `site/`; external links go only to hosts
  listed in `scripts/check-site.mjs`.
- Colours mirror the app's tokens (`site/styles.css` `:root`), light and dark from the device.
- Copy follows the app's voice: warm, plain, inclusive, never recommending a dose. Brand names
  appear only to identify medicines, always with the trademark and non-affiliation line.
- Markdown and HTML contain no em-dashes (U+2014).
