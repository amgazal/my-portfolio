# Beyond the Crowds: validation

October 11, 2026. Repository identity was verified with the GitHub Pages API:
`amgazal/my-portfolio`, `main` branch, root directory, custom domain `amgazal.com`.
The suggested `amgazal/amgazal.github.io` repository returned 404. Work was done
in an isolated clone, preserving the existing local portfolio checkout.

## Data and scope

- Exported the annual, seasonal, designation and model report outputs from analysis
  commit `5f5bb2fe9fbf08d8a866f92c79e26dae2dac1f22`; source SHA-256 hashes are in
  `data.v1.json`. No statistical analysis was changed.
- Checked 47 annual totals, monthly proportions summing to one under both weighting
  methods, the July/June/August ordering, designation quartile/axis bounds, category
  sample sizes, and the four rounded model scores against the source reports.
- Generated the thumbnail from the same 47 annual observations. No fabricated
  observations, stock scenery, or generated imagery are used.
- Findings retain the distinction between Bronx municipal parks and NPS reporting
  units, and between recreation visits, unique visitors, and crowding.

## Executed checks

- JavaScript syntax with `node --check`; HTML with `html-validate` recommended rules;
  CSS parsing with PostCSS; `git diff --check`.
- Playwright with installed Chrome at 1440, 1024, 768, 390 and 320 CSS pixels,
  both light and dark themes: homepage project card and project page.
- Automated axe WCAG 2 A/AA and 2.1 AA checks: no violations in the tested states.
  This is not a claim of complete accessibility conformance.
- Keyboard year selection, seasonal arrow/Home/End navigation, designation button
  activation, visible focus, theme persistence across pages, and scrollable tables.
- Pointer tooltips and Escape dismissal; emulated touch selections for all charts;
  reduced-motion behavior; every project-page local link returned HTTP 200.
- No-JavaScript tables and a simulated unavailable JSON response.
- No horizontal page overflow, local HTTP failures, or JavaScript runtime errors.
- Desktop, tablet and mobile screenshots inspected, including dark-mode charts and
  the homepage card. The original shared styles, script, hosting configuration,
  resume, and other projects were preserved.

Browser QA packages were reused from an existing temporary testing environment;
none are added to the website's runtime or repository dependencies. The page
uses the portfolio's existing Google Fonts request, with local font fallbacks.

## Limits

Browser automation was run in Chrome, including emulated touch; physical mobile
devices and other browser engines were not tested. The data is a versioned snapshot,
not live statistics. Current metadata, unmatched reporting codes, changing coverage,
and historical partial totals retain the limitations documented in the analysis.
