// ── PARTICLE HERO ──
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let mouse = { x: null, y: null };
let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);
canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

class HeroParticle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.1;
  }
  update() {
    if (mouse.x !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const force = (140 - dist) / 140;
        this.vx += (dx / dist) * force * 0.3;
        this.vy += (dy / dist) * force * 0.3;
      }
    }
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = '#00D4FF';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 180; i++) particles.push(new HeroParticle());

function drawHeroLines() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        ctx.save();
        ctx.globalAlpha = (1 - dist / 90) * 0.18;
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function heroLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawHeroLines();
  requestAnimationFrame(heroLoop);
}
heroLoop();

// ── GALAXY CANVAS ──
const gc = document.getElementById('galaxy-canvas');
if (gc) {
  const gctx = gc.getContext('2d');
  let stars = [];
  function resizeGalaxy() {
    gc.width = gc.offsetWidth;
    gc.height = gc.offsetHeight;
    stars = [];
    const cx = gc.width / 2, cy = gc.height / 2;
    for (let i = 0; i < 500; i++) {
      const arm = Math.floor(Math.random() * 3);
      const t = Math.random() * Math.PI * 2.5;
      const spread = (Math.random() - 0.5) * 20;
      const r = t * 22 + spread + Math.random() * 10;
      const angle = t + arm * (Math.PI * 2 / 3);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * 0.45;
      const brightness = Math.random();
      stars.push({ x, y, r: Math.random() * 1.3 + 0.2, alpha: brightness * 0.8 + 0.1,
        color: brightness > 0.7 ? '#B0E0FF' : brightness > 0.4 ? '#FFFFFF' : '#FFE8C0' });
    }
  }
  setTimeout(resizeGalaxy, 100);

  function galaxyLoop() {
    if (!gc.width) return requestAnimationFrame(galaxyLoop);
    gctx.clearRect(0, 0, gc.width, gc.height);
    // glow core
    const grad = gctx.createRadialGradient(gc.width/2, gc.height/2, 0, gc.width/2, gc.height/2, 60);
    grad.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, gc.width, gc.height);
    stars.forEach(s => {
      gctx.save();
      gctx.globalAlpha = s.alpha;
      gctx.fillStyle = s.color;
      gctx.beginPath();
      gctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      gctx.fill();
      gctx.restore();
    });
    requestAnimationFrame(galaxyLoop);
  }
  galaxyLoop();
}

// ── N-BODY PHYSICS DEMO ──
const demoCanvas = document.getElementById('demo-canvas');
const dctx = demoCanvas.getContext('2d');
let demoMode = 'gravity';
let bodies = [];
const G = 400;

function resizeDemo() {
  demoCanvas.width = demoCanvas.offsetWidth;
  demoCanvas.height = demoCanvas.offsetHeight;
}
setTimeout(resizeDemo, 100);
window.addEventListener('resize', resizeDemo);

class Body {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 60;
    this.vy = (Math.random() - 0.5) * 60;
    this.m = Math.random() * 6 + 3;
    this.trail = [];
    this.color = `hsl(${180 + Math.random() * 60}, 90%, 65%)`;
  }
}

demoCanvas.addEventListener('click', e => {
  const rect = demoCanvas.getBoundingClientRect();
  const scaleX = demoCanvas.width / rect.width;
  const scaleY = demoCanvas.height / rect.height;
  bodies.push(new Body((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY));
});

document.getElementById('btn-grav').addEventListener('click', function() {
  demoMode = 'gravity';
  document.querySelectorAll('.demo-btn').forEach(b => b.classList.remove('active'));
  this.classList.add('active');
});
document.getElementById('btn-spring').addEventListener('click', function() {
  demoMode = 'spring';
  document.querySelectorAll('.demo-btn').forEach(b => b.classList.remove('active'));
  this.classList.add('active');
});
document.getElementById('btn-clear').addEventListener('click', () => { bodies = []; });

// seed with a few
setTimeout(() => {
  if (demoCanvas.width > 0) {
    const cx = demoCanvas.width / 2, cy = demoCanvas.height / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const r = Math.min(cx, cy) * 0.45;
      const b = new Body(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      const speed = Math.sqrt(G * 8 / r) * 0.7;
      b.vx = -Math.sin(angle) * speed;
      b.vy = Math.cos(angle) * speed;
      b.m = 8;
      bodies.push(b);
    }
  }
}, 300);

let lastDemo = null;
function demoLoop(ts) {
  if (!lastDemo) lastDemo = ts;
  const dt = Math.min((ts - lastDemo) / 1000, 0.03);
  lastDemo = ts;

  dctx.fillStyle = 'rgba(6, 10, 18, 0.18)';
  dctx.fillRect(0, 0, demoCanvas.width, demoCanvas.height);

  const cx = demoCanvas.width / 2, cy = demoCanvas.height / 2;

  for (let i = 0; i < bodies.length; i++) {
    let ax = 0, ay = 0;
    for (let j = 0; j < bodies.length; j++) {
      if (i === j) continue;
      const dx = bodies[j].x - bodies[i].x;
      const dy = bodies[j].y - bodies[i].y;
      const dist2 = dx * dx + dy * dy + 400;
      const dist = Math.sqrt(dist2);
      if (demoMode === 'gravity') {
        const f = G * bodies[j].m / dist2;
        ax += f * dx / dist;
        ay += f * dy / dist;
      } else {
        const restLen = 120;
        const f = 0.8 * (dist - restLen) / dist;
        ax += f * dx;
        ay += f * dy;
      }
    }
    // gentle centre pull
    ax += (cx - bodies[i].x) * 0.005;
    ay += (cy - bodies[i].y) * 0.005;
    bodies[i].vx += ax * dt;
    bodies[i].vy += ay * dt;
    const speed = Math.sqrt(bodies[i].vx**2 + bodies[i].vy**2);
    if (speed > 400) { bodies[i].vx *= 400/speed; bodies[i].vy *= 400/speed; }
  }

  bodies.forEach(b => {
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 40) b.trail.shift();
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // draw trail
    if (b.trail.length > 1) {
      dctx.beginPath();
      dctx.moveTo(b.trail[0].x, b.trail[0].y);
      for (let k = 1; k < b.trail.length; k++) {
        dctx.lineTo(b.trail[k].x, b.trail[k].y);
      }
      dctx.strokeStyle = b.color;
      dctx.globalAlpha = 0.25;
      dctx.lineWidth = 1;
      dctx.stroke();
      dctx.globalAlpha = 1;
    }

    // draw body
    const grd = dctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.m * 2.5);
    grd.addColorStop(0, b.color);
    grd.addColorStop(1, 'rgba(0,212,255,0)');
    dctx.beginPath();
    dctx.arc(b.x, b.y, b.m * 2.5, 0, Math.PI * 2);
    dctx.fillStyle = grd;
    dctx.fill();

    dctx.beginPath();
    dctx.arc(b.x, b.y, b.m * 0.9, 0, Math.PI * 2);
    dctx.fillStyle = '#fff';
    dctx.globalAlpha = 0.85;
    dctx.fill();
    dctx.globalAlpha = 1;
  });

  // draw gravity lines between nearby bodies
  if (demoMode === 'gravity') {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const dx = bodies[i].x - bodies[j].x;
        const dy = bodies[i].y - bodies[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 160) {
          dctx.save();
          dctx.globalAlpha = (1 - d/160) * 0.2;
          dctx.strokeStyle = '#00D4FF';
          dctx.lineWidth = 0.5;
          dctx.beginPath();
          dctx.moveTo(bodies[i].x, bodies[i].y);
          dctx.lineTo(bodies[j].x, bodies[j].y);
          dctx.stroke();
          dctx.restore();
        }
      }
    }
  }

  requestAnimationFrame(demoLoop);
}
requestAnimationFrame(demoLoop);

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));

// ── SKILL BARS ──
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(fill => {
        fill.style.width = fill.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.skills-grid > div').forEach(el => skillObserver.observe(el));

// ── ACTIVE NAV ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const link = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach(s => navObserver.observe(s));