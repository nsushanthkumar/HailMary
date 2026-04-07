// ═══════════════════════════════════════════════════
//  NEON GALAXY BIRTHDAY — script.js
//  Varsha "Chitti" · April 7, 2003
// ═══════════════════════════════════════════════════

// Birth date — midnight local time, April 7 2003
const BIRTH = new Date(2003, 3, 7, 0, 0, 0); // month is 0-indexed

// Canvas variables — set inside DOMContentLoaded to avoid any race condition
let starCanvas, starCtx, confettiCanvas, confettiCtx;
let stars = [];

// ════════════════════════════════════════
//  STARFIELD
// ════════════════════════════════════════
function resizeCanvases() {
  if (!starCanvas) return;
  starCanvas.width  = confettiCanvas.width  = window.innerWidth;
  starCanvas.height = confettiCanvas.height = window.innerHeight;
}

function initStars() {
  if (!starCanvas) return;
  stars = [];
  const count = Math.floor((starCanvas.width * starCanvas.height) / 3800);
  for (let i = 0; i < count; i++) {
    stars.push({
      x:   Math.random() * starCanvas.width,
      y:   Math.random() * starCanvas.height,
      r:   Math.random() * 1.5 + 0.2,
      a:   Math.random(),
      da:  (Math.random() * 0.015 + 0.004) * (Math.random() > .5 ? 1 : -1),
      hue: Math.random() > 0.82 ? (Math.random() > .5 ? 200 : 290) : -1,
    });
  }
}

// 7-star constellation (positioned proportionally across canvas)
const CONSTELLATION_PTS = [
  [.76, .13], [.79, .10], [.82, .12],
  [.78, .16], [.81, .17], [.84, .14], [.80, .20],
];

function drawNebula() {
  const nebulas = [
    { x: .18, y: .28, r: 320, c: 'rgba(184,79,255,.045)' },
    { x: .82, y: .62, r: 260, c: 'rgba(0,229,255,.04)'   },
    { x: .50, y: .85, r: 200, c: 'rgba(255,45,135,.03)'  },
  ];
  nebulas.forEach(({ x, y, r, c }) => {
    const g = starCtx.createRadialGradient(
      x * starCanvas.width, y * starCanvas.height, 0,
      x * starCanvas.width, y * starCanvas.height, r
    );
    g.addColorStop(0, c);
    g.addColorStop(1, 'transparent');
    starCtx.fillStyle = g;
    starCtx.beginPath();
    starCtx.arc(x * starCanvas.width, y * starCanvas.height, r, 0, Math.PI * 2);
    starCtx.fill();
  });
}

function drawConstellation(t) {
  const pts = CONSTELLATION_PTS.map(([ox, oy]) => ({
    x: ox * starCanvas.width,
    y: oy * starCanvas.height,
  }));

  starCtx.strokeStyle = 'rgba(255,215,0,.18)';
  starCtx.lineWidth = .8;
  for (let i = 0; i < pts.length - 1; i++) {
    starCtx.beginPath();
    starCtx.moveTo(pts[i].x, pts[i].y);
    starCtx.lineTo(pts[i + 1].x, pts[i + 1].y);
    starCtx.stroke();
  }

  pts.forEach((p, i) => {
    const pulse = .55 + Math.sin(t / 900 + i) * .35;
    starCtx.beginPath();
    starCtx.arc(p.x, p.y, i === 0 ? 3 : 2, 0, Math.PI * 2);
    starCtx.fillStyle = `rgba(255,215,0,${pulse})`;
    starCtx.shadowBlur = 12;
    starCtx.shadowColor = '#ffd700';
    starCtx.fill();
    starCtx.shadowBlur = 0;
  });

  starCtx.fillStyle = `rgba(255,215,0,${.22 + Math.sin(t / 1200) * .08})`;
  starCtx.font = '9px Orbitron, monospace';
  const lx = CONSTELLATION_PTS[6][0] * starCanvas.width + 8;
  const ly = CONSTELLATION_PTS[6][1] * starCanvas.height + 14;
  starCtx.fillText('7 stars', lx, ly);
}

function animateStars(t) {
  if (!starCtx) return;
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  drawNebula();

  stars.forEach(s => {
    s.a += s.da;
    if (s.a > 1 || s.a < 0.05) s.da *= -1;

    let color;
    if      (s.hue === 200) color = `rgba(100,220,255,${s.a})`;
    else if (s.hue === 290) color = `rgba(180,100,255,${s.a})`;
    else                    color = `rgba(255,255,255,${s.a})`;

    starCtx.beginPath();
    starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    starCtx.fillStyle = color;
    starCtx.fill();
  });

  drawConstellation(t);
  requestAnimationFrame(animateStars);
}

// ════════════════════════════════════════
//  CONFETTI
// ════════════════════════════════════════
const CONFETTI_COLORS = ['#b84fff','#00e5ff','#ff2d87','#ffd700','#39ff14','#ffffff','#ff9900'];
let confettiPieces = [];
let confettiRunning = false;

function spawnPiece(x, y) {
  const ang = Math.random() * Math.PI * 2;
  const spd = Math.random() * 14 + 5;
  return {
    x, y,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd - 10,
    g:  0.45,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: Math.random() * 9 + 3,
    rot:  Math.random() * Math.PI * 2,
    rotS: (Math.random() - .5) * .35,
    a:    1,
    aD:   Math.random() * .012 + .005,
    rect: Math.random() > .4,
  };
}

function fireConfetti() {
  if (!confettiCtx) return;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * .45;
  for (let i = 0; i < 180; i++) confettiPieces.push(spawnPiece(cx, cy));
  for (let i = 0; i < 60; i++) {
    confettiPieces.push(spawnPiece(0, cy));
    confettiPieces.push(spawnPiece(window.innerWidth, cy));
  }
  if (!confettiRunning) {
    confettiRunning = true;
    animateConfetti();
  }
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces = confettiPieces.filter(p => p.a > 0);

  confettiPieces.forEach(p => {
    p.x  += p.vx; p.y += p.vy;
    p.vy += p.g;  p.vx *= .99;
    p.rot += p.rotS;
    p.a   -= p.aD;

    confettiCtx.save();
    confettiCtx.globalAlpha = Math.max(0, p.a);
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rot);
    confettiCtx.fillStyle   = p.color;
    confettiCtx.shadowBlur  = 6;
    confettiCtx.shadowColor = p.color;

    if (p.rect) confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    else {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      confettiCtx.fill();
    }
    confettiCtx.restore();
  });

  if (confettiPieces.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// ════════════════════════════════════════
//  BIRTHDAY FACTS
// ════════════════════════════════════════
const FACTS = [
  {
    icon: '♈',
    title: 'Zodiac Sign',
    value: 'Aries',
    desc: 'Bold, passionate, and fiercely independent. The first sign of the zodiac — born to lead, born to win.',
    highlight: false,
  },
  {
    icon: '⭐',
    title: 'Life Path Number',
    value: '7',
    big: true,
    desc: '4 + 7 + 2 + 0 + 0 + 3 = 16 → 1 + 6 = 7. The Seeker — analytical, spiritual, endlessly curious.',
    highlight: true,
  },
  {
    icon: '📅',
    title: 'Day of the Week',
    value: 'Monday',
    desc: 'You arrived on a Monday — a brand new start to a brand new week. The universe reset just for you.',
    highlight: false,
  },
  {
    icon: '🎵',
    title: 'Chart-Topper',
    value: '"In Da Club" — 50 Cent',
    desc: 'The song dominating the charts in early 2003. You entered the world with a certified banger playing.',
    highlight: false,
  },
  {
    icon: '🐠',
    title: 'Born in 2003',
    value: 'Finding Nemo Year!',
    desc: 'Pixar released Finding Nemo in May 2003. You and Nemo both made their debut the same year.',
    highlight: false,
  },
  {
    icon: '7️⃣',
    title: 'Born on the 7th',
    value: '7',
    big: true,
    desc: 'Born on April 7 with Life Path 7 — lucky 7 is woven into your very existence. Twice blessed.',
    highlight: true,
  },
  {
    icon: '🌸',
    title: 'Birth Season',
    value: 'Spring · April',
    desc: 'Born in the heart of spring — when the world blooms and the air smells like new beginnings.',
    highlight: false,
  },
];

function renderFacts() {
  const grid = document.getElementById('facts-grid');
  if (!grid) return;
  grid.innerHTML = FACTS.map((f, i) => `
    <div class="fact-card ${f.highlight ? 'highlight' : ''}" style="transition-delay:${i * 0.08}s">
      <span class="fact-icon">${f.icon}</span>
      <div class="fact-title">${f.title}</div>
      <div class="fact-value ${f.big ? 'big' : ''}">${f.value}</div>
      <div class="fact-desc">${f.desc}</div>
    </div>
  `).join('');
}

// ════════════════════════════════════════
//  PER-CARD RIDDLE MODAL
// ════════════════════════════════════════
let currentModalIdx = -1;

function handleCardClick(el) {
  const idx = parseInt(el.dataset.idx, 10);
  if (el.classList.contains('locked')) {
    openRiddleModal(idx);
  } else {
    el.classList.toggle('flipped');
  }
}

function openRiddleModal(idx) {
  currentModalIdx = idx;
  const t = LOVE_THINGS[idx];
  document.getElementById('modal-card-label').textContent = `Card ${t.num} · ${t.title}`;
  document.getElementById('modal-riddle-q').textContent   = t.riddle;
  document.getElementById('modal-riddle-input').value     = '';
  document.getElementById('modal-feedback').textContent   = '';
  document.getElementById('modal-feedback').className     = 'riddle-feedback';
  document.getElementById('modal-hint').textContent       = '';
  document.getElementById('riddle-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('modal-riddle-input').focus(), 80);
}

function closeRiddleModal() {
  document.getElementById('riddle-modal').classList.add('hidden');
  currentModalIdx = -1;
}

function handleModalOverlayClick(e) {
  if (e.target === document.getElementById('riddle-modal')) closeRiddleModal();
}

function checkModalAnswer() {
  const idx   = currentModalIdx;
  if (idx === -1) return;
  const input = document.getElementById('modal-riddle-input').value.trim().toLowerCase();
  const fbEl  = document.getElementById('modal-feedback');
  const t     = LOVE_THINGS[idx];

  if (!input) {
    fbEl.textContent = 'Type your answer first! 💭';
    fbEl.className   = 'riddle-feedback wrong';
    return;
  }

  if (t.answers.includes(input)) {
    fbEl.textContent = '✨ Correct! Unlocking your card...';
    fbEl.className   = 'riddle-feedback correct';
    setTimeout(() => {
      closeRiddleModal();
      unlockCard(idx);
    }, 800);
  } else {
    fbEl.textContent = 'Not quite... try again! 🤔';
    fbEl.className   = 'riddle-feedback wrong';
    document.getElementById('modal-hint').textContent = t.hint;
  }
}

function unlockCard(idx) {
  const t    = LOVE_THINGS[idx];
  const card = document.getElementById(`love-card-${idx}`);
  if (!card) return;

  card.classList.remove('locked');
  card.classList.add('unlocking');

  // Update front face: show number + title
  card.querySelector('.love-front-num').textContent   = t.num;
  card.querySelector('.love-front-title').textContent = t.title;

  // Small confetti burst then auto-flip to reveal
  fireConfetti();
  setTimeout(() => {
    card.classList.remove('unlocking');
    card.classList.add('flipped');
  }, 420);
}

// ════════════════════════════════════════
//  TIME ALIVE COUNTER
// ════════════════════════════════════════
function updateAliveCounter() {
  const now      = new Date();
  const diffMs   = now - BIRTH;
  const totalSecs = Math.floor(diffMs / 1000);
  const totalMins = Math.floor(totalSecs / 60);
  const totalHrs  = Math.floor(totalMins / 60);
  const totalDays = Math.floor(totalHrs  / 24);

  let years = now.getFullYear() - BIRTH.getFullYear();
  if (
    now.getMonth() < BIRTH.getMonth() ||
    (now.getMonth() === BIRTH.getMonth() && now.getDate() < BIRTH.getDate())
  ) years--;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val.toLocaleString();
  };
  set('alive-years', years);
  set('alive-days',  totalDays);
  set('alive-hours', totalHrs);
  set('alive-mins',  totalMins);
  set('alive-secs',  totalSecs);
}

// ════════════════════════════════════════
//  7 THINGS I LOVE ABOUT YOU
// ════════════════════════════════════════
const LOVE_THINGS = [
  {
    num: 1, title: 'Radiant Grace',
    text: 'An ethereal blend of breathtaking elegance and heart-melting sweetness. She possesses a beauty that is as much about her striking presence as it is about her gentle, endearing spirit.',
    riddle: 'I fill a room without taking any space. I begin in the eyes and end in the heart. I am contagious and completely free. What am I?',
    hint: 'Think about the first thing you notice when Chitti walks in... 😊',
    answers: ['smile', 'a smile', 'warmth', 'grace'],
  },
  {
    num: 2, title: 'A Noble Spirit',
    text: 'Defined by a soul of rare altruism, her kindness knows no borders. She moves through the world with a generous heart, leaving a trail of warmth in every life she touches.',
    riddle: 'The more of me you give away, the wealthier you become. I can\'t be stored, only shared. What am I?',
    hint: 'What Chitti has an infinite supply of 💛',
    answers: ['kindness', 'love', 'generosity', 'compassion'],
  },
  {
    num: 3, title: 'Boundless Devotion',
    text: 'In the sanctuary of a relationship, her commitment is unparalleled. She doesn\'t just show up; she pours her entire heart into the connection, elevating it to extraordinary heights.',
    riddle: 'Distance makes me stronger. Time makes me deeper. Hardship cannot break me when I am real. What am I?',
    hint: 'The strongest force between two people 💜',
    answers: ['love', 'devotion', 'commitment', 'loyalty', 'bond'],
  },
  {
    num: 4, title: 'The Beauty of Simplicity',
    text: 'She possesses the rare gift of finding infinite joy in life\'s smallest offerings. To her, a single wildflower is as precious as the most extravagant treasure, proving that her happiness is rooted in sincerity, not status.',
    riddle: 'I am found in a wildflower, a quiet sunset, and a warm cup of tea. I cost nothing, yet most people spend their whole lives searching for me. What am I?',
    hint: 'The secret behind Chitti\'s happiness 🌸',
    answers: ['joy', 'happiness', 'beauty', 'peace', 'contentment', 'wonder', 'simplicity'],
  },
  {
    num: 5, title: 'Social Luminary',
    text: 'A vibrant social architect who turns strangers into confidants with effortless charm. Her outgoing nature is a beacon, creating a sense of belonging for everyone she meets.',
    riddle: 'I turn strangers into friends and rooms into families. I spread without diminishing and grow the more I am shared. What am I?',
    hint: 'What Chitti radiates wherever she goes ✨',
    answers: ['laughter', 'warmth', 'charm', 'friendship', 'love', 'joy', 'light'],
  },
  {
    num: 6, title: 'Delightful Candor',
    text: 'There is a refreshing, wholesome honesty in her nature. She has the unique ability to speak about the most human, unrefined, unfiltered moments of life with a candidness that is both endearing and profoundly charming. I\'m talking about Doddi.',
    riddle: 'I am uncomfortable to give and sometimes hard to hear, yet the world would be far worse without me. I am most beautiful when it costs the most to share. What am I?',
    hint: 'What makes Chitti\'s Doddi moments so charming 😂',
    answers: ['honesty', 'truth', 'candor', 'sincerity', 'authenticity'],
  },
  {
    num: 7, title: 'The Compassionate Guardian',
    text: 'The heartbeat of her inner circle, her greatest ambition is the well-being of those she loves. She is a devoted protector of her friends and family, making their care her life\'s most beautiful mission.',
    riddle: 'I carry no weapon yet I defend fiercely. I build no walls yet everyone inside feels completely safe. I ask for nothing, yet I give everything. What am I?',
    hint: 'What Chitti IS for the people she loves 💜',
    answers: ['love', 'a guardian', 'guardian', 'care', 'protection', 'devotion', 'heart'],
  },
];

function renderLoveCards() {
  const grid = document.getElementById('love-grid');
  if (!grid) return;
  grid.innerHTML = LOVE_THINGS.map((t, i) => `
    <div class="love-flip locked" id="love-card-${i}" data-idx="${i}" onclick="handleCardClick(this)">
      <div class="love-flip-inner">
        <div class="love-front">
          <span class="love-front-num">🔒</span>
          <span class="love-front-title">Tap to unlock</span>
        </div>
        <div class="love-back">
          <span class="love-back-heart">💜</span>
          <span class="love-back-text">${t.text}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ════════════════════════════════════════
//  SCROLL REVEAL — fact cards only
//  Sections are always visible; only the cards animate in on scroll.
// ════════════════════════════════════════
function initScrollReveal() {
  const factsSection = document.getElementById('facts');
  if (!factsSection) return;

  function animateCards() {
    factsSection.querySelectorAll('.fact-card:not(.in)').forEach((card, i) => {
      setTimeout(() => card.classList.add('in'), i * 90);
    });
  }

  const rect = factsSection.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    // Already in view on load — animate immediately
    animateCards();
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCards();
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(factsSection);
  }
}

// ════════════════════════════════════════
//  INIT — everything starts here
// ════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Init canvases (must be inside DOMContentLoaded)
  starCanvas     = document.getElementById('starfield');
  confettiCanvas = document.getElementById('confetti-canvas');

  if (starCanvas && confettiCanvas) {
    starCtx      = starCanvas.getContext('2d');
    confettiCtx  = confettiCanvas.getContext('2d');
    resizeCanvases();
    initStars();
    requestAnimationFrame(animateStars);
  }

  // Render dynamic content
  renderFacts();
  renderLoveCards();

  // Live counter
  updateAliveCounter();
  setInterval(updateAliveCounter, 1000);

  // Modal riddle — Enter key submits
  const modalInput = document.getElementById('modal-riddle-input');
  if (modalInput) modalInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkModalAnswer();
  });

  // Close modal on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeRiddleModal();
  });

  // Scroll reveal
  initScrollReveal();

  // Auto confetti on load
  setTimeout(fireConfetti, 900);

  // Resize handler
  window.addEventListener('resize', () => {
    resizeCanvases();
    initStars();
  });
});
