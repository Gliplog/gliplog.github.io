# gliplog.github.io

The project site for [Gliplog](https://gliplog.com/), a free, private, and offline GLP-1
journal. The app itself lives in [Gliplog/app](https://github.com/Gliplog/app) and is served
at [gliplog.com/app](https://gliplog.com/app/).

## What is here

| Path                | Holds                                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `site/`             | The published files: pages, `styles.css`, fonts, images                                                                      |
| `scripts/`          | `check-site.mjs` (the gate), `build-pages.mjs` and `dosing-data.mjs` (dosing pages and sitemap), `serve.mjs` (local preview) |
| `.github/workflows` | `deploy.yml`: runs the gate and publishes `site/` to Pages                                                                   |

## Rules

The site shares the `gliplog.com` origin with the app, so:

- **No scripts, ever.** Every page carries a CSP with `script-src 'none'`. A script here could
  read the app's on-device data.
- **No service worker.** One registered at the root would control `/app/`.
- **No third-party requests.** Fonts and images are self-hosted; links to GitHub and DailyMed
  are plain links, never loaded resources.

`npm run check` enforces all three, plus working internal links and anchors, image alt text,
formatting, and the no-em-dash rule.

## Development

Requires Node 24 (see `.nvmrc`).

```bash
nvm use
make install
make serve        # http://localhost:4174/ (links to /app/ need the app repo deployed)
make check
```

## Deploying

This repository must be named `gliplog.github.io` in the `Gliplog` organisation. In its
settings, under Pages, set the source to **GitHub Actions**, then push to `main`.

Screenshots in `site/assets/screens/` come from the app with sample data, never real records. To
retake the Today pair, run `make screenshots` in the app repository; its `site-screenshots`
skill has the steps.

## License

AGPL-3.0. See [LICENSE](LICENSE).
