export function createQuizScreen({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  texts,
  onSelect,
  onNext,
  onRestart,
}) {
  const section = document.createElement("section");
  section.className = "screen screen--quiz";

  const progressPercent = Math.round(((questionIndex + 1) / totalQuestions) * 100);
  const top = document.createElement("div");
  top.className = "quiz-top";

  const meta = document.createElement("div");
  meta.className = "progress-meta";

  const currentLabel = document.createElement("span");
  currentLabel.textContent = `${texts.questionLabel} ${questionIndex + 1} из ${totalQuestions}`;

  const percentLabel = document.createElement("span");
  percentLabel.textContent = `${progressPercent}%`;

  meta.append(currentLabel, percentLabel);

  const progressTrack = document.createElement("div");
  progressTrack.className = "progress-track";
  progressTrack.setAttribute("role", "progressbar");
  progressTrack.setAttribute("aria-valuemin", "0");
  progressTrack.setAttribute("aria-valuemax", "100");
  progressTrack.setAttribute("aria-valuenow", String(progressPercent));

  const progressFill = document.createElement("div");
  progressFill.className = "progress-fill";
  progressFill.style.width = `${progressPercent}%`;
  progressTrack.append(progressFill);
  top.append(meta, progressTrack);

  const questionBlock = document.createElement("div");
  questionBlock.className = "question";

  const title = document.createElement("h1");
  title.className = "question-title";
  title.textContent = question.title;

  const hint = document.createElement("p");
  hint.className = "question-hint";
  hint.textContent = question.hint;

  const options = document.createElement("ul");
  options.className = "option-list";

  question.options.forEach((option) => {
    const item = document.createElement("li");

    const button = document.createElement("button");
    button.className = "option-button";
    button.type = "button";
    button.setAttribute("aria-pressed", String(option.id === selectedOptionId));

    if (option.id === selectedOptionId) {
      button.classList.add("is-selected");
    }

    const indicator = document.createElement("span");
    indicator.className = "option-indicator";
    indicator.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "option-label";
    label.textContent = option.label;

    button.append(indicator, label);
    button.addEventListener("click", () => onSelect(option.id));
    item.append(button);
    options.append(item);
  });

  questionBlock.append(title, hint, options);

  const choiceHint = document.createElement("p");
  choiceHint.className = "choice-hint";
  choiceHint.textContent = selectedOptionId ? "" : texts.chooseHint;

  const actions = document.createElement("div");
  actions.className = "quiz-actions";

  const restartButton = document.createElement("button");
  restartButton.className = "button button--ghost";
  restartButton.type = "button";
  restartButton.textContent = texts.restart;
  restartButton.addEventListener("click", onRestart);

  const nextButton = document.createElement("button");
  nextButton.className = "button button--primary";
  nextButton.type = "button";
  nextButton.disabled = !selectedOptionId;
  nextButton.textContent =
    questionIndex === totalQuestions - 1 ? texts.finish : texts.next;
  nextButton.addEventListener("click", onNext);

  actions.append(restartButton, nextButton);
  section.append(top, questionBlock, choiceHint, actions);

  return section;
}
