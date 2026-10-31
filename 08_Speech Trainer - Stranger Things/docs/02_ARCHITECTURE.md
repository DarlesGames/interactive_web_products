# Архитектура и контракты

## Стек
Использовать **текущий** HTML/CSS/JS проекта (ES-модули, если присутствуют). Предпочтительно статический SPA без backend для GitHub Pages. Существующие пути изучить в запросе №5; дерево ниже — **предлагаемая структура**, не утверждение о реальном репозитории.

```text
src/
  ui/                   screens, witness cards, chat, forms
  core/
    normalize.js        Russian text normalization
    parseQuestion.js    intent, target, negation, confidence
    storyEngine.js      match fact + access check + answer result
    response.js         witness phrasing, safe fallbacks
    hints.js            thresholds and manual hint requests
    solution.js         evaluate 4 criteria
    stats.js            counters, distinct question types
    state.js            active story/witness, transcript
  voice/recognition.js  SpeechRecognition adapter
  data/ (or data/cases/)  external scenario JSON
```

## Поток
UI → input text (or `ru-RU` SpeechRecognition + editable draft) → normalize → parseQuery → `storyEngine.answer(question, witness, story, state)` → response renderer → update transcript & counters → hint decision → UI. Separate `solutionEngine.evaluate(text, solutionCriteria)`.

## Пример контрактов (можно адаптировать к существующему коду)

```js
parseQuestion(text, context) => {
  intent, subject, predicate, object, location, time,
  negated, confidence, unresolvedSlots
}
answerQuestion({text, witnessId, story, state}) => {
  status: 'YES'|'NO'|'IRRELEVANT'|'UNKNOWN',
  reason: 'KNOWN'|'NOT_KNOWN'|'WITHHELD'|'AMBIGUOUS'|'NO_MATCH',
  factId: string|null, category: string|null,
  reply: string, understood: boolean
}
evaluateSolution({text, criteria}) => {
  verdict: 'CORRECT'|'PARTIAL'|'INCORRECT'|'UNPARSEABLE',
  matched: string[], missing: string[], feedback: string
}
```

`reason` — внутренний уточняющий код, не новая пользовательская категория и не нарушение четырёх основных статусов.

## Состояние
`storyId`, `activeWitnessId`, `transcript` (с `witnessId` для каждой реплики), `submittedRequestIds`, `totalQuestions`, `understoodQuestions`, `unknownQuestions`, `hintIdsShown`, `hypothesisAttempts`, `questionCategories`, `discoveredFacts`, `currentDraft`.

- Наращивать глобальный счётчик при **принятии одного непустого уникального** вопроса; дубли из события голоса не считать повторно.
- Переключение свидетеля не обнуляет статистику истории; реплики остаются связаны с исходным свидетелем.
- Не подставлять старый контекст «ты» для другого свидетеля после переключения.
- Хранить глобальные факты истории отдельно от состояния «кто знает» и «когда готов ответить».

## Ключи данных
`data/cases/case-001.json`: `id`, `title`, `level`, `description`, `characters`, `facts`, `questionMappings`, `hints`, `solution`, `solutionCriteria`. Внутри `facts` — `id`, `subject`, `predicate`, `object`, `value`, `importance`, `knownBy`. Для фактов с условным раскрытием предусмотреть `revealPolicy`, но **не выдумывать** условия из ничего.

## Статический хостинг / спойлер
На GitHub Pages сценарий и разгадка загружаются клиентом. Скрывать в экране и истории диалога до разгадки, но нельзя обещать секретность от проверки JS/Network. Для соревнования с требованием защиты данных нужен иной архитектурный вариант с сервером (не часть MVP).
