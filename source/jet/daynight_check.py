import sys
from playwright.sync_api import sync_playwright
URL, OUT = sys.argv[1], sys.argv[2]
def state(pg):
    return pg.evaluate("""() => { const f = document.querySelector('[data-ph="01"]'), d = f.querySelector('.j-day'), n = f.querySelector('img:not(.j-day)');
      const r = f.getBoundingClientRect();
      return {top: Math.round(r.top), vh: innerHeight, day: +getComputedStyle(d).opacity, live: document.documentElement.classList.contains('dn-live'),
              loaded: [n, d].every(i => i.complete && i.naturalWidth > 0), cur: d.currentSrc.split('/').pop()}; }""")
def put(pg, top):  # scroll so the picture's top sits at this many pixels from the top of the screen
    y = pg.evaluate("t => document.querySelector('[data-ph=\"01\"]').getBoundingClientRect().top + scrollY - t", top)
    pg.evaluate("y => window.scrollTo({top: y, behavior: 'instant'})", y); pg.wait_for_timeout(350)
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    cases = [('desktop 1440x900', {'viewport': {'width': 1440, 'height': 900}}), ('desktop 1180x820', {'viewport': {'width': 1180, 'height': 820}}),
             ('iPad (gen 7)', dict(pw.devices['iPad (gen 7)'])), ('iPhone 13', dict(pw.devices['iPhone 13'])), ('iPhone SE', dict(pw.devices['iPhone SE'])),
             ('less motion', {'viewport': {'width': 1440, 'height': 900}, 'reduced_motion': 'reduce'})]
    for label, args in cases:
        ctx = b.new_context(**args); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:100]))
        pg.goto(URL, wait_until='networkidle'); pg.wait_for_timeout(800)
        vh = pg.evaluate('innerHeight'); h = pg.evaluate("() => document.querySelector('[data-ph=\"01\"]').getBoundingClientRect().height")
        out = []
        for name, top in (('entering', vh * .9), ('all in view', vh - h), ('rising', (vh - h + vh * .5 - h / 2) / 2), ('centred', vh * .5 - h / 2), ('above centre', vh * .4 - h / 2), ('leaving', -h * .5)):
            put(pg, top); s = state(pg); out.append('%s %.2f' % (name, s['day']))
        s = state(pg)
        print('%-18s live %-5s loaded %-5s %s | day opacity: %s %s' % (label, s['live'], s['loaded'], s['cur'], ', '.join(out), errs if errs else ''))
        if label == 'desktop 1440x900':
            pg.evaluate("() => document.querySelectorAll('.rv').forEach(e => e.classList.add('in'))")
            for name, top in (('day', vh * .85), ('dusk', (vh * .85 + vh * .4 - h / 2) / 2), ('night', vh * .4 - h / 2)):
                put(pg, top); pg.wait_for_timeout(300)
                pg.locator('[data-ph="01"]').screenshot(path='%s/poly-%s.png' % (OUT, name))
        ctx.close()
    b.close()
