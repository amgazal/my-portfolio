# Abdallah Gazal — Software Engineering Portfolio

Static portfolio built with hand-written HTML, CSS, and JavaScript. There is no build step and no framework dependency.

## Run locally

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Files

- `index.html` — content, metadata, project/experience structure
- `styles.css` — responsive visual system, intro, project layouts, print styles
- `script.js` — cinematic name assembly, navigation, section state, color demo
- `favicon.svg` — site icon
- `*.png` — project screenshots

## Resume

The site looks for `Abdallah_Gazal_Resume.pdf` in the project root. If the PDF is present, the Resume links work normally. If it is not present on the deployed site, those links are hidden instead of sending visitors to a broken page.

## Design notes

- Two type families: Bricolage Grotesque for display type and Hanken Grotesk for body/UI text.
- Motion is intentionally restrained. Project cards do not float, glow, lift, or zoom on hover; interaction is communicated through borders, type, and a single accent line.
- The intro animation respects `prefers-reduced-motion` and is skipped for users who request reduced motion.
- The Layer project preview is rendered in HTML/CSS, so it stays crisp and does not depend on a separate screenshot asset.

## Live project links

- Layer: https://amgazal.github.io/Layer/
- Future Civilizations Conference: https://futurecivilizations.com
- AI Tweet Detection (Streamlit): https://machine-learning-project-22d-atu8bhkcttbebpd44xntd2.streamlit.app/
