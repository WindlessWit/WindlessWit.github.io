// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Hide/show header on scroll
let lastScroll = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('hidden');
        return;
    }
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }
    
    lastScroll = currentScroll;
});

// Add scroll animation to sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// --- Network background (lightweight vanilla version) ---
(() => {
  const canvas = document.getElementById('network');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  const cfg = {
    count: 150,            // fewer = faster
    speed: 0.55,          // px/frame
    linkDist: 120,        // max link distance
    dot: 2,               // radius
    dotColor: 'rgba(243, 243, 245, 1)',
    lineColor: 'rgba(120,160,255,0.25)'
  };

  const rand = (a,b)=>Math.random()*(b-a)+a;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    if(!particles){
      particles = Array.from({length: cfg.count}, () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-cfg.speed, cfg.speed),
        vy: rand(-cfg.speed, cfg.speed)
      }));
    }
  }

  function tick(){
    ctx.clearRect(0,0,W,H);

    // move & bounce
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > W) p.vx *= -1;
      if(p.y < 0 || p.y > H) p.vy *= -1;
    }

    // links
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy, max2 = cfg.linkDist*cfg.linkDist;
        if(d2 < max2){
          const alpha = 1 - d2/max2;
          ctx.strokeStyle = cfg.lineColor.replace(/[\d.]+\)$/, (alpha*0.9)+')');
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }

    // dots
    ctx.fillStyle = cfg.dotColor;
    for(const p of particles){
      ctx.beginPath(); ctx.arc(p.x,p.y,cfg.dot,0,Math.PI*2); ctx.fill();
    }
    frame = requestAnimationFrame(tick);
  }

  let frame; let paused = false;
  function start(){ if(!paused){ cancelAnimationFrame(frame); tick(); } }
  function stop(){ cancelAnimationFrame(frame); }

  // pause when hidden
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    paused ? stop() : start();
  });

  window.addEventListener('resize', resize, {passive:true});
  resize(); start();
})();