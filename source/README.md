# Proposal master: source files

Everything needed to rebuild The Observatory proposal master and the live page at
www.theobservatory.je/greatideas.

## What lives where
- `msrc/config-newbiz.js`: the master's content (all copy, images, levels, contacts). Most briefs only touch this file.
- `msrc/config-deploy.js`: the same content set up for the live site (film and poster served from the repo, email links open in the visitor's mail app).
- `msrc/app.js`, `msrc/body.html`, `msrc/style.css`, `msrc/wordmark.js`, `symsrc/sym.js`: the page itself.
- `site/assets`, `sj-assets`: images. The film lives once, in `../greatideas/assets/showreel-v4-r2.mp4`.
- `og/`: the share preview image (`og-greatideas.jpg`) and the scripts that render it.
- `tools/build_master.py`: builds the master page. `tools/deploy.py`: builds the live page into `../greatideas/`. `tools/audit.js`: layout checks at every width.

## Update the live page
1. Edit `msrc/config-newbiz.js` and make the same change in `msrc/config-deploy.js` (they differ only in the film source and the email link target).
2. From this folder: `python3 -I tools/deploy.py "$PWD" config-deploy.js greatideas`
3. Commit and push. GitHub Pages updates the live page within a couple of minutes. Webflow only needs republishing for page settings (title, share image).

## Update the master artifact preview
- The master preview is https://claude.ai/artifact/FXxh6XJEQdwcQbbJgYMjZD
- Build it with `python3 -I tools/build_master.py "$PWD" config-newbiz.js newbiz "The Observatory · Creative Partnerships" "A creative partnership proposal from The Observatory for businesses with a story to tell."`
- Its film and poster come from that artifact's own asset store (the `/_blob/...` ids in the config).
- Artifacts cannot load Adobe Fonts, so the preview embeds Neue Haas Grotesk Display 65 Medium. That font file is not kept in this public repo: put `nhgd65.woff2` in `font/` before building, or the preview falls back to Helvetica. The live site uses the Adobe Fonts kit `lud1fnf` and needs no font file.

## The JET proposal: www.theobservatory.je/jet
- `jet/copy7.json` holds every word on the page. `jet/jet7_post.py` fills the master config (`msrc/config-jet7.js`), then adds the numbered sections, the first look, the moving timeline and their styles and scripts to the master build.
- The live page is not linked from the site and stays out of search (noindex, robots.txt). Its images and films live in `../jet/assets`. The artifact preview is the "The Observatory × JET" artifact in Ben's claude.ai artifacts: change both together.
- Rebuild, from this folder:
  1. `python3 -I jet/jet7_post.py config jet/copy7.json jet/config-jet7.tpl.js msrc/config-jet7.js`
  2. `python3 -I tools/build_master.py "$PWD" config-jet7.js jetbuild "The Observatory × JET" "A creative and commercial partnership proposal for Jersey Energy Technologies, from The Observatory."` (put `nhgd65.woff2` in `font/` first when building the artifact preview)
  3. `python3 -I jet/jet7_post.py post jet/copy7.json jetbuild/index.html jetbuild/jet.html`
  4. Live page: `python3 -I jet/deploy_jet.py jetbuild/jet.html jetbuild/assets:../jet/assets .. ../jet/assets/og-jet.jpg`, then commit and push. It swaps the built-in font for the Adobe Fonts kit and applies the website's type rule.
  5. Artifact preview: publish `jetbuild/jet.html` to that artifact, with the files from `jetbuild/assets` and `../jet/assets` under `assets/`.
- Checks: `python3 jet/verify7.py <page.html> jet/copy7.json` (every word, the nav, every width, the timeline) and `python3 jet/media7.py <url>` (frames, images, films and the timeline on every device; serve the page over http first).
- The share image `../jet/assets/og-jet.jpg` comes from `node jet/og-jet.js "$PWD"` (needs the font in `font/`), screenshotted at 1200 × 630.

## Rules
- Type: FatFrank for the OBSERVATORY wordmark (as outlines), Neue Haas Grotesk Display for everything else, never bold. Headlines in caps, body in sentence case. No em dashes in body copy.
- Colours: #F1EDE5 background, #242424 ink, #FF3400 accent.
- New proposals get their own folder next to `greatideas/` and their own config. Never overwrite another proposal's folder.
