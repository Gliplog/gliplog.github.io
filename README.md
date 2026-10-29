# tidebook.github.io

The project site for [Tidebook](https://tidebook.github.io/), a free, private and offline GLP-1
journal. The app itself lives in [Tidebook/app](https://github.com/Tidebook/app) and is served
at [tidebook.github.io/app](https://tidebook.github.io/app/).

## What is here

| Path                | Holds                                                       |
| ------------------- | ----------------------------------------------------------- |
| `site/`             | The published files: pages, `styles.css`, fonts, images     |
| `scripts/`          | `check-site.mjs` (the gate) and `serve.mjs` (local preview) |
| `.github/workflows` | `deploy.yml`: runs the gate and publishes `site/` to Pages  |

## Rules

The site shares the `tidebook.github.io` origin with the app, so:

- **No scripts, ever.** Every page carries a CSP with `script-src 'none'`. A script here could
  read the app's on-device data.
- **No service worker.** One registered at the root would control `/app/`.
- **No third-party requests.** Fonts and images are self-hosted; links to GitHub and DailyMed
  are plain links, never loaded resources.

`npm run check` enforces all three, plus working internal links and anchors, image alt text,
formatting and the no-em-dash rule.

## Development

Requires Node 24 (see `.nvmrc`).

```bash
nvm use
make install
make serve        # http://localhost:4174/ (links to /app/ need the app repo deployed)
make check
```

## Deploying

This repository must be named `tidebook.github.io` in the `Tidebook` organisation. In its
settings, under Pages, set the source to **GitHub Actions**, then push to `main`.

Screenshots in `site/assets/screens/` come from the app with sample data, never real records.

## License

AGPL-3.0. See [LICENSE](LICENSE).
