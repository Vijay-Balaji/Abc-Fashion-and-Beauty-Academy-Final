(()=>{
  requestAnimationFrame(() => document.body.classList.add('page-loaded'));
  const themeKey='abcTheme';
  const setTheme=t=>{document.documentElement.dataset.theme=t;localStorage.setItem(themeKey,t);const b=document.getElementById('themeToggle');if(b)b.textContent=t==='dark'?'☀':'☾'};
  setTheme(localStorage.getItem(themeKey)||'light');
  const toggle=document.getElementById('themeToggle'); if(toggle) toggle.onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
  const menu=document.getElementById('menu');
  const navPanel=document.querySelector('.nav nav');
  const setMenu=(open)=>{ if(!navPanel)return; navPanel.classList.toggle('open',open); menu?.setAttribute('aria-expanded',String(open)); };
  if(menu) menu.addEventListener('click',()=>setMenu(!navPanel?.classList.contains('open')));
  document.querySelectorAll('.nav nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
  document.addEventListener('click',e=>{if(navPanel?.classList.contains('open') && !e.target.closest('.nav'))setMenu(false)});
  window.addEventListener('resize',()=>{if(window.innerWidth>900)setMenu(false)});
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click', e=>{ const id=a.getAttribute('href'); if(id && id.length>1){ const target=document.querySelector(id); if(target){ e.preventDefault(); const navHeight=document.querySelector('.nav')?.getBoundingClientRect().height||0; const top=target.getBoundingClientRect().top+window.scrollY-navHeight-18; window.scrollTo({top,behavior:'smooth'}); history.replaceState(null,'',id); setMenu(false); } }}));

  // Hero carousel: images/text remain in HTML; JS only changes slide visibility.
  const slides=[...document.querySelectorAll('.hero-slide')], dots=[...document.querySelectorAll('[data-hi]')]; let hi=0;
  const showHero=i=>{if(!slides.length)return; hi=(i+slides.length)%slides.length;slides.forEach((x,n)=>x.classList.toggle('active',n===hi));dots.forEach((x,n)=>x.classList.toggle('active',n===hi));
    const n=document.getElementById('heroNumber'),t=slides[hi]?.querySelector('.slide-label b'),m=slides[hi]?.querySelector('.slide-label small');if(n)n.textContent=String(hi+1).padStart(2,'0');if(t)document.getElementById('heroCardTitle').textContent=t.textContent;if(m)document.getElementById('heroCardMeta').textContent=m.textContent;};
  dots.forEach((b,i)=>b.onclick=()=>showHero(i));document.getElementById('heroPrev')?.addEventListener('click',()=>showHero(hi-1));document.getElementById('heroNext')?.addEventListener('click',()=>showHero(hi+1));if(slides.length)setInterval(()=>showHero(hi+1),5000);

  // Gallery carousel: images stay in HTML.
  const track=document.getElementById('galleryTrack'), items=track?[...track.children]:[];let gi=0;const visible=4,total=Math.max(1,items.length-visible+1),gd=document.getElementById('galleryDots');
  if(gd){gd.innerHTML=Array.from({length:total},(_,i)=>`<button class="${i===0?'active':''}" data-gi="${i}" aria-label="Gallery ${i+1}"></button>`).join('');}
  const showGallery=i=>{if(!track||!items.length)return;gi=(i+total)%total;track.style.transform=`translateX(-${gi*(100/visible)}%)`;gd?.querySelectorAll('[data-gi]').forEach((b,n)=>b.classList.toggle('active',n===gi));};
  gd?.querySelectorAll('[data-gi]').forEach((b,i)=>b.onclick=()=>showGallery(i));document.getElementById('galleryPrev')?.addEventListener('click',()=>showGallery(gi-1));document.getElementById('galleryNext')?.addEventListener('click',()=>showGallery(gi+1));if(items.length)setInterval(()=>showGallery(gi+1),4200);

  // Alumni carousel — responsive, swipe-friendly, with mobile Show more text.
  const at=document.getElementById('alumniTrack'),ac=at?[...at.children]:[],ad=document.getElementById('alumniDots');
  let ai=0, alumniVisible=3, alumniTotal=1, alumniTimer=null, alumniStartX=0, alumniDragging=false;
  const getAlumniVisible=()=>window.innerWidth<=600?1:(window.innerWidth<=1000?2:3);
  const updateAlumniDots=()=>{
    if(!ad)return;
    ad.innerHTML=Array.from({length:alumniTotal},(_,i)=>`<button type="button" aria-label="Show alumni ${i+1}" data-ai="${i}" class="${i===ai?'active':''}"></button>`).join('');
    ad.querySelectorAll('[data-ai]').forEach((b,i)=>b.onclick=()=>showAlumni(i));
  };
  const showAlumni=i=>{
    if(!at||!ac.length)return;
    alumniVisible=getAlumniVisible();
    alumniTotal=Math.max(1,ac.length-alumniVisible+1);
    ai=Math.max(0,Math.min(i,alumniTotal-1));
    const step=100/alumniVisible;
    at.style.setProperty('--alumni-visible',alumniVisible);
    at.style.transform=`translate3d(-${ai*step}%,0,0)`;
    updateAlumniDots();
  };
  const setupAlumniShowMore=()=>{
    ac.forEach(card=>{
      const p=card.querySelector('p');
      if(!p||card.querySelector('.alumni-more'))return;
      const btn=document.createElement('button');
      btn.type='button'; btn.className='alumni-more'; btn.textContent='Show more';
      btn.setAttribute('aria-expanded','false');
      btn.addEventListener('click',()=>{
        const expanded=card.classList.toggle('alumni-expanded');
        btn.textContent=expanded?'Show less':'Show more';
        btn.setAttribute('aria-expanded',String(expanded));
      });
      p.insertAdjacentElement('afterend',btn);
    });
  };
  const restartAlumniTimer=()=>{
    clearInterval(alumniTimer);
    if(ac.length>alumniVisible) alumniTimer=setInterval(()=>showAlumni((ai+1)%alumniTotal),5500);
  };
  if(at&&ac.length){
    setupAlumniShowMore();
    showAlumni(0);
    document.getElementById('alumniPrev')?.addEventListener('click',()=>{showAlumni((ai-1+alumniTotal)%alumniTotal);restartAlumniTimer();});
    document.getElementById('alumniNext')?.addEventListener('click',()=>{showAlumni((ai+1)%alumniTotal);restartAlumniTimer();});
    at.addEventListener('pointerdown',e=>{alumniStartX=e.clientX;alumniDragging=true;at.setPointerCapture?.(e.pointerId);clearInterval(alumniTimer);});
    at.addEventListener('pointerup',e=>{if(!alumniDragging)return; const dx=e.clientX-alumniStartX; alumniDragging=false; if(Math.abs(dx)>45) showAlumni(dx<0?(ai+1)%alumniTotal:(ai-1+alumniTotal)%alumniTotal); restartAlumniTimer();});
    at.addEventListener('pointercancel',()=>{alumniDragging=false;restartAlumniTimer();});
    window.addEventListener('resize',()=>{const old=alumniVisible; const next=getAlumniVisible(); if(old!==next)showAlumni(Math.min(ai,Math.max(0,ac.length-next))); restartAlumniTimer();});
    restartAlumniTimer();
  }

  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
  const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('scroll-visible');cio.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -30px 0px'});document.querySelectorAll('.scroll-card').forEach(e=>cio.observe(e));

  /* =========================================================
     START: FIXED-LAYOUT EXPERIENCE TYPING
     The container keeps a fixed two-line height, so typing never moves
     the content below it. Edit the two data-line attributes in index.html.
     ========================================================= */
  (() => {
    const box = document.getElementById('experienceTyping');
    const line1 = document.getElementById('experienceTypingLine1');
    const line2 = document.getElementById('experienceTypingLine2');
    if (!box || !line1 || !line2) return;

    const lines = [
      box.dataset.line1 || '',
      box.dataset.line2 || ''
    ];

    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const current = lines[lineIndex] || '';

      if (!deleting) {
        charIndex++;
        const typed = current.slice(0, charIndex);
        if (lineIndex === 0) line1.textContent = typed;
        else line2.textContent = typed;

        if (charIndex >= current.length) {
          if (lineIndex < lines.length - 1) {
            lineIndex++;
            charIndex = 0;
            setTimeout(tick, 450);
            return;
          }
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
      } else {
        charIndex--;
        if (lineIndex === 0) line1.textContent = current.slice(0, charIndex);
        else line2.textContent = current.slice(0, charIndex);

        if (charIndex <= 0) {
          if (lineIndex > 0) {
            lineIndex--;
            charIndex = lines[lineIndex].length;
            setTimeout(tick, 120);
            return;
          }
          deleting = false;
          setTimeout(tick, 350);
          return;
        }
      }

      setTimeout(tick, deleting ? 22 : 34);
    };

    tick();
  })();
  /* =========================================================
     END: FIXED-LAYOUT EXPERIENCE TYPING
     ========================================================= */

  /* =========================================================
     START: LIGHTWEIGHT AUTOPLAY VIDEO LOADING
     Keeps the existing autoplay behavior but avoids preloading every
     off-screen video at once. This improves mobile/desktop smoothness.
     ========================================================= */
  (() => {
    const videos = [...document.querySelectorAll('video[autoplay]')];
    if (!videos.length || !('IntersectionObserver' in window)) return;

    videos.forEach(video => {
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise?.catch) playPromise.catch(() => {});
        } else if (!video.closest('.hero')) {
          video.pause();
        }
      });
    }, { threshold: 0.15, rootMargin: '120px 0px' });

    videos.forEach(video => observer.observe(video));
  })();
  /* =========================================================
     END: LIGHTWEIGHT AUTOPLAY VIDEO LOADING
     ========================================================= */
})();