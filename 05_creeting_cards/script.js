(() => {
  const screens = [...document.querySelectorAll('.screen')];
  const nextButtons = [...document.querySelectorAll('[data-next]')];
  const progress = document.querySelector('.progress');
  const soundToggle = document.querySelector('.sound-toggle');
  const strings = [...document.querySelectorAll('.string')];
  const wishList = document.querySelector('.wish-list');
  const wishPlaceholder = document.querySelector('.wish-placeholder');
  const stringsNext = document.getElementById('stringsNext');
  const poemText = document.getElementById('poemText');
  const poemNext = document.getElementById('poemNext');
  const skipPoem = document.getElementById('skipPoem');
  const restartBtn = document.getElementById('restartBtn');
  const confettiBtn = document.getElementById('confettiBtn');
  const floaters = document.querySelector('.floaters');

  let active = 0;
  let audioContext = null;
  let soundEnabled = true;
  let poemStarted = false;
  let poemTimer = null;

  const poem = `Пусть ваша семья будет крепкой,
а каждый новый день приносит
тепло, радость и спокойствие.

Любите, уважайте
и всегда поддерживайте друг друга.`;

  function setupProgress() {
    screens.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = `dot${index === 0 ? ' is-active' : ''}`;
      progress.appendChild(dot);
    });
  }

  function setupFloaters() {
    const symbols = ['♡', '✦', '★', '☀', '❀', '♪'];
    for (let i = 0; i < 34; i += 1) {
      const item = document.createElement('span');
      item.className = 'floater';
      item.textContent = symbols[i % symbols.length];
      item.style.left = `${Math.random() * 100}%`;
      item.style.animationDelay = `${Math.random() * -12}s`;
      item.style.setProperty('--duration', `${9 + Math.random() * 10}s`);
      item.style.transform = `translateY(${80 + Math.random() * 35}vh)`;
      item.style.fontSize = `${0.85 + Math.random() * 0.75}rem`;
      floaters.appendChild(item);
    }
  }

  function getAudioContext() {
    if (!audioContext) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      audioContext = new AudioCtor();
    }
    return audioContext;
  }

  function playTone(frequency = 330, duration = 0.45) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.985, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(520, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.085, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  function playSoftChord() {
    [262, 330, 392].forEach((note, index) => {
      setTimeout(() => playTone(note, 0.65), index * 85);
    });
  }

  function showScreen(index) {
    active = Math.max(0, Math.min(index, screens.length - 1));
    screens.forEach((screen, screenIndex) => {
      screen.classList.toggle('is-active', screenIndex === active);
    });
    [...progress.children].forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
    });

    if (active === 2 && !poemStarted) startPoem();
    if (active === 6) {
      playSoftChord();
      burstConfetti(64);
    }
  }

  function startPoem() {
    poemStarted = true;
    poemText.textContent = '';
    let i = 0;
    clearInterval(poemTimer);
    poemTimer = setInterval(() => {
      poemText.textContent += poem[i];
      i += 1;
      if (i >= poem.length) {
        clearInterval(poemTimer);
        poemNext.classList.remove('is-hidden');
        skipPoem.classList.add('is-hidden');
      }
    }, 32);
  }

  function revealPoem() {
    clearInterval(poemTimer);
    poemText.textContent = poem;
    poemNext.classList.remove('is-hidden');
    skipPoem.classList.add('is-hidden');
  }

  function burstConfetti(count = 34) {
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty('--hue', `${Math.floor(Math.random() * 360)}`);
      piece.style.setProperty('--drift', `${-80 + Math.random() * 160}px`);
      piece.style.setProperty('--fall', `${1800 + Math.random() * 1400}ms`);
      document.querySelector('.app').appendChild(piece);
      setTimeout(() => piece.remove(), 3400);
    }
  }

  nextButtons.forEach((button) => {
    button.addEventListener('click', () => {
      playTone(440, 0.22);
      showScreen(active + 1);
    });
  });

  strings.forEach((string) => {
    string.addEventListener('click', () => {
      const note = Number(string.dataset.note || 330);
      playTone(note, 0.55);
      string.classList.add('is-ringing', 'is-played');
      setTimeout(() => string.classList.remove('is-ringing'), 280);

      if (!string.dataset.added) {
        string.dataset.added = 'true';
        const li = document.createElement('li');
        li.textContent = string.dataset.wish;
        wishList.appendChild(li);
        wishPlaceholder.classList.add('is-hidden');
      }

      const playedCount = strings.filter((item) => item.dataset.added === 'true').length;
      if (playedCount >= strings.length) {
        stringsNext.classList.remove('is-hidden');
        playSoftChord();
      }
    });
  });

  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = `звук: ${soundEnabled ? 'вкл' : 'выкл'}`;
    if (soundEnabled) playTone(392, 0.18);
  });

  skipPoem.addEventListener('click', revealPoem);

  restartBtn.addEventListener('click', () => {
    playTone(330, 0.2);
    showScreen(0);
  });

  confettiBtn.addEventListener('click', () => {
    playSoftChord();
    burstConfetti(84);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      const activeNext = screens[active].querySelector('[data-next]:not(.is-hidden)');
      if (activeNext) activeNext.click();
    }
    if (event.key === 'ArrowLeft') showScreen(active - 1);
  });

  setupProgress();
  setupFloaters();
})();
