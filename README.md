# Abdallah Gazal — Portfolio

A lightweight software-engineering portfolio built with HTML, CSS, and vanilla JavaScript. No build step or runtime dependencies.

## Preview locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000.

## Structure

- `index.html`: profile, projects, experience, About, skills, contact, and metadata.
- `styles.css`: warm light palette, intentional dark palette, sticky desktop identity rail, and single-column layouts at 900px and below.
- `script.js`: persisted theme preference and active section navigation.
- `headshot.jpg`: original portrait; `assets/headshot-small.jpg`: smaller responsive copy.
- `resolve.png`, `layer.webp`: featured previews. Full-resolution originals remain available through the preview links.
- `Abdallah_Gazal_Resume.pdf`: the only resume PDF; every Resume action uses this exact filename.
- `CNAME`: existing custom domain, unchanged.

The page is readable without JavaScript. Theme preference follows the system until a visitor makes a manual selection. Reduced motion disables smooth scrolling and hover movement. All navigation links remain visible on mobile.

Changes remain local for owner review; nothing has been committed or published.
