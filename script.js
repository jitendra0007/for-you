// ========== FLOATING HEARTS BG ==========
(function makeHearts() {
  const bg = document.getElementById('heartsBg');
  const emojis = ['💗','💕','🌸','💖','💘','💞'];
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('span');
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.fontSize = (14 + Math.random() * 22) + 'px';
    s.style.animationDuration = (10 + Math.random() * 14) + 's';
    s.style.animationDelay = (Math.random() * 12) + 's';
    bg.appendChild(s);
  }
})();

// ========== SECTION NAVIGATION ==========
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return el;
}

document.querySelectorAll('.btn-next').forEach(btn => {
  const target = btn.dataset.next;
  if (!target) return;
  btn.addEventListener('click', () => {
    const el = showSection(target);
    if (target === 'sorry') startTypewriter();
  });
});

// ========== ENVELOPE ==========
const envelope = document.getElementById('envelope');
envelope.addEventListener('click', () => {
  envelope.classList.add('open');
  setTimeout(() => {
    showSection('sorry');
    startTypewriter();
  }, 900);
});

// ========== TYPEWRITER ==========
const sorryLines = [
  "I've been sitting with this, and I want to say it properly.",
  "You matter more to me than being right, or winning, or my pride.",
  "I hurt you — and I'm truly, genuinely sorry."
];
let twStarted = false;
function startTypewriter() {
  if (twStarted) return;
  twStarted = true;
  const el = document.getElementById('typewriter');
  let li = 0, ci = 0;
  function step() {
    if (li >= sorryLines.length) return;
    const line = sorryLines[li];
    if (ci === 0 && li > 0) el.innerHTML += '<br><br>';
    el.innerHTML = el.innerHTML.replace(/\|$/, '') + line.charAt(ci);
    ci++;
    if (ci < line.length) {
      setTimeout(step, 35 + Math.random() * 40);
    } else {
      li++; ci = 0;
      setTimeout(step, 700);
    }
  }
  step();
}

// ========== THE 'NO' BUTTON RUNS AWAY ==========
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const qHint = document.getElementById('qHint');
const qButtons = document.querySelector('.q-buttons');

let dodgeCount = 0;
const hints = [
  "…are you sure?",
  "please?",
  "one more chance?",
  "I'll bring you your favourite snack",
  "…I'll do the dishes for a week",
  "…okay okay I'll do them forever",
  "you can't catch me anyway 💨"
];

function dodge() {
  const rect = qButtons.getBoundingClientRect();
  const maxX = rect.width - noBtn.offsetWidth - 10;
  const maxY = 60;
  const x = Math.random() * maxX;
  const y = (Math.random() * maxY) - 30;
  noBtn.style.left = x + 'px';
  noBtn.style.right = 'auto';
  noBtn.style.transform = `translateY(${y}px)`;
  qHint.textContent = hints[Math.min(dodgeCount, hints.length - 1)];
  dodgeCount++;
  // shrink slightly each time
  const scale = Math.max(0.55, 1 - dodgeCount * 0.06);
  noBtn.style.fontSize = (15 * scale) + 'px';
  noBtn.style.padding = `${14 * scale}px ${34 * scale}px`;
}
noBtn.addEventListener('mouseenter', dodge);
noBtn.addEventListener('touchstart', dodge, { passive: true });
noBtn.addEventListener('focus', dodge);
noBtn.addEventListener('click', dodge);

// ========== YES ==========
yesBtn.addEventListener('click', () => {
  showSection('forgiven');
  launchConfetti();
});

// ========== CONFETTI ==========
function launchConfetti() {
  const colors = ['#e63e6d','#ff6b98','#ffc2d1','#fff8f9','#ffb3d1','#ff9ebb'];
  for (let i = 0; i < 140; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
    c.style.animationDelay = Math.random() * 0.6 + 's';
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    if (Math.random() > 0.6) c.style.borderRadius = '50%';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }
}

// ========== MUSIC (tiny web-audio tune, no external files) ==========
const musicBtn = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');
let audioCtx = null;
let musicPlaying = false;
let musicTimer = null;

// A simple loop of a warm arpeggio (C major-ish, gentle)
const notes = [
  261.63, 329.63, 392.00, 523.25, // C E G C
  329.63, 392.00, 523.25, 659.25, // E G C E
  349.23, 440.00, 523.25, 659.25, // F A C E
  293.66, 392.00, 493.88, 587.33  // D G B D
];

function playNote(freq, time, duration = 0.5) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.14, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + duration + 0.05);
}

function scheduleLoop() {
  const now = audioCtx.currentTime;
  const step = 0.35;
  notes.forEach((n, i) => playNote(n, now + i * step, step * 1.4));
  musicTimer = setTimeout(scheduleLoop, notes.length * step * 1000);
}

musicBtn.addEventListener('click', () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (!musicPlaying) {
    audioCtx.resume();
    scheduleLoop();
    musicPlaying = true;
    musicBtn.classList.add('playing');
    musicIcon.textContent = '🎶';
  } else {
    clearTimeout(musicTimer);
    audioCtx.suspend();
    musicPlaying = false;
    musicBtn.classList.remove('playing');
    musicIcon.textContent = '🎵';
  }
});

// ========== CLICK-TO-SPRAY HEARTS ==========
document.addEventListener('click', (e) => {
  if (e.target.closest('button')) return;
  const heart = document.createElement('span');
  heart.textContent = ['💖','💗','💕'][Math.floor(Math.random()*3)];
  heart.style.cssText = `
    position:fixed;
    left:${e.clientX}px;
    top:${e.clientY}px;
    font-size:24px;
    pointer-events:none;
    z-index:9999;
    animation: rise 1.6s ease-out forwards;
  `;
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1700);
});
