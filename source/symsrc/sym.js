/* ============================================================
   THE OBSERVATORY SYMBOL, IN MOTION
   One circle and three wings each side, drawn from geometry so every part can move.
   p = 0 is the full form. p = 1 is the circle alone.
   Beats: the wings ease out a touch (anticipation), fold in from the outside first,
   and the circle swells as it takes them in, then settles.
   ============================================================ */
var SYM=(function(){
  var CX=143,CY=93.7,R=90.15,NS='http://www.w3.org/2000/svg';
  /* each wing is a slice of a circle: [centre x, radius, x of the straight edge], inner to outer */
  var WINGS=[[151.4,108.1,98.4],[138.7,113.5,55],[80.2,81.4,17.4]];
  var LEAD=[.17,.085,0];      /* outer wing leads, inner follows */
  var REST=[.8,.66,.52];      /* scale at which each wing sits fully inside the circle */
  var SPAN=.6;                /* share of the timeline each wing takes to travel */
  function clamp(v){return v<0?0:v>1?1:v}
  function anticipate(t){var c=1.15;return t*t*((c+1)*t-c)}
  function sine(t){return .5-.5*Math.cos(Math.PI*t)}
  function outCubic(t){return 1-Math.pow(1-t,3)}
  function circleScale(p){
    if(p<.56)return 1-.035*sine(p/.56);
    if(p<.79)return .965+.085*outCubic((p-.56)/.23);
    return 1.05-.05*sine((p-.79)/.21);
  }
  function wing(c,r,e,right){
    var h=Math.sqrt(r*r-(e-c)*(e-c)),x=(right?2*CX-e:e).toFixed(2);
    return 'M'+x+' '+(CY-h).toFixed(2)+'A'+r+' '+r+' 0 0 '+(right?1:0)+' '+x+' '+(CY+h).toFixed(2)+'Z';
  }
  function scaleAbout(s){return 'translate('+CX+' '+CY+') scale('+s.toFixed(4)+') translate('+(-CX)+' '+(-CY)+')'}
  function mount(host){
    var svg=document.createElementNS(NS,'svg');
    svg.setAttribute('viewBox','0 0 286 188');svg.setAttribute('class','symx');svg.setAttribute('aria-hidden','true');
    svg.style.overflow='visible';
    var groups=WINGS.map(function(w){
      var g=document.createElementNS(NS,'g');
      [false,true].forEach(function(right){var p=document.createElementNS(NS,'path');p.setAttribute('d',wing(w[0],w[1],w[2],right));g.appendChild(p)});
      return g;
    });
    for(var k=groups.length-1;k>=0;k--)svg.appendChild(groups[k]);
    var circ=document.createElementNS(NS,'circle');circ.setAttribute('cx',CX);circ.setAttribute('cy',CY);circ.setAttribute('r',R);svg.appendChild(circ);
    host.textContent='';host.appendChild(svg);
    var ctl={p:0,raf:0,
      set:function(p){
        ctl.p=p=clamp(p);
        for(var k=0;k<3;k++){
          var e=anticipate(clamp((p-LEAD[k])/SPAN));
          groups[k].setAttribute('transform',scaleAbout(1+(REST[k]-1)*e));
          groups[k].style.visibility=p>=.999?'hidden':'';
        }
        circ.setAttribute('transform',scaleAbout(circleScale(p)));
        return ctl;
      },
      /* glide to a state; interruptible, so hover and scroll never fight */
      to:function(target,ms,done){
        cancelAnimationFrame(ctl.raf);
        var from=ctl.p,d=Math.abs(target-from),dur=(ms||1050)*d,t0=null;
        if(d<.001||!dur){ctl.set(target);if(done)done();return ctl}
        (function step(t){
          if(t0===null)t0=t;
          var k=clamp((t-t0)/dur);ctl.set(from+(target-from)*k);
          if(k<1)ctl.raf=requestAnimationFrame(step);else if(done)done();
        })(performance.now());
        return ctl;
      }
    };
    return ctl.set(0);
  }
  return {mount:mount};
})();
