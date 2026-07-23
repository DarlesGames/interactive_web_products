(() => {
  const queryLanguage = new URLSearchParams(location.search).get('lang');
  const savedLanguage = localStorage.getItem('darlesLanguage');
  const language = queryLanguage === 'en' || queryLanguage === 'ru'
    ? queryLanguage
    : savedLanguage === 'en' ? 'en' : 'ru';
  localStorage.setItem('darlesLanguage', language);
  document.documentElement.lang = language;

  const english = new Map([
    ['Илларион и Элиза', 'Illarion and Eliza'],
    ['Поздравляем вас с днём свадьбы!', 'Congratulations on your wedding day!'],
    ['Желаем вам любви, взаимного уважения, семейного счастья и много радостных дней вместе.', 'May your life together be filled with love, mutual respect, family happiness, and many joyful days.'],
    ['Открыть поздравление', 'Open the greeting'],
    ['Нажмите на все струны, чтобы открыть пожелания.', 'Play every string to reveal the wishes.'],
    ['Шесть струн с пожеланиями', 'Six strings with wedding wishes'],
    ['Крепкой любви и взаимного уважения.', 'Strong love and mutual respect.'],
    ['Доверия, терпения и понимания.', 'Trust, patience, and understanding.'],
    ['Уюта, тепла и достатка в доме.', 'Comfort, warmth, and abundance at home.'],
    ['Поддержки друг друга в любой ситуации.', 'Support for one another in every situation.'],
    ['Общих целей и счастливых событий.', 'Shared goals and happy occasions.'],
    ['Много радости, улыбок и добрых воспоминаний.', 'Plenty of joy, smiles, and wonderful memories.'],
    ['Пожелания появятся здесь.', 'Your wishes will appear here.'],
    ['Дальше', 'Continue'],
    ['Показать сразу', 'Show now'],
    ['Силуэт жениха', 'Groom silhouette'],
    ['Илларион', 'Illarion'],
    ['Поздравляем тебя с этим важным днём!', 'Congratulations on this important day!'],
    ['Желаем быть надёжной опорой для своей семьи, беречь любовь и всегда поддерживать Элизу.', 'May you always be a reliable source of support for your family, protect your love, and stand by Eliza.'],
    ['Пусть ваш дом будет наполнен теплом, спокойствием и радостью.', 'May your home be filled with warmth, peace, and joy.'],
    ['Силуэт невесты', 'Bride silhouette'],
    ['Элиза', 'Eliza'],
    ['Поздравляем тебя с днём свадьбы!', 'Congratulations on your wedding day!'],
    ['Желаем любви, семейного счастья, душевного тепла и исполнения общих мечтаний.', 'May you have love, family happiness, heartfelt warmth, and the fulfillment of your shared dreams.'],
    ['Пусть рядом всегда будет забота, понимание и поддержка Иллариона.', 'May Illarion’s care, understanding, and support always be by your side.'],
    ['Свадебный тост', 'Wedding toast'],
    ['За вашу новую семью! Желаем вам любить и уважать друг друга, вместе встречать радостные события и легко справляться с трудностями. Пусть ваш союз будет крепким и счастливым.', 'To your new family! May you love and respect one another, celebrate joyful moments together, and meet every challenge with ease. May your union be strong and happy.'],
    ['Силуэты жениха и невесты вместе', 'Bride and groom silhouettes together'],
    ['Счастья вашей семье!', 'Happiness to your family!'],
    ['Пусть ваша совместная жизнь будет долгой, спокойной и счастливой. Берегите друг друга, чаще радуйтесь вместе и сохраняйте любовь на долгие годы.', 'May your life together be long, peaceful, and happy. Take care of one another, share joy often, and keep your love strong for many years.'],
    ['С днём свадьбы!', 'Happy wedding day!'],
    ['Сначала', 'Start over'],
    ['Ещё немного радости', 'More celebration'],
    ['Включить или выключить звук', 'Toggle sound'],
    ['звук: вкл', 'sound: on'],
  ]);

  function applyEnglishPage() {
    if (language !== 'en') return;
    document.title = 'Illarion and Eliza';
    document.querySelector('meta[name="description"]').content = 'A wedding greeting for Illarion and Eliza';

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const source = node.nodeValue.trim();
      if (english.has(source)) node.nodeValue = node.nodeValue.replace(source, english.get(source));
    });

    document.querySelectorAll('[aria-label], [alt], [data-wish]').forEach((element) => {
      ['aria-label', 'alt', 'data-wish'].forEach((attribute) => {
        const value = element.getAttribute(attribute);
        if (english.has(value)) element.setAttribute(attribute, english.get(value));
      });
    });
  }

  applyEnglishPage();

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

  const poem = language === 'en' ? `May your family always be strong,
and may every new day bring
warmth, joy, and peace.

Love and respect one another,
and always stand side by side.` : `Пусть ваша семья будет крепкой,
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
    soundToggle.textContent = language === 'en'
      ? `sound: ${soundEnabled ? 'on' : 'off'}`
      : `звук: ${soundEnabled ? 'вкл' : 'выкл'}`;
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
