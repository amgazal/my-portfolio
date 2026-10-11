"""Export verified analysis reports for the static project page (stdlib only).

Usage: python3 tools/export-parks.py /path/to/national-parks-visitation-analysis
Requires the pinned clean analysis commit; never recomputes the analysis.
"""
import csv
import hashlib
import html
import json
from pathlib import Path
import subprocess
import sys

COMMIT = '5f5bb2fe9fbf08d8a866f92c79e26dae2dac1f22'
ROOT = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]).resolve()
if subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip() != COMMIT:
    raise SystemExit('Use the pinned analysis commit: ' + COMMIT)
if subprocess.check_output(['git', '-C', str(source), 'status', '--porcelain', '--', 'reports'], text=True).strip():
    raise SystemExit('Source reports must be clean')

def rows(name):
    with (source / 'reports' / name).open() as handle:
        return list(csv.DictReader(handle))

annual = [dict(year=int(r['Year']), visits=int(float(r['RecreationVisits'])), units=int(r['ReportingUnits'])) for r in rows('annual_summary.csv')]
seasonal = [dict(month=int(r['Month']), equal=float(r['MeanUnitShare']), volume=float(r['VolumeShare'])) for r in rows('seasonality.csv')]
designations = [dict(name=r['Designation'], units=int(r['Units']), median=float(r['Median']), q1=float(r['Q1']), q3=float(r['Q3'])) for r in rows('designation_comparison.csv')]
designations.sort(key=lambda r: r['median'], reverse=True)
models = []
for name in ['baseline', 'geography', 'designation', 'combined']:
    values = [float(r['r2_log_visits']) for r in rows('model_splits.csv') if r['model'] == name and r['sensitivity'] == 'include_zero']
    mean = sum(values) / len(values)
    models.append(dict(name=name, mean=mean, sd=(sum((v-mean)**2 for v in values)/(len(values)-1))**.5))
files = ['annual_summary.csv', 'seasonality.csv', 'designation_comparison.csv', 'model_splits.csv']
payload = dict(version=1, source=dict(repository='https://github.com/amgazal/national-parks-visitation-analysis', commit=COMMIT,
               sha256={f: hashlib.sha256((source/'reports'/f).read_bytes()).hexdigest() for f in files}),
               annual=annual, seasonal=seasonal, seasonalUnits=392, period=[2023,2025], designations=designations, models=models, modelUnits=367, folds=25)
destination = ROOT / 'projects/beyond-the-crowds'
(destination/'data.v1.json').write_text(json.dumps(payload, separators=(',', ':'), ensure_ascii=False)+'\n')
# A real 47-point annual curve, with the same scale for every observation.
x = lambda r: 76+(r['year']-1979)/46*840
y = lambda r: 414-(r['visits']/1e6-200)/150*270
points = ' '.join(f'{x(r):.2f},{y(r):.2f}' for r in annual)
svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="560" viewBox="0 0 1000 560" role="img" aria-labelledby="title desc">
<title id="title">NPS recreation visits, 1979–2025</title><desc id="desc">Reported visits rose from 205 million to 323 million, with a sharp drop in 2020. Reporting coverage changes over time.</desc>
<rect width="1000" height="560" fill="#f4f1ea"/>
<g font-family="sans-serif" fill="#6f6a64"><text x="76" y="68" font-size="22" fill="#2b2926">Recreation visits over time</text><text x="76" y="103" font-size="16">National Park Service · millions of visits</text>'''
for tick in [200,250,300,350]:
    yy=414-(tick-200)/150*270
    svg+=f'<path d="M76 {yy}H916" stroke="#d9d4ca"/><text x="60" y="{yy+6}" text-anchor="end" font-size="17">{tick}</text>'
svg+=f'<polyline points="{points}" fill="none" stroke="#7b263c" stroke-width="3.5" stroke-linejoin="round"/>'
for year in [1979,2000,2020,2025]:
    r=next(r for r in annual if r['year']==year)
    svg+=f'<text x="{x(r)}" y="448" text-anchor="middle" font-size="17">{year}</text>'
r=annual[-1]; svg+=f'<circle cx="{x(r)}" cy="{y(r)}" r="5" fill="#7b263c"/><text x="76" y="513" font-size="16">Reported visits, not unique visitors. Coverage varies by year.</text></g></svg>'
(ROOT/'assets/beyond-the-crowds.svg').write_text(svg+'\n')
# Static, screen-reader-friendly tables also serve visitors without JavaScript.
page=destination/'index.html'
if page.exists():
    def table(caption, headers, values):
        return '<table><caption>'+caption+'</caption><thead><tr>'+''.join('<th scope="col">'+h+'</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join(('<th scope="row">' if i==0 else '<td>')+html.escape(str(v))+('</th>' if i==0 else '</td>') for i,v in enumerate(row))+'</tr>' for row in values)+'</tbody></table>'
    tables={
      'annual':table('Reported recreation visits, 1979–2025',['Year','Visits','Reporting codes'],[(r['year'],f"{r['visits']:,}",r['units']) for r in annual]),
      'seasonal':table('Monthly share of annual visits, 2023–2025; 392 units',['Month','Equal unit weight','Visit-volume weight'],[(r['month'],f"{r['equal']:.2%}",f"{r['volume']:.2%}") for r in seasonal]),
      'designation':table('Unit means, 2023–2025; exact current API categories',['Designation','Units','Median visits','25th percentile','75th percentile'],[(r['name'],r['units'],f"{r['median']:,.0f}",f"{r['q1']:,.0f}",f"{r['q3']:,.0f}") for r in designations])}
    text=page.read_text()
    for key,value in tables.items():
        start=f'<!-- {key}-table -->';end=f'<!-- /{key}-table -->'
        a=text.index(start)+len(start);b=text.index(end,a);text=text[:a]+value+text[b:]
    page.write_text(text)
print('Exported pinned data, thumbnail and accessible tables')
