# www.theobservatory.je: the website

The whole site is one file, `site-src/index.html`. Its first script block (`window.SITE = {...}`) is the CMS: every word, project, news post and picture on the site comes from there.

## Make a change (Claude does this)
1. Edit `site-src/index.html`. Copy changes go in the `window.SITE` block. New images and films go in `media/work/` (optimised first), referenced as `__BASE__media/work/<file>`.
2. Build: `python3 -I site-src/deploy.py "$PWD" /`
   (use `/observatory-proposals/ --preview` only before the domain points here)
3. Commit and push to `main`. GitHub Pages updates the live site in a minute or two.

The build writes `index.html`, a folder per page (`work/<id>/`, `news/<id>/`, `about/`, `news/`, `contact/`), `404.html`, `sitemap.xml` and `robots.txt`. Never edit those by hand: the next build overwrites them. Removing a project or post from the CMS removes its page on the next build.

## Rules
- Colours #F1EDE5, #242424, #FF3400. Headlines in caps, body in sentence case, no em dashes, images never cropped.
- Names: Future of Humanity, The Good Stone, SpaceBox, 7th Sense Research, War Tunnels.
- Type comes from the Adobe Fonts kit `lud1fnf` (Neue Haas Grotesk Display). Licensed font files never go in this public repo.
- Films: H.264, yuv420p, `-movflags +faststart`, silent unless they have real sound, under 20 MB.
- `originalthinking/` is the proposal page. It is not linked from the site and stays out of search (noindex, robots.txt).
