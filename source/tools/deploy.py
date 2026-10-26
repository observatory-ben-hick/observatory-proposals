# Build the standalone page for GitHub Pages: python3 -I tools/deploy.py <scratch> <config> <slug>
import sys,re,shutil,os,subprocess
S,CFG,SLUG=sys.argv[1],sys.argv[2],sys.argv[3]
# inside the GitHub repo the published folders sit next to source/; in a scratch workspace they go to repo/
ROOT=os.path.dirname(os.path.abspath(S)) if os.path.exists(os.path.dirname(os.path.abspath(S))+'/.nojekyll') else S+'/repo'
subprocess.run(['python3','-I',S+'/tools/build_master.py',S,CFG,'deploybuild','The Observatory · Original thinking','A creative partnership proposal from The Observatory.'],check=True,stdout=subprocess.DEVNULL)
p=open(S+'/deploybuild/index.html',encoding='utf8').read()
mark="setTimeout(bare,5000)})();</script>\n"
i=p.index(mark)+len(mark)
doc=('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
     '<meta name="robots" content="noindex,nofollow">\n<meta name="theme-color" content="#F1EDE5">\n'
     '<style>html,body{margin:0;padding:0;background:#F1EDE5}[hidden]{display:none!important}img{max-width:100%}</style>\n'
     +p[:i]+'</head>\n<body>\n'+p[i:]+'</body>\n</html>\n')
# fonts on the live site come from The Observatory's Adobe Fonts kit (licensed for theobservatory.je and the GitHub Pages host)
import re as _re
n0=len(doc)
doc=_re.sub(r'/\* Neue Haas Grotesk Display Pro, built into the page[^\n]*\n@font-face\{font-family:"NHG Display";src:url\(data:font/woff2;base64,[A-Za-z0-9+/=]+\) format\("woff2"\);[^}]*\}','',doc,count=1)
assert 'data:font/woff2' not in doc, 'embedded font not removed'
doc=doc.replace('"NHG Display",','"neue-haas-grotesk-display",')
doc=doc.replace('*,*:before,*:after{font-weight:400!important','*,*:before,*:after{font-weight:500!important')
# same type rule as www.theobservatory.je: 75 Bold for headlines in caps and links with arrows, 55 Roman for everything else
BOLD=','.join('html body '+x for x in ['h1','h2','h3','h4','.h1','.h2','.h3','.mega','[data-split]','[data-split] *','.w','.marq-t','.marq-t *','a.btn','a.btn *','.foot-meta a'])
doc=doc.replace('</head>','<style>'+BOLD+'{font-weight:700!important}</style>\n</head>',1)
OG='https://www.theobservatory.je/'+SLUG
OGI='https://www.theobservatory.je/'+SLUG+'/assets/og-'+SLUG+'.jpg?v=3'
doc=doc.replace('<meta name="theme-color" content="#F1EDE5">','<meta name="theme-color" content="#F1EDE5">\n<meta property="og:type" content="website">\n<meta property="og:title" content="The Observatory · Original thinking. Built to last.">\n<meta property="og:description" content="A creative partnership proposal from The Observatory.">\n<meta property="og:url" content="'+OG+'">\n<meta property="og:image" content="'+OGI+'">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="'+OGI+'">',1)
shutil.os.makedirs(ROOT+'/'+SLUG+'/assets',exist_ok=True); shutil.copy(S+'/og/og-'+SLUG+'.jpg',ROOT+'/'+SLUG+'/assets/og-'+SLUG+'.jpg')
doc=doc.replace('<meta name="theme-color" content="#F1EDE5">','<meta name="theme-color" content="#F1EDE5">\n<link rel="preconnect" href="https://use.typekit.net" crossorigin>\n<link rel="stylesheet" href="https://use.typekit.net/lud1fnf.css">',1)
out=ROOT+'/'+SLUG
os.makedirs(out+'/assets',exist_ok=True)
open(out+'/index.html','w',encoding='utf8').write(doc)
for r in sorted(set(re.findall(r'assets/[A-Za-z0-9_.\-]+\.(?:jpg|png|mp4|svg|webp)',doc))):
    n=r.split('/')[1]
    for d in (S+'/sj-assets',S+'/site/assets',S+'/deploybuild/assets',S+'/newbiz/assets',S+'/../'+SLUG+'/assets'):
        if os.path.exists(d+'/'+n):
            if os.path.abspath(d+'/'+n)!=os.path.abspath(out+'/assets/'+n): shutil.copy(d+'/'+n,out+'/assets/'+n)
            break
    else: print('MISSING',n)
print('built',out)
