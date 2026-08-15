# Abdallah Gazal — Portfolio

Static site. Hand-written HTML, CSS, and JavaScript — no framework, no build
step, no dependencies.

## Run locally

    python3 -m http.server 8000
    # http://localhost:8000

## Files

    index.html      markup, metadata, JSON-LD Person schema
    styles.css      all styling, including the print stylesheet
    script.js       intro rig, scroll reveal, scrollspy, nav, colour demo
    favicon.svg     AG monogram
    og-image.jpg    1200x630 social preview
    *.webp          project screenshots
    Abdallah_Gazal_Resume.pdf

## Notes

- Screenshots are served as WebP, sized to the largest slot each one renders in.
  Total image payload is ~0.55 MB. If a browser cannot decode WebP, each card
  falls back to a styled placeholder panel rather than a broken image.
- Fonts load from Google Fonts. Without a connection the page falls back to
  system faces; layout and spacing are unaffected.
- The scroll intro is skipped entirely for visitors who set
  `prefers-reduced-motion: reduce`; they land straight on the hero.
- Smallest text/background contrast ratio on the site is 4.76:1
  (WCAG AA for normal text is 4.5:1).

## Updating the live site

From inside your clone, copy these files in and push:

    git add -A
    git commit -m "Update portfolio"
    git push

## Project links

- Layer: https://github.com/amgazal/Layer
- Future Civilizations: https://github.com/amgazal/future-civilizations
- Color Model Converter: https://github.com/amgazal/color-model-converter
- Image Filter Editor: https://github.com/amgazal/Image-editor-python

Froggit can be linked after its repository is published.
