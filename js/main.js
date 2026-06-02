/* =========================================================
   BRINDI'S BISTRO — main.js
   Data · rendering · GSAP scrollytelling · egg finale
   ========================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var smoother = null;
  var normalizer = null;   // GSAP touch-scroll normalizer (created alongside the smoother)
  var PHOTOS_VER = "2";    // bump when dish photos change -> cache-busts the cached image URLs
  var hasPhysics = false;  // true once Draggable + InertiaPlugin register (egg drag/throw enabled)

  /* ----------------------------------------------------------
     Line-icon set (subtle placeholders inside photo-slots)
  ---------------------------------------------------------- */
  var ICONS = {
    bowl:'<path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 8c1-1.4 3-1.4 4 0M13 7c1.4-1.4 3-.6 3 .8"/>',
    eggplant:'<path d="M14.5 4.2c1.3.2 1.7 1.4 1 2.3 2.8 1.1 3.6 4.4 1.7 7.2-2 3-6.4 4.6-9.4 2.8-2.8-1.7-2.4-6 .8-8 1.6-1 3.4-1.7 4.9-1.6"/><path d="M15.4 6.5c0-1-.6-1.8-1.6-2.3"/>',
    leaf:'<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z"/><path d="M9 15 15 9"/>',
    wheat:'<path d="M12 21V8"/><path d="M12 8c-2-1.4-4-.3-4-.3.2 2.2 2.2 3 4 1.6M12 8c2-1.4 4-.3 4-.3-.2 2.2-2.2 3-4 1.6"/><path d="M12 13c-2-1.4-4-.3-4-.3.2 2.2 2.2 3 4 1.6M12 13c2-1.4 4-.3 4-.3-.2 2.2-2.2 3-4 1.6"/>',
    shrimp:'<path d="M17 7c2.5 0 4 2.2 4 5 0 4-4 7-9 7-4 0-8-2-8-5 0-1 1-2 2-2"/><path d="M6 12c2 0 3.5-1 3.5-3M20 9.5c1 0 1.6.7 1.6 1.6"/>',
    mushroom:'<path d="M4.5 11a7.5 7.5 0 0 1 15 0Z"/><path d="M10 11v6a2 2 0 0 0 4 0v-6"/>',
    flame:'<path d="M12 3c3 3.6 5 6 5 9a5 5 0 0 1-10 0c0-1.8 1-3 2-4 .2 1 1 1.8 2 1.8-.2-2.8 0-4.8 1-6.8Z"/>',
    fish:'<path d="M3 12c4-5 11-5 15 0-4 5-11 5-15 0Z"/><path d="M18 12c2-1 3-2.4 3-2.4v4.8S20 13 18 12Z"/><path d="M8 11h.01"/>',
    steak:'<path d="M6 8.5a6 5.5 0 0 1 11.6 0c2.2 0 3.9 1.2 3.9 3s-1.7 3-3.9 3A6 5.5 0 0 1 6 8.5Z"/><path d="M9 11.5h4"/>',
    skewer:'<path d="M4 20 20 4"/><circle cx="9" cy="13" r="2.3"/><circle cx="13" cy="9" r="2.3"/>',
    bread:'<path d="M4 9.5a8 4 0 0 1 16 0c0 2.2-3 4-8 4s-8-1.8-8-4Z"/><path d="M8 8.4h.01M11.5 7.6h.01M15 8.4h.01"/>',
    baklava:'<path d="M12 3 21 12 12 21 3 12Z"/><path d="M7.5 12h9M12 7.5v9"/>',
    delight:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 12a3 3 0 0 1 6 0 3 3 0 0 1-6 0Z"/>',
    pudding:'<path d="M5 13a7 4 0 0 1 14 0v1a7 4 0 0 1-14 0Z"/><path d="M7 10c1-1.4 3-1.4 4 0s3 1.4 4 0"/>',
    coffee:'<path d="M5 8h11v5a5 5 0 0 1-10 0Z"/><path d="M16 9.5h2.2a2 2 0 0 1 0 4H16"/><path d="M8.5 4.5c0 1 .8 1.2.8 2.2M11.5 4.5c0 1 .8 1.2.8 2.2"/>',
    salad:'<path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M8 9.5c1-2 3.4-1.8 4.4-.4M13 8.6c1.6-1.8 4-1 4 1"/>'
  };
  function svg(name){ return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(ICONS[name]||ICONS.salad)+'</svg>'; }

  /* ----------------------------------------------------------
     Menu data (real Brindi's menu)
  ---------------------------------------------------------- */
  var MEZZE = [
    {name:"Hummus",            desc:"Chickpea, olive oil, garlic, lemon &amp; tahini — classic or spiced.", price:9,  tag:"VG", icon:"bowl",     photo:"hummus.webp"},
    {name:"Baba Ghanoush",     desc:"Roasted eggplant whipped with yogurt, tahini, garlic &amp; lemon.",     price:9,  tag:"VG", icon:"eggplant", photo:"baba-ghanoush.webp"},
    {name:"Dolmas",            desc:"House-made grape leaves, rolled by hand around herbed rice.",           price:9,  tag:"VG", icon:"leaf",     photo:"dolmas.webp"},
    {name:"Tabbouleh",         desc:"Cracked wheat, parsley, green onion, tomato &amp; bright lemon.",       price:9,  tag:"VG", icon:"wheat",    photo:"tabbouleh.webp"},
    {name:"Eggplant Shakshuka",desc:"Wood-fired eggplant simmered with tomato, peppers, garlic &amp; lemon.",price:9,  tag:"VT", icon:"flame",    photo:"eggplant-shakshuka.webp"},
    {name:"Garlic Shrimp",     desc:"Wood-fired shrimp in a glossy garlic-lemon sauce.",                    price:17, tag:"",   icon:"shrimp",   photo:"garlic-shrimp.webp"},
    {name:"Stuffed Mushrooms", desc:"Caps filled with garlic ricotta &amp; lemon, kissed by flame.",         price:17, tag:"VT", icon:"mushroom", photo:"stuffed-mushrooms.webp"}
  ];
  var ENTREES = [
    {name:"Chicken Shish Kebab", price:20, note:"Wood-fired · rice or salad · yogurt sauce"},
    {name:"Lamb Shish Kebab",    price:22, note:"Charred over open flame"},
    {name:"Shrimp Shish Kebab",  price:20, note:"Garlic &amp; lemon"},
    {name:"Lamb Shank Dinner",   price:25, note:"Slow-braised until it falls from the bone"},
    {name:"Köfte Kebab",    price:20, note:"Beef &amp; lamb meatballs"},
    {name:"Marinated Salmon",    price:23, note:"Flame-roasted"},
    {name:"Whole Sea Bass",      price:25, note:"Mediterranean · whole-roasted"},
    {name:"Wood-Fired Steak",    price:26, note:"The flame at its boldest"},
    {name:"Turkish Pasta",       price:17, note:"Farfalle, cold yogurt-garlic, hot chili oil"},
    {name:"Pita Sandwich",       price:15, note:"Meatball, lamb or chicken · sumac salad"}
  ];
  var FLATBREADS = [
    {name:"Lahmacun", price:15}, {name:"Pastrami", price:15}, {name:"Spinach &amp; Feta", price:13},
    {name:"Veggie", price:13}, {name:"Cheese", price:12}
  ];
  var SALADS = [
    {name:"House Turkish Mixed Green", desc:"Arugula, romaine, spinach, red cabbage, cucumber, tomato, walnuts &amp; pine nuts.", price:13},
    {name:"Classic Caesar", desc:"Romaine, parmesan, croutons &amp; black pepper, yogurt or pomegranate dressing.", price:12}
  ];
  var SWEETS = [
    {name:"Pistachio Baklava", desc:"Layered phyllo, pistachio &amp; honey.", price:8, icon:"baklava", photo:"pistachio-baklava.jpg"},
    {name:"Turkish Delight",   desc:"Rose &amp; citrus lokum, dusted in sugar.", price:8, icon:"delight", photo:"turkish-delight.jpg"},
    {name:"Rice Pudding",      desc:"Slow-cooked with cinnamon &amp; vanilla.", price:8, icon:"pudding", photo:"rice-pudding.jpg"}
  ];
  var DRINKS = ["Turkish Coffee","Ayran","House Hibiscus Tea","Pomegranate Tea","Fresh Lemonade"];

  /* ----------------------------------------------------------
     Rendering
  ---------------------------------------------------------- */
  function el(html){ var t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstElementChild; }
  function photoSlot(file, alt, ratio, icon){
    return '<div class="photo-slot '+ratio+'">'
      + '<div class="ph">'+svg(icon)+'<span class="ph-tag">Brindi’s</span></div>'
      + '<img src="assets/photos/'+file+'?v='+PHOTOS_VER+'" alt="'+alt+'" loading="lazy" '
      + 'onload="this.classList.add(\'loaded\')" onerror="this.remove()">'
      + '</div>';
  }

  function render(){
    // Mezze cards
    var track = document.getElementById("mezzeTrack");
    MEZZE.forEach(function(d,i){
      track.appendChild(el(
        '<article class="dish-card">'
        + '<span class="idx">'+("0"+(i+1)).slice(-2)+'</span>'
        + photoSlot(d.photo, d.name, "r45", d.icon)
        + '<h3 class="dish-name">'+d.name+'</h3>'
        + '<p class="dish-desc">'+d.desc+'</p>'
        + '<div class="dish-foot"><span class="dish-price">$'+d.price+'</span>'
        + (d.tag?'<span class="tag">'+d.tag+'</span>':'')+'</div>'
        + '</article>'));
    });
    // tail spacer so last card clears the edge
    track.appendChild(el('<div style="flex:0 0 6vw"></div>'));

    // Entrées
    var list = document.getElementById("entreeList");
    ENTREES.forEach(function(e,i){
      list.appendChild(el(
        '<div class="entree">'
        + '<span class="e-idx">'+("0"+(i+1)).slice(-2)+'</span>'
        + '<h3 class="e-name">'+e.name+(e.note?'<span class="e-note">'+e.note+'</span>':'')+'</h3>'
        + '<span class="e-price">$'+e.price+'</span>'
        + '</div>'));
    });
    document.querySelector(".woodfire .wrap").appendChild(el(
      '<div class="woodfire-photos">'
      + photoSlot("lamb-shank.jpg","Wood-fired lamb shank","r45","steak")
      + photoSlot("sea-bass.jpg","Whole Mediterranean sea bass","r45","fish")
      + '</div>'));

    // Flatbreads
    var flat = document.getElementById("flatList");
    FLATBREADS.forEach(function(f){
      flat.appendChild(el('<li>'+f.name+'<span class="p">$'+f.price+'</span></li>'));
    });
    // Salads
    var sal = document.getElementById("saladList");
    SALADS.forEach(function(s){
      sal.appendChild(el('<li><span><span class="l-name">'+s.name+'</span><span class="l-desc">'+s.desc+'</span></span><span class="l-price">$'+s.price+'</span></li>'));
    });
    // Sweets
    var sg = document.getElementById("sweetsGrid");
    SWEETS.forEach(function(s){
      sg.appendChild(el(
        '<div class="sweet">'
        + photoSlot(s.photo, s.name, "r45", s.icon)
        + '<h3 class="s-name">'+s.name+'</h3>'
        + '<p class="s-desc">'+s.desc+'</p>'
        + '<span class="s-price">$'+s.price+'</span>'
        + '</div>'));
    });
    // Drinks
    var dl = document.getElementById("drinkList");
    DRINKS.forEach(function(d){ dl.appendChild(el('<li>'+d+'</li>')); });
  }

  /* ----------------------------------------------------------
     WebAudio crack synth
  ---------------------------------------------------------- */
  var actx=null, muted=false;
  function ensureAudio(){ if(!actx){ try{ actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(actx&&actx.state==="suspended"){actx.resume();} }
  function playCrack(intensity, big){
    if(muted) return; ensureAudio(); if(!actx) return;
    var t=actx.currentTime, dur=big?0.55:0.13;
    var buf=actx.createBuffer(1, Math.floor(actx.sampleRate*dur), actx.sampleRate);
    var data=buf.getChannelData(0);
    for(var i=0;i<data.length;i++){ data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length, big?2:3.2); }
    var src=actx.createBufferSource(); src.buffer=buf;
    var bp=actx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=big?780:1500+intensity*420; bp.Q.value=0.9;
    var g=actx.createGain(); g.gain.value=Math.min(0.5, 0.16*intensity);
    src.connect(bp); bp.connect(g); g.connect(actx.destination); src.start(t);
    if(big){
      var o=actx.createOscillator(), og=actx.createGain();
      o.type="sine"; o.frequency.setValueAtTime(523,t); o.frequency.exponentialRampToValueAtTime(880,t+0.55);
      og.gain.setValueAtTime(0.0001,t); og.gain.exponentialRampToValueAtTime(0.22,t+0.05); og.gain.exponentialRampToValueAtTime(0.0001,t+1.0);
      o.connect(og); og.connect(actx.destination); o.start(t); o.stop(t+1.05);
    }
  }

  /* ----------------------------------------------------------
     UI: sound toggle + menu modal + scroll progress
  ---------------------------------------------------------- */
  function wireUI(){
    var st=document.getElementById("soundToggle");
    st.addEventListener("click", function(){
      muted=!muted; st.setAttribute("aria-pressed", String(muted)); if(!muted) ensureAudio();
    });

    var modal=document.getElementById("menuModal");
    document.getElementById("openMenu").addEventListener("click", function(){
      modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
      if(smoother) smoother.paused(true);
      if(normalizer) normalizer.disable();   // release touch so the tall modal scrolls natively on mobile
      document.body.style.overflow="hidden";
    });
    function closeMenu(){
      modal.classList.remove("open"); modal.setAttribute("aria-hidden","true");
      if(smoother) smoother.paused(false);
      if(normalizer) normalizer.enable();
      document.body.style.overflow="";
    }
    document.getElementById("menuClose").addEventListener("click", closeMenu);
    modal.addEventListener("click", function(e){ if(e.target===modal) closeMenu(); });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeMenu(); });

    var bar=document.getElementById("progressBar");
    ScrollTrigger.create({ start:0, end:"max", onUpdate:function(self){ gsap.set(bar,{scaleX:self.progress}); } });
  }

  /* ----------------------------------------------------------
     Embers
  ---------------------------------------------------------- */
  function embers(sel, n){
    if(reduced) return;
    var c=document.querySelector(sel); if(!c) return;
    for(var i=0;i<n;i++){
      var e=document.createElement("i"); e.className="ember";
      var s=gsap.utils.random(3,8); e.style.width=e.style.height=s+"px";
      e.style.left=gsap.utils.random(0,100)+"%"; c.appendChild(e);
      (function(node){
        function fly(){
          gsap.set(node,{y:0,opacity:0,scale:gsap.utils.random(.6,1.2)});
          gsap.timeline({onComplete:fly, delay:gsap.utils.random(0,1.5)})
            .to(node,{opacity:gsap.utils.random(.4,.85),duration:.8})
            .to(node,{y:-gsap.utils.random(window.innerHeight*0.55, window.innerHeight*1.05),
                      x:"+="+gsap.utils.random(-70,70), duration:gsap.utils.random(4,9), ease:"none"},0)
            .to(node,{opacity:0,duration:1.4},"-=1.6");
        }
        gsap.delayedCall(gsap.utils.random(0,6), fly);
      })(e);
    }
  }

  /* ----------------------------------------------------------
     Helpers: reveals
  ---------------------------------------------------------- */
  function reveal(sel, opts){
    gsap.utils.toArray(sel).forEach(function(node){
      gsap.from(node, Object.assign({opacity:0, y:30, duration:.9, ease:"brindi",
        scrollTrigger:{trigger:node, start:"top 86%"}}, opts||{}));
    });
  }
  function splitTitle(sel){
    gsap.utils.toArray(sel).forEach(function(node){
      var split=new SplitText(node,{type:"lines", mask:"lines"});
      gsap.from(split.lines,{yPercent:115, opacity:0, duration:1, ease:"brindi", stagger:.09,
        scrollTrigger:{trigger:node, start:"top 84%"}});
    });
  }

  /* ----------------------------------------------------------
     Act timelines
  ---------------------------------------------------------- */
  function heroIntro(){
    var split=new SplitText(".hero-title .line",{type:"chars"});
    // Hide the hero IMMEDIATELY so it sits blank behind the preloader — this prevents
    // any flash of un-animated text when the intro curtain lifts. Returns a paused
    // timeline the caller plays once the intro slide is gone, so the text only ever
    // appears via the animation on an already-blank screen.
    gsap.set(".hero-kicker",{opacity:0,y:22});
    gsap.set(".hero-logo",{opacity:0,y:36,scale:.94});
    gsap.set(split.chars,{yPercent:120,opacity:0});
    gsap.set(".hero-tag",{opacity:0,y:20});
    gsap.set(".scroll-cue",{opacity:0,y:12});
    var tl=gsap.timeline({paused:true, defaults:{ease:"brindi"}});
    tl.to(".hero-kicker",{opacity:1,y:0,duration:1.2})
      .to(".hero-logo",{opacity:1,y:0,scale:1,duration:1.5},"-=.75")
      .to(split.chars,{yPercent:0,opacity:1,stagger:.035,duration:1.2},"-=.85")
      .to(".hero-tag",{opacity:1,y:0,duration:1.1},"-=.6")
      .to(".scroll-cue",{opacity:1,y:0,duration:1.1},"-=.45")
      // a soft, repeating breath on the cue so the held hero gently invites a scroll
      .to(".scroll-cue",{opacity:.55,duration:1.6,ease:"sine.inOut",yoyo:true,repeat:-1},"+=.1");
    return tl;
  }
  function heroParallax(){
    gsap.to(".hero-inner",{yPercent:-14, ease:"none",
      scrollTrigger:{trigger:".hero", start:"top top", end:"bottom top", scrub:true}});
    gsap.to(".hero-emblem",{scale:1.18, rotation:6, ease:"none",
      scrollTrigger:{trigger:".hero", start:"top top", end:"bottom top", scrub:true}});
  }

  function fireStory(){
    var lines=gsap.utils.toArray(".fire-line");
    lines.forEach(function(l){ l._w=new SplitText(l.querySelector(".t"),{type:"words"}).words; });
    var tl=gsap.timeline({scrollTrigger:{trigger:".fire", start:"top top",
      end:"+="+(lines.length*110)+"%", pin:true, scrub:1, anticipatePin:1}});
    lines.forEach(function(l,i){
      var d=l.dataset.dir;
      var from = d==="left"?{xPercent:-55}: d==="right"?{xPercent:55}: d==="scale"?{scale:.7}:{yPercent:90};
      tl.fromTo(l,{opacity:0},{opacity:1,duration:.18},i);
      tl.fromTo(l._w, Object.assign({opacity:0},from),
        {opacity:1,xPercent:0,yPercent:0,scale:1,stagger:.035,duration:.55,ease:"brindi"}, i+0.02);
      if(i<lines.length-1){
        tl.to(l._w,{opacity:0,yPercent:-40,stagger:.02,duration:.4}, i+0.72);
        tl.to(l,{opacity:0,duration:.18}, i+0.85);
      }
    });
    gsap.to(".fire-glow",{yPercent:-12,opacity:.75,ease:"none",
      scrollTrigger:{trigger:".fire",start:"top bottom",end:"bottom top",scrub:true}});
  }

  function mezze(){
    var track=document.getElementById("mezzeTrack");
    var amount=function(){ return track.scrollWidth - window.innerWidth + 40; };
    var hTween=gsap.to(track,{ x:function(){return -amount();}, ease:"none",
      scrollTrigger:{ trigger:".mezze", start:"top top", end:function(){return "+="+amount();},
        pin:true, scrub:1, invalidateOnRefresh:true, anticipatePin:1 } });
    // intro reveal
    splitTitleInContainer(".mezze-intro .sect-title");
    gsap.utils.toArray(".dish-card").forEach(function(card){
      gsap.from(card.querySelectorAll(".idx,.dish-name,.dish-desc,.dish-foot"),
        {y:26,opacity:0,stagger:.07,duration:.7,ease:"brindi",
         scrollTrigger:{trigger:card, containerAnimation:hTween, start:"left 88%"}});
      gsap.from(card.querySelector(".photo-slot"),
        {scale:1.12,opacity:0,duration:.8,ease:"brindi",
         scrollTrigger:{trigger:card, containerAnimation:hTween, start:"left 92%"}});
    });
  }
  // title reveal that works whether or not inside container animation (no ST here, plays on section enter)
  function splitTitleInContainer(sel){
    gsap.utils.toArray(sel).forEach(function(node){
      var split=new SplitText(node,{type:"lines",mask:"lines"});
      gsap.from(split.lines,{yPercent:115,duration:1,ease:"brindi",stagger:.09,
        scrollTrigger:{trigger:".mezze",start:"top 70%"}});
    });
  }

  function woodfire(){
    splitTitle(".woodfire-head .sect-title");
    reveal(".woodfire-head .kicker");
    reveal(".woodfire-head .sect-lede",{y:24});
    gsap.utils.toArray(".entree").forEach(function(row,i){
      gsap.from(row,{opacity:0,y:34,duration:.8,ease:"brindi",
        scrollTrigger:{trigger:row,start:"top 90%"}});
      gsap.from(row.querySelector(".e-name"),{xPercent:(i%2?5:-5),duration:.9,ease:"brindi",
        scrollTrigger:{trigger:row,start:"top 90%"}});
    });
    gsap.utils.toArray(".woodfire-photos .photo-slot").forEach(function(p,i){
      gsap.from(p,{opacity:0,y:50,duration:1,ease:"brindi",delay:i*.1,
        scrollTrigger:{trigger:".woodfire-photos",start:"top 84%"}});
    });
  }

  function flatReveals(){
    reveal(".flat .kicker");
    splitTitle(".flat .sect-title");
    gsap.utils.toArray(".tag-list li").forEach(function(li,i){
      gsap.from(li,{opacity:0,scale:.85,y:14,duration:.6,ease:"brindi",
        scrollTrigger:{trigger:".tag-list",start:"top 88%"},delay:i*.06});
    });
    gsap.utils.toArray(".line-list li").forEach(function(li){
      gsap.from(li,{opacity:0,x:24,duration:.7,ease:"brindi",
        scrollTrigger:{trigger:li,start:"top 92%"}});
    });
  }

  function sweetsReveals(){
    reveal(".sweets .kicker");
    splitTitle(".sweets-head .sect-title");
    gsap.utils.toArray(".sweet").forEach(function(s,i){
      gsap.from(s,{opacity:0,y:40,duration:.9,ease:"brindi",delay:i*.1,
        scrollTrigger:{trigger:".sweets-grid",start:"top 84%"}});
    });
    reveal(".drinks .kicker");
    gsap.from(".drink-list li",{opacity:0,y:16,stagger:.08,duration:.7,ease:"brindi",
      scrollTrigger:{trigger:".drink-list",start:"top 90%"}});
  }

  function tableReveals(){
    reveal(".table .kicker");
    gsap.utils.toArray(".table-quote .ql").forEach(function(q,i){
      var ch=new SplitText(q,{type:"chars"}).chars;
      gsap.from(ch,{yPercent:110,opacity:0,stagger:.025,duration:.9,ease:"brindi",
        scrollTrigger:{trigger:".table-quote",start:"top 78%"},delay:i*.12});
    });
    reveal(".table-meta",{y:24});
    reveal(".btn-menu",{y:18});
  }

  function teaseStory(){
    var lines=gsap.utils.toArray(".tease-line");
    var tl=gsap.timeline({scrollTrigger:{trigger:".tease",start:"top top",
      end:"+="+(lines.length*90)+"%",pin:true,scrub:1,anticipatePin:1}});
    lines.forEach(function(l,i){
      var w=new SplitText(l.querySelector(".t"),{type:"words",mask:"words"}).words;
      tl.fromTo(l,{opacity:0},{opacity:1,duration:.18},i);
      tl.fromTo(w,{yPercent:110},{yPercent:0,stagger:.05,duration:.55,ease:"brindi"},i+0.02);
      tl.to(w,{yPercent:-110,stagger:.03,duration:.45},i+0.74);
      tl.to(l,{opacity:0,duration:.16},i+0.86);
    });
  }

  function footReveals(){
    splitTitle(".foot-line");
    reveal(".foot-logos",{y:30});
    reveal(".foot-meta");
    reveal(".foot-credit");
  }

  /* ----------------------------------------------------------
     EGG FINALE
  ---------------------------------------------------------- */
  function spawnSparks(){
    var burst=document.getElementById("burst");
    var colors=["#F2B441","#E4BB6A","#C2683D","#ffffff","#7A2E48"];
    for(var i=0;i<30;i++){
      var s=document.createElement("i"); s.className="spark";
      var sz=gsap.utils.random(5,14); s.style.width=s.style.height=sz+"px";
      s.style.background=colors[i%colors.length]; burst.appendChild(s);
      var ang=Math.random()*Math.PI*2, dist=gsap.utils.random(90,280);
      (function(node){
        gsap.fromTo(node,{x:0,y:0,opacity:1,scale:1},
          {x:Math.cos(ang)*dist, y:Math.sin(ang)*dist-40, opacity:0, scale:0,
           rotation:gsap.utils.random(-200,200), duration:gsap.utils.random(.9,1.7),
           ease:"power2.out", onComplete:function(){ node.remove(); }});
      })(s);
    }
  }

  function initEgg(){
    var arena=document.getElementById("eggArena");
    var eggBtn=document.getElementById("eggBtn");
    var eggInner=eggBtn.querySelector(".egg-inner");
    var glow=document.getElementById("eggGlow");
    var burst=document.getElementById("burst");
    var floorEl=document.getElementById("eggFloor");
    var jb=document.getElementById("jbReveal");
    var prompt=document.getElementById("eggPrompt");
    var cracks=gsap.utils.toArray("#cracks .crack");
    var prompts=["Crack it open…","Again…","One more…"];
    var taps=0, MAX=3, done=false, idle=[], draggable=null, lastX=0;
    var arenaH=0, arenaW=0, eggH=0, floorY=0;

    // shared centered basis: all arena children pivot on their own centre; x/y are physics offsets
    gsap.set(eggBtn,{xPercent:-50,yPercent:-50,x:0,y:0,rotation:0});
    gsap.set(jb,{xPercent:-50,yPercent:-50,x:0,y:0,scale:0,opacity:0,transformOrigin:"50% 50%"});
    gsap.set(glow,{xPercent:-50,yPercent:-50,x:0,y:0,scale:0.2,opacity:0});
    gsap.set(burst,{xPercent:-50,yPercent:-50,x:0,y:0});
    gsap.set(floorEl,{xPercent:-50,yPercent:-50,x:0,y:0,opacity:0});
    gsap.set("#cracks",{opacity:1});
    try{ gsap.set("#cracks path",{drawSVG:0}); }catch(e){ gsap.set("#cracks",{opacity:0}); }
    gsap.set(["#shellL","#shellR"],{opacity:0});

    function measure(){
      var r=arena.getBoundingClientRect();
      arenaH=r.height; arenaW=r.width; eggH=eggBtn.offsetHeight||200;
      floorY=arenaH/2 - eggH*0.46 - 6;     // egg-centre y-offset when resting on the floor
    }
    function setFloorShadow(){
      var ey=gsap.getProperty(eggBtn,"y");
      var prox=gsap.utils.clamp(0,1, 1 - Math.abs(floorY-ey)/(arenaH*0.55));
      gsap.set(floorEl,{ x:gsap.getProperty(eggBtn,"x"), y:floorY+eggH*0.46,
        opacity:0.55*prox*prox, scaleX:0.6+0.6*prox, scaleY:0.6+0.6*prox });
    }
    function startIdle(){ if(reduced) return;
      idle.push(gsap.to(prompt,{opacity:.55,duration:1.3,ease:"sine.inOut",yoyo:true,repeat:-1})); }
    function stopIdle(){ idle.forEach(function(t){t.kill();}); idle=[]; }
    function spin(d){ var dx=d.x-lastX; lastX=d.x;
      gsap.set(eggBtn,{rotation: gsap.getProperty(eggBtn,"rotation")+dx*0.6}); setFloorShadow(); }

    function toppleOnEnter(){
      measure();
      var dir=(gsap.utils.random(0,1)>0.5)?1:-1;
      gsap.timeline({delay:.45, onUpdate:setFloorShadow, onComplete:createDraggable})
        .to(eggBtn,{rotation:dir*7,duration:.55,ease:"sine.inOut"})
        .to(eggBtn,{rotation:dir*-6,duration:.5,ease:"sine.inOut"})
        .to(eggBtn,{rotation:dir*34,duration:.45,ease:"power1.in"})
        .to(eggBtn,{rotation:dir*58,y:floorY,duration:.5,ease:"power2.in",onComplete:function(){ playCrack(0.5,false); }})
        .to(eggBtn,{rotation:dir*51,duration:.22,ease:"sine.out"})
        .to(eggBtn,{rotation:dir*58,duration:.55,ease:"bounce.out"});
    }

    function settleToFloor(){
      var curR=gsap.getProperty(eggBtn,"rotation");
      var rest=Math.round(curR/180)*180 + (curR<0?-1:1)*58;   // a lying pose, never perfectly upright
      var lim=arenaW/2 - eggH*0.42;
      var cx=gsap.utils.clamp(-lim, lim, gsap.getProperty(eggBtn,"x"));
      playCrack(0.4,false);
      gsap.timeline({onUpdate:setFloorShadow})
        .to(eggBtn,{x:cx,y:floorY,duration:.85,ease:"bounce.out"},0)
        .to(eggBtn,{rotation:rest,duration:.85,ease:"power2.out"},0);
    }

    function createDraggable(){
      if(done) return;
      startIdle();
      try{
        draggable=Draggable.create(eggBtn,{
          type:"x,y", bounds:arena, edgeResistance:0.65,
          inertia:true, minimumMovement:6, dragClickables:true, allowContextMenu:true, zIndexBoost:false,
          onPress:function(){ if(normalizer) normalizer.disable(); eggBtn.classList.add("dragging");
            gsap.killTweensOf(eggBtn); lastX=this.x; },
          onDragStart:function(){ stopIdle(); gsap.to(prompt,{opacity:0,duration:.3}); },
          onDrag:function(){ spin(this); },
          onThrowUpdate:function(){ spin(this); },
          onRelease:function(){ if(normalizer) normalizer.enable(); eggBtn.classList.remove("dragging"); },
          onThrowComplete:function(){ settleToFloor(); },
          onClick:function(){ crackOnce(); }
        })[0];
      }catch(e){ draggable=null; eggBtn.addEventListener("click",crackOnce); }
    }

    function crackOnce(){
      if(done) return;
      ensureAudio();
      taps++;
      playCrack(0.5+taps*0.25,false);
      var grp=cracks[taps-1];
      if(grp){ try{ gsap.to(grp.querySelectorAll("path"),{drawSVG:"100%",duration:.45,ease:"power2.out",stagger:.05}); }
               catch(e){ gsap.to(grp,{opacity:1,duration:.3}); } }
      gsap.fromTo(eggInner,{rotation:0},{keyframes:{rotation:[-5,5,-3,1,0]},duration:.42,ease:"power2.out"});
      gsap.fromTo(".egg-svg",{scale:1},{scale:1.05,duration:.1,yoyo:true,repeat:1});
      if(taps>=MAX){ hatch(); }
      else { stopIdle(); prompt.textContent=prompts[taps]||"Again…"; gsap.fromTo(prompt,{opacity:.4},{opacity:1,duration:.4}); startIdle(); }
    }

    function hatch(){
      if(done) return;
      done=true; eggBtn.classList.add("spent"); stopIdle();
      if(draggable){ try{ draggable.disable(); }catch(e){} }
      if(normalizer) normalizer.enable();
      gsap.killTweensOf([eggBtn,eggInner,prompt]); gsap.set(eggInner,{rotation:0});
      gsap.to(prompt,{opacity:0,duration:.25});
      gsap.to(floorEl,{opacity:0,duration:.5});
      playCrack(1.0,true);
      var R=gsap.getProperty(eggBtn,"rotation");
      var Rn=((R%360)+540)%360-180;                       // shortest-path normalized angle
      var ex=gsap.getProperty(eggBtn,"x"), ey=gsap.getProperty(eggBtn,"y");

      if(reduced){
        gsap.set(["#eggWhole","#eggHL","#cracks","#eggSpeckle",".egg-shade","#shellL","#shellR"],{opacity:0});
        gsap.set(jb,{x:0,y:0,rotation:0,scale:1,opacity:1});
        revealPayoff();
        return;
      }

      gsap.timeline({defaults:{ease:"brindi"}})
        .set(["#shellL","#shellR"],{opacity:1})
        .set(["#eggWhole","#eggHL","#cracks","#eggSpeckle",".egg-shade"],{opacity:0},"<")
        // shell halves are children of the rotated egg → they part along the egg's own axis
        .to("#shellL",{x:"-=135",y:"+=120",rotation:"-=58",opacity:0,duration:1,ease:"power2.in"},0)
        .to("#shellR",{x:"+=135",y:"+=120",rotation:"+=58",opacity:0,duration:1,ease:"power2.in"},0)
        .set(glow,{x:ex,y:ey},0)
        .fromTo(glow,{scale:.2,opacity:0},{scale:1.05,opacity:1,duration:.8},.1)
        .to(glow,{opacity:.5,scale:1,duration:1.4},.9)
        .add(function(){ gsap.set(burst,{x:ex,y:ey}); spawnSparks(); },.18)
        // logo emerges at the egg's spot, aligned to the egg's top (rotation Rn)…
        .set(jb,{x:ex,y:ey,rotation:Rn,opacity:0,scale:0})
        .to(jb,{opacity:1,scale:0.42,duration:.6,ease:"back.out(1.7)"},.34)
        // …then rights itself upright…
        .to(jb,{rotation:0,duration:1.0,ease:"back.out(1.4)"},">-.1")
        // …then centers and expands to fill…
        .to(jb,{x:0,y:0,scale:1,duration:1.0,ease:"brindi"},">-.2")
        .to(jb,{y:"-=9",duration:2.8,ease:"sine.inOut",yoyo:true,repeat:-1},">")
        .add(revealPayoff,"<");
      ScrollTrigger.refresh();
    }

    // keyboard: crack without dragging (Enter/Space on the button)
    eggBtn.addEventListener("keydown", function(e){
      if(e.key==="Enter"||e.key===" "){ e.preventDefault(); ensureAudio(); crackOnce(); }
    });

    // entrance — physics path topples then enables drag; reduced / no-plugins path is static click-to-crack
    ScrollTrigger.create({trigger:".finale", start:"top 55%", once:true, onEnter:function(){
      measure();
      if(reduced || !hasPhysics){
        gsap.set(arena,{opacity:1}); gsap.set(prompt,{opacity:1}); prompt.textContent="Tap to crack";
        eggBtn.addEventListener("click", crackOnce);
        return;
      }
      prompt.textContent="Drag it · tap to crack";
      gsap.to(arena,{opacity:1,duration:1.0,ease:"brindi"});
      gsap.fromTo(prompt,{opacity:0},{opacity:.85,duration:1,delay:.4});
      toppleOnEnter();
    }});

    // keep drag bounds + floor measurements correct across resize/refresh
    ScrollTrigger.addEventListener("refresh", function(){
      if(!arena) return; measure();
      if(draggable){ try{ draggable.applyBounds(arena); }catch(e){} }
      if(!done){ setFloorShadow(); }
    });

    // debug hook (used by automated verification; harmless in production)
    window.__egg={ crackOnce:crackOnce, hatch:hatch, topple:toppleOnEnter, measure:measure, createDraggable:createDraggable,
      getR:function(){return gsap.getProperty(eggBtn,"rotation");},
      pos:function(){return {x:gsap.getProperty(eggBtn,"x"),y:gsap.getProperty(eggBtn,"y")};},
      jb:function(){return {x:gsap.getProperty(jb,"x"),y:gsap.getProperty(jb,"y"),rotation:gsap.getProperty(jb,"rotation"),scale:gsap.getProperty(jb,"scale"),opacity:gsap.getProperty(jb,"opacity")};},
      draggable:function(){return draggable;}, floorY:function(){return floorY;}, set:function(o){gsap.set(eggBtn,o);} };

    function revealPayoff(){
      var p=document.getElementById("payoff"); p.setAttribute("aria-hidden","false");
      gsap.set(p,{opacity:1});
      var split=null;
      try{ split=new SplitText(".payoff-title",{type:"lines",mask:"lines"}); }catch(e){}
      var tl=gsap.timeline({defaults:{ease:"brindi"}});
      tl.from(".payoff-kicker",{opacity:0,y:16,duration:.8});
      if(split && split.lines.length){ tl.from(split.lines,{yPercent:120,opacity:0,stagger:.12,duration:1.0},"-=.25"); }
      else { tl.from(".payoff-title",{opacity:0,y:22,duration:1.0},"-=.25"); }
      tl.from(".payoff-sub",{opacity:0,y:14,duration:.9},"-=.4");
      if(!reduced) ScrollTrigger.refresh();
    }
  }

  /* ----------------------------------------------------------
     Boot
  ---------------------------------------------------------- */
  function preloaderOut(after){
    var pl=document.getElementById("preloader");
    // Let the wordmark draw in, hold a beat so it reads, then lift the curtain smoothly.
    gsap.timeline({defaults:{ease:"brindi"}, onComplete:function(){ pl.style.display="none"; if(after) after(); }})
      .to("#preRule",{scaleX:1,duration:1.1},0)
      .to(".pre-inner",{opacity:0,y:-12,duration:.7},1.5)
      .to(pl,{yPercent:-100,duration:1.05,ease:"power3.inOut"},1.75);
  }

  function setup(){
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin, MotionPathPlugin, CustomEase, ScrollToPlugin);
    try{ if(typeof Draggable!=="undefined" && typeof InertiaPlugin!=="undefined"){ gsap.registerPlugin(Draggable, InertiaPlugin); hasPhysics=true; } }catch(e){ hasPhysics=false; }
    CustomEase.create("brindi","M0,0,C0.16,1,0.3,1,1,1");
    gsap.defaults({ease:"brindi"});

    wireUI();
    initEgg();

    if(reduced){
      // content already visible via CSS; just play preloader out
      preloaderOut(function(){ ScrollTrigger.refresh(); });
      return;
    }

    // Mobile jitter fixes: ignoreMobileResize stops ScrollTrigger refreshing (and jumping)
    // when the address bar shows/hides; normalizeScroll lets GSAP drive touch scrolling so the
    // pinned + horizontal sections stay rock-solid instead of fighting native momentum.
    ScrollTrigger.config({ ignoreMobileResize:true });
    smoother=ScrollSmoother.create({wrapper:"#smooth-wrapper", content:"#smooth-content",
      smooth:1.2, effects:true, normalizeScroll:true});
    normalizer=ScrollTrigger.normalizeScroll();
    embers("#emberHero", 16);
    embers("#emberWood", 26);

    // Prepare the hero NOW so it's already blank behind the preloader, then play its
    // reveal only after the intro slide has lifted (no flash of un-animated text).
    var heroTl=heroIntro();
    heroParallax();
    fireStory();
    mezze();
    woodfire();
    flatReveals();
    sweetsReveals();
    tableReveals();
    teaseStory();
    footReveals();

    preloaderOut(function(){
      ScrollTrigger.refresh();
      gsap.delayedCall(.35, function(){ heroTl.play(); });
    });
  }

  function boot(){
    render();
    var started=false;
    function go(){ if(started) return; started=true;
      try{ setup(); }
      catch(err){ console.error("Brindi init error:", err);
        var pl=document.getElementById("preloader"); if(pl) pl.style.display="none"; }
    }
    // wait for fonts so SplitText measures correctly; fall back after 1.6s
    if(document.fonts && document.fonts.ready){ document.fonts.ready.then(go); }
    setTimeout(go, 1600);
  }

  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})();
