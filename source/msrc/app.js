(function(){
'use strict';
var D=document,H=D.documentElement,W=window;
function $(s,c){return (c||D).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function pad(n){return (n<10?'0':'')+n}
var ANIM=H.classList.contains('anim');
var fine=W.matchMedia&&W.matchMedia('(hover:hover) and (pointer:fine)').matches;

/* ---------- 1. write the proposal into the page ---------- */
var P=W.PROPOSAL||{},C=P.client||{};
var WORDS=['no','one','two','three','four','five','six','seven','eight','nine','ten'];
function tok(s){return String(s==null?'':s).replace(/\{client\}/g,C.name||'').replace(/\{short\}/g,C.short||'')}
function esc(s){return tok(s).replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
function put(id,s){var el=$('#'+id);if(el)el.textContent=tok(s)}
/* optional line: an empty value removes the element */
function opt(id,s){var el=$('#'+id);if(!el)return;if(s)el.textContent=tok(s);else el.hidden=true}
function lines(id,arr){var el=$('#'+id);if(el)el.innerHTML=(arr||[]).map(esc).join('<br>')}
function blocks(id,arr){var el=$('#'+id);if(el)el.innerHTML=(arr||[]).map(function(l,i){return '<span'+(i?' class="l2"':'')+'>'+esc(l)+'</span>'}).join('')}
function plain(t){t=String(t||'').replace(/[.]+$/,'').toLowerCase();return t}
function sentence(list){var s=list.map(plain).join(', ');return s.charAt(0).toUpperCase()+s.slice(1)}
(function render(){
  var O=P.opportunity||{},F=P.offer||{},PL=P.plan||{},CP=P.concept||{},PD=P.pedigree||{},L=P.levels||{},A=P.aim||{},CL=P.close||{},K=P.contacts||{};
  if(!C.preparedFor)C.preparedFor=C.name;
  $$('[data-t]').forEach(function(el){el.textContent=tok(C[el.getAttribute('data-t')])});
  if(C.title)D.title=tok(C.title);else if(!P.template&&C.short)D.title='The Observatory × '+C.short;
  if(P.template)$('#tpl').hidden=false;
  /* optional sections */
  $$('[data-sec]').forEach(function(el){var k=P[el.getAttribute('data-sec')];if(k&&k.show===false){if(el.tagName==='A')el.parentNode.removeChild(el);else el.hidden=true}});
  /* LB is the label block. It is not L, which is the levels block above. */
  var LB=P.labels||{},H2=P.hero||{};
  /* hero.intro: a sentence, or a list of paragraphs (a paragraph given as a list keeps its line breaks) */
  if(Array.isArray(H2.intro)){var hiEl=$('#heroIntro'),hw=D.createElement('div');hw.className='hi';hw.id='heroIntro';
    hw.innerHTML=H2.intro.map(function(p){return '<p class="body">'+(Array.isArray(p)?p.map(esc).join('<br>'):esc(p))+'</p>'}).join('');
    if(hiEl)hiEl.parentNode.replaceChild(hw,hiEl)}
  else opt('heroIntro',H2.intro);
  /* hero.wordmark: OBSERVATORY in FatFrank outlines replaces the set name at the top and in the footer.
     The footer one is drawn letter by letter so it can move. */
  var WM=W.OBS_WORDMARK;
  if(H2.wordmark&&WM){
    var wmSvg=function(cls){return '<svg class="wm '+cls+'" viewBox="'+WM.vb+'" role="img" aria-label="Observatory"><title>Observatory</title>'+WM.letters.map(function(d,i){return '<path style="--i:'+i+'" d="'+d+'"/>'}).join('')+'</svg>'};
    var hm=$('#mega');if(hm){hm.removeAttribute('data-fit');hm.removeAttribute('data-split');hm.style.fontSize='';hm.classList.add('has-wm');hm.innerHTML=wmSvg('wm-top')}
    /* the footer word is built in layers per letter: two red ghosts (solid and hatched) under the ink letter, so it can assemble like the film's title */
    var fm=$('.foot .mega');if(fm){fm.removeAttribute('data-fit');fm.style.fontSize='';fm.classList.add('has-wm');
      fm.innerHTML='<svg class="wm wm-foot" viewBox="'+WM.vb+'" role="img" aria-label="Observatory"><title>Observatory</title><defs><pattern id="wmHatch" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="13" height="26" fill="#FF3400"/></pattern></defs>'+
        WM.letters.map(function(d,i){return '<g class="lt" data-i="'+i+'"><path class="gh gh2" d="'+d+'"/><path class="gh gh1" d="'+d+'"/><path class="m" d="'+d+'"/></g>'}).join('')+'</svg>'}
  }
  /* hero.navBrand: the words beside the symbol in the top bar. hero.metaBrand:false removes the same line from the row under it */
  if(H2.navBrand){var nb=$('#brand span');if(nb)nb.textContent=tok(H2.navBrand)}
  if(H2.metaBrand===false){var mb=$('.hero-meta>span');if(mb)mb.hidden=true}
  /* hero.prepared:false removes the "Prepared for" line */
  if(H2.prepared===false){var pl=$('.hero-meta .live');if(pl)pl.hidden=true}
  /* hero.marquee:false removes the moving line under the pictures. hero.work puts a sentence in its place */
  if(H2.marquee===false){var mq=$('.marq');if(mq)mq.hidden=true}
  if(H2.work){var wk=D.createElement('div');wk.className='wrap work';wk.innerHTML='<p class="lead rv">'+esc(H2.work)+'</p>';var mq2=$('.marq');if(mq2)mq2.parentNode.insertBefore(wk,mq2.nextSibling)}
  put('heroKind',LB.kind||'Creative partnership proposal');
  if(LB.est&&LB.est.length){var hk=$('#heroKind');if(hk){hk.className='est';hk.innerHTML=esc(LB.est[0])+'<i aria-hidden="true"></i>'+esc(LB.est[1]||'');var hy=hk.nextElementSibling;if(hy&&hy.hasAttribute('data-t'))hy.hidden=true}}put('footKind',LB.kind||'Creative partnership proposal');
  lines('heroTag',H2.tagline||['ORIGINAL THINKING.','BUILT TO LAST.']);lines('footTag',(P.labels||{}).footTag||H2.tagline||['ORIGINAL THINKING.','BUILT TO LAST.']);
  lines('kvLine',LB.kvLine||H2.tagline||['ORIGINAL THINKING.','BUILT TO LAST.']);
  /* labels.keyVisualShow:false removes the full-width picture and its panel above the contact section */
  if(LB.keyVisualShow===false){var kvs=$('section.kv');if(kvs)kvs.hidden=true}
  /* keyVisual image: labels.keyVisualImage = {src, alt, position} */
  var KI=LB.keyVisualImage;if(KI&&KI.src){var ki=$('.kv .ph img');if(ki){ki.src=KI.src;ki.alt=KI.alt||'';if(KI.position)ki.style.objectPosition=KI.position}}
  put('kv1',(LB.keyVisual||['Your brand','Built to work'])[0]);put('kv2',(LB.keyVisual||['Your brand','Built to work'])[1]);
  put('oppLabel',LB.opportunity||'The opportunity');
  put('offerLabel',LB.offer||'What you get');put('offerTag',LB.offerTag||'An ongoing partnership');
  put('lvLabel',LB.levels||'Choose your level');
  put('closeLabel',LB.close||'Where we go from here');if(LB.closeTag==='')$('#closeTag').hidden=true;else put('closeTag',LB.closeTag||'Your move');
  put('pfMsg',LB.workflow||'Visual language concepts are now ready');
  put('pfT1',LB.workflowFile||'Visual language');put('pfT2',LB.workflowMeta||'Concepts v1 →');put('pfTag',LB.workflowNote||'Illustration of an intelligent workflow');
  /* hero images: the set in the page stands unless the block names its own */
  var hi=(P.hero||{}).images,stage=$('#stage');
  /* optional picture swaps: opportunity.image beside the opening, opportunity.band below it. Each {src,position,ratio,alt} */
  var OI=(P.opportunity||{}).image,OB=(P.opportunity||{}).band;
  if(OI===false){var sd=$('#intro .st-side');if(sd)sd.hidden=true}
  if(OB===false){var bd=$('.band');if(bd)bd.hidden=true}
  if(OI&&OI.src){var oa=$('#intro .ap'),oim=oa&&$('img',oa);if(oim){oim.src=OI.src;oim.alt=OI.alt||'';if(OI.position)oim.style.objectPosition=OI.position;if(OI.ratio)oa.style.aspectRatio=OI.ratio}}
  if(OB&&OB.src){var bim=$('.band img');if(bim){bim.src=OB.src;if(OB.position)bim.style.objectPosition=OB.position}}
  /* hero.video: a film in place of the pictures, edge to edge. {src, poster, ratio, label}
     Written as markup so iOS Safari sees every attribute before it loads the file:
     muted + playsinline (and webkit-playsinline for older iOS) are what allow it to play inline on its own,
     controls gives everyone a way to pause it, and a tap to start it if Low Power Mode blocks autoplay. */
  /* hero.stage:false takes the whole picture/film band out */
  if(H2.stage===false&&stage){$$('img',stage).forEach(function(m){m.parentNode.removeChild(m)});stage.parentNode.hidden=true;stage=null}
  var HV=H2.video;
  if(HV&&HV.src&&stage){
    $$('img',stage).forEach(function(m){m.parentNode.removeChild(m)});
    var still0=false;try{still0=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
    var vw=D.createElement('div');
    vw.innerHTML='<video class="stage-v"'+(still0?'':' autoplay')+' muted loop playsinline webkit-playsinline controls preload="metadata"'+
      (HV.poster?' poster="'+esc(HV.poster)+'"':'')+' aria-label="'+esc(HV.label||'The Observatory showreel')+'">'+
      '<source src="'+esc(HV.src)+'" type="video/mp4"></video>';
    var v=vw.firstChild;
    v.muted=true;v.defaultMuted=true;
    /* hero.video.fallback: a second copy of the film. If the first source cannot load,
       the page fetches the fallback and plays it from memory, which some browsers allow where a direct link is refused */
    if(HV.fallback){var vs=$('source',v),vTried=false;
      var vFall=function(){if(vTried)return;vTried=true;
        try{fetch(HV.fallback).then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(b){
          v.removeAttribute('src');while(v.firstChild)v.removeChild(v.firstChild);
          v.src=URL.createObjectURL(b.type?b:new Blob([b],{type:'video/mp4'}));v.load();
          if(!still0){var pf=v.play();if(pf&&pf.catch)pf.catch(function(){})}
        }).catch(function(){})}catch(e){}};
      if(vs)vs.addEventListener('error',vFall);v.addEventListener('error',vFall)}
    stage.insertBefore(v,$('.stage-ui',stage));stage.classList.add('has-v');stage.style.aspectRatio=HV.ratio||'16/9';
    if(stage.parentNode)stage.parentNode.classList.add('bleed');
    /* rests while it is off screen, and picks up again only if it was playing when it left */
    var vRest=false;
    if(!still0&&'IntersectionObserver' in W)try{new IntersectionObserver(function(e){
      if(!e[0].isIntersecting){if(!v.paused){vRest=true;v.pause()}}
      else if(vRest){vRest=false;var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}
    },{threshold:.15}).observe(stage)}catch(e){}
    if(!still0){var pr0=v.play();if(pr0&&pr0.catch)pr0.catch(function(){})}
  }
  /* hero.ratio: the frame takes the proportions of its pictures */
  if(H2.ratio&&stage)stage.style.aspectRatio=H2.ratio;
  /* a single picture needs no counter */
  if(H2.images&&H2.images.length===1){var sN=$('.stage-n');if(sN)sN.hidden=true}
  /* an optional mark that sits over every frame, centred: hero.mark = {src,alt,height} */
  var mk=(P.hero||{}).mark;
  if(mk&&mk.src&&stage){var ms=D.createElement('span');ms.className='stage-mark';ms.setAttribute('role','img');ms.setAttribute('aria-label',mk.alt||'');ms.style.backgroundImage='url("'+mk.src+'")';if(mk.ratio)ms.style.aspectRatio=mk.ratio;if(mk.height)ms.style.setProperty('--mh',mk.height);stage.appendChild(ms)}
  if(hi&&hi.length&&stage&&!(HV&&HV.src)){$$('img',stage).forEach(function(m){m.parentNode.removeChild(m)});var ui=$('.stage-ui',stage);hi.forEach(function(im,i){var m=D.createElement('img');m.src=im.src;m.alt=im.alt||'';if(i===0)m.className='on';else m.loading='lazy';if(im.position)m.style.objectPosition=im.position;if(im.css)m.style.cssText+=';'+im.css;m.setAttribute('data-par','.06');stage.insertBefore(m,ui)});$('#stagen').textContent='01 / '+pad(hi.length)}
  /* opportunity */
  put('oppTags',O.tags);lines('oppHead',O.headline);
  /* opportunity.head:false removes the label row above the headline */
  if(O.head===false){var oh=$('#intro .sec-head');if(oh)oh.hidden=true}
  $('#oppCopy').innerHTML=(O.paragraphs||[]).map(function(p){return Array.isArray(p)?'<div class="pg">'+p.map(function(l){return '<p class="lead">'+esc(l)+'</p>'}).join('')+'</div>':'<p class="lead">'+esc(p)+'</p>'}).join('');
  /* a long opening is set a size down so it reads as a letter, not a wall */
  if([].concat.apply([],O.paragraphs||[]).join(' ').split(/\s+/).length>90)$('#oppCopy').classList.add('long');
  /* what you get */
  opt('offerLead',F.lead);
  if(!(F.people||[]).length)$('#people').hidden=true;
  $('#people').innerHTML=(F.people||[]).map(function(p,i){return '<div class="rv" style="--d:'+i+'"><h3 class="h3">'+esc(p.name)+'</h3><p>'+esc(p.text)+'</p></div>'}).join('');
  var caps=F.capabilities||[];
  /* no capabilities: the poster sequence stands on its own beside the lead */
  if(!caps.length){$('#caps').hidden=true;$('#capview').parentNode.classList.add('solo')}
  /* no capabilities and no pictures: the whole block goes */
  if(!caps.length&&!(F.gallery&&F.gallery.length))$('#capview').parentNode.hidden=true;
  $('#caps').innerHTML=caps.map(function(c,i){return '<li class="cap" data-i="'+i+'" tabindex="0"><i class="dot"></i><h3 class="h3">'+esc(c.title)+'</h3>'+(c.lead?'<p class="cl">'+esc(c.lead)+'</p>':'')+'<p>'+esc(c.text)+'</p></li>'}).join('');
  /* offer.gallery: an optional sequence of pictures that plays on its own beside the list */
  var gal=F.gallery&&F.gallery.length?F.gallery:null,views=gal||caps.map(function(c){return {src:c.image,position:c.position}});
  $('#capview').innerHTML=views.map(function(c,i){return '<img'+(i?'':' class="on"')+' src="'+esc(c.src)+'" alt="'+esc(c.alt||'')+'" loading="lazy"'+(c.position?' style="object-position:'+esc(c.position)+'"':'')+'>'}).join('')+'<span class="cv-n num" id="capn">1 / '+views.length+'</span>';
  if(gal){var cv=$('#capview');cv.classList.add('gal');cv.setAttribute('data-t','0');if(F.galleryRatio)cv.style.aspectRatio=F.galleryRatio}
  var one=caps.map(function(c){return '<span>'+esc(c.title)+'</span><svg class="sym"><use href="#sym"/></svg>'}).join('');
  $('#marq').innerHTML=one+one;
  /* plan */
  /* plan.stages (the newer form) or plan.months: each counts as 30 days on the ruler */
  var ST=PL.stages&&PL.stages.length?PL.stages:null,months=ST||PL.months||[];
  put('planLabel',PL.label);put('planTag',sentence(months.map(function(m){return m.title})));
  lines('planHead',PL.headline);opt('planLead',PL.lead);opt('planClosing',PL.closing);
  /* plan.body: a line, or a list of paragraphs */
  if(Array.isArray(PL.body)){var pb=$('#planBody'),pw=D.createElement('div');pw.className='pbody';pw.innerHTML=PL.body.map(function(p){return '<p class="body">'+esc(p)+'</p>'}).join('');pb.parentNode.replaceChild(pw,pb)}else opt('planBody',PL.body);
  var nl=$('#navlinks a[data-sec="plan"]');if(nl)nl.textContent=PL.nav||'Plan';
  var track=$('#track');track.style.setProperty('--days',Math.max(1,months.length*30));
  months.forEach(function(m,i){var s=D.createElement('span');s.className='ph'+(i?'':' on');s.style.left=(i/months.length*100)+'%';s.textContent=plain(m.title).replace(/^./,function(a){return a.toUpperCase()});track.appendChild(s)});
  $('#months').style.setProperty('--ch',Math.max.apply(null,[4].concat(months.map(function(m){return String(m.title||'').length}))));
  if(ST){
    /* the three stages as a connected map: each node jumps to its stage and lights as the ruler reaches it */
    var mp=$('#stgMap');mp.hidden=false;
    mp.innerHTML=(PL.connector?'<p class="lead stg-line rv">'+esc(PL.connector)+'</p>':'')+(PL.map===false?'':'<ol class="stg-nodes rv">'+ST.map(function(s,i){return '<li><a href="#stage-'+(i+1)+'" class="stg-node"><span class="ring"><i></i></span><span class="num">'+esc(s.num||pad(i+1))+'</span><span class="stg-t">'+esc(String(s.title||'').replace(/[.]$/,''))+'</span><span class="stg-d lab">'+esc(s.days||'')+'</span></a>'+(i<ST.length-1?'<span class="stg-link"><i></i></span>':'')+'</li>'}).join('')+'</ol>');
    $('#months').innerHTML=ST.map(function(s,i){
      return '<article class="grid month stg" id="stage-'+(i+1)+'"><div class="month-l">'+
        '<div class="stg-meta"><svg class="stg-ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20"/><circle class="p" cx="22" cy="22" r="20" pathLength="1"/></svg><p class="lab">'+esc(s.days||'')+'</p></div>'+
        '<h3 class="big" data-split><span class="sn">'+esc(s.num||pad(i+1))+'.</span> '+esc(s.title)+'</h3><p class="lead">'+esc(s.sub)+'</p></div>'+
        '<div class="month-r"><div class="stg-body">'+(s.body||[]).map(function(p){return '<p class="body rv">'+esc(p)+'</p>'}).join('')+'</div>'+
        '<div><p class="lab" style="margin-bottom:10px">'+esc(PL.focusLabel||'Our focus')+'</p><ol class="pri focus">'+(s.focus||[]).map(function(f,k){return '<li class="rv"><span class="num">'+(k+1)+'.</span><span><span class="fk">'+esc(f.k)+'</span> '+esc(f.t)+'</span></li>'}).join('')+'</ol></div>'+
        '<div class="outcome rv"><span class="lab">'+esc(PL.getLabel||'What you get')+'</span><p class="lead">'+esc(s.get)+'</p></div></div></article>';
    }).join('');
    /* the close of the plan: a headline, a line, a paragraph and the small print */
    var E=PL.end;if(E){var dO=$('#daysOut');dO.hidden=false;
      dO.innerHTML='<h3 class="h1" data-split>'+(E.headline||[]).map(esc).join('<br>')+'</h3><div class="txt">'+(E.sub?'<p class="lead rv">'+esc(E.sub)+'</p>':'')+(E.body?'<p class="body rv">'+esc(E.body)+'</p>':'')+(E.small?'<p class="small rv">'+esc(E.small)+'</p>':'')+'</div>'}
  }else
  $('#months').innerHTML=months.map(function(m,i){
    return '<article class="grid month"><div class="month-l"><p class="lab">'+esc(m.name)+' · Days '+pad(i*30+1)+' to '+pad(i*30+30)+'</p><h3 class="big" data-split>'+esc(m.title)+'</h3><p class="lead">'+esc(m.lead)+'</p></div>'+
      '<div class="month-r"><div><p class="lab" style="margin-bottom:10px">Priorities</p><ol class="pri">'+(m.priorities||[]).map(function(p,k){return '<li class="rv"><span class="num">'+pad(k+1)+'</span><span>'+esc(p)+'</span></li>'}).join('')+'</ol></div>'+
      '<div class="outcome rv"><span class="lab">Outcome</span><p class="lead">'+esc(m.outcome)+'</p></div>'+(m.note?'<p class="small">'+esc(m.note)+'</p>':'')+'</div></article>';
  }).join('');
  /* concept */
  var cl=$('#navlinks a[data-sec="concept"]');if(cl)cl.textContent=CP.nav||'Concept';
  put('cpLabel',CP.label);put('cpTag',CP.tag);lines('cpHead',CP.headline);put('cpBody',CP.body);put('cpCap',CP.caption);put('ovCap',CP.caption);
  var ci=$('#cpImg');if(CP.image){ci.src=CP.image;if(CP.imagePosition)ci.style.objectPosition=CP.imagePosition}
  $$('[data-cpbtn]').forEach(function(el){el.textContent=tok(CP.button||'Open the concept')});
  if(CP.page){$('#cpBtn').hidden=false;$('#frame').setAttribute('data-open-concept','');$('#frame').setAttribute('data-cur','Open');$('#frame').classList.add('can')}
  else if(CP.url){var a=$('#cpLink');a.href=CP.url;a.hidden=false}
  else if(P.template)$('#cpPill').hidden=false;
  /* pedigree */
  put('pedLabel',PD.label||'Pedigree');put('pedTtl',PD.title||'Clients and collaborators');put('pedTag',PD.tag||'Since 2005');
  lines('pedHead',PD.headline);opt('pedBody',PD.body);
  /* levels */
  var items=L.items||[],md=L.maxDays||6,ms=L.maxSessions||3;
  function pips(n,max,round){var s='';for(var i=0;i<max;i++)s+='<i'+(i<n?' class="f"':'')+'></i>';return '<span class="pips'+(round?' o':'')+'">'+s+'</span>'}
  put('lvTag',(WORDS[items.length]||items.length)+' ways to work together');
  var tg=$('#lvTag');tg.textContent=tg.textContent.charAt(0).toUpperCase()+tg.textContent.slice(1);
  put('lvIntro',L.intro);
  var lv=$('#lvs');lv.style.setProperty('--n',items.length||1);
  var CB=L.caseBase||'../work/',TB=L.thumbBase||'../media/work/thumb/';
  function cases(it){if(!(it.cases||[]).length)return '';return '<div class="lv-cases"><span class="lv-ck">'+esc(L.casesLabel||'Case studies')+'</span><ul>'+it.cases.map(function(c){
    return '<li><a class="lv-case" href="'+esc(CB+c.id+'/')+'" data-site><span class="lv-th"><img src="'+esc(TB+c.id+'.webp')+'" alt="" loading="lazy" decoding="async"><video muted loop playsinline webkit-playsinline preload="none" aria-hidden="true" data-src="'+esc(TB+c.id+'.mp4')+'"></video></span><span class="lv-cn">'+esc(c.name)+'</span><span class="lv-ca" aria-hidden="true">→</span></a></li>'}).join('')+'</ul></div>'}
  lv.innerHTML=items.map(function(it){
    return '<div class="lv-col"><button class="level" type="button" role="radio" aria-checked="false" data-level="'+esc(it.name)+'" data-days="'+it.days+'" data-sess="'+it.sessions+'" data-price="'+esc(it.price)+'" data-text="'+esc(it.text||'')+'" data-manage="'+esc(it.manage||'')+'">'+
      '<span class="h3">'+esc(String(it.name).toUpperCase())+'</span>'+
      '<span><span class="lv-price num">'+esc(it.price)+'</span><span class="lv-per">Per month</span></span>'+
      '<span class="lv-desc">'+esc(it.text)+'</span>'+
      (it.manage?'<span class="lv-rows"><span class="lv-mg">'+(L.manageLabel?'<span class="lv-mk">'+esc(L.manageLabel)+'</span>':'')+'<span class="lv-mv">'+esc(it.manage)+'</span></span></span>':
      '<span class="lv-rows"><span class="lv-row"><span>Senior days</span>'+pips(it.days,md)+'<b class="num">'+it.days+'</b></span>'+
      '<span class="lv-row"><span>Working sessions</span>'+pips(it.sessions,ms,true)+'<b class="num">'+it.sessions+'</b></span></span>')+
      '<span class="lv-pick"><i></i><span data-pick>Choose '+esc(it.name)+'</span></span></button>'+cases(it)+'</div>';
  }).join('');
  opt('lvNote',L.note);
  blocks('flexHead',L.flex);opt('termsLead',L.termsLead);opt('termsClose',L.closing);
  $('#terms').innerHTML=(L.terms||[]).map(function(t){return '<li class="rv">'+esc(t)+'</li>'}).join('');
  /* AIM */
  put('aimLabel',A.label||'When the time is right');put('aimTag',A.tag||'Technology partnership');lines('aimHead',A.headline||['WHEN THE TIME','IS RIGHT.']);
  if((A.headline||[]).join(' ').length>34)$('#aimHead').classList.add('mid');
  opt('aimLead',A.lead);opt('aimBody',A.body);
  /* close and contacts */
  blocks('closeHead',CL.lines);
  /* close.lines left empty removes the closing statement and its label row; the contact block stays */
  if(!(CL.lines||[]).length){$$('#talk .sec-head,#talk .close-top').forEach(function(el){el.hidden=true});$('#talk').classList.add('bare')}
  if((CL.lines||[]).join(' ').length>90)$('#closeHead').classList.add('mid');
  /* number the chapters that are showing */
  $$('.sec-head .idx.num').filter(function(el){return !el.closest('[hidden]')}).forEach(function(el,i){el.textContent='('+pad(i+1)+')'});
  var wa=K.whatsapp;
  if(wa&&wa.number){var b=$('#wa');b.hidden=false;b.href=waLink('Let’s talk.');$$('[data-wabtn]').forEach(function(el){el.textContent=wa.button||'WhatsApp'});put('waN',[wa.name,wa.display].filter(Boolean).join(' · '))}
  /* contacts.compose: the address opens a new email in the viewer's own mail app, subject and opening line filled in
     (with the level they picked, if any). The address stays on screen as text and is copied on click as a backup. */
  var BK=K.booking;
  $('#emails').innerHTML=(BK&&BK.url?'<div class="contact book"><span class="lab">'+esc(BK.who||'')+'</span><a class="mail" href="'+esc(BK.url)+'" target="_blank" rel="noopener"><span class="mt">'+esc(BK.text||'Book a call')+'</span><span class="cp">'+esc(BK.button||'Pick a time')+' ↗</span></a></div>':'')+(K.emails||[]).map(function(e){
    if(K.compose)return '<div class="contact"><span class="lab">'+esc(e.who)+'</span><a class="mail" target="'+esc(K.compose.target||'_blank')+'" rel="noopener" data-mail="'+esc(e.address)+'" data-who="'+esc(String(e.who||'').split(' · ')[0])+'" href="'+esc(mailHref(e.address,String(e.who||'').split(' · ')[0],null))+'"><span class="mt">'+esc(e.address)+'</span><span class="cp">'+esc(K.compose.button||'Email us')+'</span></a></div>';
    return '<div class="contact"><span class="lab">'+esc(e.who)+'</span><button class="mail" type="button" data-mail="'+esc(e.address)+'"><span class="mt">'+esc(e.address)+'</span><span class="cp">Copy address</span></button></div>'}).join('');
})();
function mailHref(addr,first,choice){
  var CM=(P.contacts||{}).compose||{},subj=tok(CM.subject||'Creative Partnerships'),hi='Hi'+(first?' '+first:'')+',';
  var line=choice?tok(CM.chosen||"I’ve read The Observatory partnership proposal and I’d like to talk about the {level} partnership.").replace('{level}',choice.name).replace('{detail}',choice.detail):tok(CM.body||"I’ve read The Observatory partnership proposal and I’d like to talk about a creative partnership.");
  if(choice)subj+=' · '+choice.name;
  return 'mailto:'+addr+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(hi+'\n\n'+line+'\n\n')}
function waLink(tail){var wa=(P.contacts||{}).whatsapp||{};return 'https://wa.me/'+String(wa.number).replace(/\D/g,'')+'?text='+encodeURIComponent((tok(wa.message)+' '+tail).trim())}

/* ---------- 2. the symbol, mounted where it moves ---------- */
function sym(id){var el=$('#'+id);try{return el&&W.SYM?SYM.mount(el):null}catch(e){return null}}
var navSym=sym('navmk'),pfSym=sym('pfmk'),ovSym=sym('ovmk');
function loopSym(ctl,ms){
  var on=false;
  function turn(){if(!on){ctl.to(0,ms);return}ctl.to(ctl.p>.5?0:1,ms,function(){setTimeout(turn,90)})}
  return {start:function(){if(on||!ctl||!ANIM)return;on=true;turn()},stop:function(){on=false;if(ctl)ctl.to(0,ms)}};
}

/* ---------- split headlines into rising words ---------- */
$$('[data-split]').forEach(function(el){
  var n=0;
  (function walk(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(c){
      if(c.nodeType===3){
        var parts=c.textContent.split(/(\s+)/),f=D.createDocumentFragment();
        parts.forEach(function(p){
          if(!p)return;
          if(/^\s+$/.test(p)){f.appendChild(D.createTextNode(' '));return}
          var w=D.createElement('span');w.className='w';
          var s=D.createElement('span');s.textContent=p;s.style.setProperty('--d',n++);
          w.appendChild(s);f.appendChild(w);
        });
        node.replaceChild(f,c);
      }else if(c.nodeType===1&&c.tagName!=='BR'){walk(c)}
    });
  })(el);
});

/* ---------- fit the name to the full measure ---------- */
function fit(){
  $$('[data-fit]').forEach(function(el){
    el.style.fontSize='100px';
    var r=D.createRange();r.selectNodeContents(el);
    var w=r.getBoundingClientRect().width,box=el.parentNode.getBoundingClientRect();
    var cs=getComputedStyle(el.parentNode),avail=box.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    if(w>0&&avail>0)el.style.fontSize=(100*avail/w*0.995)+'px';
  });
}
fit();
if(D.fonts&&D.fonts.ready)D.fonts.ready.then(fit);
W.addEventListener('resize',fit);

/* ---------- scroll highlighted reading ---------- */
var wordBlocks=$$('[data-words]').map(function(el){
  var ws=[];
  $$('p',el).forEach(function(p){
    var parts=p.textContent.split(/(\s+)/);p.textContent='';
    parts.forEach(function(t){
      if(/^\s+$/.test(t)||!t){p.appendChild(D.createTextNode(t));return}
      var s=D.createElement('span');s.className='sw';s.textContent=t;p.appendChild(s);ws.push(s);
    });
  });
  return {el:el,ws:ws,last:-1};
});

/* ---------- reveal on view ---------- */
function startReveal(){
  var els=$$('[data-split],.rv,.ap,.wall');
  function all(){els.forEach(function(e){e.classList.add('in')})}
  if(!ANIM||!('IntersectionObserver' in W)){all();return}
  try{
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        e.target.classList.add('in');io.unobserve(e.target);
        if(e.target.id==='wall')setTimeout(function(){e.target.classList.add('done')},1600);
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:.05});
    els.forEach(function(e){io.observe(e)});
    $$('.pri,.terms ul').forEach(function(l){$$('.rv',l).forEach(function(li,i){li.style.setProperty('--d',i)})});
  }catch(e){all()}
}

/* ---------- preloader ---------- */
(function(){
  var pre=$('#pre'),n=$('#pren');
  function done(){if(pre)pre.classList.add('out');H.classList.add('ready');startReveal();startStage()}
  if(!ANIM||!pre){done();return}
  if(H.classList.contains('cin')){setTimeout(done,260);return}
  var t0=performance.now(),dur=1500;
  (function tick(t){
    var p=clamp((t-t0)/dur,0,1),e=1-Math.pow(1-p,3);
    n.textContent=('00'+Math.round(e*100)).slice(-3);
    if(p<1)requestAnimationFrame(tick);else setTimeout(done,180);
  })(t0);
  setTimeout(function(){if(!H.classList.contains('ready'))done()},3200);
})();

/* ---------- hero stage: frames open one after another ---------- */
var stageStarted=false;
function startStage(){
  if(stageStarted)return;stageStarted=true;
  var imgs=$$('#stage img'),n=$('#stagen'),bar=$('#stagebar'),i=0,vis=true;
  function run(){bar.classList.remove('run');bar.style.transition='none';bar.style.transform='scaleX(0)';void bar.offsetWidth;bar.style.transition='';bar.style.transform='';bar.classList.add('run')}
  if(!ANIM||imgs.length<2)return;
  run();
  if('IntersectionObserver' in W)try{new IntersectionObserver(function(e){vis=e[0].isIntersecting},{threshold:.1}).observe($('#stage'))}catch(e){}
  setInterval(function(){
    if(!vis||D.hidden)return;
    var prev=imgs[i];i=(i+1)%imgs.length;var next=imgs[i];
    imgs.forEach(function(m){m.classList.remove('was')});
    prev.classList.remove('on');prev.classList.add('was');
    next.classList.add('on');
    n.textContent=pad(i+1)+' / '+pad(imgs.length);run();
  },3800);
}

/* ---------- footer wordmark: the type, still (the assembly animation is retired; kept here switched off) ----------
   A red dot opens into the O, each letter after it arrives as a red shape (some flipped, the Rs jumping),
   then settles to ink. While the footer stays in view the word breaks apart and rebuilds every few seconds. */
(function(){
  var wm=$('.wm-foot');return;
  var still=false;try{still=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  if(still)return;
  var L=$$('.lt',wm),N=L.length,running=[],vis=false,loopT=null,busy=false;
  var MIR={3:1,7:1},JUMP={4:1,9:1};   /* E and T flip; the Rs jump, as in the film */
  function stop(){running.forEach(function(x){try{x.cancel()}catch(e){}});running=[]}
  function an(el,k,o){var x=el.animate(k,o);running.push(x);return x}
  function hide(){L.forEach(function(g){$('.m',g).style.opacity=0;$('.gh1',g).style.opacity=0;$('.gh2',g).style.opacity=0})}
  function build(done){
    stop();hide();var last=null;
    L.forEach(function(g,i){
      var m=$('.m',g),g1=$('.gh1',g),g2=$('.gh2',g),d=120+i*85,mir=MIR[i]?'scaleX(-1)':'scaleX(1)',up=JUMP[i]?'translateY(-34%)':'translateY(0)';
      if(i===0){
        an(g1,[{opacity:0,transform:'scale(.12)'},{opacity:1,transform:'scale(.16)',offset:.25},{opacity:1,transform:'scale(1.12)',offset:.6},{opacity:0,transform:'scale(1)'}],{duration:760,delay:0,easing:'cubic-bezier(.3,1.4,.4,1)',fill:'both'});
        an(m,[{opacity:0},{opacity:0,offset:.55},{opacity:1}],{duration:760,delay:0,fill:'both'});
        return;
      }
      an(g1,[{opacity:0,transform:up+' '+mir+' scale(.6)'},{opacity:1,transform:up+' '+mir+' scale(1.05)',offset:.3},{opacity:1,transform:'translateX(5%) skewX(-10deg)',offset:.6},{opacity:0,transform:'none'}],{duration:560,delay:d,easing:'cubic-bezier(.3,1.3,.4,1)',fill:'both'});
      if(i%2===0)an(g2,[{opacity:0,transform:'translateX(-7%)'},{opacity:1,transform:'translateX(-7%)',offset:.35},{opacity:1,transform:'translateX(3%)',offset:.7},{opacity:0,transform:'none'}],{duration:560,delay:d,fill:'both'});
      last=an(m,[{opacity:0,transform:'translateY(6%)'},{opacity:0,transform:'translateY(6%)',offset:.55},{opacity:1,transform:'none'}],{duration:560,delay:d,easing:'cubic-bezier(.2,1,.3,1)',fill:'both'});
    });
    if(last&&done)last.onfinish=done;
  }
  function breakUp(done){
    stop();var last=null;
    L.forEach(function(g,i){
      var m=$('.m',g),g1=$('.gh1',g),g2=$('.gh2',g),d=i*70,mir=MIR[i]?'scaleX(-1)':'scaleX(1)',up=JUMP[i]?'translateY(-34%)':'translateY(0)';
      an(m,[{opacity:1},{opacity:0,offset:.25},{opacity:0}],{duration:460,delay:d,fill:'both'});
      an(g1,[{opacity:0,transform:'none'},{opacity:1,transform:'translateX(-6%)',offset:.2},{opacity:1,transform:up+' '+mir,offset:.55},{opacity:0,transform:up+' '+mir+' scale(.5)'}],{duration:460,delay:d,easing:'ease-in',fill:'both'});
      if(i%2)an(g2,[{opacity:0},{opacity:1,transform:'translateX(6%)',offset:.3},{opacity:0,transform:'translateX(10%)'}],{duration:460,delay:d,fill:'both'});
      if(i===N-1)last=an(g,[{opacity:1},{opacity:1}],{duration:460+d});
    });
    if(last&&done)last.onfinish=done;
  }
  function cycle(){if(!vis||busy||D.hidden)return;busy=true;breakUp(function(){build(function(){busy=false})})}
  if('IntersectionObserver' in W)try{new IntersectionObserver(function(e){
    var now=e[0].isIntersecting;if(now===vis)return;vis=now;
    clearInterval(loopT);
    if(vis){busy=true;build(function(){busy=false});loopT=setInterval(cycle,7000)}
    else{stop();busy=false;L.forEach(function(g){$$('path',g).forEach(function(p){p.style.opacity=''})})}
  },{threshold:.35}).observe(wm)}catch(e){}
  wm.addEventListener('mouseenter',cycle);
})();

/* ---------- capabilities: the list drives the picture ----------
   With a gallery the pictures also play on their own, each change using the next of four reveals:
   a wipe up, an iris, shutters from the centre and a diagonal sweep. */
(function(){
  var list=$('#caps'),caps=$$('.cap',list),view=$('#capview'),imgs=$$('img',view),n=$('#capn'),cur=0,tn=0,gal=view&&view.classList.contains('gal');
  if(!imgs.length)return;
  var still=false;try{still=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  function show(i){
    i=((i%imgs.length)+imgs.length)%imgs.length;
    if(i===cur||!imgs[i])return;
    if(gal){tn=(tn+1)%4;view.setAttribute('data-t',String(tn));void imgs[i].offsetWidth}
    imgs.forEach(function(m){m.classList.remove('was')});
    imgs[cur].classList.remove('on');imgs[cur].classList.add('was');
    imgs[i].classList.add('on');cur=i;n.textContent=(i+1)+' / '+imgs.length;
  }
  function set(i){
    list.classList.add('has');
    caps.forEach(function(c,k){c.classList.toggle('on',k===i)});
    show(gal?i%imgs.length:i);
  }
  caps.forEach(function(c,i){
    c.addEventListener('mouseenter',function(){set(i);hold=true});
    c.addEventListener('focus',function(){set(i)});
    c.addEventListener('click',function(){set(i)});
  });
  var hold=false;
  list.addEventListener('mouseleave',function(){hold=false;list.classList.remove('has');caps.forEach(function(c){c.classList.remove('on')})});
  if(!gal||still)return;
  /* plays only while it is on screen and nobody is pointing at the list */
  var vis=false;
  if('IntersectionObserver' in W)try{new IntersectionObserver(function(e){vis=e[0].isIntersecting},{threshold:.2}).observe(view)}catch(e){vis=true}else vis=true;
  setInterval(function(){if(vis&&!hold&&!D.hidden)show(cur+1)},3400);
})();

/* ---------- concept: a page that opens over the proposal ---------- */
(function(){
  var CP=P.concept||{},ov=$('#ov'),frame=$('#ovf'),msg=$('#ovmsg'),txt=$('#ovtxt'),link=$('#ovlink'),loaded=false,lastFocus=null,wait=loopSym(ovSym,700);
  if(!CP.page){
    if(CP.url){var f=$('#frame');f.classList.add('can');f.setAttribute('data-cur','Open');f.addEventListener('click',function(){$('#cpLink').click()})}
    return;
  }
  function fail(){wait.stop();if(CP.url){txt.textContent='The concept opens in its own tab.';link.href=CP.url;link.hidden=false}else txt.textContent='The concept could not be loaded.';msg.hidden=false}
  /* the page behind the overlay is taken out of the tab order while it is open */
  function inert(on){Array.prototype.forEach.call(D.body.children,function(el){if(el===ov||/^(SCRIPT|STYLE|LINK|META|TITLE)$/.test(el.tagName))return;if(on)el.setAttribute('inert','');else el.removeAttribute('inert')})}
  /* two patches for a page running inside the overlay: storage that cannot throw, and in-page links that stay in the frame */
  var GUARD='<script>(function(){function mem(){var m={};return{getItem:function(k){return Object.prototype.hasOwnProperty.call(m,k)?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]},clear:function(){m={}},key:function(){return null},length:0}}["sessionStorage","localStorage"].forEach(function(n){try{window[n].getItem("_")}catch(e){try{Object.defineProperty(window,n,{value:mem(),configurable:true})}catch(_){}}})})();<\/script>';
  var LINKS='<script>document.addEventListener("click",function(e){if(e.defaultPrevented)return;var a=e.target.closest&&e.target.closest("a[href^=\'#\']");if(!a)return;e.preventDefault();var id=a.getAttribute("href").slice(1),t=id&&document.getElementById(id);if(t)t.scrollIntoView({behavior:"smooth"});else window.scrollTo({top:0,behavior:"smooth"})});<\/script>';
  function patch(t){
    t=/<head[^>]*>/i.test(t)?t.replace(/<head[^>]*>/i,function(m){return m+GUARD}):GUARD+t;
    return /<\/body>/i.test(t)?t.replace(/<\/body>/i,function(m){return LINKS+m}):t+LINKS;
  }
  function open(){
    lastFocus=D.activeElement;ov.hidden=false;D.body.classList.add('lock');inert(true);$('#ovx').focus();
    if(loaded)return;
    msg.hidden=false;wait.start();
    fetch(CP.page).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){
      if(!t||t.length<20)throw 0;
      frame.addEventListener('load',function(){msg.hidden=true;wait.stop()},{once:true});
      frame.srcdoc=patch(t);loaded=true;
    }).catch(fail);
  }
  function close(){ov.hidden=true;D.body.classList.remove('lock');inert(false);if(lastFocus&&lastFocus.focus)lastFocus.focus()}
  $$('[data-open-concept]').forEach(function(b){b.addEventListener('click',open)});
  $('#ovx').addEventListener('click',close);
  D.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden)close()});
})();

/* ---------- levels: the choice carries to the close ---------- */
(function(){
  var wrap=$('#lvs'),lv=$$('.level',wrap),line=$('#lvline'),go=$('#lvgo'),cta=$('#ctaline');
  function count(n,one,many){n=parseInt(n,10)||0;return (WORDS[n]||n)+' '+(n===1?one:many)}
  function pick(b){
    wrap.classList.add('has');
    lv.forEach(function(x){var on=x===b;x.classList.toggle('sel',on);if(x.parentNode.classList.contains('lv-col'))x.parentNode.classList.toggle('sel',on);x.setAttribute('aria-checked',on?'true':'false');x.querySelector('[data-pick]').textContent=on?'Selected':'Choose '+x.getAttribute('data-level')});
    var name=b.getAttribute('data-level'),days=count(b.getAttribute('data-days'),'senior day','senior days');
    var mg=b.getAttribute('data-manage');
    /* tiers described by how they are managed, not by days */
    if(mg){var stop=function(t){t=String(t||'').trim();return /[.!?]$/.test(t)?t:t+'.'};line.textContent=name+'. '+stop(b.getAttribute('data-text'))+' '+stop(mg);line.hidden=true}
    else line.textContent=name+'. '+days.charAt(0).toUpperCase()+days.slice(1)+' and '+count(b.getAttribute('data-sess'),'working session','working sessions')+' a month, at '+b.getAttribute('data-price')+'.';
    go.hidden=false;
    cta.textContent='Let’s talk about '+name+'.';
    var wa=$('#wa');if(wa&&!wa.hidden)wa.href=waLink('Let’s talk about '+name+'.');
    var choice={name:name,detail:line.textContent.replace(name+'. ','')};
    $$('a.mail[data-mail]').forEach(function(m){m.href=mailHref(m.getAttribute('data-mail'),m.getAttribute('data-who'),choice)});
  }
  lv.forEach(function(b,i){
    b.addEventListener('click',function(){pick(b)});
    b.addEventListener('keydown',function(e){
      var d=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;
      if(!d)return;e.preventDefault();var n=lv[(i+d+lv.length)%lv.length];n.focus();pick(n);
    });
  });
})();

/* ---------- copy an address ---------- */
$$('.mail[data-mail]').forEach(function(b){
  var cp=$('.cp',b),t=$('.mt',b);
  b.addEventListener('click',function(){
    var a=b.getAttribute('data-mail'),isLink=b.tagName==='A',lbl=cp.textContent;
    if(isLink){
      /* the link opens the mail app; the address is also copied, so it is to hand if no mail app opens */
      try{navigator.clipboard.writeText(a).then(function(){cp.textContent='Address copied too';setTimeout(function(){cp.textContent=lbl},2600)},function(){})}catch(e){}
      return;
    }
    function sel(){var r=D.createRange();r.selectNodeContents(t);var s=W.getSelection();s.removeAllRanges();s.addRange(r);cp.textContent='Selected, copy to use'}
    try{navigator.clipboard.writeText(a).then(function(){cp.textContent='Copied';setTimeout(function(){cp.textContent='Copy address'},2200)},sel)}catch(e){sel()}
  });
});

/* ---------- AIM: the symbol thinks, then delivers ---------- */
(function(){
  var pf=$('#pf'),s=$('#pfs');if(!pf||!ANIM||!('IntersectionObserver' in W))return;
  /* labels.workflowCount: the number the thinking counter climbs to, over the same two and a half seconds */
  var TOP=Math.max(1,parseInt((P.labels||{}).workflowCount,10)||12);s.textContent=TOP+'s';
  var busy=false,vis=false,think=loopSym(pfSym,620);
  function cycle(){
    if(busy||!vis)return;busy=true;
    pf.classList.add('is-live');pf.classList.remove('s1','s2');think.start();
    var k=0,iv=setInterval(function(){k++;s.textContent=k+'s';if(k>=TOP){clearInterval(iv);think.stop();
      setTimeout(function(){pf.classList.add('s1')},350);
      setTimeout(function(){pf.classList.add('s2')},900);
      setTimeout(function(){busy=false;cycle()},6500);
    }},Math.max(40,Math.round(2520/TOP)));
  }
  try{new IntersectionObserver(function(e){vis=e[0].isIntersecting;if(vis)cycle()},{threshold:.4}).observe(pf)}catch(e){}
})();

/* ---------- cursor bubble ---------- */
(function(){
  var c=$('#cur');if(!fine||!c)return;
  var x=-200,y=-200,tx=-200,ty=-200,s=0,ts=0,live=false;
  function loop(){
    x+=(tx-x)*.2;y+=(ty-y)*.2;s+=(ts-s)*.16;
    c.style.transform='translate3d('+x+'px,'+y+'px,0) scale('+s.toFixed(3)+')';
    if(ts===0&&s<.004){live=false;return}
    requestAnimationFrame(loop);
  }
  W.addEventListener('pointermove',function(e){
    tx=e.clientX;ty=e.clientY;
    var el=e.target.closest&&e.target.closest('[data-cur]');
    if(el){ts=1;if(c.textContent!==el.getAttribute('data-cur'))c.textContent=el.getAttribute('data-cur');if(!live){live=true;x=tx;y=ty;requestAnimationFrame(loop)}}else ts=0;
  },{passive:true});
  D.addEventListener('mouseleave',function(){ts=0});
})();

/* ---------- one scroll loop: progress, nav mark, parallax, reading, ruler ---------- */
(function(){
  var prog=$('#prog'),nav=$('#nav'),brand=$('#brand'),pars=$$('[data-par]'),months=$$('#months .month'),dayn=$('#dayn'),rfill=$('#rfill'),rhead=$('#rhead'),phs=$$('.track .ph'),track=$('#track'),
      marq=$('#marq'),mx=0,lastY=W.scrollY,vel=0,links=$$('.nav-links a'),secs=links.map(function(a){return $(a.getAttribute('href'))}),ticking=false,total=Math.max(1,months.length*30),folded=false,hover=false,
      stages=$$('#months .stg'),rings=stages.map(function(s){return $('.stg-ring .p',s)}),nodes=$$('.stg-node'),links2=$$('.stg-link i'),focusLists=$$('#months .focus');
  function mark(){if(navSym&&ANIM)navSym.to(folded&&!hover?1:0,900)}
  brand.addEventListener('mouseenter',function(){hover=true;mark()});
  brand.addEventListener('mouseleave',function(){hover=false;mark()});
  function frame(){
    ticking=false;
    var y=W.scrollY,vh=W.innerHeight,max=H.scrollHeight-vh;
    prog.style.transform='scaleX('+(max>0?clamp(y/max,0,1):0)+')';
    nav.classList.toggle('scrolled',y>8);
    var f=y>120;if(f!==folded){folded=f;mark()}
    if(ANIM)pars.forEach(function(im){var r=im.parentNode.getBoundingClientRect();if(r.bottom<-100||r.top>vh+100)return;var c=(r.top+r.height/2-vh/2);im.style.transform='translate3d(0,'+(-c*parseFloat(im.getAttribute('data-par'))).toFixed(1)+'px,0)'});
    wordBlocks.forEach(function(b){
      if(!ANIM)return;
      var r=b.el.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;
      var p=clamp((vh*.82-r.top)/(r.height+vh*.3),0,1),k=Math.floor(p*(b.ws.length+2));
      if(k===b.last)return;b.last=k;
      b.ws.forEach(function(w,i){w.style.opacity=i<k?1:.2});
    });
    /* day counter */
    if(months.length){
      var ref=vh*.55,day=0,act=0;
      months.forEach(function(m,i){var r=m.getBoundingClientRect(),p=clamp((ref-r.top)/r.height,0,1);day+=p*30;if(p>0)act=i});
      dayn.textContent=pad(Math.round(day));
      rfill.style.transform='scaleX('+(day/total)+')';
      rhead.style.transform='translateX('+(track.clientWidth*day/total)+'px)';
      phs.forEach(function(p,i){p.classList.toggle('on',i===act)});
      if(stages.length){
        months.forEach(function(m,i){var r=m.getBoundingClientRect(),p=clamp((ref-r.top)/r.height,0,1);if(rings[i])rings[i].style.strokeDashoffset=(1-p).toFixed(3);m.classList.toggle('now',p>0&&p<1)});
        nodes.forEach(function(nd,i){var r=months[i].getBoundingClientRect(),p=clamp((ref-r.top)/r.height,0,1);nd.classList.toggle('on',i===act&&day>0);nd.classList.toggle('done',p>=1);if(links2[i])links2[i].style.transform='scaleX('+p.toFixed(3)+')'});
        if(ANIM)focusLists.forEach(function(ol){var r=ol.getBoundingClientRect();if(r.bottom<-vh||r.top>vh*2)return;var lis=ol.children,on=-1;for(var k=0;k<lis.length;k++){if(lis[k].getBoundingClientRect().top<vh*.62)on=k}for(var k2=0;k2<lis.length;k2++){lis[k2].classList.toggle('is-cur',k2===on);lis[k2].classList.toggle('is-past',k2<on)}ol.classList.toggle('reading',on>=0)});
      }
    }
    /* nav state */
    var on=-1;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<vh*.4)on=i});
    links.forEach(function(a,i){a.classList.toggle('on',i===on)});
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  W.addEventListener('scroll',onScroll,{passive:true});W.addEventListener('resize',onScroll);frame();
  /* marquee: moves only while it is on screen, leans into the scroll */
  var mvis=true;
  if('IntersectionObserver' in W)try{new IntersectionObserver(function(e){mvis=e[0].isIntersecting}).observe(marq.parentNode)}catch(e){}
  if(ANIM)(function loop(){
    var y=W.scrollY;vel+=((y-lastY)-vel)*.2;lastY=y;
    if(mvis){mx-=.7+Math.abs(vel)*.35;var half=marq.scrollWidth/2;if(half>0&&-mx>=half)mx+=half;marq.style.transform='translate3d('+mx.toFixed(1)+'px,0,0)'}
    requestAnimationFrame(loop);
  })();
})();


/* ---------- case study thumbnails: small loops play while they are on screen ---------- */
(function(){
  var vs=$$('.lv-th video');if(!vs.length)return;
  var still=false;try{still=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  if(still||!('IntersectionObserver' in W))return;
  function on(v){if(!v.src){v.src=v.getAttribute('data-src');v.addEventListener('playing',function(){v.parentNode.classList.add('vp')})}var p=v.play();if(p&&p.catch)p.catch(function(){})}
  try{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)on(e.target);else e.target.pause()})},{rootMargin:'120px 0px'});vs.forEach(function(v){io.observe(v)})}catch(e){}
})();

/* ---------- seamless hand-off to and from the website ----------
   Links into the website (case studies, the symbol) close an ink curtain, as the website does between its pages,
   and the website opens the same curtain on arrival. Arriving from the website, the page opens out of it. */
(function(){
  var SITE=P.site;if(!SITE)return;
  /* Back to website: returns to the website page the visitor came from (same place), or the home page */
  var hero=$('#top'),bk=D.createElement('a');bk.className='ot-back';bk.href=SITE.home||'../';bk.setAttribute('data-site','');bk.setAttribute('data-back','');
  bk.innerHTML='<span aria-hidden="true">←</span><span>'+esc(SITE.back||'Back to website')+'</span>';if(hero)hero.insertBefore(bk,hero.firstChild);
  var FROM=null;try{var r=new URL(D.referrer);if(r.origin===location.origin&&!/\/originalthinking\//.test(r.pathname))FROM=r.pathname}catch(x){}
  /* the website's menu in the bar, and the same full-screen menu on phones */
  if(SITE.menu&&SITE.menu.length){
    var nlk=$('#navlinks');
    function item(m,cls){return '<a'+(cls?' class="'+cls+'"':'')+' href="'+esc(m.href)+'"'+(m.current?' aria-current="page"':' data-site')+'>'+esc(m.label)+'</a>'}
    if(nlk){nlk.innerHTML=SITE.menu.map(function(m){return item(m,m.current?'on':'')}).join('');nlk.classList.add('site')}
    var nv=$('#nav'),mbtn=D.createElement('button');mbtn.type='button';mbtn.className='menu-btn';mbtn.setAttribute('aria-expanded','false');mbtn.setAttribute('aria-controls','mnav');mbtn.innerHTML='<span>Menu</span><i></i>';
    if(nv)nv.appendChild(mbtn);
    var mnv=D.createElement('div');mnv.className='mnav';mnv.id='mnav';mnv.setAttribute('aria-hidden','true');
    mnv.innerHTML='<div class="mnav-top"><span>The Observatory</span><button type="button" id="menuClose">Close</button></div><nav class="mnav-links" aria-label="Menu">'+SITE.menu.map(function(m){return item(m,m.current?'mn-wwu':'')}).join('')+'</nav><div class="mnav-foot">'+(SITE.menuFoot||[]).map(function(t,i){return '<span'+(i?' class="dim"':'')+'>'+esc(t)+'</span>'}).join('')+'</div>';
    D.body.appendChild(mnv);
    function shut(){mnv.classList.remove('open');mnv.setAttribute('aria-hidden','true');mbtn.setAttribute('aria-expanded','false');D.body.classList.remove('lock')}
    mbtn.addEventListener('click',function(){mnv.classList.add('open');mnv.setAttribute('aria-hidden','false');mbtn.setAttribute('aria-expanded','true');D.body.classList.add('lock')});
    $('#menuClose',mnv).addEventListener('click',shut);
    $$('a[aria-current]',mnv).forEach(function(x){x.addEventListener('click',shut)});
    D.addEventListener('keydown',function(e){if(e.key==='Escape'&&mnv.classList.contains('open'))shut()});
  }
  var b=$('#brand');if(b&&SITE.home){b.setAttribute('href',SITE.home);b.setAttribute('aria-label','The Observatory, website home');b.setAttribute('data-site','')}
  var c=D.createElement('div');c.className='hand';c.setAttribute('aria-hidden','true');c.innerHTML='<svg class="sym"><use href="#sym"/></svg>';D.body.appendChild(c);
  D.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a[data-site]');if(!a)return;
    try{sessionStorage.setItem('obs-cur','1')}catch(x){}
    var back=a.hasAttribute('data-back')&&FROM&&history.length>1;
    if(!ANIM){if(back){e.preventDefault();history.back()}return}
    e.preventDefault();c.classList.add('cover');
    setTimeout(function(){if(back)history.back();else location.href=a.href},420);
  });
  /* back/forward cache: if this page is shown again, the curtain is open */
  W.addEventListener('pageshow',function(ev){if(ev.persisted)c.classList.remove('cover')});
})();

H.classList.add('ok');
})();
