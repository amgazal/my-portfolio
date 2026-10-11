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
- `resolve.webp`, `layer.webp`: featured previews. Full-resolution originals remain available through the preview links.
- `Abdallah_Gazal_Resume.pdf`: the only resume PDF; every Resume action uses this exact filename.
- `CNAME`: existing custom domain, unchanged.

The page is readable without JavaScript. Theme preference follows the system until a visitor makes a manual selection. Reduced motion disables smooth scrolling and hover movement. All navigation links remain visible on mobile.

The site is deployed through GitHub Pages at https://amgazal.com.

## Beyond the Crowds

The project card links to `/projects/beyond-the-crowds/`, a static analysis page
using the existing shared theme, typography, identity rail and navigation script.
Its scoped `analysis.css` and vanilla `analysis.js` add responsive SVG charts,
keyboard controls and HTML data tables. No runtime libraries or build step were added.

`projects/beyond-the-crowds/data.v1.json` is a 7.6 KB export of verified report
outputs from [the analysis repository](https://github.com/amgazal/national-parks-visitation-analysis),
pinned to commit `5f5bb2fe9fbf08d8a866f92c79e26dae2dac1f22`. Source report hashes
are recorded inside the JSON. No raw visitation dataset is shipped to the browser.
The designation graphic shows only categories with at least five units; the table
and JSON retain all categories. Annual totals include changing reporting coverage.

To regenerate the JSON, real-data SVG thumbnail and static accessible tables:

```sh
python3 tools/export-parks.py /path/to/national-parks-visitation-analysis
node --check projects/beyond-the-crowds/analysis.js
```

The exporter requires clean reports at the pinned source commit and uses only the
Python standard library. Updating the source version is an intentional review:
check the findings and explanatory copy as well as the exported data. The page's
data tables and findings remain usable if JavaScript is disabled or the JSON
cannot load. Local preview and GitHub Pages deployment use the root directory as
before; preserve the existing `CNAME`.

QA for this addition is recorded in [projects/beyond-the-crowds/VALIDATION.md](projects/beyond-the-crowds/VALIDATION.md).
