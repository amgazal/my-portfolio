# Safe GitHub update

This package is complete: it includes the Layer screenshot and the PDF resume referenced by the site.

The safest update is to copy it over your existing clone **without `--delete`** so unrelated files in the repository are not removed accidentally.

```bash
cd ~/Downloads
rm -rf portfolio-rebuild-extracted
unzip -q abdallah-portfolio-premium-rebuild-final.zip -d portfolio-rebuild-extracted

rsync -av \
  --exclude=".git" \
  ~/Downloads/portfolio-rebuild-extracted/abdallah-portfolio-premium-rebuild-final/ \
  ~/Downloads/my-portfolio-update/

cd ~/Downloads/my-portfolio-update
git status
git add -A
git commit -m "Polish portfolio content, visuals, and intro"
git push origin main
```

If `my-portfolio-update` no longer exists, clone it again first:

```bash
cd ~/Downloads
git clone https://github.com/amgazal/my-portfolio.git my-portfolio-update
```
