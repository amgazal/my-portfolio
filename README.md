# Abdallah Gazal — Portfolio

Static site (HTML/CSS/JS). No build step, no dependencies.

## Run locally
Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000
    # then visit http://localhost:8000

## Before you deploy — add two assets
These are referenced by the site but were not in the source I received:

- `layer.png`  — screenshot of the Layer app (the featured project). Until it's
  present, the Layer card shows a styled fallback panel instead of the image.
- `Abdallah_Gazal_Resume.pdf` — the résumé linked in the hero and contact section.

Drop both in the project root (next to `index.html`).

## Files
- index.html   — markup
- styles.css   — all styling
- script.js    — cinematic intro, scroll reveal, nav, live color demo
- favicon.svg  — AG monogram favicon
- *.png        — project screenshots
