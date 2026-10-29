"""Build www.theobservatory.je from site-src/index.html.

  python3 -I site-src/deploy.py <repo> <base> [--preview]

base is "/" for the live domain, "/observatory-proposals/" for the github.io preview.
Writes index.html, one folder per page (work/<id>/, news/<id>/, about/, news/, contact/),
404.html, sitemap.xml and robots.txt into the repo root. Every page carries its own title,
description, canonical address, share tags and structured data, so search engines and
link previews see each page without running the script.
"""
import hashlib, sys, os, re, json, html, shutil, threading, functools, datetime, tempfile
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

REPO, BASE = sys.argv[1], sys.argv[2]
PREVIEW = '--preview' in sys.argv
ORIGIN = 'https://www.theobservatory.je'
SRC = os.path.join(REPO, 'site-src', 'index.html')
DEFAULT_IMG = ORIGIN + '/media/og-great-ideas.jpg'
FONT = ('<link rel="preconnect" href="https://use.typekit.net" crossorigin>\n'
        '<link rel="stylesheet" href="https://use.typekit.net/lud1fnf.css">\n'
        '<style>/* Adobe kit weights: 500 = 55 Roman, 600 = 65 Medium, 700 = 75 Bold. 75 Bold for every headline in caps, every link with an arrow, every work title and news dates; 65 Medium for client names on the home work tiles; 55 Roman for everything else */body,body *{font-weight:500!important}html body h1,html body h2,html body h3,html body h4,html body h5,html body h6,html body b,html body strong,html body th,html body [data-split],html body .mega,html body .t-mega,html body .t-title,html body .h1,html body .mf-t,html body .fc-h,html body p.tg,html body .tl,html body .tl *,html body .lk,html body .cs-back,html body .btn,html body .btn *,html body .tq-nav button,html body .nl a .t,html body .nl a .ar,html body .wc .meta span:first-child,html body .wlist .c,html body .next .lab,html body .next .h1,html body [data-split] *,html body .fc-h,html body .fc-h *,html body .nl a .d,html body .nc>.dim:first-child,html body .np-meta .num,html body .post-date,html body .ft-soc a,html body .bos-t,html body .bk2-h,html body .bk2-go,html body .bk2-go *{font-weight:700!important}html body .wk-c .ar,html body .wk-c span:nth-child(2){font-weight:600!important}html body .wc h3.cardt{font-weight:500!important}</style>\n')
CSP = ("default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://use.typekit.net https://p.typekit.net; "
       "font-src 'self' data: https://use.typekit.net; img-src 'self' data: https://p.typekit.net https://*.google-analytics.com https://*.googletagmanager.com; media-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; "
       "frame-src https://calendly.com; object-src 'none'; base-uri 'self'; form-action 'self' mailto:")

def page_html(base):
    s = open(SRC, encoding='utf-8').read().replace('__BASE__', base)
    head = ('<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<meta http-equiv="Content-Security-Policy" content="%s">\n'
            '<meta name="referrer" content="strict-origin-when-cross-origin">\n'
            '<meta name="google-site-verification" content="-VpKRAsjYBZ9gfo6TmifI1kYQbCXsEsVQbuSis7VphQ">\n'
            '<meta name="obs-base" content="%s">\n'
            '<link rel="icon" href="%smedia/favicon.svg" type="image/svg+xml">\n'
            '<link rel="icon" href="%smedia/favicon-32.png" sizes="32x32" type="image/png">\n'
            '<link rel="apple-touch-icon" href="%smedia/apple-touch-icon.png">\n' % (CSP, base, base, base, base)) + FONT
    if PREVIEW:
        s = s.replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex, nofollow">')
    return fingerprint(head + s, base)

_FP = {}
def fingerprint(s, base):
    """Every media link carries a short fingerprint of the file's contents (?v=...), so files can be
    cached for a long time and a changed file still shows at once: its address changes with it."""
    def rep(m):
        rel = m.group(1)
        if rel not in _FP:
            f = os.path.join(REPO, rel)
            _FP[rel] = hashlib.sha1(open(f, 'rb').read()).hexdigest()[:8] if os.path.isfile(f) else ''
        return m.group(0) + ('?v=' + _FP[rel] if _FP[rel] else '')
    return re.sub(r'(?<=["\'(\s,=])' + re.escape(base) + r'(media/[A-Za-z0-9_./-]+\.(?:webp|jpe?g|png|gif|svg|mp4|webm))(?![A-Za-z0-9_./?-])', rep, s)

def collect(base_html):
    """Load every page in a headless browser and read back what the site itself sets."""
    from playwright.sync_api import sync_playwright
    tmp = tempfile.mkdtemp()
    open(os.path.join(tmp, 'index.html'), 'w', encoding='utf-8').write(base_html)
    os.symlink(os.path.join(REPO, 'media'), os.path.join(tmp, 'media'))
    class H(SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def handle(self):
            try: super().handle()
            except (ConnectionResetError, BrokenPipeError): pass
        def send_head(self):
            p = self.translate_path(self.path)
            if not os.path.exists(p) or os.path.isdir(p) and not os.path.exists(os.path.join(p, 'index.html')):
                self.path = '/index.html'
            return super().send_head()
    srv = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(H, directory=tmp))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    root = 'http://127.0.0.1:%d/' % srv.server_address[1]
    out = {}
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        pg.goto(root); pg.wait_for_timeout(600)
        ids = pg.evaluate("({work:SITE.work.map(w=>w.id),news:SITE.news.map(n=>n.id)})")
        routes = [''] + ['work', 'about', 'news', 'contact', 'privacy'] + ['work/' + i for i in ids['work']] + ['news/' + i for i in ids['news']]
        for r in routes:
            pg.goto(root + (r + '/' if r else '')); pg.wait_for_timeout(250)
            out[r] = pg.evaluate("""()=>{const g=(s,a)=>{const m=document.head.querySelector(s);return m?m.getAttribute(a||'content'):''};
              const it=(()=>{const p=location.pathname.split('/').filter(Boolean);if(p[0]==='work'&&p[1])return SITE.work.find(w=>w.id===p[1]);if(p[0]==='news'&&p[1])return SITE.news.find(n=>n.id===p[1]);return null})();
              return {title:document.title,desc:g('meta[name="description"]'),img:g('meta[property="og:image"]'),
                h1:(document.querySelector('#main h1')||{}).textContent||'',
                kind:it?(it.client?'case':'post'):'page',year:it&&it.year||'',date:it&&it.date||'',
                main:(()=>{const m=document.querySelector('#main').cloneNode(true);
                  m.querySelectorAll('script,iframe,noscript,.cs-back').forEach(e=>e.remove());
                  m.querySelectorAll('video').forEach(v=>{v.removeAttribute('src');v.removeAttribute('autoplay');v.removeAttribute('poster');v.querySelectorAll('source').forEach(x=>x.remove())});
                  m.querySelectorAll('br').forEach(b=>b.before(document.createTextNode(' ')));
                  m.querySelectorAll('[data-split]').forEach(e=>[...e.querySelectorAll('span')].forEach(x=>x.after(document.createTextNode(' '))));
                  m.querySelectorAll('[style]').forEach(e=>{e.style.removeProperty('opacity');e.style.removeProperty('transform');if(!e.getAttribute('style'))e.removeAttribute('style')});
                  return m.innerHTML})(),
                hero:(()=>{const i=document.querySelector('#main img[fetchpriority="high"]');return i?{src:i.getAttribute('src'),srcset:i.getAttribute('srcset')||'',sizes:i.getAttribute('sizes')||''}:null})()}}""")
        b.close()
    srv.shutdown(); shutil.rmtree(tmp)
    return routes, out

def esc(t): return html.escape(t or '', quote=True)

def head_for(r, m):
    url = ORIGIN + '/' + (r + '/' if r else '')
    img = m['img'] or DEFAULT_IMG
    img = re.sub(r'^https://www\.theobservatory\.je/+', ORIGIN + '/', img)
    title = m['title']; desc = m['desc']
    ld = None
    if m['kind'] == 'case':
        ld = {"@context": "https://schema.org", "@type": "CreativeWork", "name": title.split(' · ')[0], "headline": m['h1'].strip(),
              "description": desc, "url": url, "image": img, "creator": {"@id": ORIGIN + "/#org"},
              "isPartOf": {"@id": ORIGIN + "/#site"}}
        yr = re.findall(r'(?:19|20)\d\d', m['year'])
        if yr: ld["dateCreated"] = yr[0]
    elif m['kind'] == 'post':
        ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": m['h1'].strip() or title, "description": desc,
              "url": url, "image": img, "author": {"@id": ORIGIN + "/#org"}, "publisher": {"@id": ORIGIN + "/#org"}}
    if r:
        crumbs = [("The Observatory", ORIGIN + "/")]
        sec = r.split('/')[0]
        if '/' in r: crumbs.append((sec.capitalize(), ORIGIN + "/" + sec + "/"))
        crumbs.append((title.split(' · ')[0] if '/' in r else sec.capitalize(), url))
        bc = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
              {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)]}
        ld = [x for x in (ld, bc) if x]
    return url, title, desc, img, ld

def apply_head(s, url, title, desc, img, ld, hero=None):
    def rep(pat, val):
        nonlocal s
        s2, n = re.subn(pat, lambda mm: mm.group(1) + esc(val) + mm.group(2), s, count=1)
        assert n == 1, pat
        s = s2
    rep(r'(<title>)[^<]*(</title>)', title)
    rep(r'(<meta name="description" content=")[^"]*(">)', desc)
    rep(r'(<link rel="canonical" href=")[^"]*(">)', url)
    rep(r'(<meta property="og:url" content=")[^"]*(">)', url)
    rep(r'(<meta property="og:title" content=")[^"]*(">)', title)
    rep(r'(<meta property="og:description" content=")[^"]*(">)', desc)
    rep(r'(<meta name="twitter:title" content=")[^"]*(">)', title)
    rep(r'(<meta name="twitter:description" content=")[^"]*(">)', desc)
    extra = '<meta property="og:image" content="%s">\n<meta property="og:image:alt" content="%s">\n<meta name="twitter:image" content="%s">\n' % (esc(img), esc(title), esc(img))
    if hero and hero.get('src'):
        # the first big picture starts downloading while the page is still arriving
        extra += '<link rel="preload" as="image" href="%s"%s fetchpriority="high">\n' % (esc(hero['src']), (' imagesrcset="%s" imagesizes="%s"' % (esc(hero['srcset']), esc(hero['sizes'] or '100vw'))) if hero.get('srcset') else '')
    if ld: extra += '<script type="application/ld+json">%s</script>\n' % json.dumps(ld, ensure_ascii=False).replace('</', '<\\/')
    return s.replace('<meta name="twitter:card"', extra + '<meta name="twitter:card"', 1)

def main():
    live = page_html(BASE)
    routes, meta = collect(page_html('/'))
    written = []
    for r in routes:
        url, title, desc, img, ld = head_for(r, meta[r])
        out = apply_head(live, url, title, desc, img, ld, meta[r].get('hero'))
        # the page's own text goes into the HTML, so link previews, AI assistants and crawlers that do not run scripts read the real page; the script redraws it on load
        assert out.count('<main id="main"></main>') == 1
        out = out.replace('<main id="main"></main>', '<main id="main">' + meta[r]['main'] + '</main>')
        d = os.path.join(REPO, r) if r else REPO
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(out); written.append(r)
    # unknown addresses, and links from the old site, find their way
    legacy = ("<script>(function(){var B=%s,p=location.pathname.slice(B.length).replace(/\\/+$/,'').split('/');"
              "var to=null;if(/^(works?|projects?)$/.test(p[0]))to='work/';else if(/^(blog|blog-posts|journal|news|ob-zine)$/.test(p[0]))to='news/';"
              "else if(p[0]==='contact')to='contact/';else if(p[0]==='about'||p[0]==='studio')to='about/';"
              "if(to!==null){location.replace(B+to);return}"
              "history.replaceState(null,'',B)})();</script>\n") % json.dumps(BASE)
    nf = apply_head(live, ORIGIN + '/', 'Page not found · The Observatory', meta['']['desc'], DEFAULT_IMG, None)
    nf = nf.replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex">')
    nf = nf.replace('<meta charset="utf-8">\n', '<meta charset="utf-8">\n' + legacy, 1)
    open(os.path.join(REPO, '404.html'), 'w', encoding='utf-8').write(nf)
    today = datetime.date.today().isoformat()
    pri = lambda r: '1.0' if r == '' else '0.8' if r in ('work', 'about', 'contact', 'news') else '0.7' if r.startswith('work/') else '0.5'
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    for r in routes:
        im = re.sub(r'^https://www\.theobservatory\.je/+', ORIGIN + '/', meta[r]['img'] or DEFAULT_IMG)
        sm.append('  <url><loc>%s/%s</loc><lastmod>%s</lastmod><priority>%s</priority><image:image><image:loc>%s</image:loc></image:image></url>' % (ORIGIN, r + '/' if r else '', today, pri(r), html.escape(im)))
    sm.append('</urlset>')
    open(os.path.join(REPO, 'sitemap.xml'), 'w').write('\n'.join(sm) + '\n')
    rb = 'User-agent: *\nDisallow: /\n' if PREVIEW else ('User-agent: *\nAllow: /\nDisallow: /site-src/\nDisallow: /source/\nDisallow: /greatideas/\nDisallow: /originalthinking/\nDisallow: /overview/\n\nSitemap: %s/sitemap.xml\n' % ORIGIN)
    open(os.path.join(REPO, 'robots.txt'), 'w').write(rb)
    # pages that no longer exist in the CMS are removed
    keep = set(r for r in routes if '/' in r)
    for sec in ('work', 'news'):
        d = os.path.join(REPO, sec)
        for name in os.listdir(d):
            pth = os.path.join(d, name)
            if os.path.isdir(pth) and sec + '/' + name not in keep and os.path.exists(os.path.join(pth, 'index.html')):
                shutil.rmtree(pth)
    print('pages', len(written), 'base', BASE, 'preview' if PREVIEW else 'live')

main()
