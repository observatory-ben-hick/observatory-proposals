"""THE OBSERVATORY × JET, v7: pared back, with a first look and a timeline that moves.

All copy lives in copy7.json. This script
  config: fills config-jet7.tpl.js (headline, meta line, opening paragraphs)
  post:   adds the numbered sections, the placeholders, the moving timeline, styles and script to the master build
  md:     writes the same copy as a readable markdown doc

usage:
  python3 -I jet7_post.py config <copy7.json> <template.js> <out-config.js>
  python3 -I jet7_post.py post   <copy7.json> <built index.html> <out index.html>
  python3 -I jet7_post.py md     <copy7.json> <out.md>
"""
import sys, io, html, json, re, datetime as dt

mode, data_path = sys.argv[1], sys.argv[2]
D = json.load(io.open(data_path, encoding='utf-8'))


def e(s):
    return html.escape(s, quote=False)


def a(s):
    return html.escape(s, quote=True)


def js(s):
    return json.dumps(s, ensure_ascii=False)


def parts(kind):
    return [p for s in D['sections'] for p in s['parts'] if p['type'] == kind]


# ------------------------------------------------------------------ config
if mode == 'config':
    tpl, out = sys.argv[3], sys.argv[4]
    c = io.open(tpl, encoding='utf-8').read()
    c = c.replace('{{HEADLINE}}', js(D['headline'])).replace('{{META}}', js(D['meta']))
    c = c.replace('{{INTRO}}', ', '.join(js(p) for p in D['intro']))
    assert not re.search(r'\{\{(HEADLINE|META|INTRO)\}\}', c)
    io.open(out, 'w', encoding='utf-8').write(c)
    print('config written')
    sys.exit(0)

# ------------------------------------------------------------------ markdown copy doc
if mode == 'md':
    out = sys.argv[3]
    m = ['# %s' % D['title'], '', '## %s' % D['headline'], '', D['meta'], '']
    m += [p + '\n' for p in D['intro']]
    for s in D['sections']:
        m += ['---', '', '## %s / %s' % (s['num'], s['title']), '']
        for p in s['parts']:
            t = p['type']
            if t == 'lead':
                m += [p['text'] + '\n'] + ([p['sub'] + '\n'] if p.get('sub') else [])
            elif t == 'blocks':
                for b in p['blocks']:
                    m += ['### %s' % b['h'], ''] + [x + '\n' for x in b['p']]
                    if b.get('stats'):
                        m += ['  ·  '.join('%s: %s' % (x['v'], x['l']) for x in b['stats']) + '\n']
                    for i, x in enumerate(b.get('ideas', []), 1):
                        m += ['%02d. %s%s: %s' % (i, x['k'], ' (%s)' % x['tag'] if x.get('tag') else '', x['t'])]
                    if b.get('ideas'):
                        m += ['']
            elif t == 'caps':
                m += [' · '.join(p['items']) + '\n']
            elif t == 'steps':
                m += ['%02d. %s. %s' % (i, x['h'], x['t']) for i, x in enumerate(p['items'], 1)] + ['']
            elif t == 'look':
                for g in p['groups']:
                    m += ['### %s' % g['h'], '', g['t'], '']
                    for x in g['slots']:
                        if not x.get('src'):
                            m.append('- Placeholder %s: %s' % (x['n'], x['label']))
                            continue
                        line = '- %s: %s, %s in place (%s)' % (x['n'], x['label'], 'film' if x.get('video') else 'image', x['src'].split('/')[-1])
                        if x.get('note'):
                            line += ', marked "%s"' % x['note']
                        if x.get('desc'):
                            line += '. ' + x['desc']
                        m.append(line)
                    m += ['']
            elif t == 'timeline':
                m += [p['lead'], '', '| Stage | When | What |', '|---|---|---|']
                m += ['| %s | %s | %s |' % (r['name'], r['when'], r['what']) for r in p['rows']]
                m += ['', p['note'], '']
            elif t == 'big':
                m += [p['text'], '']
            elif t == 'figure':
                m += ['%s %s' % (p['value'], p['unit']), '', p['label'], '']
            elif t == 'small':
                m += [p['text'], '']
    io.open(out, 'w', encoding='utf-8').write('\n'.join(m).rstrip() + '\n')
    print('markdown written')
    sys.exit(0)

# ------------------------------------------------------------------ post
src, out = sys.argv[3], sys.argv[4]
page = io.open(src, encoding='utf-8').read()


def swap(old, new, count=1):
    global page
    k = page.count(old)
    assert k == count, (k, old[:140])
    page = page.replace(old, new)


# the row under the wordmark: no second title (the nav carries it), then the meta line
swap('<span>The Observatory × <span data-t="short"></span></span>\n    <span id="heroKind"></span>',
     '<span hidden></span>\n    <span id="heroKind"></span>')
swap('<span>Prepared for <span data-t="preparedFor"></span></span>', '<span>' + e(D['meta']) + '</span>')

# nav: one link for each section that has a nav label
navs = [(s['id'], s['nav']) for s in D['sections'] if s.get('nav')]
swap('''    <a href="#offer">What you get</a>
    <a href="#days" data-sec="plan"></a>
    <a href="#concept" data-sec="concept"></a>
    <a href="#levels">Levels</a>''',
     '\n'.join('    <a href="#%s"%s>%s</a>' % (sid, ' class="nv-x"' if len(label) > 18 else '', e(label)) for sid, label in navs))

# the master's own sections this page doesn't use
swap('<section class="wrap sec" id="levels">', '<section class="wrap sec" id="levels" data-sec="levels">')
swap('<section class="wrap sec" id="offer">', '<section class="wrap sec" id="offer" data-sec="offer">')
swap('<span class="lab">Next step</span><p class="lead" id="ctaline">', '<span class="lab">Contact</span><p class="lead" id="ctaline">')

# ---------- timeline geometry ----------
TL = parts('timeline')[0]
w0, w1 = [dt.date.fromisoformat(x) for x in TL['window']]
span = (w1 - w0).days


def fr(d):
    if isinstance(d, str):
        d = dt.date.fromisoformat(d)
    return (d - w0).days / span


def pc(x):
    return '%.3f%%' % (100.0 * x)


months = []
d = w0
while d < w1:
    nxt = dt.date(d.year + (d.month == 12), d.month % 12 + 1, 1)
    months.append(d)
    d = nxt
edges = [100.0 * fr(m) for m in months[1:]]
track_bg = ','.join('linear-gradient(90deg,transparent calc(%.3f%% - .5px),var(--rule) calc(%.3f%% - .5px),var(--rule) calc(%.3f%% + .5px),transparent calc(%.3f%% + .5px))'
                    % (x, x, x, x) for x in edges)

ticks = []
d = w0 + dt.timedelta(days=(7 - w0.weekday()) % 7)   # the first Monday
while d < w1:
    if d.day != 1:
        ticks.append('<i class="jt-tk" style="left:%s"></i>' % pc(fr(d)))
    d += dt.timedelta(days=7)
ticks += ['<i class="jt-tk m" style="left:%s"></i>' % pc(fr(m)) for m in months]
MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
first_label = '%s %d to %s %d' % (MONTH[months[0].month - 1], months[0].year, MONTH[months[-1].month - 1], months[-1].year)


def bars(r):
    k = r['kind']
    if k == 'dot':
        s = fr(r['start'])
        return '<span class="tl-dot" data-s="%.4f" style="left:%s"></span>' % (s, pc(s))
    s = fr(r['start'])
    t = 1.0 if k in ('on', 'ahead') else fr(r['end'])
    out = '<span class="tl-bar tl-%s" data-s="%.4f" data-e="%.4f" style="left:%s;width:%s"><i></i></span>' % (k, s, t, pc(s), pc(t - s))
    if r.get('dot'):
        out += '<span class="tl-dot" data-s="%.4f" style="left:%s"></span>' % (fr(r['dot']), pc(fr(r['dot'])))
    return out


def row_span(r):
    s = fr(r['start'])
    if r['kind'] == 'dot':
        return s, s + 7.0 / span
    if r['kind'] in ('on', 'ahead'):
        return s, 1.01   # ongoing work stays lit once the reader reaches the end
    return s, fr(r['end'])


def timeline(p):
    ruler = ('<div class="jt-ruler" aria-hidden="true"><p class="jt-day"><span id="jtMo">%s</span></p>'
             '<div class="jt-track"><div class="jt-ticks">%s</div><div class="jt-fill" id="jtFill"></div><div class="jt-head" id="jtHead"></div>%s</div></div>'
             % (e(first_label), ''.join(ticks),
                ''.join('<span class="jt-ph" data-m="%d-%d" style="left:%s">%s</span>' % (m.year, m.month - 1, pc(fr(m)), m.strftime('%b')) for m in months)))
    rows = ''.join('<li class="tl-row%s" data-s="%.4f" data-e="%.4f"><div class="tl-lab"><p class="tl-n">%s</p>'
                   '<p class="tl-w"><span class="tl-when">%s</span><span class="tl-sep" aria-hidden="true"> · </span><span class="tl-what">%s</span></p></div>'
                   '<div class="tl-track" aria-hidden="true">%s</div></li>'
                   % ((' tl-first' if r['kind'] == 'now' else ''), row_span(r)[0], row_span(r)[1], e(r['name']), e(r['when']), e(r['what']), bars(r))
                   for r in p['rows'])
    return ('  <div class="grid j-lr"><p class="j-lead rv">%s</p></div>\n'
            '  <div class="jt" id="jt">%s\n  <div class="tl-body"><ol class="tl-rows" id="tlRows">%s</ol>'
            '<div class="tl-play" aria-hidden="true"><div class="tl-play-col"><i id="tlPlay"></i></div></div>%s</div></div>\n'
            '  <div class="grid j-end"><p class="j-note rv">%s</p></div>\n'
            % (e(p['lead']), ruler, rows,
               ('<div class="tl-ms" aria-hidden="true"><div class="tl-ms-col"><i style="left:%s"></i></div></div>' % pc(fr(p['milestone']['date']))) if p.get('milestone') else '',
               e(p['note'])))


# ---------- section builders ----------
def sec_open(s):
    return ('<section class="wrap sec j7" id="%s">\n  <div class="sec-head"><span class="idx j-n">%s /</span></div>\n'
            '  <h2 class="h1 j-title" data-split>%s</h2>\n' % (s['id'], e(s['num']), e(s['title'])))


def lead(p):
    return ('  <div class="grid j-lr"><p class="j-lead rv">%s</p>%s</div>\n'
            % (e(p['text']), '<p class="j-sub rv">%s</p>' % e(p['sub']) if p.get('sub') else ''))


def stats(b):
    return ('<div class="j-stats rv">%s</div>' % ''.join(
        '<div class="j-stat%s"><p class="j-sv num">%s</p><p class="j-sl">%s</p></div>' % (' acc' if x.get('accent') else '', e(x['v']), e(x['l']))
        for x in b['stats']))


def ideas(b):
    out = []
    for i, x in enumerate(b['ideas'], 1):
        tag = '<span class="j-tag"><i aria-hidden="true"></i>%s</span>' % e(x['tag']) if x.get('tag') else ''
        out.append('<li class="j-idea rv%s" style="--d:%d"><p class="j-im"><span class="num">%02d</span>%s</p><p class="j-ik">%s</p><p class="j-it">%s</p></li>'
                   % (' has-tag' if tag else '', (i - 1) % 3, i, tag, e(x['k']), e(x['t'])))
    return '<ol class="j-ideas">%s</ol>' % ''.join(out)


def block(b):
    body = ''.join('<p>%s</p>' % e(x) for x in b['p'])
    extra = (stats(b) if b.get('stats') else '') + (ideas(b) if b.get('ideas') else '')
    return ('    <article class="j-b%s"><h3 class="j-h rv">%s</h3><div class="j-c rv">%s</div>%s</article>\n'
            % (' has-stats' if b.get('stats') else '', e(b['h']), body, extra))


def caps(p):
    return '  <ul class="j-caps">%s</ul>\n' % ''.join('<li class="rv" style="--d:%d">%s</li>' % (i % 7, e(c)) for i, c in enumerate(p['items']))


def steps(p):
    return '  <ol class="j-steps">%s</ol>\n' % ''.join(
        '<li class="j-step rv" style="--d:%d"><span class="num">%02d</span><p class="j-sh">%s</p><p class="j-st">%s</p></li>' % ((i - 1) % 4, i, e(x['h']), e(x['t']))
        for i, x in enumerate(p['items'], 1))


def pad(ar):
    s = str(ar)
    w, h = [float(v) for v in s.split('/')] if '/' in s else (float(s), 1.0)
    return 100.0 * h / w


def slot(i, x):
    if x.get('src'):
        srcset = (' srcset="%s 1400w, %s %dw" sizes="(max-width: 800px) 100vw, 94vw"' % (a(x['src_small']), a(x['src']), x['w'])) if x.get('src_small') else ''
        chip = x.get('note_style') == 'chip'
        note = '<figcaption class="j-ph-note%s">%s</figcaption>' % (' chip' if chip else '', e(x['note'])) if x.get('note') else ''
        # a daytime version of the same frame, laid over the night scene and faded out as the reader scrolls past
        day = ''
        if x.get('day'):
            d = x['day']
            dset = (' srcset="%s 1400w, %s %dw" sizes="(max-width: 800px) 100vw, 94vw"' % (a(d['src_small']), a(d['src']), x['w'])) if d.get('src_small') else ''
            day = '<img class="j-day" src="%s"%s width="%d" height="%d" alt="" aria-hidden="true" decoding="async">' % (a(d['src']), dset, x['w'], x['h'])
        return ('<figure class="j-ph has-img%s%s rv" style="--d:%d;--pt:%.4f%%" data-ph="%s"><img src="%s"%s width="%d" height="%d" alt="%s">%s%s</figure>'
                % (' light' if chip else '', ' j-dn' if day else '', i % 4, pad(x.get('ar', '4/3')), a(x['n']), a(x['src']), srcset, x['w'], x['h'], a(x['alt']), day, note))
    return ('<figure class="j-ph rv" style="--d:%d" data-ph="%s" role="img" aria-label="%s"><span class="j-ph-n num" aria-hidden="true">%s</span>'
            '<figcaption class="j-ph-c" aria-hidden="true">%s</figcaption></figure>'
            % (i % 4, a(x['n']), a('Image %s, %s, to follow' % (x['n'], x['label'].lower())), e(x['n']), e(x['label'])))


def ref_item(x, frac, i):
    ar = x['w'] / x['h']
    if x.get('video'):
        media = ('<video class="j-vid" muted loop playsinline webkit-playsinline preload="none" poster="%s" aria-label="%s"><source src="%s" type="video/mp4"></video>'
                 % (a(x['poster']), a(x['alt']), a(x['src'])))
    else:
        srcset = (' srcset="%s 1000w, %s %dw" sizes="(max-width: 640px) 92vw, %dvw"' % (a(x['src_small']), a(x['src']), x['w'], max(8, round(frac * 94))))\
            if x.get('src_small') else ''
        media = '<img src="%s"%s width="%d" height="%d" alt="%s" loading="lazy" decoding="async">' % (a(x['src']), srcset, x['w'], x['h'], a(x['alt']))
    cap = '<figcaption class="j-ref-c"><span class="num">%s</span>%s</figcaption>' % (e(x['n']), '<span class="j-ref-d">%s</span>' % e(x['desc']) if x.get('desc') else '')
    return ('<figure class="j-ref rv" style="--ar:%.4f;--d:%d;--pt:%.4f%%" data-ph="%s"><div class="j-ref-m">%s</div>%s</figure>'
            % (ar, i, 100.0 * x['h'] / x['w'], a(x['n']), media, cap))


def refs(g):
    by = {x['n']: x for x in g['slots']}
    placed = [n for fam in g['families'] for row in fam for n in row]
    assert sorted(placed) == sorted(by) and len(placed) == len(set(placed)), 'every reference placed exactly once'
    fams = []
    for fam in g['families']:
        rows = []
        for row in fam:
            tot = sum(by[n]['w'] / by[n]['h'] for n in row)
            rows.append('<div class="j-row">%s</div>' % ''.join(ref_item(by[n], (by[n]['w'] / by[n]['h']) / tot, i) for i, n in enumerate(row)))
        fams.append('<div class="j-fam">%s</div>' % ''.join(rows))
    return '<div class="j-refs">%s</div>' % ''.join(fams)


def look(p):
    out = ['  <div class="j-look">']
    for g in p['groups']:
        ns = [x['n'] for x in g['slots']]
        body = refs(g) if g['layout'] == 'refs' else '<div class="j-phs j-l-%s">%s</div>' % (g['layout'], ''.join(slot(i, x) for i, x in enumerate(g['slots'])))
        rng = ns[0] if len(ns) == 1 else '%s to %s' % (ns[0], ns[-1])
        out.append('    <div class="j-group"><div class="j-gh"><p class="j-gn num">%s</p><h3 class="j-gt-h rv">%s</h3><p class="j-gt rv">%s</p></div>%s</div>'
                   % (e(rng), e(g['h']), e(g['t']), body))
    out.append('  </div>\n')
    return '\n'.join(out)


BUILD = {'lead': lead, 'caps': caps, 'steps': steps, 'look': look, 'timeline': timeline,
         'blocks': lambda p: '  <div class="j-blocks">\n' + ''.join(block(b) for b in p['blocks']) + '  </div>\n',
         'big': lambda p: '  <div class="grid"><p class="j-big rv">%s</p></div>\n' % e(p['text']),
         'figure': lambda p: ('  <div class="grid j-figrow"><p class="j-fv rv"><span class="num">%s</span><span class="j-fu">%s</span></p><p class="j-fl rv">%s</p></div>\n'
                              % (e(p['value']), e(p['unit']), e(p['label']))),
         'small': lambda p: '  <div class="grid j-end"><p class="j-small rv">%s</p></div>\n' % e(p['text'])}

secs = []
for s in D['sections']:
    secs.append(sec_open(s) + ''.join(BUILD[p['type']](p) for p in s['parts']) + '</section>\n')

band = '<div class="band" aria-hidden="true"><img src="assets/aerial.jpg" alt="" loading="lazy" data-par=".1"></div>\n'
swap(band, band + '\n' + '\n'.join(secs))

css = '''
/* JET v7: pared back. Smaller body copy, a first look, and a timeline that moves with the reader */
#intro .st-copy .lead{font-size:clamp(20px,2.2vw,35px);line-height:1.16;letter-spacing:-.014em}
.j7 .sec-head{margin-bottom:clamp(18px,2.2vw,34px)}
.j-title{margin-bottom:clamp(30px,4.4vw,72px)}
.j-lr{align-items:end;row-gap:18px;margin-bottom:clamp(30px,4vw,64px)}
.j-lead{grid-column:1/span 8;font-family:var(--display);font-size:clamp(24px,2.8vw,46px);line-height:1.08;letter-spacing:-.018em;text-wrap:balance}
.j-sub{grid-column:9/span 4;font-size:clamp(14px,1.02vw,16px);line-height:1.5;max-width:30em;text-wrap:pretty}
.j-blocks{border-top:1px solid var(--ink)}
.j-b{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--g);row-gap:16px;padding:clamp(20px,2.4vw,36px) 0;border-bottom:1px solid var(--rule);align-items:start}
.j-b:last-child{border-bottom:0}
.j-h{grid-column:1/span 5;font-size:clamp(18px,1.7vw,27px);line-height:1.04;letter-spacing:-.01em;text-wrap:balance}
.j-c{grid-column:7/span 6;display:flex;flex-direction:column;gap:.8em;font-size:clamp(14px,1.02vw,16px);line-height:1.5;min-width:0}
.j-c p{max-width:36em;text-wrap:pretty}
/* the pepper */
.j-stats{grid-column:7/span 6;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:var(--g);margin-top:6px}
.j-stat{border-top:1px solid var(--ink);padding-top:10px;min-width:0}
.j-sv{font-family:var(--display);font-size:clamp(40px,4.6vw,76px);line-height:.92;letter-spacing:-.03em}
.j-sl{font-size:13px;line-height:1.3;margin-top:8px;max-width:14em}
.j-stat.acc .j-sv{color:var(--accent)}
/* ideas */
.j-ideas{grid-column:1/-1;list-style:none;margin:clamp(18px,2.4vw,36px) 0 0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:var(--g);row-gap:clamp(24px,2.6vw,40px)}
.j-idea{border-top:1px solid var(--ink);padding-top:10px;display:flex;flex-direction:column;gap:8px;min-width:0}
.j-im{display:flex;align-items:center;gap:12px;font-size:13px}
.j-ik{font-family:var(--display);font-size:clamp(17px,1.45vw,23px);line-height:1.1;letter-spacing:-.01em}
.j-it{font-size:clamp(13.5px,.98vw,15px);line-height:1.48;max-width:32em;text-wrap:pretty}
.j-tag{display:inline-flex;align-items:center;gap:7px;font-size:12px;line-height:1;padding:5px 9px 5px 8px;border:1px solid var(--accent);border-radius:99px;color:var(--accent)}
.j-tag i{width:6px;height:6px;border-radius:50%;background:var(--accent)}
.j-idea.has-tag{border-top-color:var(--accent)}
/* what we bring */
.j-caps{list-style:none;margin:0 0 clamp(36px,4.6vw,72px);padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));column-gap:var(--g)}
.j-caps li{font-family:var(--display);font-size:clamp(14px,1.12vw,18px);line-height:1.1;letter-spacing:-.005em;padding:12px 0 14px;border-top:1px solid var(--ink);text-wrap:balance;min-width:0}
@media(max-width:1100px){.j-caps{grid-template-columns:repeat(4,minmax(0,1fr))}}
.j-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));column-gap:var(--g);row-gap:clamp(24px,2.6vw,40px)}
.j-step{border-top:2px solid var(--ink);padding-top:10px;display:flex;flex-direction:column;gap:8px;min-width:0;font-size:13px}
.j-sh{font-family:var(--display);font-size:clamp(17px,1.45vw,23px);line-height:1.08;letter-spacing:-.01em;text-wrap:balance}
.j-st{font-size:clamp(13.5px,.98vw,15px);line-height:1.48;text-wrap:pretty}
/* a first look: numbered grey boxes, replaced by number */
.j-look{display:flex;flex-direction:column;gap:clamp(40px,5vw,80px)}
.j-gh{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--g);row-gap:8px;align-items:baseline;border-top:1px solid var(--ink);padding-top:12px;margin-bottom:var(--g)}
.j-gn{grid-column:1/span 2;font-size:13px}
.j-gt-h{grid-column:3/span 4;font-size:clamp(17px,1.45vw,23px);line-height:1.08;letter-spacing:-.01em}
.j-gt{grid-column:7/span 6;font-size:clamp(14px,1.02vw,16px);line-height:1.5;max-width:36em;text-wrap:pretty}
.j-phs{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--g)}
.j-ph{position:relative;margin:0;background:#D5D0C7;overflow:hidden;min-width:0}
.j-ph::before{content:'';display:block;padding-top:var(--pt,75%)}
.j-ph-n{position:absolute;left:clamp(12px,1.2vw,20px);top:clamp(10px,1vw,16px);font-family:var(--display);font-size:clamp(30px,3.4vw,58px);line-height:1;letter-spacing:-.02em;color:rgba(36,36,36,.5)}
.j-ph-c{position:absolute;left:clamp(12px,1.2vw,20px);bottom:clamp(10px,1vw,16px);font-size:12px;line-height:1.2;color:rgba(36,36,36,.58)}
.j-ph img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block}
/* the polytunnel: by day as it comes into view, the night scene by the time it passes the middle of the screen. Without scripts or with less motion, night */
.j-dn .j-day{opacity:0;pointer-events:none}
.dn-live .j-dn .j-day{will-change:opacity}
.j-ph.has-img .j-ph-n,.j-ph.has-img .j-ph-c{display:none}
/* visual direction: references in justified rows, every frame kept whole, the film leading at full width */
.j-refs{display:flex;flex-direction:column;gap:calc(var(--g)*1.6)}
.j-fam{display:flex;flex-direction:column;gap:clamp(20px,2.2vw,36px)}
.j-row{display:flex;gap:var(--g);align-items:flex-start}
.j-ref{flex:var(--ar) 1 0;min-width:0;margin:0}
.j-ref-m{position:relative;background:#2b2723;overflow:hidden}
.j-ref-m::before{content:'';display:block;padding-top:var(--pt)}
.j-ref-m img,.j-ref-m video{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block}
.j-ref-c{display:flex;gap:10px;align-items:baseline;margin-top:8px;font-size:12px;line-height:1.35}
.j-ref-c .num{opacity:.55}
.j-ref-d{max-width:36em;text-wrap:pretty}
@media(max-width:640px){.j-row{flex-direction:column}.j-ref{flex:none;width:100%}}
.j-l-wide .j-ph:nth-child(1){grid-column:1/-1}
.j-l-wide .j-ph:nth-child(n+2){grid-column:span 6;--ar:16/9}
.j-ph.has-img{background:#2b2723}
.j-ph.has-img::after{content:'';position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(to top,rgba(0,0,0,.42),rgba(0,0,0,0));pointer-events:none}
.j-ph.light{background:#ECECEA}
.j-ph.light::after{display:none}
.j-ph-note.chip{top:clamp(10px,1vw,16px);bottom:auto;padding:6px 10px;border-radius:99px;background:var(--ink);color:var(--on-dark);font-size:11.5px;line-height:1}
.j-ph-note{position:absolute;z-index:2;left:clamp(12px,1.2vw,20px);bottom:clamp(10px,1vw,16px);font-size:12px;line-height:1.2;letter-spacing:.01em;color:var(--on-dark)}
.j-l-feature .j-ph:nth-child(1){grid-column:1/span 8;grid-row:1/span 2;--ar:3/2}
.j-l-feature .j-ph:nth-child(2),.j-l-feature .j-ph:nth-child(3){grid-column:9/span 4;aspect-ratio:auto;min-height:0}
.j-l-three .j-ph{grid-column:span 4;--ar:4/3}
.j-l-four .j-ph{grid-column:span 3;--ar:4/5}
/* the timeline: a ruler that sticks, a head that moves, and each stage drawing in as the reader reaches it */
.jt{position:relative}
.jt-ruler{position:-webkit-sticky;position:sticky;top:calc(var(--navh) + env(safe-area-inset-top,0px));z-index:20;background:var(--bg);display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--g);align-items:center;padding:14px 0 12px;border-top:1px solid var(--ink);border-bottom:1px solid var(--ink)}
.jt-day{grid-column:1/span 5;font-family:var(--display);font-size:var(--t-h3);line-height:1;letter-spacing:-.01em;white-space:nowrap;min-width:0}
.jt-track{grid-column:6/span 7;position:relative;height:34px;min-width:0}
.jt-tk{position:absolute;top:0;width:1px;height:6px;background:var(--ink);opacity:.35}
.jt-tk.m{height:10px;opacity:.7}
.jt-fill{position:absolute;left:0;top:0;height:10px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:var(--ink);display:none}
.jt-head{position:absolute;top:-3px;left:0;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:var(--accent);display:none}
.jt-ph{position:absolute;top:18px;font-size:13px;line-height:1;padding-left:4px;white-space:nowrap}
.tl-body{position:relative}
.tl-rows{list-style:none;margin:0;padding:0}
.tl-row{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--g);align-items:center;padding:clamp(9px,.9vw,13px) 0;border-bottom:1px solid var(--rule)}
.tl-lab{grid-column:1/span 5;min-width:0;transition:opacity .45s}
.tl-n{font-family:var(--display);font-size:clamp(14.5px,1.1vw,17px);line-height:1.1;letter-spacing:-.003em;transition:color .35s}
.tl-w{font-size:12.5px;line-height:1.35;margin-top:3px}
.tl-when{opacity:.6}
.tl-track{grid-column:6/span 7;position:relative;height:24px;min-width:0;background:''' + track_bg + '''}
.tl-bar{position:absolute;top:50%;height:8px;margin-top:-4px;background:rgba(36,36,36,.12)}
.tl-bar i{position:absolute;top:0;right:0;bottom:0;left:0;background:var(--ink)}
.tl-now{background:rgba(255,52,0,.2)}
.tl-now i{background:var(--accent)}
.tl-on{-webkit-clip-path:polygon(0 0,calc(100% - 8px) 0,100% 50%,calc(100% - 8px) 100%,0 100%);clip-path:polygon(0 0,calc(100% - 8px) 0,100% 50%,calc(100% - 8px) 100%,0 100%)}
.tl-ahead{height:0;margin-top:-1px;background:none;border-top:2px dashed rgba(36,36,36,.28)}
.tl-ahead i{top:-2px;bottom:auto;height:0;background:none;border-top:2px dashed var(--ink)}
.tl-dot{position:absolute;top:50%;width:13px;height:13px;margin:-6.5px 0 0 -6.5px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--bg);transition:transform .45s cubic-bezier(.2,.7,.2,1.4),background-color .3s,box-shadow .3s}
.tl-first .tl-n{color:var(--accent)}
.tl-ms{position:absolute;top:0;right:0;bottom:0;left:0;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--g);pointer-events:none}
.tl-ms-col{grid-column:6/span 7;position:relative}
.tl-ms i{position:absolute;top:0;bottom:0;width:0;border-left:1px dashed rgba(36,36,36,.5)}
.tl-play{position:absolute;top:0;right:0;bottom:0;left:0;display:none;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--g);pointer-events:none}
.tl-play-col{grid-column:6/span 7;position:relative}
.tl-play i{position:absolute;top:0;bottom:0;left:0;width:1px;background:var(--accent);opacity:.7}
.jt-live .jt-fill,.jt-live .jt-head{display:block}
.jt-live .tl-play{display:grid}
.jt-live .jt-ph{opacity:.35;transition:opacity .4s}
.jt-live .jt-ph.on{opacity:1}
.jt-live .tl-row.is-next .tl-lab{opacity:.36}
.jt-live .tl-row .tl-n{color:var(--ink)}
.jt-live .tl-row.is-on .tl-n{color:var(--accent)}
.jt-live .tl-dot:not(.on){background:var(--bg);box-shadow:inset 0 0 0 1.5px rgba(36,36,36,.35);transform:scale(.7)}
.j-end{margin-top:clamp(18px,2vw,28px)}
.j-note{grid-column:6/span 7;font-size:13px;line-height:1.45;max-width:40em;opacity:.75}
/* the investment: one figure, then the terms in the same block grammar */
.j-figrow{align-items:end;row-gap:12px;margin-bottom:clamp(28px,3.4vw,56px);border-top:1px solid var(--ink);padding-top:clamp(16px,1.8vw,28px)}
.j-fv{grid-column:1/span 8;font-family:var(--display);font-size:clamp(64px,10vw,168px);line-height:.86;letter-spacing:-.035em;display:flex;align-items:baseline;flex-wrap:wrap}
.j-fu{font-size:clamp(20px,2.2vw,36px);line-height:1;letter-spacing:-.01em;margin-left:.16em}
.j-fl{grid-column:9/span 4;font-size:clamp(14px,1.02vw,16px);line-height:1.5}
.j-small{grid-column:7/span 6;font-size:13px;line-height:1.45;max-width:40em;opacity:.75}
@media(max-width:800px){.j-fv,.j-fl,.j-small{grid-column:1/-1}}
.j-big{grid-column:1/span 10;font-family:var(--display);font-size:clamp(28px,3.5vw,58px);line-height:1.06;letter-spacing:-.018em;text-wrap:balance}
@media(max-width:1000px){.j-ideas{grid-template-columns:repeat(2,minmax(0,1fr))}.j-steps{grid-template-columns:repeat(2,minmax(0,1fr))}
  .j-gt-h{grid-column:3/span 10}.j-gt{grid-column:3/span 10}}
@media(max-width:800px){.j-h,.j-c,.j-lead,.j-sub,.j-stats,.j-big,.j-note{grid-column:1/-1}
  .j-gn{grid-column:1/-1}.j-gt-h,.j-gt{grid-column:1/-1}
  .j-l-feature .j-ph:nth-child(1){grid-column:1/-1;grid-row:auto}
  .j-l-feature .j-ph:nth-child(2),.j-l-feature .j-ph:nth-child(3){grid-column:span 6;aspect-ratio:1/1}
  .j-l-three .j-ph:nth-child(1){grid-column:1/-1;--ar:3/2}.j-l-three .j-ph{grid-column:span 6;--ar:1/1}
  .j-l-four .j-ph{grid-column:span 6}
  .jt-ruler{row-gap:10px}.jt-day{grid-column:1/-1;font-size:20px}.jt-track{grid-column:1/-1}
  .tl-lab,.tl-track{grid-column:1/-1}.tl-track{margin-top:8px}.jt-live .tl-play,.tl-ms{display:none}}
@media(max-width:640px){.j-ph-note{font-size:11px}.j-ideas,.j-steps{grid-template-columns:1fr}.j-caps{grid-template-columns:repeat(2,minmax(0,1fr))}.jt-ph{font-size:11px;padding-left:2px}
  .j-stats{column-gap:14px}.j-sl{font-size:12px}}
@media(max-width:1280px){nav .nv-x{display:none}}
.hero-meta .live{grid-column:7/span 6;justify-content:flex-end}
@media(max-width:800px){.hero-meta .live{grid-column:1/-1;justify-content:flex-start}}
</style>'''
st = page.index('</style>\n<script>(function(){var h=document.documentElement;')
page = page[:st] + css.lstrip('\n') + page[st + len('</style>'):]

script = '''<script>
/* JET v7: the reference film plays while it is on screen, with controls instead for anyone who prefers less motion */
(function(){
  var D=document,W=window,vs=[].slice.call(D.querySelectorAll('video.j-vid'));if(!vs.length)return;
  vs.forEach(function(v){v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','')});
  function manual(v){v.controls=true;if(v.preload==='none')v.preload='metadata'}
  function go(v){v.muted=true;if(v.preload==='none')v.preload='auto';var p;try{p=v.play()}catch(e){v._held=1;manual(v);return}if(p&&p.then)p.then(function(){v._held=0},function(){v._held=1;manual(v)})}
  if(!D.documentElement.classList.contains('anim')){vs.forEach(manual);return}
  function onScreen(v){var r=v.getBoundingClientRect(),h=W.innerHeight||D.documentElement.clientHeight;return r.bottom>0&&r.top<h}
  if('IntersectionObserver' in W){try{var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting)go(v);else if(!v.paused)v.pause()})},{threshold:.2});vs.forEach(function(v){io.observe(v)})}catch(e){vs.forEach(go)}}
  else vs.forEach(go);
  /* some phones hold autoplay back (low power mode, data saver): a touch then starts any held film on screen, never one the viewer paused */
  function nudge(){vs.forEach(function(v){if(v._held&&v.paused&&onScreen(v))go(v)})}
  ['touchstart','pointerdown','keydown'].forEach(function(t){W.addEventListener(t,nudge,{passive:true})});
})();
/* JET v7: the timeline that moves with the reader. Images are set by number in copy7.json */
(function(){
  var D=document,W=window,H=D.documentElement;
  /* the timeline: still for anyone who prefers less motion, otherwise drawn as the reader scrolls */
  var jt=D.getElementById('jt');if(!jt||!H.classList.contains('anim'))return;
  var list=D.getElementById('tlRows'),rows=[].slice.call(list.children),
      fill=D.getElementById('jtFill'),head=D.getElementById('jtHead'),play=D.getElementById('tlPlay'),mo=D.getElementById('jtMo'),
      phs=[].slice.call(jt.querySelectorAll('.jt-ph')),
      bars=[].slice.call(jt.querySelectorAll('.tl-bar')).map(function(b){return {i:b.firstElementChild,s:+b.getAttribute('data-s'),e:+b.getAttribute('data-e'),q:-1}}),
      dots=[].slice.call(jt.querySelectorAll('.tl-dot')).map(function(d){return {el:d,s:+d.getAttribute('data-s')}}),
      spans=rows.map(function(li){return {el:li,s:+li.getAttribute('data-s'),e:+li.getAttribute('data-e')}}),
      T0=Date.UTC(''' + '%d,%d,%d' % (w0.year, w0.month - 1, w0.day) + '''),DAYS=''' + str(span) + ''',
      MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"],
      last='',ticking=false;
  function cl(v){return v<0?0:v>1?1:v}
  jt.classList.add('jt-live');
  function frame(){
    ticking=false;
    var vh=W.innerHeight,r=list.getBoundingClientRect(),t=cl((vh*.55-r.top)/Math.max(1,r.height));
    fill.style.transform='scaleX('+t.toFixed(4)+')';
    head.style.left=play.style.left=(t*100).toFixed(3)+'%';
    var d=new Date(T0+Math.min(t,.9999)*DAYS*864e5),key=d.getUTCFullYear()+'-'+d.getUTCMonth();
    if(key!==last){last=key;mo.textContent=MONTHS[d.getUTCMonth()]+' '+d.getUTCFullYear();phs.forEach(function(p){p.classList.toggle('on',p.getAttribute('data-m')===key)})}
    bars.forEach(function(b){var q=cl((t-b.s)/Math.max(1e-6,b.e-b.s));if(Math.abs(q-b.q)>.0005){b.q=q;var cp='inset(0 '+((1-q)*100).toFixed(2)+'% 0 0)';b.i.style.webkitClipPath=cp;b.i.style.clipPath=cp}});
    dots.forEach(function(o){o.el.classList.toggle('on',t>=o.s)});
    spans.forEach(function(o){o.el.classList.toggle('is-next',t<o.s);o.el.classList.toggle('is-on',t>=o.s&&t<o.e);o.el.classList.toggle('is-done',t>=o.e)});
  }
  function on(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  W.addEventListener('scroll',on,{passive:true});W.addEventListener('resize',on);frame();
})();
/* JET v7: the Arabian polytunnel turns from day to night as the reader scrolls past it */
(function(){
  var D=document,W=window,H=D.documentElement;
  var items=[].slice.call(D.querySelectorAll('.j-dn')).map(function(f){return {f:f,day:f.querySelector('.j-day'),q:-1}});
  if(!items.length||!H.classList.contains('anim'))return;
  H.classList.add('dn-live');
  var ticking=false;
  function cl(v){return v<0?0:v>1?1:v}
  function frame(){
    ticking=false;
    var vh=W.innerHeight||H.clientHeight,still=!H.classList.contains('anim');
    items.forEach(function(o){
      if(still){if(o.q!==-2){o.q=-2;o.day.style.opacity=''}return}
      /* day until the picture is in view, night once its middle is just above the centre of the screen, over at least 40% of a screen of scrolling */
      var r=o.f.getBoundingClientRect(),to=vh*.42-r.height/2,from=Math.max(vh-r.height,to+vh*.4),
          t=cl((from-r.top)/Math.max(1,from-to)),q=1-t*t*(3-2*t);
      if(Math.abs(q-o.q)>.002){o.q=q;o.day.style.opacity=q.toFixed(3)}
    });
  }
  function on(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  W.addEventListener('scroll',on,{passive:true});W.addEventListener('resize',on);frame();
})();
</script>
'''
assert page.rstrip().endswith('</script>'), page[-200:]
page = page.rstrip() + '\n' + script

io.open(out, 'w', encoding='utf-8').write(page)
print('written', len(page))
