import { createInitialState } from "./state.js";
import { createQuizScreen } from "./components/quiz.js";
import { createResultScreen } from "./components/result.js";
import { questions as questionsRu } from "./data/questions.js";
import { resultOrder, results as resultsRu } from "./data/results.js";
import { texts as textsRu } from "./data/texts.js";
import { questionsEn, resultsEn, textsEn } from "./data/localization.en.js";

const language = getLanguage();
const questions = language === "en" ? questionsEn : questionsRu;
const results = language === "en" ? resultsEn : resultsRu;
const texts = language === "en" ? textsEn : textsRu;

const app = document.querySelector("#app");
let state = createInitialState();

applyPageLanguage();

function getLanguage() {
  const queryLanguage = new URLSearchParams(location.search).get("lang");
  if (queryLanguage === "ru" || queryLanguage === "en") {
    localStorage.setItem("darlesLanguage", queryLanguage);
    return queryLanguage;
  }
  const storedLanguage = localStorage.getItem("darlesLanguage");
  return storedLanguage === "en" ? "en" : "ru";
}

function applyPageLanguage() {
  const page = language === "en"
    ? textsEn.page
    : {
        title: "Квиз-диагностика",
        description: "HTML5-квиз для диагностики и заявки через Google Форму.",
        headerAria: "Шапка продукта",
        contactsAria: "Контакты разработчика",
        brandAria: "Darles Games во ВКонтакте",
        footer: "После результата можно открыть форму заявки или связаться с разработчиком.",
      };
  document.documentElement.lang = language;
  document.title = page.title;
  document.querySelector('meta[name="description"]').content = page.description;
  document.querySelector(".topbar").setAttribute("aria-label", page.headerAria);
  document.querySelector(".developer-contacts").setAttribute("aria-label", page.contactsAria);
  document.querySelector(".brand").setAttribute("aria-label", page.brandAria);
  document.querySelector(".footer").textContent = page.footer;
}

function setState(nextState) {
  state = { ...state, ...nextState };
  render();
}

function render() {
  if (!app) {
    return;
  }

  app.replaceChildren();

  if (state.screen === "quiz") {
    app.append(renderQuiz());
    return;
  }

  if (state.screen === "result") {
    app.append(renderResult());
    return;
  }

  app.append(renderStart());
}

function renderStart() {
  const section = document.createElement("section");
  section.className = "screen screen--start";

  const kicker = document.createElement("p");
  kicker.className = "kicker";
  kicker.textContent = texts.start.eyebrow;

  const title = document.createElement("h1");
  title.className = "title";
  title.textContent = texts.start.title;

  const lead = document.createElement("p");
  lead.className = "lead";
  lead.textContent = texts.start.lead;

  const facts = document.createElement("div");
  facts.className = "summary-strip";

  texts.start.facts.forEach((fact) => {
    const item = document.createElement("div");
    item.className = "summary-item";

    const dot = document.createElement("span");
    dot.className = "summary-dot";
    dot.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.textContent = fact;

    item.append(dot, text);
    facts.append(item);
  });

  const actions = document.createElement("div");
  actions.className = "start-actions";

  const startButton = document.createElement("button");
  startButton.className = "button button--primary";
  startButton.type = "button";
  startButton.textContent = texts.start.startButton;
  startButton.addEventListener("click", startQuiz);

  actions.append(startButton);
  section.append(kicker, title, lead, facts, actions);

  return section;
}

function renderQuiz() {
  const question = questions[state.currentQuestionIndex];

  return createQuizScreen({
    question,
    questionIndex: state.currentQuestionIndex,
    totalQuestions: questions.length,
    selectedOptionId: state.selectedOptionId,
    texts: texts.quiz,
    onSelect: selectOption,
    onNext: goToNextQuestion,
    onRestart: restart,
  });
}

function renderResult() {
  const result = results[state.resultKey] || results[resultOrder[0]];

  return createResultScreen({
    result,
    texts: texts.result,
    formTexts: texts.form,
    onRestart: restart,
  });
}

function startQuiz() {
  state = createInitialState();
  setState({ screen: "quiz" });
}

function selectOption(optionId) {
  setState({ selectedOptionId: optionId });
}

function goToNextQuestion() {
  const question = questions[state.currentQuestionIndex];
  const option = question.options.find((item) => item.id === state.selectedOptionId);

  if (!option) {
    return;
  }

  const answers = [
    ...state.answers.filter((answer) => answer.questionId !== question.id),
    {
      questionId: question.id,
      optionId: option.id,
      label: option.label,
      scores: option.scores,
    },
  ];

  if (state.currentQuestionIndex === questions.length - 1) {
    setState({
      screen: "result",
      answers,
      resultKey: calculateResultKey(answers),
      selectedOptionId: null,
    });
    return;
  }

  setState({
    answers,
    currentQuestionIndex: state.currentQuestionIndex + 1,
    selectedOptionId: null,
  });
}

function calculateResultKey(answers) {
  const scores = Object.fromEntries(resultOrder.map((key) => [key, 0]));

  answers.forEach((answer) => {
    Object.entries(answer.scores).forEach(([key, value]) => {
      scores[key] = (scores[key] || 0) + value;
    });
  });

  return resultOrder.reduce((bestKey, key) => {
    return scores[key] > scores[bestKey] ? key : bestKey;
  }, resultOrder[0]);
}

function restart() {
  state = createInitialState();
  render();
}

render();
