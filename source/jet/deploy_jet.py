"""Build the JET proposal for www.theobservatory.je/jet from the page jet7_post.py makes.

  python3 -I deploy_jet.py <built page> <asset folders, colon separated> <repo root> <og-jet.jpg>

The same steps as source/tools/deploy.py does for greatideas: a full document head, kept out of
search (noindex here, Disallow: /jet/ in robots.txt), type from The Observatory's Adobe Fonts kit
instead of the font built into the artifact preview (licensed font files never go in this public repo),
the website's type rule (55 Roman, 75 Bold for headlines in caps), and email buttons that open the
visitor's mail app. Only the files the page uses are copied into jet/assets.
"""
import sys, re, os, io, shutil

PAGE, ASSETS, REPO, OG = sys.argv[1:5]
ASSETS = [d for d in ASSETS.split(':') if d]
SLUG = 'jet'
URL = 'https://www.theobservatory.je/' + SLUG + '/'
TITLE = 'The Observatory × JET'
DESC = 'A creative and commercial partnership proposal for Jersey Energy Technologies, from The Observatory.'

p = io.open(PAGE, encoding='utf-8').read()
assert p.lstrip().startswith('<title>'), 'expected the page as jet7_post.py writes it'
mark = "setTimeout(bare,5000)})();</script>\n"
assert p.count(mark) == 1
i = p.index(mark) + len(mark)

head = ('<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="robots" content="noindex,nofollow">\n'
        '<meta name="referrer" content="strict-origin-when-cross-origin">\n'
        '<meta name="theme-color" content="#F1EDE5">\n'
        '<link rel="preconnect" href="https://use.typekit.net" crossorigin>\n'
        '<link rel="stylesheet" href="https://use.typekit.net/lud1fnf.css">\n'
        '<link rel="icon" href="/media/favicon.svg?v=2" type="image/svg+xml">\n'
        '<link rel="icon" href="/media/favicon-32.png?v=2" sizes="32x32" type="image/png">\n'
        '<link rel="apple-touch-icon" href="/media/apple-touch-icon.png?v=2">\n'
        '<link rel="manifest" href="/site.webmanifest">\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:title" content="%s">\n'
        '<meta property="og:description" content="%s">\n'
        '<meta property="og:url" content="%s">\n'
        '<meta property="og:image" content="%sassets/og-jet.jpg?v=1">\n'
        '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
        '<meta name="twitter:card" content="summary_large_image">\n'
        '<meta name="twitter:image" content="%sassets/og-jet.jpg?v=1">\n'
        '<style>html,body{margin:0;padding:0;background:#F1EDE5}[hidden]{display:none!important}img{max-width:100%%}</style>\n'
        ) % (TITLE, DESC, URL, URL, URL)
doc = head + p[:i] + '</head>\n<body>\n' + p[i:].rstrip() + '\n</body>\n</html>\n'

# type: the Adobe Fonts kit (licensed for theobservatory.je) in place of the embedded preview font
doc, n = re.subn(r'(/\* Neue Haas Grotesk Display Pro, built into the page[^\n]*\n)?@font-face\{font-family:"NHG Display";src:url\(data:font/woff2;base64,[A-Za-z0-9+/=]+\) format\("woff2"\);[^}]*\}', '', doc, count=1)
assert n <= 1 and 'data:font/woff2' not in doc, 'embedded font not removed'  # no font file in font/ means none was embedded
doc = doc.replace('"NHG Display",', '"neue-haas-grotesk-display",')
assert '"NHG Display"' not in doc
w = '*,*:before,*:after{font-weight:400!important'
assert doc.count(w) == 1
doc = doc.replace(w, '*,*:before,*:after{font-weight:500!important')
# the website's rule: 75 Bold for headlines in caps (as on greatideas, plus the JET page's own caps headings), 55 Roman for the rest
BOLD = ['h1', 'h2', 'h3', 'h4', '.h1', '.h2', '.h3', '.mega', '[data-split]', '[data-split] *', '.w', '.marq-t', '.marq-t *',
        'a.btn', 'a.btn *', '.foot-meta a', '.bos-t', '.ot-back', '.ot-back *', '.wy-cta', '.wy-cta *',
        '.j-caps li', '.j-sh', '.tl-n']
doc = doc.replace('</head>', '<style>' + ','.join('html body ' + x for x in BOLD) + '{font-weight:700!important}</style>\n</head>', 1)

# email buttons open a new email in the visitor's own mail app, as on greatideas
c = "compose: {\n      button: 'Email us',\n"
assert doc.count(c) == 1
doc = doc.replace(c, c + "      target: '_top',\n")

assert doc.count('<head>') == 1 and doc.count('</head>') == 1 and doc.count('<body>') == 1
assert '—' not in re.sub(r'<script.*?</script>|<style.*?</style>', '', doc, flags=re.S), 'em dash in page text'

out = os.path.join(REPO, SLUG)
os.makedirs(os.path.join(out, 'assets'), exist_ok=True)
io.open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(doc)
refs = sorted(set(re.findall(r'assets/([A-Za-z0-9_.\-]+\.(?:jpe?g|png|mp4|svg|webp|gif))', doc)))
refs = [r for r in refs if r != 'og-jet.jpg']  # the share image is copied on its own below
def find(r):
    for d in ASSETS:
        if os.path.isfile(os.path.join(d, r)):
            return os.path.join(d, r)
missing = [r for r in refs if not find(r)]
assert not missing, missing
def put(src, dst):
    if not (os.path.exists(dst) and os.path.samefile(src, dst)):
        shutil.copy2(src, dst)
for r in refs:
    put(find(r), os.path.join(out, 'assets', r))
put(OG, os.path.join(out, 'assets', 'og-jet.jpg'))
keep = set(refs) | {'og-jet.jpg'}
for f in os.listdir(os.path.join(out, 'assets')):
    if f not in keep:
        os.remove(os.path.join(out, 'assets', f))
size = sum(os.path.getsize(os.path.join(out, 'assets', f)) for f in keep)
print('built %s/index.html, %d bytes, %d files in assets (%.1f MB)' % (out, len(doc.encode('utf-8')), len(keep), size / 1e6))
