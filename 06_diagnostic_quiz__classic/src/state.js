export function createInitialState() {
  return {
    screen: "start",
    currentQuestionIndex: 0,
    selectedOptionId: null,
    answers: [],
    resultKey: null,
  };
}
