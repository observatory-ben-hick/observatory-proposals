import sys, re, io, json
from playwright.sync_api import sync_playwright
page_path, data_path = sys.argv[1], sys.argv[2]
D = json.load(io.open(data_path, encoding='utf-8'))
want = [D['headline'], D['meta']] + D['intro']
for s in D['sections']:
    want.append('%s /' % s['num'])
    want.append(s['title'])
    for p in s['parts']:
        t = p['type']
        if t == 'lead':
            want += [p['text']] + ([p['sub']] if p.get('sub') else [])
        elif t == 'blocks':
            for b in p['blocks']:
                want += [b['h']] + b['p'] + [x['v'] for x in b.get('stats', [])] + [x['l'] for x in b.get('stats', [])]
                for x in b.get('ideas', []):
                    want += [x['k'], x['t']] + ([x['tag']] if x.get('tag') else [])
        elif t == 'caps':
            want += p['items']
        elif t == 'steps':
            want += [x for i in p['items'] for x in (i['h'], i['t'])]
        elif t == 'look':
            for g in p['groups']:
                want += [g['h'], g['t']] + [x['note'] for x in g['slots'] if x.get('note')]
        elif t == 'timeline':
            want += [p['lead'], p['note']] + [x for r in p['rows'] for x in (r['name'], r['when'], r['what'])]
        elif t == 'big':
            want.append(p['text'])
        elif t == 'figure':
            want += [p['value'], p['unit'], p['label']]
        elif t == 'small':
            want.append(p['text'])
norm = lambda x: re.sub(r'\s+', ' ', x).strip()
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for w in (1440, 1180, 960, 390):
        pg = b.new_page(viewport={'width': w, 'height': 820}, reduced_motion='reduce'); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        pg.goto('file://' + page_path, wait_until='load'); pg.wait_for_timeout(900)
        r = pg.evaluate('''() => { const n = document.querySelector('nav'); const nr = n.getBoundingClientRect();
          const vis = [...document.querySelectorAll('nav a')].filter(a => a.offsetParent && a.textContent.trim());
          const over = vis.some(a => { const r = a.getBoundingClientRect(); return r.right > nr.right + 1 || r.top > nr.top + 40; });
          const secs = [...document.querySelectorAll('main > section')].filter(s => s.offsetParent && s.getBoundingClientRect().height > 0).map(s => s.id);
          const meta = [...document.querySelectorAll('.hero-meta > *')].filter(x => x.offsetParent).map(x => x.textContent.trim()).join(' | ');
          const phs = [...document.querySelectorAll('[data-ph]')].map(f => (f.querySelector('.j-ph-n') ? f.querySelector('.j-ph-n').textContent : f.getAttribute('data-ph') + '(image)') + ':' + Math.round(f.getBoundingClientRect().width) + 'x' + Math.round(f.getBoundingClientRect().height));
          const wide = [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > document.documentElement.clientWidth + 1; }).slice(0, 5).map(e => e.className || e.tagName);
          return {sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, nav: vis.map(a => a.textContent.trim()).join(' | '), over, secs: secs.join(', '), meta, phs: phs.join(' '), wide, live: !!document.querySelector('.jt-live'), text: document.body.innerText}; }''')
        print(w, '| scrollWidth', r['sw'], '/', r['cw'], '| nav overflow', r['over'], '| errors', errs, '| timeline live (reduced motion)', r['live'])
        if r['wide']: print('   wider than the page:', r['wide'])
        print('   meta row:', r['meta'])
        if w in (1440, 960, 390): print('   nav:', r['nav'])
        if w in (1440, 390): print('   placeholders:', r['phs'])
        if w == 1440:
            print('   sections:', r['secs'])
            t = norm(r['text']); miss = [x for x in want if norm(x) not in t]
            print('   copy strings found: %d of %d' % (len(want) - len(miss), len(want)))
            for m in miss: print('   MISSING:', m[:100])
            low = t.lower()
            print('   title repeats in page text:', low.count('the observatory × jet'))
            for old in ['prepared for', 'what you get', 'questions for friday', 'creativity first', 'ten boards']:
                if old in low: print('   check leftover:', repr(old), '->', t[max(0, low.index(old) - 50): low.index(old) + 50])
        pg.close()
    # the timeline moving: full motion, scroll through it and sample the ruler and rows
    for w, h in ((1440, 900), (390, 844)):
        pg = b.new_page(viewport={'width': w, 'height': h}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + page_path, wait_until='load'); pg.wait_for_timeout(700)
        top = pg.evaluate("() => document.getElementById('tlRows').getBoundingClientRect().top + scrollY")
        hgt = pg.evaluate("() => document.getElementById('tlRows').getBoundingClientRect().height")
        out = []
        for f in (-0.2, 0.0, 0.15, 0.35, 0.55, 0.75, 1.0, 1.2):
            y = top - h * .55 + f * hgt
            pg.evaluate('y => window.scrollTo(0, y)', y); pg.wait_for_timeout(250)
            s = pg.evaluate('''() => { const rows = [...document.querySelectorAll('.tl-row')];
              const r = document.querySelector('.jt-ruler').getBoundingClientRect();
              return {mo: document.getElementById('jtMo').textContent, fill: document.getElementById('jtFill').style.transform,
                on: rows.filter(x => x.classList.contains('is-on')).length, done: rows.filter(x => x.classList.contains('is-done')).length,
                next: rows.filter(x => x.classList.contains('is-next')).length, rulerTop: Math.round(r.top)}; }''')
            out.append('%5.2f %-15s %-18s on %2d done %2d next %2d ruler@%d' % (f, s['mo'], s['fill'], s['on'], s['done'], s['next'], s['rulerTop']))
        print('motion', w, 'errors', errs, '| rows height', round(hgt))
        for o in out: print('   ', o)
        pg.close()
    b.close()
