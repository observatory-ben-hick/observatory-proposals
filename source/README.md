# Proposal master: source files

Everything needed to rebuild The Observatory proposal master and the live page at
www.theobservatory.je/originalthinking.

## What lives where
- `msrc/config-newbiz.js`: the master's content (all copy, images, levels, contacts). Most briefs only touch this file.
- `msrc/config-deploy.js`: the same content set up for the live site (film and poster served from the repo, email links open in the visitor's mail app).
- `msrc/app.js`, `msrc/body.html`, `msrc/style.css`, `msrc/wordmark.js`, `symsrc/sym.js`: the page itself.
- `site/assets`, `sj-assets`: images. The film lives once, in `../originalthinking/assets/showreel-v4b.mp4`.
- `og/`: the share preview image (`og-originalthinking.jpg`) and the scripts that render it.
- `tools/build_master.py`: builds the master page. `tools/deploy.py`: builds the live page into `../originalthinking/`. `tools/audit.js`: layout checks at every width.

## Update the live page
1. Edit `msrc/config-newbiz.js` and make the same change in `msrc/config-deploy.js` (they differ only in the film source and the email link target).
2. From this folder: `python3 -I tools/deploy.py "$PWD" config-deploy.js originalthinking`
3. Commit and push. GitHub Pages updates the live page within a couple of minutes. Webflow only needs republishing for page settings (title, share image).

## Update the master artifact preview
- The master preview is https://claude.ai/artifact/FXxh6XJEQdwcQbbJgYMjZD
- Build it with `python3 -I tools/build_master.py "$PWD" config-newbiz.js newbiz "The Observatory · Creative Partnerships" "A creative partnership proposal from The Observatory for businesses with a story to tell."`
- Its film and poster come from that artifact's own asset store (the `/_blob/...` ids in the config).
- Artifacts cannot load Adobe Fonts, so the preview embeds Neue Haas Grotesk Display 65 Medium. That font file is not kept in this public repo: put `nhgd65.woff2` in `font/` before building, or the preview falls back to Helvetica. The live site uses the Adobe Fonts kit `lud1fnf` and needs no font file.

## Rules
- Type: FatFrank for the OBSERVATORY wordmark (as outlines), Neue Haas Grotesk Display for everything else, never bold. Headlines in caps, body in sentence case. No em dashes in body copy.
- Colours: #F1EDE5 background, #242424 ink, #FF3400 accent.
- New proposals get their own folder next to `originalthinking/` and their own config. Never overwrite another proposal's folder.
