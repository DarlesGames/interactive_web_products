(function () {
  "use strict";

  const config = window.QUIZ_CONFIG;
  if (!config) {
    throw new Error("QUIZ_CONFIG is not available");
  }

  const app = document.getElementById("app");
  const themePicker = document.getElementById("theme-picker");
  const languagePicker = document.getElementById("language-picker");
  const brandHome = document.getElementById("brand-home");
  const examplesDialog = document.getElementById("examples-dialog");
  const examplesClose = document.getElementById("examples-close");
  const examplesStart = document.getElementById("examples-start");
  const toast = document.getElementById("toast");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const resultIds = Object.keys(config.results);

  let navigationTimer = null;
  let calculationTimer = null;
  let toastTimer = null;
  let lastAnsweredQuestionId = null;

  const restored = restoreState();
  const state = {
    language: restored.language || detectLanguage(),
    theme: restored.theme || config.product.defaultTheme,
    screen: restored.screen || "start",
    currentIndex: Number.isInteger(restored.currentIndex) ? restored.currentIndex : 0,
    answers: sanitizeAnswers(restored.answers || {})
  };

  normalizeState();
  bindChromeEvents();
  renderChrome();
  renderScreen(false);
  installEmbedHeightBridge();

  function detectLanguage() {
    return String(navigator.language || "en").toLowerCase().startsWith("ru") ? "ru" : "en";
  }

  function restoreState() {
    try {
      return JSON.parse(sessionStorage.getItem(config.product.storageKey) || "{}");
    } catch (error) {
      return {};
    }
  }

  function sanitizeAnswers(rawAnswers) {
    const safe = {};
    config.questions.forEach((question) => {
      const allowed = new Set(question.answers.map((answer) => answer.id));
      const values = Array.isArray(rawAnswers[question.id]) ? rawAnswers[question.id] : [];
      const filtered = values.filter((value) => allowed.has(value));
      if (filtered.length) {
        safe[question.id] = question.type === "single" ? [filtered[0]] : [...new Set(filtered)];
      }
    });
    return safe;
  }

  function normalizeState() {
    if (!config.ui[state.language]) state.language = "en";
    if (!config.themes[state.theme]) state.theme = config.product.defaultTheme;
    state.currentIndex = Math.min(Math.max(state.currentIndex, 0), config.questions.length - 1);

    const allowedScreens = new Set(["start", "question", "calculation", "result"]);
    if (!allowedScreens.has(state.screen)) state.screen = "start";

    if ((state.screen === "result" || state.screen === "calculation") && !allQuestionsAnswered()) {
      state.screen = "question";
      state.currentIndex = firstUnansweredIndex();
    }

    if (state.screen === "calculation" && allQuestionsAnswered()) {
      state.screen = "result";
    }
  }

  function saveState() {
    try {
      sessionStorage.setItem(config.product.storageKey, JSON.stringify({
        language: state.language,
        theme: state.theme,
        screen: state.screen,
        currentIndex: state.currentIndex,
        answers: state.answers
      }));
    } catch (error) {
      // The quiz still works when storage is unavailable.
    }
  }

  function bindChromeEvents() {
    themePicker.addEventListener("click", (event) => {
      const button = event.target.closest("[data-theme-choice]");
      if (!button) return;
      state.theme = button.dataset.themeChoice;
      saveState();
      renderChrome();
      renderScreen(false);
    });

    languagePicker.addEventListener("click", (event) => {
      const button = event.target.closest("[data-language]");
      if (!button) return;
      state.language = button.dataset.language;
      saveState();
      renderChrome();
      renderScreen(false);
    });

    brandHome.addEventListener("click", () => navigateTo("start"));
    examplesClose.addEventListener("click", closeExamples);
    examplesStart.addEventListener("click", () => {
      closeExamples();
      startOrContinue();
    });

    examplesDialog.addEventListener("click", (event) => {
      if (event.target === examplesDialog) closeExamples();
    });
  }

  function renderChrome() {
    const ui = getUi();
    const root = document.documentElement;
    root.lang = state.language;
    root.dataset.theme = state.theme;
    document.title = ui.documentTitle;

    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = ui.description;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = state.theme === "bright" ? "#f3efe6" : state.theme === "business" ? "#17191c" : "#17131d";
    }

    document.querySelector(".skip-link").textContent = ui.skip;
    brandHome.setAttribute("aria-label", ui.brandHome);
    document.getElementById("brand-subtitle").textContent = ui.brandSubtitle;
    document.getElementById("footer-copy").textContent = ui.footer;
    document.getElementById("theme-legend").textContent = ui.themeLegend;
    languagePicker.setAttribute("aria-label", ui.language);

    themePicker.querySelectorAll("[data-theme-choice]").forEach((button) => {
      const themeId = button.dataset.themeChoice;
      button.textContent = config.themes[themeId].labels[state.language];
      button.setAttribute("aria-pressed", String(themeId === state.theme));
    });

    languagePicker.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
    });

    renderExamples();
  }

  function renderScreen(focusContent) {
    clearTimeout(navigationTimer);
    navigationTimer = null;

    if (state.screen !== "calculation") {
      clearTimeout(calculationTimer);
      calculationTimer = null;
    }

    if (state.screen === "start") renderStart();
    if (state.screen === "question") renderQuestion();
    if (state.screen === "calculation") renderCalculation();
    if (state.screen === "result") renderResult();

    if (focusContent) {
      requestAnimationFrame(() => {
        const heading = app.querySelector("h1, h2");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      });
    }
  }

  function renderStart() {
    const ui = getUi();
    const progressExists = answeredCount() > 0;
    app.innerHTML = `
      <section class="screen screen-start">
        <div class="screen-grid start-layout">
          ${renderArtifact({ forceBlank: !progressExists })}
          <div class="screen-copy">
            <p class="eyebrow">${escapeHtml(ui.startEyebrow)}</p>
            <h1>${escapeHtml(ui.startTitle)}</h1>
            <p class="lead">${escapeHtml(ui.startText)}</p>
            <div class="start-actions">
              <button class="primary-button" id="start-button" type="button">${escapeHtml(progressExists ? ui.continueButton : ui.startButton)}</button>
              <button class="text-button" id="show-examples" type="button">${escapeHtml(ui.examplesButton)}</button>
            </div>
            <div class="micro-notes">
              <span>${escapeHtml(ui.timeNote)}</span>
              <span>RU / EN</span>
            </div>
            <p class="style-note">${escapeHtml(ui.styleNote)}</p>
          </div>
        </div>
      </section>
    `;

    document.getElementById("start-button").addEventListener("click", startOrContinue);
    document.getElementById("show-examples").addEventListener("click", openExamples);
  }

  function renderQuestion() {
    const ui = getUi();
    const question = config.questions[state.currentIndex];
    const selected = state.answers[question.id] || [];
    const options = question.answers.map((answer, index) => `
      <button
        class="option-button"
        type="button"
        data-answer-id="${escapeHtml(answer.id)}"
        aria-pressed="${selected.includes(answer.id)}"
      >
        <span class="option-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <span class="option-label">${escapeHtml(answer.label[state.language])}</span>
      </button>
    `).join("");

    app.innerHTML = `
      <section class="screen screen-question">
        <div class="screen-grid question-layout">
          ${renderArtifact()}
          <div class="question-card">
            <div class="progress-head">
              <p class="question-number">${escapeHtml(formatTemplate(ui.questionCount, {
                current: state.currentIndex + 1,
                total: config.questions.length
              }))}</p>
              <div class="progress-track" aria-hidden="true">
                ${config.questions.map((item, index) => `<span class="progress-segment ${index < state.currentIndex ? "is-complete" : index === state.currentIndex ? "is-current" : ""}"></span>`).join("")}
              </div>
            </div>
            <h1 class="question-title">${escapeHtml(question.title[state.language])}</h1>
            <p class="question-hint">${escapeHtml(question.type === "multi" ? ui.chooseMany : ui.chooseOne)}</p>
            <div class="options-grid" id="options-grid">${options}</div>
            <p class="validation-message" id="validation-message" aria-live="polite"></p>
            <div class="question-actions">
              <button class="secondary-button" id="back-button" type="button">${escapeHtml(ui.back)}</button>
              ${question.type === "multi" ? `<button class="primary-button" id="next-button" type="button">${escapeHtml(ui.next)}</button>` : ""}
            </div>
          </div>
        </div>
      </section>
    `;

    const optionsGrid = document.getElementById("options-grid");
    optionsGrid.addEventListener("click", handleOptionClick);
    optionsGrid.addEventListener("keydown", handleOptionArrowNavigation);
    document.getElementById("back-button").addEventListener("click", goBack);
    const nextButton = document.getElementById("next-button");
    if (nextButton) nextButton.addEventListener("click", goNext);
  }

  function renderCalculation() {
    const ui = getUi();
    const result = calculateResult();

    app.innerHTML = `
      <section class="screen screen-calculation">
        <div class="screen-grid calculation-layout">
          ${renderArtifact({ complete: true, resultTitle: result.primary.title[state.language] })}
          <div class="screen-copy">
            <div class="calculation-mark" aria-hidden="true"></div>
            <p class="eyebrow">${escapeHtml(ui.calculatingEyebrow)}</p>
            <h1>${escapeHtml(ui.calculatingTitle)}</h1>
            <p class="lead">${escapeHtml(ui.calculatingText)}</p>
          </div>
        </div>
      </section>
    `;

    if (!calculationTimer) {
      calculationTimer = window.setTimeout(() => {
        calculationTimer = null;
        state.screen = "result";
        saveState();
        renderScreen(true);
      }, reduceMotion.matches ? 0 : 650);
    }
  }

  function renderResult() {
    const ui = getUi();
    const result = calculateResult();
    const featureItems = result.primary.features[state.language]
      .map((feature) => `<li>${escapeHtml(feature)}</li>`)
      .join("");
    const modifierItems = result.modifiers.length
      ? result.modifiers.map((modifierId) => `<span class="modifier-chip">${escapeHtml(result.priceConfig.modifiers[modifierId].label)}</span>`).join("")
      : `<span class="modifier-chip">${escapeHtml(ui.noExtras)}</span>`;
    const second = result.secondary
      ? `<p class="second-result">${escapeHtml(formatTemplate(ui.secondResult, { result: result.secondary.title[state.language] }))}</p>`
      : "";
    const fitMessages = [];
    if (result.budgetMessage) fitMessages.push(result.budgetMessage);
    if (result.deadlineTight) fitMessages.push(ui.deadlineTight);
    const fit = fitMessages.length
      ? `<p class="fit-note ${result.budgetStatus === "below" || result.deadlineTight ? "is-warning" : ""}">${escapeHtml(fitMessages.join(" "))}</p>`
      : "";

    app.innerHTML = `
      <section class="screen screen-result">
        <div class="screen-grid result-layout">
          ${renderArtifact({ complete: true, resultTitle: result.primary.title[state.language] })}
          <article class="result-card">
            <p class="eyebrow">${escapeHtml(ui.resultEyebrow)}</p>
            <p class="question-number">${escapeHtml(ui.resultLead)}</p>
            <h1 class="result-title">${escapeHtml(result.primary.title[state.language])}</h1>
            <p class="result-description">${escapeHtml(result.primary.description[state.language])}</p>

            <dl class="result-metrics">
              <div class="metric">
                <dt>${escapeHtml(ui.timeline)}</dt>
                <dd>${escapeHtml(result.timelineText)}</dd>
              </div>
              <div class="metric">
                <dt>${escapeHtml(ui.price)}</dt>
                <dd>${escapeHtml(result.priceText)}</dd>
              </div>
            </dl>
            ${fit}

            <section class="result-section">
              <h3>${escapeHtml(ui.included)}</h3>
              <ul class="feature-list">${featureItems}</ul>
            </section>

            <section class="result-section">
              <h3>${escapeHtml(ui.extra)}</h3>
              <div class="modifier-list">${modifierItems}</div>
            </section>

            ${second}

            <div class="result-actions">
              <button class="primary-button" id="discuss-button" type="button">${escapeHtml(ui.discuss)}</button>
              <button class="secondary-button" id="copy-button" type="button">${escapeHtml(ui.copy)}</button>
              <button class="text-button" id="restart-button" type="button">${escapeHtml(ui.restart)}</button>
            </div>
            <p class="estimate-note">${escapeHtml(ui.estimateNote)}</p>
          </article>
        </div>
      </section>
    `;

    document.getElementById("discuss-button").addEventListener("click", () => openTelegram(result));
    document.getElementById("copy-button").addEventListener("click", () => copyResult(result, ui.copied));
    document.getElementById("restart-button").addEventListener("click", restartQuiz);
  }

  function renderArtifact(options = {}) {
    const ui = getUi();
    const entries = [];

    if (!options.forceBlank) {
      config.questions.forEach((question) => {
        const selected = state.answers[question.id] || [];
        if (!selected.length) return;
        const values = selected
          .map((answerId) => question.answers.find((answer) => answer.id === answerId))
          .filter(Boolean)
          .map((answer) => answer.summary[state.language]);
        entries.push({
          id: question.id,
          label: question.revealLabel[state.language],
          value: values.join(", ")
        });
      });
    }

    const content = entries.length
      ? `${options.complete && options.resultTitle ? `<h2 class="artifact-complete-title">${escapeHtml(options.resultTitle)}</h2>` : ""}
        <div class="artifact-entries">
          ${entries.map((entry) => `
            <div class="artifact-entry ${entry.id === lastAnsweredQuestionId ? "is-new" : ""}">
              <span class="artifact-entry__label">${escapeHtml(entry.label)}</span>
              <span class="artifact-entry__value">${escapeHtml(entry.value)}</span>
            </div>
          `).join("")}
        </div>`
      : `<div class="artifact-empty-lines" aria-hidden="true"><span></span><span></span><span></span><span></span></div>`;

    const caption = entries.length
      ? config.themes[state.theme].artifactLabels[state.language]
      : ui.artifactEmpty;

    return `
      <aside class="artifact-panel" aria-label="${escapeHtml(ui.summaryTitle)}">
        <div class="artifact-stage">
          <div class="artifact-object">
            <div class="artifact-roll artifact-roll--top" aria-hidden="true"></div>
            <div class="artifact-paper">
              <div class="artifact-content ${options.complete ? "is-complete" : ""}">${content}</div>
            </div>
            <div class="artifact-roll artifact-roll--bottom" aria-hidden="true"></div>
            <div class="artifact-swatches" aria-hidden="true"><span></span><span></span><span></span></div>
          </div>
          <div class="artifact-tool" aria-hidden="true"></div>
        </div>
        <p class="artifact-caption">${escapeHtml(caption)}</p>
      </aside>
    `;
  }

  function renderExamples() {
    const ui = getUi();
    document.getElementById("examples-eyebrow").textContent = ui.examplesEyebrow;
    document.getElementById("examples-title").textContent = ui.examplesTitle;
    examplesClose.setAttribute("aria-label", ui.examplesClose);
    examplesStart.textContent = ui.startButton;
    document.getElementById("examples-grid").innerHTML = resultIds.map((resultId, index) => {
      const result = config.results[resultId];
      return `
        <article class="example-card">
          <span class="example-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeHtml(result.title[state.language])}</h3>
          <p>${escapeHtml(result.description[state.language])}</p>
        </article>
      `;
    }).join("");
  }

  function handleOptionClick(event) {
    const button = event.target.closest("[data-answer-id]");
    if (!button) return;
    const question = config.questions[state.currentIndex];
    const answer = question.answers.find((item) => item.id === button.dataset.answerId);
    if (!answer) return;

    lastAnsweredQuestionId = question.id;
    if (question.type === "single") {
      state.answers[question.id] = [answer.id];
      saveState();
      renderScreen(false);
      navigationTimer = window.setTimeout(goNext, reduceMotion.matches ? 0 : 250);
      return;
    }

    const current = new Set(state.answers[question.id] || []);
    if (answer.exclusive) {
      current.clear();
      current.add(answer.id);
    } else {
      current.delete("none");
      if (current.has(answer.id)) current.delete(answer.id);
      else current.add(answer.id);
    }

    state.answers[question.id] = [...current];
    if (!state.answers[question.id].length) delete state.answers[question.id];
    saveState();
    renderScreen(false);
  }

  function handleOptionArrowNavigation(event) {
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
    const buttons = [...document.querySelectorAll(".option-button")];
    const currentIndex = buttons.indexOf(document.activeElement);
    if (currentIndex < 0) return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
    buttons[nextIndex].focus();
  }

  function startOrContinue() {
    if (allQuestionsAnswered()) {
      navigateTo("result");
      return;
    }
    state.currentIndex = firstUnansweredIndex();
    navigateTo("question");
  }

  function goBack() {
    lastAnsweredQuestionId = null;
    if (state.currentIndex === 0) {
      navigateTo("start");
      return;
    }
    state.currentIndex -= 1;
    navigateTo("question");
  }

  function goNext() {
    const question = config.questions[state.currentIndex];
    const selected = state.answers[question.id] || [];
    if (!selected.length) {
      const message = document.getElementById("validation-message");
      if (message) message.textContent = getUi().required;
      return;
    }

    if (state.currentIndex >= config.questions.length - 1) {
      navigateTo("calculation");
      return;
    }

    state.currentIndex += 1;
    navigateTo("question");
  }

  function navigateTo(screen) {
    state.screen = screen;
    saveState();
    renderScreen(true);
  }

  function restartQuiz() {
    state.answers = {};
    state.currentIndex = 0;
    lastAnsweredQuestionId = null;
    navigateTo("start");
  }

  function calculateResult() {
    const scores = Object.fromEntries(resultIds.map((resultId) => [resultId, 0]));

    config.questions.forEach((question) => {
      (state.answers[question.id] || []).forEach((answerId) => {
        const answer = question.answers.find((item) => item.id === answerId);
        if (!answer) return;
        Object.entries(answer.scores || {}).forEach(([resultId, points]) => {
          if (Object.prototype.hasOwnProperty.call(scores, resultId)) scores[resultId] += points;
        });
      });
    });

    const ranked = resultIds.map((resultId) => ({
      id: resultId,
      score: scores[resultId],
      q1: scoreForQuestion("goal", resultId),
      q3: scoreForQuestion("outcome", resultId),
      priority: config.scoring.tieBreakPriority.indexOf(resultId)
    })).sort((a, b) => b.score - a.score || b.q1 - a.q1 || b.q3 - a.q3 || a.priority - b.priority);

    const primaryId = ranked[0].id;
    const primary = config.results[primaryId];
    const secondCandidate = ranked[1];
    const secondary = secondCandidate.score > 0 && secondCandidate.score >= ranked[0].score * config.scoring.secondResultThreshold
      ? config.results[secondCandidate.id]
      : null;

    const modifiers = collectModifiers(primaryId);
    const priceConfig = config.pricing[state.language];
    const price = [...priceConfig.base];
    const timeline = [...primary.timeline];

    modifiers.forEach((modifierId) => {
      const priceModifier = priceConfig.modifiers[modifierId];
      if (priceModifier) {
        price[0] += priceModifier.range[0];
        price[1] += priceModifier.range[1];
      }
      const timeModifier = config.timelineModifiers[modifierId];
      if (timeModifier) {
        timeline[0] += timeModifier[0];
        timeline[1] += timeModifier[1];
      }
    });

    const budget = selectedAnswer("budget")?.budget?.[state.language] || null;
    const budgetStatus = compareBudget(budget, price);
    const ui = getUi();
    const budgetMessage = budgetStatus === "fit"
      ? ui.budgetFit
      : budgetStatus === "below"
        ? ui.budgetBelow
        : budgetStatus === "above"
          ? ui.budgetAbove
          : "";
    const desiredMaxDays = selectedAnswer("deadline")?.desiredMaxDays ?? null;

    return {
      primaryId,
      primary,
      secondary,
      scores,
      modifiers,
      priceConfig,
      price,
      priceText: formatMoneyRange(price, priceConfig),
      timeline,
      timelineText: formatTemplate(ui.businessDays, { min: timeline[0], max: timeline[1] }),
      budgetStatus,
      budgetMessage,
      deadlineTight: desiredMaxDays !== null && desiredMaxDays < timeline[0]
    };
  }

  function scoreForQuestion(questionId, resultId) {
    const question = config.questions.find((item) => item.id === questionId);
    if (!question) return 0;
    return (state.answers[questionId] || []).reduce((sum, answerId) => {
      const answer = question.answers.find((item) => item.id === answerId);
      return sum + Number(answer?.scores?.[resultId] || 0);
    }, 0);
  }

  function collectModifiers(primaryId) {
    const modifiers = new Set(config.results[primaryId].defaultModifiers || []);
    config.questions.forEach((question) => {
      (state.answers[question.id] || []).forEach((answerId) => {
        const answer = question.answers.find((item) => item.id === answerId);
        (answer?.modifiers || []).forEach((modifierId) => modifiers.add(modifierId));
      });
    });
    return [...modifiers].filter((modifierId) => config.pricing[state.language].modifiers[modifierId]);
  }

  function compareBudget(budget, price) {
    if (!budget) return null;
    if (budget[1] < price[0]) return "below";
    if (budget[0] > price[1]) return "above";
    return "fit";
  }

  function formatMoneyRange(range, priceConfig) {
    const formatter = new Intl.NumberFormat(priceConfig.locale, {
      style: "currency",
      currency: priceConfig.currency,
      maximumFractionDigits: 0
    });
    return `${formatter.format(range[0])}–${formatter.format(range[1])}`;
  }

  function selectedAnswer(questionId) {
    const question = config.questions.find((item) => item.id === questionId);
    const answerId = state.answers[questionId]?.[0];
    return question?.answers.find((answer) => answer.id === answerId) || null;
  }

  function buildRequestMessage(result) {
    const ui = getUi();
    const task = selectedAnswer("goal")?.summary?.[state.language] || ui.none;
    const needs = ["style", "connections"]
      .flatMap((questionId) => {
        const question = config.questions.find((item) => item.id === questionId);
        return (state.answers[questionId] || [])
          .map((answerId) => question.answers.find((answer) => answer.id === answerId)?.summary?.[state.language])
          .filter(Boolean);
      });

    return [
      ui.requestGreeting,
      "",
      `${ui.requestFit}: ${result.primary.title[state.language]}.`,
      `${ui.requestTask}: ${task}.`,
      `${ui.requestNeed}: ${needs.length ? needs.join(", ") : ui.none}.`,
      `${ui.requestTimeline}: ${result.timelineText}.`,
      `${ui.requestPrice}: ${result.priceText}.`,
      "",
      ui.requestClose
    ].join("\n");
  }

  function openTelegram(result) {
    const ui = getUi();
    const message = buildRequestMessage(result);
    const username = config.contacts.telegramUsername.trim().replace(/^@/, "");
    const url = username
      ? `https://t.me/${encodeURIComponent(username)}?text=${encodeURIComponent(message)}`
      : `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    if (!username) showToast(ui.telegramFallback);
  }

  async function copyResult(result, successMessage) {
    const text = buildRequestMessage(result);
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      copied = document.execCommand("copy");
      textarea.remove();
    }
    if (copied) showToast(successMessage);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  function openExamples() {
    if (typeof examplesDialog.showModal === "function") examplesDialog.showModal();
    else examplesDialog.setAttribute("open", "");
  }

  function closeExamples() {
    if (typeof examplesDialog.close === "function" && examplesDialog.open) examplesDialog.close();
    else examplesDialog.removeAttribute("open");
  }

  function answeredCount() {
    return config.questions.filter((question) => (state.answers[question.id] || []).length > 0).length;
  }

  function allQuestionsAnswered() {
    return answeredCount() === config.questions.length;
  }

  function firstUnansweredIndex() {
    const index = config.questions.findIndex((question) => !(state.answers[question.id] || []).length);
    return index < 0 ? config.questions.length - 1 : index;
  }

  function getUi() {
    return config.ui[state.language];
  }

  function formatTemplate(template, values) {
    return String(template).replace(/\{(\w+)\}/g, (match, key) => Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function installEmbedHeightBridge() {
    if (window.parent === window || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      window.parent.postMessage({
        type: "darles-quiz-height",
        height: document.documentElement.scrollHeight
      }, "*");
    });
    observer.observe(document.body);
  }
}());
