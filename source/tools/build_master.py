import sys,math,shutil,os
S=sys.argv[1]
CFG=sys.argv[2] if len(sys.argv)>2 else 'config.js'
OUT=sys.argv[3] if len(sys.argv)>3 else 'master'
TITLE=sys.argv[4] if len(sys.argv)>4 else 'Observatory Proposal Master'
DESC=sys.argv[5] if len(sys.argv)>5 else 'The Observatory master template for client partnership proposals. Original thinking. Built to last.'
os.makedirs(S+'/'+OUT+'/assets',exist_ok=True)
css=open(S+'/msrc/style.css').read()
# the Neue Haas file is not stored in the public repo: drop nhgd65.woff2 into font/ to build the artifact preview with it embedded
if '/*{{NHG_FONT}}*/' in css:
    import base64
    fp=S+'/font/nhgd65.woff2'
    css=css.replace('/*{{NHG_FONT}}*/',open(S+'/font/font-face.tpl').read().replace('{{B64}}',base64.b64encode(open(fp,'rb').read()).decode()) if os.path.exists(fp) else '')
body=open(S+'/msrc/body.html').read()
cfg=open(S+'/msrc/'+CFG).read(); symjs=open(S+'/symsrc/sym.js').read(); js=open(S+'/msrc/app.js').read(); wmjs=open(S+'/msrc/wordmark.js').read() if os.path.exists(S+'/msrc/wordmark.js') else ''
CX,CY,R=143,93.7,90.15; WINGS=[(151.4,108.1,98.4),(138.7,113.5,55),(80.2,81.4,17.4)]
def wing(c,r,e,right):
    h=math.sqrt(r*r-(e-c)**2); x=(2*CX-e) if right else e
    return 'M%.2f %.2fA%s %s 0 0 %d %.2f %.2fZ'%(x,CY-h,r,r,1 if right else 0,x,CY+h)
symbol='<circle cx="%s" cy="%s" r="%s"/><path d="%s"/>'%(CX,CY,R,''.join(wing(c,r,e,s) for (c,r,e) in WINGS for s in (False,True)))
roundel='<div class="roundel" role="img" aria-label="Observatory">'+''.join('<span class="l" style="--i:%d"><b>%s</b></span>'%(i,ch) for i,ch in enumerate('OBSERVATORY'))+'</div>'
wall='\n'.join('    <div class="cell" style="--c:%d;--r:%d"></div>'%(c,r) for r in range(7) for c in range(6))
import re as _re
if _re.search(r'roundel\s*:\s*false',cfg):
    # no rotating roundel anywhere: the AIM lockup takes the symbol instead, every other slot is left empty
    body=body.replace('<span class="aim-plus" aria-hidden="true">+</span>\n        {{ROUNDEL}}','<span class="aim-plus" aria-hidden="true">+</span>\n        <svg class="sym aim-sym" role="img" aria-label="The Observatory"><use href="#sym"/></svg>')
    roundel=''
body=body.replace('{{SYMBOL}}',symbol).replace('{{ROUNDEL}}',roundel).replace('{{WALL}}',wall)
assert '{{' not in body
head='''<title>'''+TITLE+'''</title>
<meta name="description" content="'''+DESC+'''">
<script>
'''+cfg+'''</script>
<style>
'''+css+'''</style>
<script>(function(){var h=document.documentElement;h.classList.add('js');try{if(sessionStorage.getItem('obs-cur')==='1'){h.classList.add('cin');sessionStorage.removeItem('obs-cur')}}catch(e){}try{if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))h.classList.add('anim')}catch(e){}/* failsafe: if the page script has not finished, show everything as plain content */function bare(){if(!h.classList.contains('ok'))h.classList.remove('anim')}window.addEventListener('error',bare);setTimeout(bare,5000)})();</script>
'''
page=head+body+'\n<script>\n'+wmjs+symjs+'\n'+js+'</script>\n'
open(S+'/'+OUT+'/index.html','w').write(page)
skel='<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#faf9f5;color:#141413}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
open(S+'/'+OUT+'/preview.html','w').write(skel+page)
for f in ['aerial.jpg','aim.png','dunes.jpg','fabric.jpg','fuji.jpg','kv.jpg','logos.png','moon.jpg','wave.jpg']:
    shutil.copy(S+'/site/assets/'+f,S+'/'+OUT+'/assets/'+f)
print(OUT,'bytes',len(page),'title in first 8KB',page.find('<title>')<8000)
