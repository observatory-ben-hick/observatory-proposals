const { chromium } = require('playwright');
const URL=process.argv[2]||'http://localhost:8765/preview.html';
const tag=process.argv[3]||'a';
(async()=>{
  const b = await chromium.launch();
  const out=[];
  // 1. widths
  for (const w of [320,390,768,1024,1440,1920]){
    const p = await b.newPage({viewport:{width:w,height:900}});
    const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|404/.test(m.text()))errs.push(m.text())});
    await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(2300);
    const H=await p.evaluate(()=>document.documentElement.scrollHeight);
    for(let y=0;y<H;y+=700){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(120)}
    await p.waitForTimeout(500);
    const r=await p.evaluate(()=>{
      const vw=document.documentElement.clientWidth, bad=[];
      document.querySelectorAll('body *').forEach(e=>{
        if(e.closest('.marq,.shop-rail,.rail,.pre,.ov,.cur,.stage,.band,.kv .ph,.cap-view,.ap,svg'))return;
        const cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden')return;
        const r=e.getBoundingClientRect(); if(r.width===0)return;
        if(r.right>vw+1.5||r.left<-1.5) bad.push(e.tagName+'.'+(e.className&&e.className.baseVal===undefined?e.className:'')+' L'+Math.round(r.left)+' R'+Math.round(r.right));
      });
      // hidden-after-scroll check
      const hid=[...document.querySelectorAll('.rv,[data-split]')].filter(e=>!e.classList.contains('in')&&getComputedStyle(e).display!=='none'&&e.offsetParent!==null).length;
      // clipped text: elements whose scrollWidth exceeds clientWidth with overflow hidden
      const clip=[];document.querySelectorAll('h1,h2,h3,p,span,button,a,li').forEach(e=>{const cs=getComputedStyle(e);if(e.closest('.marq,.shop-rail,.pre,.ov,.w,.btn'))return;if((cs.overflowX==='hidden'||cs.overflowX==='clip')&&e.scrollWidth>e.clientWidth+2)clip.push(e.tagName+'.'+e.className)});
      return {sw:document.documentElement.scrollWidth,vw,bad:[...new Set(bad)].slice(0,8),hid,clip:clip.slice(0,6)};
    });
    out.push('W'+w+' sw='+r.sw+'/'+r.vw+' offscreen='+JSON.stringify(r.bad)+' unrevealed='+r.hid+' clipped='+JSON.stringify(r.clip)+' errs='+JSON.stringify(errs));
    if(w===320){await p.evaluate(()=>document.querySelector('#days .ruler').scrollIntoView({block:'start',behavior:'instant'}));await p.waitForTimeout(700);await p.screenshot({path:'prev/'+tag+'-320-ruler.png'});
      await p.evaluate(()=>document.querySelector('.cta').scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(900);await p.screenshot({path:'prev/'+tag+'-320-cta.png'});
      await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(700);await p.screenshot({path:'prev/'+tag+'-320-hero.png'});}
    await p.close();
  }
  // 2. reduced motion
  { const c=await b.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'}); const p=await c.newPage(); await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(800);
    const r=await p.evaluate(()=>({anim:document.documentElement.classList.contains('anim'),pre:getComputedStyle(document.querySelector('#pre')).display,op:[...document.querySelectorAll('.rv')].filter(e=>getComputedStyle(e).opacity!=='1').length}));
    out.push('REDUCED '+JSON.stringify(r)); await p.screenshot({path:'prev/'+tag+'-reduced.png'}); await c.close(); }
  // 3. no JS
  { const c=await b.newContext({viewport:{width:1280,height:800},javaScriptEnabled:false}); const p=await c.newPage(); await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(500);
    await p.screenshot({path:'prev/'+tag+'-nojs.png',fullPage:false}); out.push('NOJS ok'); await c.close(); }
  // 3b. main script fails after head script: simulate by blocking? emulate: page where app script throws immediately
  { const p=await b.newPage({viewport:{width:1280,height:800}}); await p.addInitScript(()=>{ Object.defineProperty(window,'IntersectionObserver',{get(){throw new Error('simulated failure')}}) });
    await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(7000);
    const r=await p.evaluate(()=>({pre:getComputedStyle(document.querySelector('#pre')).visibility+'/'+getComputedStyle(document.querySelector('#pre')).display,hiddenBlocks:[...document.querySelectorAll('.rv')].filter(e=>getComputedStyle(e).opacity==='0').length,heads:[...document.querySelectorAll('[data-split] .w>span')].filter(e=>getComputedStyle(e).transform!=='none').length}));
    out.push('SCRIPTFAIL '+JSON.stringify(r)); await p.close(); }
  // 4/5. overlay: anchors inside the embedded page and blocked storage
  if(await (async()=>{const p=await b.newPage();await p.goto(URL);const has=await p.evaluate(()=>!!document.querySelector('[data-open-store],[data-open-concept]'));await p.close();return has})()){
    for (const block of [false,true]){
      const p=await b.newPage({viewport:{width:1280,height:800}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
      if(block) await p.addInitScript(()=>{ try{Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new DOMException('blocked','SecurityError')}});Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('blocked','SecurityError')}})}catch(e){} });
      await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(2300);
      await p.evaluate(()=>document.querySelector('[data-open-store],[data-open-concept]').click()); await p.waitForTimeout(4200);
      const fr=p.frames().find(f=>f!==p.mainFrame());
      if(!fr){out.push('OVERLAY block='+block+' NO FRAME errs='+JSON.stringify(errs));await p.close();continue}
      const st=await fr.evaluate(()=>({title:document.title,pre:!!document.querySelector('#pre'),ready:document.documentElement.classList.contains('ready')})).catch(e=>({err:e.message}));
      let nav='n/a';
      if(!block){ await fr.evaluate(()=>{const a=document.querySelector('a[href="#why"]');a&&a.click()}).catch(()=>{}); await p.waitForTimeout(1500);
        const fr2=p.frames().find(f=>f!==p.mainFrame()); nav=fr2?(fr2.url()+' | '+await fr2.evaluate(()=>document.title+' scrollY='+Math.round(scrollY)).catch(e=>'ERR '+e.message)):'frame gone'; }
      // focus trap
      let foc='';
      if(!block){ for(let i=0;i<4;i++){await p.keyboard.press('Tab')} foc=await p.evaluate(()=>{const a=document.activeElement;return a?(a.tagName+'#'+a.id+' inOverlay='+!!a.closest('#ov')):'none'}); }
      out.push('OVERLAY block='+block+' state='+JSON.stringify(st)+' afterAnchor='+nav+' focusAfterTabs='+foc+' errs='+JSON.stringify(errs));
      await p.screenshot({path:'prev/'+tag+'-ov-'+(block?'blocked':'ok')+'.png'});
      await p.close();
    }
  }
  console.log(out.join('\n'));
  await b.close();
})();
