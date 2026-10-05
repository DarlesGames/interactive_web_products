(function (T) {
  'use strict';
  const view = document.getElementById('view');
  const announcer = document.getElementById('announcer');
  const state = new T.GameState();
  const scenario = T.scenario;
  let sceneIndex = 0;
  let mode = 'intro';
  let locked = false;
  let transitionTimer = null;
  let challengeTimer = null;
  let aimController = null;
  let currentCharacter = 'A01';
  let characterSlot = 0;
  let characterToken = 0;
  let clientLabel = 'СКЕПТИЧЕН';
  let continueAction = null;
  let challengeDeadline = 0;
  let selectedArguments = [];
  let challengeFinished = false;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const arrow = '<span aria-hidden="true">↗</span>';
  const button = (action, label, secondary = false) => `<button class="button ${secondary ? 'button-secondary' : ''}" data-action="${action}">${label}${arrow}</button>`;

  function track(name, data = {}) {
    try { T.config.track(name, data); } catch (error) { console.warn('Analytics adapter:', error.message); }
  }
  function clearWork() {
    clearTimeout(transitionTimer);
    clearInterval(challengeTimer);
    transitionTimer = null;
    challengeTimer = null;
    continueAction = null;
    if (aimController) { aimController.destroy(); aimController = null; }
  }
  function setMode(next) {
    clearWork();
    mode = next;
    document.body.dataset.mode = next;
  }
  function announce(text) { announcer.textContent = text; }
  function focusView() { view.focus({ preventScroll: true }); }
  function scrollTop() { window.scrollTo({ top: 0, behavior: 'instant' }); }
  function updateScore() {
    document.getElementById('score').hidden = !state.darts.visible;
    document.getElementById('client-score').textContent = state.darts.client;
    document.getElementById('player-score').textContent = state.darts.player;
  }
  function character(key) {
    if (!key) return;
    const token = ++characterToken;
    const first = document.getElementById('character-a');
    const second = document.getElementById('character-b');
    if (currentCharacter === key && (first.classList.contains('active') || second.classList.contains('active'))) return;
    currentCharacter = key;
    const next = characterSlot === 0 ? first : second;
    const previous = characterSlot === 0 ? second : first;
    const show = () => {
      if (token !== characterToken) return;
      document.getElementById('character-frame').dataset.pose = key;
      next.classList.add('active');
      previous.classList.remove('active');
    };
    next.onload = show;
    next.dataset.pose = key;
    next.style.setProperty('--pose-scale', T.assetFraming[key] || 1);
    next.src = T.assets[key];
    if (next.complete && next.naturalWidth) show();
    characterSlot = 1 - characterSlot;
  }
  function metadata() {
    return `<div class="client-meta"><h2>Аристарх<br>Звездочетов</h2><p>Основатель Ares Frontier</p><span class="client-state"><i aria-hidden="true"></i>${escape(clientLabel)}</span></div>`;
  }
  function linesHtml(lines) {
    return lines.map((line, index) => `<span class="line ${index ? 'line-secondary' : ''}">${escape(line)}</span>`).join('');
  }
  function dialogueHtml(lines, answer) {
    return `<div class="dialogue">${lines.length ? `<p class="speaker-label">${escape(scenario.speakerLabels.client)}</p><h1>${linesHtml(lines)}</h1>` : ''}${answer ? `<div class="player-reply"><p class="speaker-label">${escape(scenario.speakerLabels.player)}</p><p class="player-answer">${escape(answer)}</p></div>` : ''}</div>`;
  }
  function extraHtml(id) {
    if (id === 'transformation') {
      const content = scenario.extras.transformation;
      return `<div class="transformation"><div class="document-card"><span class="eyebrow">${content.fromLabel}</span><p>${content.fromText}</p><div class="document-lines" aria-hidden="true"></div></div><span class="transform-arrow" aria-hidden="true">→</span><div class="situation-card"><span class="eyebrow">${content.toLabel}</span><p>${content.toText}</p><div class="decision-branches" aria-hidden="true"><i></i><i></i><i></i></div></div></div>`;
    }
    if (id === 'customization' || id === 'materials') return `<div class="tokens">${scenario.extras[id].map(label => `<span>${label}</span>`).join('')}</div>`;
    if (id === 'observations') return `<ul class="observations">${state.observations().map(item => `<li>${escape(item.good ? item.strength : item.observation)}</li>`).join('')}</ul>`;
    return '';
  }
  function intro() {
    setMode('intro');
    locked = false;
    state.sceneId = 'intro';
    updateScore();
    view.innerHTML = `<section class="intro screen"><div class="intro-content"><p class="eyebrow intro-kicker">PLAYABLE DEMO · 2 МИНУТЫ</p><h1>Марс ближе,<br>чем кажется<span class="accent">.</span></h1><p class="intro-product">${escape(scenario.intro.product)}</p><div class="goal"><p class="eyebrow">ВАША ЦЕЛЬ</p><p class="intro-context">${escape(scenario.intro.context)}</p><p class="intro-situation">${escape(scenario.intro.situation)}</p><p class="intro-objective">${escape(scenario.intro.goal)}</p></div><p class="intro-hint">${scenario.intro.hint}</p>${button('start', 'Начать разговор')}<p class="intro-footnote">Одна встреча. Ваши решения. Их последствия.</p></div><div class="intro-caption"><span>ARES FRONTIER</span><p>Будущее требует практики.</p></div></section>`;
    scrollTop();
    focusView();
  }
  function start() {
    if (locked || mode !== 'intro') return;
    locked = true;
    sceneIndex = 0;
    character('A01');
    track('demo_started');
    showScene();
  }
  function showScene(skipLeadIn = false) {
    const scene = scenario.scenes[sceneIndex];
    setMode('dialogue');
    locked = false;
    state.sceneId = scene.id;
    clientLabel = scene.state;
    character(scene.id === 'scene5' && state.trust < 65 ? 'A04' : scene.character);
    if (scene.leadIn && !skipLeadIn) { playBeats(scene.leadIn, () => showScene(true)); return; }
    view.innerHTML = `<section class="conversation screen">${metadata()}<div class="conversation-bottom">${dialogueHtml(scene.lines)}<p class="speaker-label choices-label">${escape(scenario.speakerLabels.choices)}</p><div class="actions" aria-label="Ваши действия">${scene.choices.map((choice, index) => `<button class="action-card" data-choice="${index}"><span class="action-number" aria-hidden="true">0${index + 1}</span><span>${escape(choice.text)}</span><span class="action-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></div></section>`;
    scrollTop();
    focusView();
    announce(scene.lines.join(' '));
  }
  function choose(index) {
    if (mode !== 'dialogue' || locked) return;
    const scene = scenario.scenes[sceneIndex];
    const choice = scene.choices[index];
    if (!choice || !state.choose(scene, choice)) return;
    locked = true;
    view.querySelectorAll('[data-choice]').forEach(el => { el.disabled = true; });
    track('choice_selected', { sceneId: scene.id, choiceId: choice.id });
    playBeats(choice.reaction, () => afterScene(scene));
  }
  function playBeats(beats, onDone, index = 0) {
    if (index >= beats.length) { onDone(); return; }
    const beat = beats[index];
    setMode('reaction');
    character(beat.character);
    if (beat.state) clientLabel = beat.state;
    view.innerHTML = `<section class="conversation screen">${metadata()}<div class="reaction-bottom ${beat.extra ? 'has-extra' : ''}">${beat.headline ? `<p class="outcome-headline">${escape(beat.headline)}</p>` : ''}${extraHtml(beat.extra)}${beat.narration ? `<p class="narration">${escape(beat.narration)}</p>` : ''}${dialogueHtml(beat.lines, beat.answer)}<button class="continue-button" data-action="continue" aria-label="Продолжить">Далее <span aria-hidden="true">→</span></button></div></section>`;
    const proceed = () => {
      if (!continueAction) return;
      continueAction = null;
      clearTimeout(transitionTimer);
      playBeats(beats, onDone, index + 1);
    };
    continueAction = proceed;
    focusView();
    announce([beat.lines.length ? scenario.speakerLabels.client : '', ...beat.lines, beat.answer ? scenario.speakerLabels.player : '', beat.answer || '', beat.narration || ''].join(' '));
  }
  function afterScene(scene) {
    const next = () => { sceneIndex++; showScene(); };
    if (scene.after === 'clientDart') clientThrow(next);
    else if (scene.after === 'playerDart') playBeats([{ lines: scenario.playerTurn, character: 'A07' }], () => playerThrow(next));
    else if (scene.after === 'challenge') challengeIntro();
    else if (scene.after === 'finalDarts') clientThrow(() => playerThrow(showOutcome, true));
    else next();
  }
  function dartScreen(actor) {
    setMode('darts');
    document.body.dataset.dartActor = actor;
    view.innerHTML = `<section class="darts-screen screen"><div class="dart-heading"><p class="eyebrow">${actor === 'player' ? 'ВАШ ХОД' : 'БРОСОК АРИСТАРХА'}</p><h1>${actor === 'player' ? 'Цельтесь. Бросайте.' : 'Посмотрим.'}</h1></div><div class="dartboard-wrap"><button class="dartboard-target" id="dartboard" aria-label="Мишень. Стрелки или WASD — прицелиться, Enter или пробел — бросить." aria-describedby="dart-help" ${actor === 'client' ? 'disabled' : ''}><img class="dartboard-image" src="${T.assets.D01}" alt="Мишень для дротиков" draggable="false"><span class="hits" id="hits"></span><img class="aim-indicator" id="aim" src="${T.assets.D07}" alt="" ${actor === 'client' ? 'hidden' : ''}></button><img class="flying-dart" id="flying-dart" src="${T.assets[actor === 'player' ? 'D03' : 'D04']}" alt=""><img class="throw-fx" id="throw-fx" src="${T.assets.D08}" alt=""></div><p class="dart-help" id="dart-help">${actor === 'player' ? '<span class="pointer-help">Наведите и нажмите · коснитесь мишени</span><span>Стрелки / WASD + Enter</span>' : 'Аристарх переводит взгляд на мишень.'}</p></section>`;
    drawHits();
    scrollTop();
    return document.getElementById('dartboard');
  }
  function drawHits() {
    const container = document.getElementById('hits');
    if (!container) return;
    container.innerHTML = state.darts.hits.map(hit => `<img class="hit-marker" src="${T.assets[hit.actor === 'player' ? 'D05' : 'D06']}" alt="" style="left:${50 + hit.x * 50}%;top:${50 + hit.y * 50}%">`).join('');
  }
  function animateHit(actor, hit, onDone) {
    const dart = document.getElementById('flying-dart');
    const fx = document.getElementById('throw-fx');
    dart.style.left = `${50 + hit.x * 50}%`;
    dart.style.top = `${50 + hit.y * 50}%`;
    dart.classList.add('in-flight');
    transitionTimer = setTimeout(() => {
      dart.classList.remove('in-flight');
      fx.style.left = dart.style.left;
      fx.style.top = dart.style.top;
      fx.classList.add('impact');
      state.darts.hits.push({ ...hit, actor });
      state.darts[actor] += hit.score;
      state.darts.visible = true;
      drawHits();
      updateScore();
      track('darts_throw', { actor, score: hit.score });
      announce(`${actor === 'player' ? 'Ваш бросок' : 'Бросок Аристарха'}. Счёт: Аристарх ${state.darts.client}, вы ${state.darts.player}.`);
      transitionTimer = setTimeout(onDone, T.config.throwHoldMs);
    }, 360);
  }
  function clientThrow(onDone) {
    state.darts.round++;
    character('A06');
    dartScreen('client');
    const hit = T.darts.clientHit(state.trust, state.darts.round);
    transitionTimer = setTimeout(() => animateHit('client', hit, () => {
      character('A07');
      transitionTimer = setTimeout(onDone, 280);
    }), 650);
  }
  function playerThrow(onDone, final = false) {
    const target = dartScreen('player');
    character('A07');
    aimController = new T.darts.AimController(target, document.getElementById('aim'), aim => {
      const hit = T.darts.playerHit(aim, state.trust);
      hit.score = T.darts.matchScore(hit.score, state.trust, state.darts, final);
      animateHit('player', hit, onDone);
    });
  }
  function challengeIntro(skipLeadIn = false) {
    setMode('challenge-intro');
    character('A04');
    clientLabel = 'БРОСАЕТ ВЫЗОВ';
    if (scenario.challenge.leadIn && !skipLeadIn) { playBeats(scenario.challenge.leadIn, () => challengeIntro(true)); return; }
    view.innerHTML = `<section class="conversation screen">${metadata()}<div class="reaction-bottom">${dialogueHtml(scenario.challenge.intro)}${button('challenge-start', 'Начать · 20 секунд')}</div></section>`;
    focusView();
    announce(scenario.challenge.intro.join(' '));
  }
  function startChallenge() {
    if (mode !== 'challenge-intro') return;
    setMode('challenge');
    selectedArguments = [];
    challengeFinished = false;
    challengeDeadline = performance.now() + T.config.challengeSeconds * 1000;
    view.innerHTML = `<section class="challenge-screen screen"><div class="challenge-panel"><div class="challenge-header"><div><p class="eyebrow">ДВАДЦАТЬ СЕКУНД НА СУТЬ</p><h1>Выберите 3 аргумента</h1></div><time class="challenge-clock" id="challenge-clock" aria-label="Осталось 20 секунд">00:20</time></div><div class="argument-grid">${scenario.challenge.cards.map((card, index) => `<button class="argument-card" data-argument="${card.id}" aria-pressed="false"><span class="argument-index" aria-hidden="true">0${index + 1}</span><span>${escape(card.text)}</span><span class="selection-dot" aria-hidden="true"></span></button>`).join('')}</div><p class="challenge-hint">Три мысли, ради которых стоит попробовать.</p></div></section>`;
    scrollTop();
    focusView();
    announce('Выберите три аргумента. У вас двадцать секунд.');
    challengeTimer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((challengeDeadline - performance.now()) / 1000));
      const clock = document.getElementById('challenge-clock');
      if (clock) { clock.textContent = `00:${String(remaining).padStart(2, '0')}`; clock.setAttribute('aria-label', `Осталось ${remaining} секунд`); clock.classList.toggle('urgent', remaining <= 5); }
      if (remaining === 5) announce('Осталось пять секунд.');
      if (!remaining) finishChallenge();
    }, 100);
  }
  function selectArgument(id) {
    if (mode !== 'challenge' || challengeFinished) return;
    if (performance.now() >= challengeDeadline) { finishChallenge(); return; }
    const index = selectedArguments.indexOf(id);
    if (index === -1) selectedArguments.push(id); else selectedArguments.splice(index, 1);
    view.querySelectorAll('[data-argument]').forEach(card => {
      const selected = selectedArguments.includes(card.dataset.argument);
      card.setAttribute('aria-pressed', selected);
      card.classList.toggle('selected', selected);
    });
    if (selectedArguments.length === 3) finishChallenge();
  }
  function finishChallenge() {
    if (mode !== 'challenge' || challengeFinished) return;
    challengeFinished = true;
    clearInterval(challengeTimer);
    view.querySelectorAll('[data-argument]').forEach(card => { card.disabled = true; });
    const quality = state.finishChallenge(selectedArguments);
    if (!quality) return;
    track('challenge_completed', { selectedIds: [...selectedArguments] });
    transitionTimer = setTimeout(() => {
      playBeats([{ lines: scenario.challenge.reactions[quality], character: quality === 'weak' ? 'A01' : 'A04', state: quality === 'weak' ? 'СКЕПТИЧЕН' : 'ВОВЛЕЧЁН' }], () => clientThrow(() => playerThrow(() => { sceneIndex++; showScene(); })));
    }, 250);
  }
  function showOutcome() {
    const outcome = state.outcome();
    state.sceneId = 'final';
    track('demo_completed', { outcome });
    const beats = [...scenario.outcomes[outcome]];
    if (outcome === 'strong' && state.darts.player > state.darts.client) beats.push({ lines: scenario.rematch, character: 'A08', state: 'ПИЛОТ СОГЛАСОВАН' });
    playBeats(beats, () => {
      setMode('outcome');
      character('A09');
      view.innerHTML = `<section class="conversation screen">${metadata()}<div class="reaction-bottom final-bottom"><p class="eyebrow">ВСТРЕЧА ЗАВЕРШЕНА</p><h1 class="final-title">Пилот согласован<span class="accent">.</span></h1><p class="final-copy">Теперь — короткий разбор ваших решений.</p>${button('debrief', 'Посмотреть разбор')}</div></section>`;
      focusView();
    });
  }
  function showDebrief() {
    setMode('debrief');
    state.sceneId = 'debrief';
    const results = state.debrief();
    view.innerHTML = `<section class="debrief screen"><div class="editorial-heading"><p class="eyebrow">ПРАКТИКА → ОБРАТНАЯ СВЯЗЬ</p><h1>${escape(scenario.debriefTitle)}<span class="accent">.</span></h1><p>Одна встреча. Пять навыков в действии.</p></div><div class="debrief-content"><dl class="competencies">${results.map(item => `<div><dt>${item.label}</dt><dd class="${item.good ? 'competency-good' : ''}">${escape(item.good ? item.goodLabel : item.weakLabel)}</dd></div>`).join('')}</dl><div class="debrief-evidence">${state.observations().map(item => `<article><h2>${escape(item.good ? item.strength : item.observation)}</h2><p>${escape(item.good ? 'Сохраните этот подход в следующей встрече.' : item.tip)}</p></article>`).join('')}</div><div class="debrief-buttons">${button('commercial', 'Что можно создать для вас')}${button('replay', 'Пройти ещё раз', true)}</div></div></section>`;
    scrollTop();
    focusView();
    announce('Ваш стиль переговоров. Профессиональный разбор.');
  }
  function showCommercial() {
    setMode('commercial');
    state.sceneId = 'commercial';
    const commercial = scenario.commercial;
    view.innerHTML = `<section class="commercial screen"><div class="commercial-top"><div><p class="eyebrow">ОТ ВАШЕГО МАТЕРИАЛА — К ПРАКТИКЕ</p><h1>${escape(commercial.title)}</h1><p class="commercial-flow">${escape(commercial.flow)}</p></div><div class="commercial-custom">${commercial.custom.map(text => `<span>${escape(text)}</span>`).join('')}</div></div><div class="preview-grid">${scenario.previews.map((item, index) => `<figure class="preview"><img src="${item.image}" alt="Пример тренажёра: ${item.label}" loading="lazy" width="1448" height="1086"><figcaption><span>${item.label}</span><span aria-hidden="true">0${index + 1}</span></figcaption></figure>`).join('')}</div><div class="commercial-bottom"><h2>${escape(commercial.headline)}<br><span>${escape(commercial.subline)}</span></h2><div>${button('cta', escape(commercial.cta))}<p>${escape(commercial.hint)}</p></div></div><button class="text-button" data-action="replay">Пройти ещё раз <span aria-hidden="true">↗</span></button></section>`;
    scrollTop();
    focusView();
    announce('Это был один сценарий. Создайте тренажёр под ваши материалы, процессы, дизайн и механики.');
  }
  function openContact() {
    track('cta_clicked');
    window.open(T.config.ctaUrl, '_blank', 'noopener,noreferrer');
  }
  function replay() {
    clearWork();
    state.reset();
    sceneIndex = 0;
    selectedArguments = [];
    challengeFinished = false;
    challengeDeadline = 0;
    locked = false;
    character('A01');
    intro();
  }
  view.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target || target.disabled) return;
    if (target.dataset.choice !== undefined) { choose(Number(target.dataset.choice)); return; }
    if (target.dataset.argument) { selectArgument(target.dataset.argument); return; }
    const actions = { start, continue: () => continueAction && continueAction(), 'challenge-start': startChallenge, debrief: showDebrief, commercial: showCommercial, replay, cta: openContact };
    if (actions[target.dataset.action]) actions[target.dataset.action]();
  });
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    const number = Number(event.key);
    if (mode === 'dialogue' && number >= 1 && number <= 3) { event.preventDefault(); choose(number - 1); }
    else if (mode === 'challenge' && number >= 1 && number <= 6) { event.preventDefault(); selectArgument(scenario.challenge.cards[number - 1].id); }
    else if (mode === 'reaction' && event.key === 'Enter' && event.target === view) { event.preventDefault(); if (continueAction) continueAction(); }
  });
  window.addEventListener('pagehide', clearWork);
  window.addEventListener('pageshow', event => { if (event.persisted) replay(); });
  // Warm pose/mini-game assets without changing the source files.
  Object.values(T.assets).forEach(path => { const image = new Image(); image.src = path; });
  intro();
})(window.Training);
