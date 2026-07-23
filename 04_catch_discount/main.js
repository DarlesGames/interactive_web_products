(() => {
  "use strict";

  /*
   * CLIENT CONFIG
   * Меняйте этот объект, чтобы адаптировать шаблон под магазин, кафе,
   * онлайн-курс, доставку, салон, маркетплейс или другую промоакцию.
   */
  const CONFIG = {
    gameName: "Поймай скидку",
    targetScore: 100,
    startingLives: 3,
    promoCode: "MAGIC10",

    scene: {
      width: 360,
      height: 640,
      maxDevicePixelRatio: 2,
    },

    texts: {
      metaDescription: "Поймай магические бонусы и получи промокод.",
      hud: {
        score: "Очки",
        lives: "Попытки",
        progress: "Магия скидки",
      },
      start: {
        eyebrow: "Магическая мини-игра",
        titleLine1: "Поймай",
        titleLine2: "скидку",
        description: "Лови магические бонусы\nи получи промокод",
        button: "Играть",
        controlsHint: "Веди мышью или пальцем",
      },
      win: {
        eyebrow: "Победа",
        titleLine1: "Скидка",
        titleLine2: "поймана!",
        description: "Твой магический промокод",
        copyButton: "Скопировать промокод",
        replayButton: "Играть снова",
        copied: "Промокод скопирован!",
      },
      lose: {
        eyebrow: "Попытки закончились",
        titleLine1: "Скидка",
        titleLine2: "ускользнула",
        description: "Не сдавайся — удача любит настойчивых",
        retryButton: "Попробовать снова",
      },
      sound: {
        on: "Звук",
        off: "Тихо",
        enable: "Включить звук",
        disable: "Выключить звук",
      },
      damage: {
        stone: "Проклятый камень!",
        blackOrb: "Чёрная сфера!",
      },
      pageNote: "Лови бонусы · Избегай опасных предметов · Набери {target} очков",
    },

    colors: {
      ink: "#fffaf0",
      muted: "#c8bde2",
      violet: "#8f58ff",
      violetDark: "#5d2fc3",
      gold: "#ffd763",
      cyan: "#65cfff",
      danger: "#ff315f",
      panel: "rgba(7, 15, 43, 0.72)",
      pageBackground: "#050b1e",
      pageBackgroundSoft: "#111433",
      pageBackgroundDeep: "#08091c",
      sceneBackground: "#07122c",
      sceneTop: "#171035",
      sceneMiddle: "#111b48",
      sceneBottom: "#060d25",
      playerRobeLight: "#9c65ff",
      playerRobe: "#6135be",
      playerRobeDark: "#342276",
      playerHatLight: "#b37aff",
      playerHat: "#6636c5",
      playerHatDark: "#34206f",
      playerMagic: "#8ceaff",
    },

    audio: {
      enabledByDefault: true,
      masterVolume: 0.68,
    },

    player: {
      width: 54,
      height: 67,
      y: 562,
      speed: 270,
      edgePadding: 8,
      pointerResponse: 13,
      leanResponse: 9,
    },

    fall: {
      baseSpeed: 104,
      randomSpeed: 30,
      speedIncreasePerSecond: 1.65,
      maxSpeedIncrease: 72,
    },

    spawn: {
      firstItemDelay: 0.55,
      initialInterval: 1,
      minimumInterval: 0.52,
      intervalAcceleration: 0.007,
      intervalJitterMin: 0.86,
      intervalJitterRange: 0.3,
      extraItemStartsAfter: 7,
      extraItemChancePerSecond: 0.018,
      maximumExtraItemChance: 0.42,
      maximumItemsOnScreen: 7,
      secondItemMinimumGap: 92,
      secondItemRandomGap: 72,
    },

    difficulty: {
      harmfulItemsStartAfter: 5,
      harmfulChanceStart: 0.16,
      harmfulChancePerSecond: 0.0025,
      harmfulChanceMax: 0.27,
      invulnerabilityAfterHit: 0.85,
      maximumFrameDelta: 0.034,
    },

    /*
     * weight — относительный шанс появления внутри своей группы.
     * Полезные и вредные предметы выбираются отдельно.
     */
    items: {
      coin: {
        points: 10,
        radius: 16,
        color: "#ffd45f",
        glow: "#ffbb3d",
        harmful: false,
        weight: 48,
      },
      star: {
        points: 20,
        radius: 18,
        color: "#ffef8b",
        glow: "#ffe05e",
        harmful: false,
        weight: 22,
      },
      crystal: {
        points: 15,
        radius: 18,
        color: "#65ddff",
        glow: "#319cff",
        harmful: false,
        weight: 24,
      },
      scroll: {
        points: 30,
        radius: 19,
        color: "#f3d49a",
        glow: "#ffbd5c",
        harmful: false,
        rare: true,
        weight: 6,
      },
      stone: {
        points: 0,
        radius: 19,
        color: "#a23b57",
        glow: "#ff315f",
        harmful: true,
        weight: 83,
      },
      blackOrb: {
        points: 0,
        radius: 18,
        color: "#261331",
        glow: "#ff3d91",
        harmful: true,
        rare: true,
        speedFactor: 1.55,
        weight: 17,
      },
    },
  };

  const SCENE_WIDTH = CONFIG.scene.width;
  const SCENE_HEIGHT = CONFIG.scene.height;
  const PLAYER_ART_WIDTH = 54;
  const PLAYER_ART_HEIGHT = 67;

  // ---------- DOM references ----------
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const frame = document.getElementById("gameFrame");
  const hud = document.getElementById("hud");
  const scoreValue = document.getElementById("scoreValue");
  const livesValue = document.getElementById("livesValue");
  const progressValue = document.getElementById("progressValue");
  const progressFill = document.getElementById("progressFill");
  const copyStatus = document.getElementById("copyStatus");
  const soundButton = document.getElementById("soundButton");
  const soundIcon = document.getElementById("soundIcon");
  const soundLabel = document.getElementById("soundLabel");

  const screens = {
    start: document.getElementById("startScreen"),
    win: document.getElementById("winScreen"),
    lose: document.getElementById("loseScreen"),
  };

  const ui = {
    gameShell: document.getElementById("gameShell"),
    themeColorMeta: document.getElementById("themeColorMeta"),
    descriptionMeta: document.getElementById("descriptionMeta"),
    scoreLabel: document.getElementById("scoreLabel"),
    livesLabel: document.getElementById("livesLabel"),
    progressLabel: document.getElementById("progressLabel"),
    startEyebrow: document.getElementById("startEyebrow"),
    startTitleLine1: document.getElementById("startTitleLine1"),
    startTitleLine2: document.getElementById("startTitleLine2"),
    startDescription: document.getElementById("startDescription"),
    playButton: document.getElementById("playButton"),
    controlsHintText: document.getElementById("controlsHintText"),
    winEyebrow: document.getElementById("winEyebrow"),
    winTitleLine1: document.getElementById("winTitleLine1"),
    winTitleLine2: document.getElementById("winTitleLine2"),
    winDescription: document.getElementById("winDescription"),
    promoCodeValue: document.getElementById("promoCodeValue"),
    copyButton: document.getElementById("copyButton"),
    playAgainButton: document.getElementById("playAgainButton"),
    loseEyebrow: document.getElementById("loseEyebrow"),
    loseTitleLine1: document.getElementById("loseTitleLine1"),
    loseTitleLine2: document.getElementById("loseTitleLine2"),
    loseDescription: document.getElementById("loseDescription"),
    retryButton: document.getElementById("retryButton"),
    pageNote: document.getElementById("pageNote"),
  };

  // Текущее состояние игры. Здесь нет клиентских настроек — они находятся в CONFIG.
  const state = {
    mode: "start",
    score: 0,
    lives: CONFIG.startingLives,
    elapsed: 0,
    spawnTimer: 0,
    spawnDelay: CONFIG.spawn.initialInterval,
    lastTime: performance.now(),
    shake: 0,
    flash: 0,
    flashColor: "255,255,255",
    catchPulse: 0,
    keys: { left: false, right: false },
    pointerX: null,
    touchPointerId: null,
    invulnerable: 0,
    objects: [],
    particles: [],
    labels: [],
  };

  const player = {
    x: SCENE_WIDTH / 2,
    y: CONFIG.player.y,
    width: CONFIG.player.width,
    height: CONFIG.player.height,
    speed: CONFIG.player.speed,
    targetX: SCENE_WIDTH / 2,
    lean: 0,
  };

  const stars = Array.from({ length: 62 }, (_, index) => ({
    x: pseudoRandom(index * 19.37) * SCENE_WIDTH,
    y: pseudoRandom(index * 8.91 + 2) * SCENE_HEIGHT,
    radius: 0.35 + pseudoRandom(index * 13.7) * 1.15,
    alpha: 0.18 + pseudoRandom(index * 4.44) * 0.48,
    phase: pseudoRandom(index * 2.61) * Math.PI * 2,
  }));

  const itemTypes = CONFIG.items;
  const beneficialItemKeys = Object.keys(itemTypes).filter((key) => !itemTypes[key].harmful);
  const harmfulItemKeys = Object.keys(itemTypes).filter((key) => itemTypes[key].harmful);

  // ---------- Configuration and utilities ----------
  function setMultilineText(element, text) {
    element.replaceChildren();
    text.split("\n").forEach((line, index) => {
      if (index > 0) element.append(document.createElement("br"));
      element.append(document.createTextNode(line));
    });
  }

  // Подставляет бренд, тексты и основные цвета из CONFIG в HTML/CSS.
  function applyConfigToInterface() {
    const { texts, colors } = CONFIG;
    const cssVariables = {
      "--ink": colors.ink,
      "--muted": colors.muted,
      "--violet": colors.violet,
      "--violet-dark": colors.violetDark,
      "--gold": colors.gold,
      "--cyan": colors.cyan,
      "--danger": colors.danger,
      "--panel": colors.panel,
      "--page-bg": colors.pageBackground,
      "--page-bg-soft": colors.pageBackgroundSoft,
      "--page-bg-deep": colors.pageBackgroundDeep,
      "--scene-bg": colors.sceneBackground,
      "--scene-ratio": String(SCENE_WIDTH / SCENE_HEIGHT),
      "--scene-max-width": `${SCENE_WIDTH}px`,
    };

    Object.entries(cssVariables).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, value);
    });

    document.title = CONFIG.gameName;
    ui.themeColorMeta.content = colors.sceneBackground;
    ui.descriptionMeta.content = texts.metaDescription;
    ui.gameShell.setAttribute("aria-label", `Мини-игра «${CONFIG.gameName}»`);
    canvas.setAttribute("aria-label", `Игровое поле «${CONFIG.gameName}»`);
    frame.style.aspectRatio = `${SCENE_WIDTH} / ${SCENE_HEIGHT}`;

    ui.scoreLabel.textContent = texts.hud.score;
    ui.livesLabel.textContent = texts.hud.lives;
    ui.progressLabel.textContent = texts.hud.progress;

    ui.startEyebrow.textContent = texts.start.eyebrow;
    ui.startTitleLine1.textContent = texts.start.titleLine1;
    ui.startTitleLine2.textContent = texts.start.titleLine2;
    setMultilineText(ui.startDescription, texts.start.description);
    ui.playButton.textContent = texts.start.button;
    ui.controlsHintText.textContent = texts.start.controlsHint;

    ui.winEyebrow.textContent = texts.win.eyebrow;
    ui.winTitleLine1.textContent = texts.win.titleLine1;
    ui.winTitleLine2.textContent = texts.win.titleLine2;
    setMultilineText(ui.winDescription, texts.win.description);
    ui.promoCodeValue.textContent = CONFIG.promoCode;
    ui.promoCodeValue.parentElement.setAttribute("aria-label", `Промокод ${CONFIG.promoCode}`);
    ui.copyButton.textContent = texts.win.copyButton;
    ui.playAgainButton.textContent = texts.win.replayButton;

    ui.loseEyebrow.textContent = texts.lose.eyebrow;
    ui.loseTitleLine1.textContent = texts.lose.titleLine1;
    ui.loseTitleLine2.textContent = texts.lose.titleLine2;
    setMultilineText(ui.loseDescription, texts.lose.description);
    ui.retryButton.textContent = texts.lose.retryButton;

    ui.pageNote.textContent = texts.pageNote.replace("{target}", String(CONFIG.targetScore));
  }

  function pseudoRandom(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  function hexToRgbChannels(hexColor) {
    const normalized = hexColor.replace("#", "");
    const value = Number.parseInt(normalized, 16);
    return `${(value >> 16) & 255},${(value >> 8) & 255},${value & 255}`;
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.scene.maxDevicePixelRatio);
    canvas.width = Math.round(SCENE_WIDTH * dpr);
    canvas.height = Math.round(SCENE_HEIGHT * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setScreen(name) {
    Object.entries(screens).forEach(([screenName, element]) => {
      element.classList.toggle("is-active", screenName === name);
      element.setAttribute("aria-hidden", String(screenName !== name));
    });

    const playing = name === "playing";
    hud.classList.toggle("is-hidden", !playing);
  }

  // ---------- Game flow and HUD ----------
  function startGame() {
    state.mode = "playing";
    state.score = 0;
    state.lives = CONFIG.startingLives;
    state.elapsed = 0;
    state.spawnTimer = CONFIG.spawn.firstItemDelay;
    state.spawnDelay = CONFIG.spawn.initialInterval;
    state.shake = 0;
    state.flash = 0;
    state.catchPulse = 0;
    state.invulnerable = 0;
    state.objects.length = 0;
    state.particles.length = 0;
    state.labels.length = 0;
    state.keys.left = false;
    state.keys.right = false;
    state.pointerX = null;
    state.touchPointerId = null;
    player.x = SCENE_WIDTH / 2;
    player.targetX = player.x;
    player.lean = 0;
    copyStatus.textContent = "";
    updateHud();
    setScreen("playing");
    state.lastTime = performance.now();
  }

  function finishGame(result) {
    state.mode = result;
    state.keys.left = false;
    state.keys.right = false;
    state.pointerX = null;
    state.touchPointerId = null;
    setScreen(result);
  }

  function updateHud() {
    const safeScore = Math.min(state.score, CONFIG.targetScore);
    const progress = Math.round((safeScore / CONFIG.targetScore) * 100);
    scoreValue.textContent = `${safeScore} / ${CONFIG.targetScore}`;
    progressValue.textContent = `${progress}%`;
    progressFill.style.width = `${progress}%`;
    const filled = "♥ ".repeat(state.lives).trim();
    const empty = "♡ ".repeat(CONFIG.startingLives - state.lives).trim();
    livesValue.textContent = [filled, empty].filter(Boolean).join(" ");
    livesValue.setAttribute("aria-label", `Осталось попыток: ${state.lives}`);
  }

  function chooseWeightedItem(keys) {
    const totalWeight = keys.reduce((sum, key) => sum + itemTypes[key].weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const key of keys) {
      randomWeight -= itemTypes[key].weight;
      if (randomWeight <= 0) return key;
    }

    return keys[keys.length - 1];
  }

  function chooseItemType() {
    const difficulty = CONFIG.difficulty;
    const dangerUnlocked = state.elapsed >= difficulty.harmfulItemsStartAfter;
    const dangerChance = dangerUnlocked
      ? Math.min(
        difficulty.harmfulChanceStart
          + (state.elapsed - difficulty.harmfulItemsStartAfter) * difficulty.harmfulChancePerSecond,
        difficulty.harmfulChanceMax,
      )
      : 0;
    return Math.random() < dangerChance
      ? chooseWeightedItem(harmfulItemKeys)
      : chooseWeightedItem(beneficialItemKeys);
  }

  // ---------- Spawn and difficulty ----------
  function spawnObject(preferredX = null) {
    const type = chooseItemType();
    const config = itemTypes[type];
    const margin = config.radius + 18;
    const x = preferredX ?? margin + Math.random() * (SCENE_WIDTH - margin * 2);
    const baseSpeed = CONFIG.fall.baseSpeed
      + Math.random() * CONFIG.fall.randomSpeed
      + Math.min(
        state.elapsed * CONFIG.fall.speedIncreasePerSecond,
        CONFIG.fall.maxSpeedIncrease,
      );

    state.objects.push({
      type,
      x,
      y: -32 - Math.random() * 18,
      radius: config.radius,
      speed: baseSpeed * (config.speedFactor || 1),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 2.4,
      wobble: Math.random() * Math.PI * 2,
      config,
    });
  }

  function spawnWave() {
    spawnObject();

    const spawn = CONFIG.spawn;
    const extraChance = Math.min(
      Math.max((state.elapsed - spawn.extraItemStartsAfter) * spawn.extraItemChancePerSecond, 0),
      spawn.maximumExtraItemChance,
    );

    if (Math.random() < extraChance && state.objects.length < spawn.maximumItemsOnScreen) {
      const firstX = state.objects[state.objects.length - 1].x;
      const minGap = spawn.secondItemMinimumGap;
      const secondX = firstX < SCENE_WIDTH / 2
        ? Math.min(SCENE_WIDTH - 38, firstX + minGap + Math.random() * spawn.secondItemRandomGap)
        : Math.max(38, firstX - minGap - Math.random() * spawn.secondItemRandomGap);
      spawnObject(secondX);
    }
  }

  function update(delta) {
    const dt = Math.min(delta, CONFIG.difficulty.maximumFrameDelta);
    state.elapsed += dt;
    state.spawnTimer -= dt;
    state.shake = Math.max(0, state.shake - dt * 26);
    state.flash = Math.max(0, state.flash - dt * 2.8);
    state.catchPulse = Math.max(0, state.catchPulse - dt * 2.4);
    state.invulnerable = Math.max(0, state.invulnerable - dt);

    if (state.spawnTimer <= 0) {
      spawnWave();
      const spawn = CONFIG.spawn;
      state.spawnDelay = Math.max(
        spawn.minimumInterval,
        spawn.initialInterval - state.elapsed * spawn.intervalAcceleration,
      );
      state.spawnTimer = state.spawnDelay
        * (spawn.intervalJitterMin + Math.random() * spawn.intervalJitterRange);
    }

    let direction = 0;
    if (state.keys.left) direction -= 1;
    if (state.keys.right) direction += 1;

    if (direction !== 0) {
      player.x += direction * player.speed * dt;
      player.targetX = player.x;
    } else if (state.pointerX !== null) {
      player.targetX = state.pointerX;
      const difference = state.pointerX - player.x;
      player.x += difference * Math.min(1, dt * CONFIG.player.pointerResponse);
    }

    player.x = Math.max(
      player.width / 2 + CONFIG.player.edgePadding,
      Math.min(SCENE_WIDTH - player.width / 2 - CONFIG.player.edgePadding, player.x),
    );
    const movementTarget = direction !== 0 ? direction : Math.max(-1, Math.min(1, (player.targetX - player.x) / 30));
    player.lean += (movementTarget - player.lean) * Math.min(1, dt * CONFIG.player.leanResponse);

    for (let index = state.objects.length - 1; index >= 0; index -= 1) {
      const item = state.objects[index];
      item.y += item.speed * dt;
      item.rotation += item.rotationSpeed * dt;
      item.wobble += dt * 3.2;

      if (isColliding(item)) {
        state.objects.splice(index, 1);
        if (item.config.harmful) {
          if (state.invulnerable <= 0) {
            const message = item.type === "blackOrb"
              ? CONFIG.texts.damage.blackOrb
              : CONFIG.texts.damage.stone;
            loseLife(item.x, item.y, message);
          }
        } else {
          collectBonus(item);
        }
        continue;
      }

      if (item.y - item.radius > SCENE_HEIGHT) {
        state.objects.splice(index, 1);
      }
    }

    for (let index = state.particles.length - 1; index >= 0; index -= 1) {
      const particle = state.particles[index];
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += particle.gravity * dt;
      particle.vx *= 0.99;
      particle.rotation += particle.rotationSpeed * dt;
      if (particle.life <= 0) state.particles.splice(index, 1);
    }

    for (let index = state.labels.length - 1; index >= 0; index -= 1) {
      const label = state.labels[index];
      label.life -= dt;
      label.y -= 32 * dt;
      if (label.life <= 0) state.labels.splice(index, 1);
    }
  }

  function isColliding(item) {
    const catchY = player.y + 3;
    const horizontalReach = player.width * 0.47 + item.radius * 0.65;
    const verticalReach = 22 + item.radius;
    return Math.abs(item.x - player.x) < horizontalReach && Math.abs(item.y - catchY) < verticalReach;
  }

  // ---------- Collisions and visual feedback ----------
  function collectBonus(item) {
    state.score = Math.min(CONFIG.targetScore, state.score + item.config.points);
    state.flash = item.config.rare ? 0.48 : 0.28;
    state.flashColor = hexToRgbChannels(item.config.rare ? CONFIG.colors.cyan : CONFIG.colors.gold);
    state.catchPulse = item.config.rare ? 1 : 0.72;
    addBurst(item.x, item.y, item.config.color, item.config.rare ? 30 : 18, item.config.rare ? "spark" : "mixed");
    addBurst(player.x, player.y - 8, CONFIG.colors.cyan, item.config.rare ? 18 : 9, "spark");
    addLabel(item.x, item.y, `+${item.config.points}`, item.config.color);
    playGameSound(item.config.rare ? "rare" : "bonus", item.config.points);
    updateHud();

    if (state.score >= CONFIG.targetScore) {
      addBurst(player.x, player.y, CONFIG.colors.gold, 42, "spark");
      playGameSound("win");
      window.setTimeout(() => finishGame("win"), 420);
      state.mode = "finishing";
    }
  }

  function loseLife(x, y, message) {
    state.lives -= 1;
    state.invulnerable = CONFIG.difficulty.invulnerabilityAfterHit;
    state.shake = 9;
    state.flash = 0.78;
    state.flashColor = hexToRgbChannels(CONFIG.colors.danger);
    addBurst(x, y, CONFIG.colors.danger, 24, "shard");
    addLabel(x, Math.min(y, 545), message, "#ff8ca9");
    playGameSound("harm");
    updateHud();

    if (state.lives <= 0) {
      window.setTimeout(() => playGameSound("lose"), 180);
      window.setTimeout(() => finishGame("lose"), 450);
      state.mode = "finishing";
    }
  }

  function addBurst(x, y, color, count, style = "mixed") {
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 100;
      const shape = style === "mixed"
        ? (Math.random() < 0.42 ? "spark" : "orb")
        : style;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 22,
        gravity: 70,
        radius: 1.5 + Math.random() * 3,
        color,
        shape,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 8,
        life: 0.45 + Math.random() * 0.42,
        maxLife: 0.87,
      });
    }
  }

  function addLabel(x, y, text, color) {
    state.labels.push({ x, y, text, color, life: 0.85 });
  }

  // ---------- Web Audio ----------
  let audioContext = null;
  let audioMaster = null;
  let audioUnlocked = false;
  let soundEnabled = CONFIG.audio.enabledByDefault;

  async function unlockAudio() {
    if (!soundEnabled) return false;

    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioMaster = audioContext.createGain();
        audioMaster.gain.value = CONFIG.audio.masterVolume;
        audioMaster.connect(audioContext.destination);
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      audioUnlocked = audioContext.state === "running";
      soundButton.dataset.audioUnlocked = String(audioUnlocked);
      return audioUnlocked;
    } catch {
      audioUnlocked = false;
      soundButton.dataset.audioUnlocked = "false";
      return false;
    }
  }

  function synthTone(frequency, offset, duration, options = {}) {
    if (!audioUnlocked || !soundEnabled || !audioContext || !audioMaster) return;

    const start = audioContext.currentTime + offset;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = options.type || "sine";
    oscillator.frequency.setValueAtTime(frequency, start);

    if (options.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, start + duration);
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.volume || 0.055, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(audioMaster);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function synthNoise(offset, duration, volume = 0.025) {
    if (!audioUnlocked || !soundEnabled || !audioContext || !audioMaster) return;

    const frameCount = Math.max(1, Math.floor(audioContext.sampleRate * duration));
    const buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
    }

    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime + offset;
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = 720;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter).connect(gain).connect(audioMaster);
    source.start(start);
  }

  function playGameSound(kind, points = 0) {
    if (!soundEnabled || !audioUnlocked) return;

    if (kind === "start") {
      synthTone(392, 0, 0.12, { volume: 0.045 });
      synthTone(523.25, 0.07, 0.15, { volume: 0.05 });
      synthTone(783.99, 0.14, 0.2, { volume: 0.055 });
    }

    if (kind === "bonus") {
      const base = 570 + points * 5;
      synthTone(base, 0, 0.09, { volume: 0.045 });
      synthTone(base * 1.5, 0.045, 0.14, { volume: 0.04 });
    }

    if (kind === "rare") {
      synthTone(523.25, 0, 0.16, { volume: 0.055, type: "triangle" });
      synthTone(783.99, 0.06, 0.22, { volume: 0.055 });
      synthTone(1046.5, 0.13, 0.3, { volume: 0.05 });
    }

    if (kind === "harm") {
      synthTone(155, 0, 0.22, { volume: 0.07, type: "sawtooth", endFrequency: 72 });
      synthNoise(0, 0.18, 0.03);
    }

    if (kind === "win") {
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        synthTone(frequency, index * 0.09, 0.3, { volume: 0.052, type: index % 2 ? "triangle" : "sine" });
      });
    }

    if (kind === "lose") {
      synthTone(293.66, 0, 0.25, { volume: 0.05, type: "triangle", endFrequency: 220 });
      synthTone(196, 0.17, 0.42, { volume: 0.055, type: "sine", endFrequency: 110 });
    }

    if (kind === "toggle") {
      synthTone(660, 0, 0.08, { volume: 0.035 });
      synthTone(880, 0.055, 0.12, { volume: 0.035 });
    }
  }

  function updateSoundButton() {
    soundButton.setAttribute("aria-pressed", String(soundEnabled));
    soundButton.setAttribute(
      "aria-label",
      soundEnabled ? CONFIG.texts.sound.disable : CONFIG.texts.sound.enable,
    );
    soundIcon.textContent = soundEnabled ? "♪" : "×";
    soundLabel.textContent = soundEnabled ? CONFIG.texts.sound.on : CONFIG.texts.sound.off;
  }

  async function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundButton();

    if (soundEnabled) {
      await unlockAudio();
      playGameSound("toggle");
    }
  }

  function startFromUserAction() {
    if (soundEnabled) {
      unlockAudio().then((ready) => {
        if (ready) playGameSound("start");
      });
    }
    startGame();
  }

  // ---------- Canvas rendering ----------
  function draw(timestamp) {
    const time = timestamp * 0.001;
    ctx.save();

    if (state.shake > 0) {
      ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
    }

    drawBackground(time);

    if (state.mode === "playing" || state.mode === "finishing") {
      drawGuide();
      state.objects.forEach((item) => drawItem(item, time));
      drawPlayer(time);
      drawParticles();
      drawLabels();
    } else {
      drawAmbientMagic(time);
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(${state.flashColor},${state.flash * 0.23})`;
      ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    }

    ctx.restore();
  }

  function drawBackground(time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, SCENE_HEIGHT);
    gradient.addColorStop(0, CONFIG.colors.sceneTop);
    gradient.addColorStop(0.46, CONFIG.colors.sceneMiddle);
    gradient.addColorStop(1, CONFIG.colors.sceneBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

    const blueNebula = ctx.createRadialGradient(58, 205, 5, 58, 205, 150);
    blueNebula.addColorStop(0, "rgba(60, 169, 255, 0.12)");
    blueNebula.addColorStop(1, "rgba(31, 97, 190, 0)");
    ctx.fillStyle = blueNebula;
    ctx.fillRect(0, 55, 225, 310);

    const moonGlow = ctx.createRadialGradient(294, 96, 4, 294, 96, 90);
    moonGlow.addColorStop(0, "rgba(179, 135, 255, 0.22)");
    moonGlow.addColorStop(1, "rgba(122, 80, 203, 0)");
    ctx.fillStyle = moonGlow;
    ctx.fillRect(196, 0, 164, 190);

    stars.forEach((star) => {
      const twinkle = 0.6 + Math.sin(time * 1.8 + star.phase) * 0.4;
      ctx.globalAlpha = star.alpha * twinkle;
      ctx.fillStyle = star.radius > 1.1 ? "#ffe394" : "#e8deff";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#78d9ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(180, 270, 132 + Math.sin(time * 0.7) * 3, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.setLineDash([2, 10]);
    ctx.beginPath();
    ctx.arc(180, 270, 105, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    drawMountains();
    drawGroundGlow();
  }

  function drawMountains() {
    ctx.fillStyle = "rgba(38, 25, 72, 0.72)";
    ctx.beginPath();
    ctx.moveTo(0, 430);
    ctx.lineTo(58, 350);
    ctx.lineTo(104, 402);
    ctx.lineTo(166, 315);
    ctx.lineTo(230, 405);
    ctx.lineTo(286, 342);
    ctx.lineTo(360, 425);
    ctx.lineTo(360, 640);
    ctx.lineTo(0, 640);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(17, 18, 45, 0.92)";
    ctx.beginPath();
    ctx.moveTo(0, 495);
    ctx.quadraticCurveTo(58, 438, 116, 490);
    ctx.quadraticCurveTo(182, 425, 246, 489);
    ctx.quadraticCurveTo(307, 446, 360, 492);
    ctx.lineTo(360, 640);
    ctx.lineTo(0, 640);
    ctx.closePath();
    ctx.fill();
  }

  function drawGroundGlow() {
    const glow = ctx.createRadialGradient(180, 600, 5, 180, 600, 176);
    glow.addColorStop(0, "rgba(124, 90, 255, 0.19)");
    glow.addColorStop(1, "rgba(63, 42, 128, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 470, SCENE_WIDTH, 170);
  }

  function drawGuide() {
    ctx.strokeStyle = "rgba(198, 176, 255, 0.09)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    ctx.moveTo(22, 520);
    ctx.lineTo(338, 520);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.save();
    ctx.translate(player.x, 606);
    ctx.scale(1, 0.28);
    ctx.strokeStyle = `rgba(98, 205, 255, ${0.12 + state.catchPulse * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 48 + state.catchPulse * 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([5, 9]);
    ctx.beginPath();
    ctx.arc(0, 0, 33 + state.catchPulse * 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawAmbientMagic(time) {
    for (let index = 0; index < 9; index += 1) {
      const angle = time * (0.13 + index * 0.006) + index * 0.72;
      const radius = 78 + (index % 3) * 28;
      const x = 180 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle * 1.2) * radius * 0.58;
      ctx.globalAlpha = 0.18 + (index % 4) * 0.05;
      ctx.fillStyle = index % 2 ? "#ffd661" : "#a876ff";
      drawSpark(x, y, 2.2 + (index % 3), angle);
    }
    ctx.globalAlpha = 1;
  }

  function drawItem(item, time) {
    const y = item.y;
    const x = item.x + Math.sin(item.wobble) * 5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(item.rotation);
    ctx.shadowColor = item.config.glow;
    ctx.shadowBlur = item.config.harmful ? 18 : 23;

    if (item.type === "coin") drawCoin(item.config);
    if (item.type === "star") drawMagicStar(item.config, time);
    if (item.type === "crystal") drawCrystal(item.config);
    if (item.type === "scroll") drawScroll(item.config, time);
    if (item.type === "stone") drawCursedStone(item.config);
    if (item.type === "blackOrb") drawBlackOrb(item.config, time);

    ctx.restore();
  }

  function drawCoin(config) {
    const gradient = ctx.createRadialGradient(-5, -6, 1, 0, 0, 18);
    gradient.addColorStop(0, "#fff5ae");
    gradient.addColorStop(0.43, config.color);
    gradient.addColorStop(1, "#d88b1f");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(116, 66, 13, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#7d4a20";
    ctx.font = "bold 17px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦", 0, 1);
  }

  function drawMagicStar(config, time) {
    const pulse = 1 + Math.sin(time * 7) * 0.06;
    ctx.scale(pulse, pulse);
    const gradient = ctx.createRadialGradient(-4, -5, 1, 0, 0, 20);
    gradient.addColorStop(0, "#fffbd0");
    gradient.addColorStop(0.42, config.color);
    gradient.addColorStop(1, "#e59629");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    for (let point = 0; point < 10; point += 1) {
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const radius = point % 2 === 0 ? 19 : 8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (point === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 250, 195, 0.82)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  function drawCrystal(config) {
    const gradient = ctx.createLinearGradient(-15, -17, 14, 17);
    gradient.addColorStop(0, "#dcfbff");
    gradient.addColorStop(0.35, config.color);
    gradient.addColorStop(1, "#2078df");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -19);
    ctx.lineTo(16, -7);
    ctx.lineTo(11, 12);
    ctx.lineTo(0, 20);
    ctx.lineTo(-11, 12);
    ctx.lineTo(-16, -7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(230, 253, 255, 0.72)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 18);
    ctx.moveTo(-15, -7);
    ctx.lineTo(15, -7);
    ctx.stroke();
  }

  function drawScroll(config, time) {
    const glowRadius = 26 + Math.sin(time * 6) * 3;
    const aura = ctx.createRadialGradient(0, 0, 3, 0, 0, glowRadius + 13);
    aura.addColorStop(0, "rgba(255, 229, 139, 0.35)");
    aura.addColorStop(0.56, "rgba(94, 211, 255, 0.18)");
    aura.addColorStop(1, "rgba(94, 211, 255, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius + 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(111, 223, 255, ${0.48 + Math.sin(time * 6) * 0.16})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const paper = ctx.createLinearGradient(-16, -18, 16, 18);
    paper.addColorStop(0, "#fff3cf");
    paper.addColorStop(0.5, config.color);
    paper.addColorStop(1, "#c89250");
    ctx.fillStyle = paper;
    ctx.fillRect(-14, -17, 28, 34);
    ctx.fillStyle = "#8e552d";
    ctx.beginPath();
    ctx.ellipse(-14, -14, 4, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(14, 14, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#9d6037";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-7, -8);
    ctx.lineTo(7, -8);
    ctx.moveTo(-7, -2);
    ctx.lineTo(6, -2);
    ctx.moveTo(-7, 4);
    ctx.lineTo(3, 4);
    ctx.stroke();
    ctx.fillStyle = "#7e3a62";
    ctx.font = "900 12px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("%", 6, 9);
  }

  function drawCursedStone(config) {
    const gradient = ctx.createLinearGradient(-17, -17, 17, 18);
    gradient.addColorStop(0, "#c1aecb");
    gradient.addColorStop(0.45, config.color);
    gradient.addColorStop(1, "#45344f");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-11, -17);
    ctx.lineTo(10, -18);
    ctx.lineTo(19, -4);
    ctx.lineTo(13, 16);
    ctx.lineTo(-8, 19);
    ctx.lineTo(-19, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#e36cff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-7, -11);
    ctx.lineTo(2, -3);
    ctx.lineTo(-4, 5);
    ctx.lineTo(7, 13);
    ctx.stroke();
  }

  function drawBlackOrb(config, time) {
    const pulse = 1 + Math.sin(time * 11) * 0.07;
    ctx.scale(pulse, pulse);
    const gradient = ctx.createRadialGradient(-6, -7, 1, 0, 0, 19);
    gradient.addColorStop(0, "#78517f");
    gradient.addColorStop(0.35, config.color);
    gradient.addColorStop(1, "#050309");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 63, 151, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 21 + Math.sin(time * 8) * 2, 0.15, Math.PI * 1.55);
    ctx.stroke();
    ctx.fillStyle = "#ff5da9";
    drawSpark(3, -2, 3.2, time);
  }

  function drawPlayer(time) {
    const x = player.x;
    const y = player.y;
    const bob = Math.sin(time * 4.5) * 1.4;

    ctx.save();
    if (state.invulnerable > 0 && Math.floor(state.invulnerable * 12) % 2 === 0) {
      ctx.globalAlpha = 0.28;
    }
    ctx.translate(x, y + bob);
    ctx.rotate(player.lean * 0.045 + Math.sin(time * 3.1) * 0.012);
    ctx.scale(player.width / PLAYER_ART_WIDTH, player.height / PLAYER_ART_HEIGHT);

    if (state.catchPulse > 0) {
      const catchAura = ctx.createRadialGradient(0, 0, 5, 0, 0, 68);
      catchAura.addColorStop(0, `rgba(255, 224, 103, ${state.catchPulse * 0.22})`);
      catchAura.addColorStop(0.48, `rgba(91, 211, 255, ${state.catchPulse * 0.2})`);
      catchAura.addColorStop(1, "rgba(91, 211, 255, 0)");
      ctx.fillStyle = catchAura;
      ctx.fillRect(-72, -68, 144, 144);
    }

    const aura = ctx.createRadialGradient(0, 13, 3, 0, 13, 48);
    aura.addColorStop(0, "rgba(148, 98, 255, 0.24)");
    aura.addColorStop(1, "rgba(148, 98, 255, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(-55, -40, 110, 105);

    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, 42, 29, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(Math.sin(time * 3.4) * 0.025);
    ctx.strokeStyle = "#8c572e";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(18, 34);
    ctx.lineTo(29, -27);
    ctx.stroke();
    ctx.strokeStyle = "#d69b4f";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(18, 34);
    ctx.lineTo(29, -27);
    ctx.stroke();
    const staffGlow = ctx.createRadialGradient(29, -31, 1, 29, -31, 18);
    staffGlow.addColorStop(0, "rgba(205, 250, 255, 0.95)");
    staffGlow.addColorStop(0.25, "rgba(86, 213, 255, 0.7)");
    staffGlow.addColorStop(1, "rgba(86, 213, 255, 0)");
    ctx.fillStyle = staffGlow;
    ctx.fillRect(9, -51, 40, 40);
    ctx.fillStyle = CONFIG.colors.playerMagic;
    drawSpark(29, -31, 3.6 + Math.sin(time * 6) * 0.55, time * 0.8);
    ctx.restore();

    const robeGradient = ctx.createLinearGradient(-24, 2, 23, 48);
    robeGradient.addColorStop(0, CONFIG.colors.playerRobeLight);
    robeGradient.addColorStop(0.55, CONFIG.colors.playerRobe);
    robeGradient.addColorStop(1, CONFIG.colors.playerRobeDark);
    ctx.fillStyle = robeGradient;
    ctx.beginPath();
    ctx.moveTo(-13, 1);
    ctx.quadraticCurveTo(-23, 18, -27, 42);
    ctx.quadraticCurveTo(0, 51, 27, 42);
    ctx.quadraticCurveTo(22, 18, 13, 1);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#f4c49b";
    ctx.beginPath();
    ctx.arc(0, -3, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#25164f";
    ctx.beginPath();
    ctx.arc(-4.5, -2, 1.4, 0, Math.PI * 2);
    ctx.arc(4.5, -2, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#6e3d33";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 1, 4, 0.18, Math.PI - 0.18);
    ctx.stroke();

    ctx.fillStyle = "#f4c49b";
    ctx.beginPath();
    ctx.arc(18, 9, 4, 0, Math.PI * 2);
    ctx.fill();

    const hatGradient = ctx.createLinearGradient(-21, -40, 19, -6);
    hatGradient.addColorStop(0, CONFIG.colors.playerHatLight);
    hatGradient.addColorStop(0.52, CONFIG.colors.playerHat);
    hatGradient.addColorStop(1, CONFIG.colors.playerHatDark);
    ctx.fillStyle = hatGradient;
    ctx.beginPath();
    ctx.moveTo(-18, -10);
    ctx.quadraticCurveTo(-6, -26, 4, -46);
    ctx.quadraticCurveTo(12, -34, 10, -16);
    ctx.lineTo(23, -9);
    ctx.quadraticCurveTo(0, -4, -23, -9);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#ffd96a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-17, -11);
    ctx.quadraticCurveTo(1, -7, 19, -11);
    ctx.stroke();

    ctx.save();
    ctx.translate(4, -32);
    ctx.rotate(Math.sin(time * 2) * 0.12);
    ctx.fillStyle = "#ffdf6d";
    drawSpark(0, 0, 3.5, 0);
    ctx.restore();

    ctx.restore();
  }

  function drawParticles() {
    state.particles.forEach((particle) => {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      if (particle.shape === "spark") {
        drawSpark(particle.x, particle.y, particle.radius, particle.rotation);
      } else if (particle.shape === "shard") {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillRect(-particle.radius * 0.45, -particle.radius * 1.5, particle.radius * 0.9, particle.radius * 3);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function drawLabels() {
    state.labels.forEach((label) => {
      ctx.globalAlpha = Math.min(1, label.life * 2);
      ctx.fillStyle = label.color;
      ctx.font = "900 16px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 6;
      ctx.fillText(label.text, label.x, label.y);
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function drawSpark(x, y, radius, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, -radius * 2.2);
    ctx.quadraticCurveTo(radius * 0.35, -radius * 0.35, radius * 2.2, 0);
    ctx.quadraticCurveTo(radius * 0.35, radius * 0.35, 0, radius * 2.2);
    ctx.quadraticCurveTo(-radius * 0.35, radius * 0.35, -radius * 2.2, 0);
    ctx.quadraticCurveTo(-radius * 0.35, -radius * 0.35, 0, -radius * 2.2);
    ctx.fill();
    ctx.restore();
  }

  function gameLoop(timestamp) {
    const delta = (timestamp - state.lastTime) / 1000;
    state.lastTime = timestamp;

    if (state.mode === "playing") update(delta);
    draw(timestamp);
    requestAnimationFrame(gameLoop);
  }

  // ---------- Input and clipboard ----------
  function getPointerSceneX(event) {
    const rect = canvas.getBoundingClientRect();
    return ((event.clientX - rect.left) / rect.width) * SCENE_WIDTH;
  }

  async function copyPromoCode() {
    const promoCode = CONFIG.promoCode;
    try {
      await navigator.clipboard.writeText(promoCode);
    } catch {
      const input = document.createElement("textarea");
      input.value = promoCode;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    copyStatus.textContent = CONFIG.texts.win.copied;
  }

  ui.playButton.addEventListener("click", startFromUserAction);
  ui.playAgainButton.addEventListener("click", startFromUserAction);
  ui.retryButton.addEventListener("click", startFromUserAction);
  ui.copyButton.addEventListener("click", copyPromoCode);
  soundButton.addEventListener("click", toggleSound);

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
      state.keys.left = true;
      event.preventDefault();
    }
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
      state.keys.right = true;
      event.preventDefault();
    }
    const isActionKey = event.key === "Enter" || event.key === " ";
    const isButtonFocused = event.target instanceof Element && Boolean(event.target.closest("button"));
    if (isActionKey && !isButtonFocused && state.mode !== "playing" && state.mode !== "finishing") {
      startFromUserAction();
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") state.keys.left = false;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") state.keys.right = false;
  });

  frame.addEventListener("pointerdown", (event) => {
    if (state.mode !== "playing" || event.target.closest("button")) return;
    state.pointerX = getPointerSceneX(event);
    if (event.pointerType !== "mouse") {
      state.touchPointerId = event.pointerId;
      frame.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
  });

  frame.addEventListener("pointermove", (event) => {
    if (state.mode !== "playing" || event.target.closest("button")) return;
    const isMouse = event.pointerType === "mouse";
    const isActiveTouch = state.touchPointerId === event.pointerId;
    if (!isMouse && !isActiveTouch) return;
    state.pointerX = getPointerSceneX(event);
    event.preventDefault();
  });

  window.addEventListener("pointerup", (event) => {
    if (event.pointerId === state.touchPointerId) {
      state.touchPointerId = null;
      state.pointerX = null;
    }
  });

  window.addEventListener("pointercancel", (event) => {
    if (event.pointerId === state.touchPointerId) {
      state.touchPointerId = null;
      state.pointerX = null;
    }
  });

  window.addEventListener("blur", () => {
    state.keys.left = false;
    state.keys.right = false;
    state.pointerX = null;
    state.touchPointerId = null;
  });

  document.addEventListener("visibilitychange", () => {
    state.lastTime = performance.now();
  });

  window.addEventListener("resize", resizeCanvas);

  // ---------- Bootstrap ----------
  applyConfigToInterface();
  resizeCanvas();
  updateHud();
  updateSoundButton();
  setScreen("start");
  requestAnimationFrame(gameLoop);
})();
