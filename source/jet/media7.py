"""Media check for the JET page: every frame sized, every image loaded, both films playing, the timeline moving,
across screen sizes and devices, with less motion, without IntersectionObserver, and with autoplay held back."""
import sys
from playwright.sync_api import sync_playwright

URL = sys.argv[1]

PROBE = '''() => {
  const boxes = [...document.querySelectorAll('.j-ph, .j-ref-m')].map(b => {
    const r = b.getBoundingClientRect();
    const fig = b.classList.contains('j-ph') ? b : b.closest('.j-ref');
    const pt = parseFloat(getComputedStyle(fig).getPropertyValue('--pt')) || 0;
    return {n: fig.getAttribute('data-ph'), w: r.width, h: r.height, want: r.width * pt / 100};
  });
  const bad = boxes.filter(b => b.h < 20 || Math.abs(b.h - b.want) > 2).map(b => b.n + ':' + Math.round(b.w) + 'x' + Math.round(b.h));
  const imgs = [...document.querySelectorAll('#look img')];
  const notLoaded = imgs.filter(i => !(i.complete && i.naturalWidth > 0)).map(i => (i.closest('[data-ph]') || {}).getAttribute ? i.closest('[data-ph]').getAttribute('data-ph') : '?');
  const hidden = [...document.querySelectorAll('#look figure')].filter(f => parseFloat(getComputedStyle(f).opacity) < .99).map(f => f.getAttribute('data-ph'));
  const p = document.querySelector('[data-ph="01"]').getBoundingClientRect();
  return {frames: boxes.length, badFrames: bad, imgs: imgs.length, notLoaded, hidden, poly: Math.round(p.width) + 'x' + Math.round(p.height) + ' ratio ' + (p.height / p.width).toFixed(4),
          sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth};
}'''


def walk(pg, sel='#look'):
    top = pg.evaluate("s => document.querySelector(s).getBoundingClientRect().top + scrollY", sel)
    hgt = pg.evaluate("s => document.querySelector(s).getBoundingClientRect().height", sel)
    vh = pg.evaluate('innerHeight')
    y = top - vh
    while y < top + hgt:
        pg.evaluate('y => window.scrollTo(0, y)', y)
        pg.wait_for_timeout(160)
        y += vh * 0.6
    pg.wait_for_timeout(900)


def films(pg, k_list=(0, 1), wait=1800):
    out = []
    for k in k_list:
        pg.evaluate("k => document.querySelectorAll('video.j-vid')[k].scrollIntoView({block: 'center'})", k)
        pg.wait_for_timeout(wait)
        out.append(pg.evaluate("k => { const v = document.querySelectorAll('video.j-vid')[k]; return (v.paused ? 'paused' : 'playing') + (v.controls ? '+controls' : '') + ' t=' + v.currentTime.toFixed(1) }", k))
    return out


def timeline(pg):
    top = pg.evaluate("() => document.getElementById('tlRows').getBoundingClientRect().top + scrollY")
    hgt = pg.evaluate("() => document.getElementById('tlRows').getBoundingClientRect().height")
    vh = pg.evaluate('innerHeight')
    pg.evaluate('y => window.scrollTo(0, y)', top - vh * .55 + .4 * hgt)
    pg.wait_for_timeout(500)
    return pg.evaluate("() => ({live: !!document.querySelector('.jt-live'), month: document.getElementById('jtMo').textContent, fill: document.getElementById('jtFill').style.transform, on: document.querySelectorAll('.tl-row.is-on').length})")


def run(b, label, ctx_args, init=None, click=False):
    ctx = b.new_context(**ctx_args)
    if init:
        ctx.add_init_script(init)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:120]))
    pg.on('response', lambda r: errs.append('%d %s' % (r.status, r.url.split('/')[-1])) if r.status >= 400 and not r.url.endswith('favicon.ico') else None)
    pg.goto(URL, wait_until='networkidle')
    pg.wait_for_timeout(1200)
    walk(pg)
    probe = pg.evaluate(PROBE)
    f = films(pg)
    if click:
        pg.mouse.click(5, 300)
        pg.wait_for_timeout(1500)
        f.append('after a tap: ' + pg.evaluate("() => { const v = document.querySelectorAll('video.j-vid')[1]; return v.paused ? 'paused' : 'playing' }"))
    t = timeline(pg)
    ok = not probe['badFrames'] and not probe['notLoaded'] and not probe['hidden'] and probe['sw'] <= probe['cw'] and not errs
    print('%-34s %s | frames %d, images %d loaded %d | polytunnel %s | films %s | timeline %s | %s' % (
        label, 'OK ' if ok else 'CHECK', probe['frames'], probe['imgs'], probe['imgs'] - len(probe['notLoaded']), probe['poly'], f,
        ('live, ' + t['month'] + ', ' + str(t['on']) + ' stages lit') if t['live'] else 'still (full plan)',
        ('issues: ' + str({k: probe[k] for k in ('badFrames', 'notLoaded', 'hidden') if probe[k]}) + ' ' + str(errs)) if not ok else 'no errors'))
    ctx.close()


with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
    for w, h in ((1440, 900), (1180, 820), (960, 900)):
        run(b, 'desktop %dx%d' % (w, h), {'viewport': {'width': w, 'height': h}})
    run(b, 'desktop 1440, retina', {'viewport': {'width': 1440, 'height': 900}, 'device_scale_factor': 2})
    for dev in ('iPad (gen 7)', 'iPhone 13', 'iPhone SE', 'Pixel 7', 'Galaxy S9+'):
        run(b, dev, dict(pw.devices[dev]))
    run(b, 'less motion (reduced)', {'viewport': {'width': 1440, 'height': 900}, 'reduced_motion': 'reduce'})
    run(b, 'no IntersectionObserver', {'viewport': {'width': 1440, 'height': 900}}, init='delete window.IntersectionObserver;')
    b.close()
    b = pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--autoplay-policy=user-gesture-required'])
    run(b, 'autoplay held back (low power)', dict(pw.devices['iPhone 13']), click=True)
    b.close()
