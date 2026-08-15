# Abdallah Gazal — Portfolio

Static portfolio built with hand-written HTML, CSS, and JavaScript. No build step or framework is required.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Included assets

- `layer.png` — Layer product screenshot used by the featured project.
- `future.png` — Future Civilizations Conference website.
- `colormodel.png` / `colormodel2.png` — Color Model Converter.
- `frogger.png` — Froggit.
- `imager.png` — Interactive Image Filter Editor.
- `Abdallah_Gazal_Resume.pdf` — Software engineering resume linked from the hero and contact section.

## Design notes

- The opening interaction is intentionally the only expressive animation: the letters begin scattered near the floor and are pulled into the name by strings as the visitor scrolls.
- The rest of the site avoids card lifting, image zooming, glows, and decorative motion. Hover states are limited to clear interaction feedback.
- `prefers-reduced-motion` skips the opening animation and presents the portfolio normally.
