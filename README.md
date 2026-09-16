# Abdallah Gazal — Portfolio

Static portfolio built with HTML, CSS, and JavaScript. No build step or runtime dependencies.

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000.

## Files

- `index.html`: content, project cards, and social metadata.
- `styles.css`: layout, typography, cinematic intro, and responsive styles.
- `script.js`: curtain, navigation, section reveals, Back to Top, and color demo.
- `*.png`: project screenshots currently referenced by the page; WebP copies are also available.
- `Abdallah Gazal Resume.pdf`: current linked resume. The underscore filename is kept in sync for existing bookmarks.

## Project previews

Resolve and Bridge use the supplied original screenshots in `resolve.png` and
`bridge.png`. CSS frames each image around the product content at every card
width; clicking a preview opens the untouched, full-resolution screenshot.
Froggit assets remain in the repository but are not displayed.

The intro is skipped when reduced motion is enabled. Fonts fall back to system
faces if Google Fonts is unavailable.

## Final content pass

See [QA.md](QA.md) for validation results, link status, and facts to confirm before publishing.
