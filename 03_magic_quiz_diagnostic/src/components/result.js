import { createLeadForm } from "./leadForm.js";
import { createMagicGuide } from "./magicGuide.js";

export function createResultScreen({
  result,
  texts,
  formTexts,
  onRestart,
}) {
  const section = document.createElement("section");
  section.className = "screen screen--result";

  const badge = document.createElement("span");
  badge.className = "result-badge";
  badge.textContent = `${texts.headingPrefix}: ${result.badge}`;

  const title = document.createElement("h1");
  title.className = "visually-hidden";
  title.textContent = result.title;

  const short = document.createElement("p");
  short.className = "visually-hidden";
  short.textContent = result.short;

  const guide = createMagicGuide({
    heading: result.title,
    text: result.short,
    ariaLabel: "Результат теста",
  });

  const blocks = document.createElement("div");
  blocks.className = "result-blocks";
  blocks.append(
    createTextBlock(texts.diagnosisTitle, result.explanation),
    createTextBlock(texts.recommendationTitle, result.recommendation),
    createStepBlock(texts.nextStepsTitle, result.steps),
  );

  const leadForm = createLeadForm({
    texts: formTexts,
  });

  const actions = document.createElement("div");
  actions.className = "result-actions";

  const restartButton = document.createElement("button");
  restartButton.className = "button button--ghost";
  restartButton.type = "button";
  restartButton.textContent = texts.restart;
  restartButton.addEventListener("click", onRestart);

  actions.append(restartButton);
  section.append(badge, title, short, guide, blocks, leadForm, actions);

  return section;
}

function createTextBlock(titleText, bodyText) {
  const block = document.createElement("section");
  block.className = "result-block";

  const title = document.createElement("h2");
  title.textContent = titleText;

  const body = document.createElement("p");
  body.textContent = bodyText;

  block.append(title, body);
  return block;
}

function createStepBlock(titleText, steps) {
  const block = document.createElement("section");
  block.className = "result-block";

  const title = document.createElement("h2");
  title.textContent = titleText;

  const list = document.createElement("ul");
  list.className = "step-list";

  steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    list.append(item);
  });

  block.append(title, list);
  return block;
}
