# Deploy to GitHub Pages

This portfolio is a static HTML/CSS/JavaScript site. If your existing repository is `amgazal/my-portfolio`, replace its contents with this folder while preserving `.git`, then commit and push.

```bash
cd ~/Downloads
rm -rf my-portfolio-update
git clone https://github.com/amgazal/my-portfolio.git my-portfolio-update

rsync -av --delete \
  --exclude='.git' \
  ~/Downloads/abdallah-portfolio-software-engineer-final/ \
  ~/Downloads/my-portfolio-update/

cd ~/Downloads/my-portfolio-update
git add -A
git status
git commit -m "Refine portfolio software engineering positioning"
git push origin main
```

If the repository uses a branch other than `main`, replace `main` in the final command with that branch name.
