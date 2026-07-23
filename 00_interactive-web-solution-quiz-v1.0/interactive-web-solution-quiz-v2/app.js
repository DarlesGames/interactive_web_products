(() => {
  "use strict";

  const config = window.QUIZ_CONFIG;
  const app = document.getElementById("app");
  const dialog = document.getElementById("examplesDialog");
  const examplesList = document.getElementById("examplesList");
  const storageKey = "darles-product-001-state-v2";

  const queryLanguage = new URLSearchParams(location.search).get("lang");
  const storedLanguage = localStorage.getItem("darlesLanguage");
  const defaultLanguage = ["ru", "en"].includes(queryLanguage)
    ? queryLanguage
    : ["ru", "en"].includes(storedLanguage)
      ? storedLanguage
      : (navigator.language || "en").toLowerCase().startsWith("ru") ? "ru" : "en";
  const defaultState = {
    screen: "start",
    questionIndex: 0,
    answers: {},
    theme: "magic",
    language: defaultLanguage,
    result: null
  };

  let state = loadState();
  state.language = defaultLanguage;
  let autoAdvanceTimer = null;

  function loadState() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      return { ...defaultState, ...(saved || {}), answers: saved?.answers || {} };
    } catch {
      return { ...defaultState };
    }
  }

  function saveState() {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  }

  function t(key) {
    const source = config.i18n[state.language];
    return key.split(".").reduce((value, part) => value?.[part], source) ?? key;
  }

  function format(str, vars) {
    return Object.entries(vars).reduce((out, [key, value]) => out.replaceAll(`{${key}}`, String(value)), str);
  }

  function applyEnvironment() {
    document.documentElement.lang = state.language;
    document.title = state.language === "ru"
      ? "Darles Games — подбор веб-решения"
      : "Web solution finder — Darles Games";
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = state.language === "ru"
        ? "Интерактивный подборщик веб-решения Darles Games: формат, срок и предварительная цена."
        : "Darles Games interactive web solution finder with format, timeline, and estimate.";
    }
    document.body.dataset.theme = state.theme;
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.themeChoice === state.theme);
    });
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.language === state.language);
    });
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    renderExamples();
  }

  function createVisual() {
    const answeredQuestions = config.questions.filter((q) => state.answers[q.id]?.length);
    const lines = answeredQuestions.map((q) => {
      const values = state.answers[q.id].map((id) => t(`answers.${q.id}.${id}`)).join(", ");
      return `<li class="reveal-line"><strong>${escapeHtml(t(`summaryLabels.${q.id}`))}:</strong> ${escapeHtml(values)}</li>`;
    }).join("");

    return `
      <div class="visual-stage" aria-label="${escapeHtml(t("scrollTitle"))}">
        <div class="art-object art-object--${escapeAttribute(state.theme)}">
          <section class="paper paper--${escapeAttribute(state.theme)}">
            <p class="paper-kicker">Darles Games</p>
            <h2 class="paper-title">${escapeHtml(t("scrollTitle"))}</h2>
            ${lines ? `<ul class="reveal-list">${lines}</ul>` : `<p class="reveal-empty">${escapeHtml(t("scrollEmpty"))}</p>`}
          </section>
        </div>
      </div>`;
  }

  function render() {
    clearTimeout(autoAdvanceTimer);
    applyEnvironment();

    if (state.screen === "start") renderStart();
    else if (state.screen === "question") renderQuestion();
    else if (state.screen === "calculating") renderCalculating();
    else if (state.screen === "result") renderResult();
    else renderStart();

    saveState();
    reportHeight();
  }

  function renderStart() {
    app.innerHTML = `
      <section class="screen hero-layout">
        ${createVisual()}
        <div class="copy-panel">
          <p class="eyebrow">${escapeHtml(t("startEyebrow"))}</p>
          <h1>${escapeHtml(t("startTitle"))}</h1>
          <p class="lead">${escapeHtml(t("startText"))}</p>
          <p class="start-note">${escapeHtml(t("startNote"))}</p>
          <div class="actions">
            <button class="button primary" id="startQuiz" type="button">${escapeHtml(t("startButton"))}</button>
            <button class="text-link" id="showExamples" type="button">${escapeHtml(t("examplesLink"))}</button>
          </div>
        </div>
      </section>`;

    document.getElementById("startQuiz").addEventListener("click", startQuiz);
    document.getElementById("showExamples").addEventListener("click", () => dialog.showModal());
  }

  function startQuiz() {
    state.screen = "question";
    state.questionIndex = 0;
    state.result = null;
    render();
  }

  function renderQuestion() {
    const q = config.questions[state.questionIndex];
    if (!q) return finishQuiz();
    const selected = state.answers[q.id] || [];
    const choices = q.answers.map((answer) => {
      const active = selected.includes(answer.id);
      return `<button class="choice ${active ? "is-selected" : ""}" type="button" data-answer="${answer.id}" aria-pressed="${active}">${escapeHtml(t(`answers.${q.id}.${answer.id}`))}</button>`;
    }).join("");

    app.innerHTML = `
      <section class="screen question-layout">
        ${createVisual()}
        <article class="question-card">
          <div class="question-meta">
            <span>${escapeHtml(format(t("questionCount"), { current: state.questionIndex + 1, total: config.questions.length }))}</span>
            <span class="progress-track" aria-hidden="true"><span class="progress-fill" style="width:${((state.questionIndex + 1) / config.questions.length) * 100}%"></span></span>
          </div>
          <h2>${escapeHtml(t(`questions.${q.id}`))}</h2>
          ${q.type === "multi" ? `<p class="question-help">${escapeHtml(t("selectSeveral"))}</p>` : ""}
          <div class="choices">${choices}</div>
          <div class="question-actions">
            <button class="button secondary" id="backButton" type="button">${escapeHtml(t("back"))}</button>
            ${q.type === "multi" ? `<button class="button primary" id="nextButton" type="button" ${selected.length ? "" : "disabled"}>${escapeHtml(t("next"))}</button>` : ""}
          </div>
        </article>
      </section>`;

    app.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => selectAnswer(q, button.dataset.answer));
    });
    document.getElementById("backButton").addEventListener("click", goBack);
    document.getElementById("nextButton")?.addEventListener("click", goNext);
  }

  function selectAnswer(question, answerId) {
    clearTimeout(autoAdvanceTimer);
    if (question.type === "multi") {
      let values = [...(state.answers[question.id] || [])];
      if (answerId === "none") {
        values = values.includes("none") ? [] : ["none"];
      } else {
        values = values.filter((id) => id !== "none");
        values = values.includes(answerId) ? values.filter((id) => id !== answerId) : [...values, answerId];
      }
      state.answers[question.id] = values;
      render();
      return;
    }

    state.answers[question.id] = [answerId];
    saveState();
    autoAdvanceTimer = setTimeout(goNext, 90);
  }

  function goBack() {
    if (state.questionIndex === 0) {
      state.screen = "start";
    } else {
      state.questionIndex -= 1;
    }
    render();
  }

  function goNext() {
    const q = config.questions[state.questionIndex];
    if (!state.answers[q.id]?.length) return;
    if (state.questionIndex >= config.questions.length - 1) finishQuiz();
    else {
      state.questionIndex += 1;
      render();
    }
  }

  function finishQuiz() {
    state.result = calculateResult();
    state.screen = "calculating";
    render();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      state.screen = "result";
      render();
    }, reduced ? 20 : 620);
  }

  function renderCalculating() {
    app.innerHTML = `
      <section class="screen calculating">
        <div>
          <div class="calc-mark" aria-hidden="true"></div>
          <h1>${escapeHtml(t("calculating"))}</h1>
        </div>
      </section>`;
  }

  function calculateResult() {
    const scores = { quiz: 0, calculator: 0, invitation: 0, promo: 0, miniGame: 0 };
    const modifiers = new Set();

    config.questions.forEach((q) => {
      (state.answers[q.id] || []).forEach((answerId) => {
        const answer = q.answers.find((item) => item.id === answerId);
        if (!answer) return;
        Object.entries(answer.scores || {}).forEach(([type, score]) => { scores[type] += score; });
        (answer.modifiers || []).forEach((modifier) => modifiers.add(modifier));
      });
    });

    const ordered = Object.keys(scores).sort((a, b) => {
      const scoreDifference = scores[b] - scores[a];
      if (scoreDifference) return scoreDifference;
      const q1 = scoreForQuestion("goal", b) - scoreForQuestion("goal", a);
      if (q1) return q1;
      const q3 = scoreForQuestion("outcome", b) - scoreForQuestion("outcome", a);
      if (q3) return q3;
      return config.tieBreakPriority.indexOf(a) - config.tieBreakPriority.indexOf(b);
    });

    const primary = ordered[0];
    const secondary = scores[ordered[1]] >= scores[primary] * config.secondResultThreshold ? ordered[1] : null;
    const price = calculatePrice(modifiers);
    const timeline = calculateTimeline(primary, modifiers);
    const budgetNote = compareBudget(price);
    const deadlineNote = compareDeadline(timeline);

    return { primary, secondary, scores, modifiers: [...modifiers], price, timeline, budgetNote, deadlineNote };
  }

  function scoreForQuestion(questionId, type) {
    const q = config.questions.find((item) => item.id === questionId);
    return (state.answers[questionId] || []).reduce((sum, answerId) => {
      const answer = q.answers.find((item) => item.id === answerId);
      return sum + (answer?.scores?.[type] || 0);
    }, 0);
  }

  function calculatePrice(modifiers) {
    const grid = config.pricing[state.language];
    let min = grid.base[0];
    let max = grid.base[1];
    modifiers.forEach((modifier) => {
      const range = grid.modifiers[modifier];
      if (range) { min += range[0]; max += range[1]; }
    });
    return [min, max];
  }

  function calculateTimeline(type, modifiers) {
    const total = [...config.timelines[type]];
    modifiers.forEach((modifier) => {
      const range = config.timelineModifiers[modifier];
      if (range) { total[0] += range[0]; total[1] += range[1]; }
    });
    return total;
  }

  function compareBudget(price) {
    const budgetId = state.answers.budget?.[0];
    if (!budgetId || budgetId === "unknown") return null;
    const budget = config.pricing[state.language].budgets[budgetId];
    if (budget[1] < price[0]) return "budgetLow";
    if (budget[0] > price[1]) return "budgetHigh";
    return "budgetFits";
  }

  function compareDeadline(timeline) {
    const deadline = state.answers.deadline?.[0];
    if (deadline === "week" && timeline[0] > 7) return "deadlineTight";
    if (deadline === "twoWeeks" && timeline[0] > 10) return "deadlineTight";
    return null;
  }

  function renderResult() {
    if (!state.result) state.result = calculateResult();
    const r = state.result;
    const extras = r.modifiers.length
      ? r.modifiers.map((id) => `<span class="extra-chip">${escapeHtml(t(`extraNames.${id}`))}</span>`).join("")
      : `<span class="extra-chip">${state.language === "ru" ? "базовая версия" : "base version"}</span>`;
    const features = config.resultFeatures[r.primary].map((id) => `<li>${escapeHtml(t(`featureNames.${id}`))}</li>`).join("");
    const price = formatPrice(r.price);
    const timeline = `${r.timeline[0]}–${r.timeline[1]} ${t("workingDays")}`;
    const telegramLink = `${config.contacts.telegram}?text=${encodeURIComponent(buildResultMessage())}`;

    app.innerHTML = `
      <section class="screen result-layout">
        ${createVisual()}
        <article class="result-card">
          <p class="eyebrow">${escapeHtml(t("resultEyebrow"))}</p>
          <p class="result-prefix">${escapeHtml(t("resultPrefix"))}:</p>
          <h2 class="result-title">${escapeHtml(t(`resultNames.${r.primary}`))}</h2>
          <p class="result-reason">${escapeHtml(t(`resultReasons.${r.primary}`))}</p>

          <section class="result-section">
            <h3>${escapeHtml(t("included"))}</h3>
            <ul class="feature-list">${features}</ul>
          </section>

          <div class="result-metrics">
            <div class="metric"><span>${escapeHtml(t("time"))}</span><strong>${escapeHtml(timeline)}</strong></div>
            <div class="metric"><span>${escapeHtml(t("price"))}</span><strong>${escapeHtml(price)}</strong></div>
          </div>

          ${r.budgetNote ? `<p class="result-note">${escapeHtml(t(r.budgetNote))}</p>` : ""}
          ${r.deadlineNote ? `<p class="result-note">${escapeHtml(t(r.deadlineNote))}</p>` : ""}

          <section class="result-section">
            <h3>${escapeHtml(t("more"))}</h3>
            <div class="extra-list">${extras}</div>
            ${r.secondary ? `<p class="secondary-result"><strong>${escapeHtml(t("secondary"))}:</strong> ${escapeHtml(t(`resultNames.${r.secondary}`))}</p>` : ""}
          </section>

          <section class="contact-block">
            <h3>${escapeHtml(t("discuss"))}</h3>
            <div class="contact-actions">
              <a class="button contact-button telegram" href="${escapeAttribute(telegramLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("telegram"))}</a>
              <a class="button contact-button vk" href="${escapeAttribute(config.contacts.vk)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("vk"))}</a>
            </div>
            <p class="email-line"><strong>${escapeHtml(t("emailLabel"))}:</strong> <a href="mailto:${escapeAttribute(config.contacts.email)}">${escapeHtml(config.contacts.email)}</a></p>
          </section>

          <div class="result-footer-actions">
            <button class="button secondary" id="copyResult" type="button">${escapeHtml(t("copyResult"))}</button>
            <button class="text-link" id="restartQuiz" type="button">${escapeHtml(t("restart"))}</button>
            <span id="copyStatus" class="copy-status" role="status"></span>
          </div>
        </article>
      </section>`;

    document.getElementById("copyResult").addEventListener("click", copyResult);
    document.getElementById("restartQuiz").addEventListener("click", restartQuiz);
  }

  function formatPrice(range) {
    const formatter = new Intl.NumberFormat(state.language === "ru" ? "ru-RU" : "en-US", {
      style: "currency",
      currency: config.pricing[state.language].currency,
      maximumFractionDigits: 0
    });
    return `${formatter.format(range[0])}–${formatter.format(range[1])}`;
  }

  function buildResultMessage() {
    const r = state.result || calculateResult();
    const goalId = state.answers.goal?.[0];
    const goal = goalId ? t(`answers.goal.${goalId}`) : "—";
    const extras = r.modifiers.length ? r.modifiers.map((id) => t(`extraNames.${id}`)).join(", ") : (state.language === "ru" ? "базовая версия" : "base version");
    return format(t("telegramMessage"), {
      result: t(`resultNames.${r.primary}`),
      goal,
      extras,
      time: `${r.timeline[0]}–${r.timeline[1]} ${t("workingDays")}`,
      price: formatPrice(r.price)
    });
  }

  async function copyResult() {
    const status = document.getElementById("copyStatus");
    try {
      await navigator.clipboard.writeText(buildResultMessage());
      status.textContent = t("copied");
    } catch {
      const area = document.createElement("textarea");
      area.value = buildResultMessage();
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      status.textContent = t("copied");
    }
  }

  function restartQuiz() {
    state = { ...defaultState, theme: state.theme, language: state.language, answers: {} };
    render();
  }

  function renderExamples() {
    examplesList.innerHTML = t("examples").map(([title, text]) => `
      <article class="example-item"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("");
  }



  function reportHeight() {
    requestAnimationFrame(() => {
      window.parent?.postMessage?.({ type: "darles-quiz-height", height: document.documentElement.scrollHeight }, "*");
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function escapeAttribute(value) { return escapeHtml(value); }

  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      state.theme = button.dataset.themeChoice;
      render();
    });
  });

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      state.language = button.dataset.language;
      localStorage.setItem("darlesLanguage", state.language);
      state.result = state.screen === "result" ? calculateResult() : state.result;
      render();
    });
  });

  document.getElementById("closeExamples").addEventListener("click", () => dialog.close());
  document.getElementById("dialogStart").addEventListener("click", () => { dialog.close(); startQuiz(); });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  window.addEventListener("resize", reportHeight);

  render();
})();
