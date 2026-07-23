window.QUIZ_CONFIG = {
  version: 2,
  contacts: {
    telegram: "https://t.me/ProgrammerLeks",
    vk: "https://vk.ru/im/convo/-224400042?entrypoint=community_page&tab=all",
    email: "DarlesGames@yandex.ru"
  },
  tieBreakPriority: ["quiz", "calculator", "promo", "invitation", "miniGame"],
  secondResultThreshold: 0.8,
  pricing: {
    ru: {
      currency: "RUB",
      base: [15000, 19000],
      modifiers: {
        branches: [4000, 8000], formulas: [4000, 9000], gameMechanic: [8000, 15000],
        brandStyle: [4000, 7000], illustratedStyle: [7000, 10000], premiumStyle: [10000, 13000],
        basicContact: [1500, 4000], externalSystem: [6000, 12000], embed: [2500, 6000]
      },
      budgets: {
        low: [0, 18000], medium: [18000, 30000], high: [30000, 45000], premium: [45000, Infinity]
      }
    },
    en: {
      currency: "USD",
      base: [260, 340],
      modifiers: {
        branches: [70, 140], formulas: [70, 160], gameMechanic: [140, 280],
        brandStyle: [70, 120], illustratedStyle: [120, 180], premiumStyle: [180, 220],
        basicContact: [25, 70], externalSystem: [100, 220], embed: [40, 100]
      },
      budgets: {
        low: [0, 320], medium: [320, 520], high: [520, 760], premium: [760, Infinity]
      }
    }
  },
  timelines: {
    quiz: [5, 8], calculator: [7, 12], invitation: [7, 12], promo: [8, 15], miniGame: [12, 20]
  },
  timelineModifiers: {
    branches: [2, 4], formulas: [3, 5], illustratedStyle: [3, 7], premiumStyle: [3, 7],
    externalSystem: [3, 6], embed: [1, 2]
  },
  resultFeatures: {
    quiz: ["questions", "simpleBranches", "personalResult", "responsive", "contact"],
    calculator: ["inputs", "formula", "calculation", "explanation", "contact"],
    invitation: ["story", "animation", "gallery", "attendance", "interactiveDetail"],
    promo: ["shortScenario", "progress", "reward", "cta", "analytics"],
    miniGame: ["oneMechanic", "brandElements", "shortSession", "score", "finalCta"]
  },
  questions: [
    {
      id: "goal", type: "single",
      answers: [
        { id: "choose", scores: { quiz: 6, calculator: 1, promo: 1 } },
        { id: "calculate", scores: { quiz: 1, calculator: 6 } },
        { id: "leads", scores: { quiz: 4, calculator: 1, promo: 2 } },
        { id: "engage", scores: { quiz: 1, promo: 5, miniGame: 3 } },
        { id: "invite", scores: { invitation: 6, promo: 1 } },
        { id: "teach", scores: { quiz: 5, promo: 1, miniGame: 1 } }
      ]
    },
    {
      id: "audience", type: "single",
      answers: [
        { id: "clients", scores: { quiz: 2, calculator: 2, promo: 1 } },
        { id: "staff", scores: { quiz: 3, promo: 1 } },
        { id: "guests", scores: { invitation: 4, promo: 1 } },
        { id: "community", scores: { quiz: 1, promo: 3, miniGame: 2 } },
        { id: "wide", scores: { promo: 2, miniGame: 4 } }
      ]
    },
    {
      id: "outcome", type: "single",
      answers: [
        { id: "advice", scores: { quiz: 6, calculator: 1 } },
        { id: "number", scores: { quiz: 1, calculator: 6 } },
        { id: "test", scores: { quiz: 5, promo: 1 } },
        { id: "impression", scores: { invitation: 5, promo: 2, miniGame: 1 } },
        { id: "game", scores: { promo: 1, miniGame: 6 } },
        { id: "contact", scores: { quiz: 3, promo: 2 } }
      ]
    },
    {
      id: "mechanic", type: "single",
      answers: [
        { id: "steps", scores: { quiz: 2, invitation: 1, promo: 1 } },
        { id: "branches", scores: { quiz: 4 }, modifiers: ["branches"] },
        { id: "formula", scores: { calculator: 6 }, modifiers: ["formulas"] },
        { id: "gameplay", scores: { promo: 2, miniGame: 6 }, modifiers: ["gameMechanic"] },
        { id: "help", scores: {} }
      ]
    },
    {
      id: "style", type: "single",
      answers: [
        { id: "simple", scores: {} },
        { id: "brand", scores: {}, modifiers: ["brandStyle"] },
        { id: "illustrated", scores: {}, modifiers: ["illustratedStyle"] },
        { id: "unusual", scores: {}, modifiers: ["premiumStyle"] }
      ]
    },
    {
      id: "connections", type: "multi",
      answers: [
        { id: "none", scores: {} },
        { id: "telegram", scores: {}, modifiers: ["basicContact"] },
        { id: "email", scores: {}, modifiers: ["basicContact"] },
        { id: "website", scores: {}, modifiers: ["embed"] },
        { id: "crm", scores: {}, modifiers: ["externalSystem"] }
      ]
    },
    {
      id: "deadline", type: "single",
      answers: [
        { id: "week", scores: {} },
        { id: "twoWeeks", scores: {} },
        { id: "month", scores: {} },
        { id: "unknown", scores: {} }
      ]
    },
    {
      id: "budget", type: "single",
      answers: [
        { id: "low", scores: {} },
        { id: "medium", scores: {} },
        { id: "high", scores: {} },
        { id: "premium", scores: {} },
        { id: "unknown", scores: {} }
      ]
    }
  ],
  i18n: {
    ru: {
      themeLabel: "Стиль демо", themeBusiness: "Деловой", themeBright: "Яркий",
      startEyebrow: "Интерактивный подборщик", startTitle: "Подберём веб-формат под вашу задачу",
      startText: "8 коротких вопросов — и вы увидите подходящее решение, срок и предварительную цену.",
      startNote: "Это один продукт в трёх стилях. Клиентская версия оформляется под ваш бренд.",
      startButton: "Начать подбор", examplesLink: "Какие форматы мы создаём?",
      examplesEyebrow: "Форматы", examplesTitle: "Что можно создать", close: "Закрыть",
      questionCount: "Вопрос {current} из {total}", back: "Назад", next: "Далее",
      selectSeveral: "Можно выбрать несколько вариантов.", scrollTitle: "Ваш будущий продукт",
      scrollEmpty: "Ответы постепенно проявятся здесь.", calculating: "Собираем решение…",
      resultEyebrow: "Результат", resultPrefix: "Вам подойдёт", why: "Почему",
      included: "Что войдёт", time: "Срок", price: "Цена", more: "Ещё можно добавить",
      secondary: "Ещё может подойти", discuss: "Обсудить проект", telegram: "Telegram", vk: "VK",
      emailLabel: "Почта", copyResult: "Скопировать результат", copied: "Результат скопирован",
      restart: "Пройти заново", budgetFits: "Похоже, решение укладывается в ваш ориентир.",
      budgetLow: "Можно начать с упрощённой версии и сохранить главное.",
      budgetHigh: "В бюджете есть место для дополнительных функций.",
      deadlineTight: "Срок можно сократить, если начать с минимальной версии.",
      workingDays: "рабочих дней", from: "от", to: "до",
      resultNames: {
        quiz: "Интерактивный квиз или тест", calculator: "Интерактивный калькулятор",
        invitation: "Интерактивное приглашение", promo: "Промо-страница с интерактивом",
        miniGame: "Брендированная мини-игра"
      },
      resultReasons: {
        quiz: "Он поможет провести человека через понятные вопросы и выдать персональный результат.",
        calculator: "Он рассчитает стоимость, выгоду или комплектацию по выбранным параметрам.",
        invitation: "Он превратит событие или поздравление в персональную интерактивную историю.",
        promo: "Он вовлечёт аудиторию коротким сценарием и приведёт к нужному действию.",
        miniGame: "Она удержит внимание через одну простую механику и фирменную подачу."
      },
      featureNames: {
        questions: "6–10 понятных вопросов", simpleBranches: "Простая логика и ветвления", personalResult: "Персональный результат",
        responsive: "Адаптация под телефон и компьютер", contact: "Связь через выбранный канал",
        inputs: "Поля и переключатели", formula: "Формулы", calculation: "Промежуточный и итоговый расчёт", explanation: "Пояснение результата",
        story: "Индивидуальный сценарий", animation: "Анимация", gallery: "Галерея или таймлайн", attendance: "Подтверждение участия", interactiveDetail: "Игровая или сюжетная деталь",
        shortScenario: "Короткий интерактивный сценарий", progress: "Прогресс", reward: "Результат или награда", cta: "Целевая кнопка", analytics: "События аналитики при необходимости",
        oneMechanic: "Одна понятная механика", brandElements: "Фирменные элементы", shortSession: "Короткая игровая сессия", score: "Игровой результат", finalCta: "Целевое действие после игры"
      },
      extraNames: {
        branches: "ветвления", formulas: "расчёты по формуле", gameMechanic: "игровую механику", brandStyle: "фирменное оформление",
        illustratedStyle: "иллюстрации и анимацию", premiumStyle: "необычную авторскую подачу", basicContact: "Telegram или email",
        externalSystem: "связь с CRM", embed: "встраивание на сайт"
      },
      summaryLabels: { goal: "Задача", audience: "Аудитория", outcome: "Итог", mechanic: "Механика", style: "Стиль", connections: "Связь", deadline: "Срок", budget: "Бюджет" },
      questions: {
        goal: "Что должен делать ваш веб-продукт?", audience: "Кто будет им пользоваться?",
        outcome: "Что человек должен получить в конце?", mechanic: "Как это должно работать?",
        style: "Как должен выглядеть продукт?", connections: "С чем его нужно связать?",
        deadline: "Когда нужен запуск?", budget: "На какой бюджет вы ориентируетесь?"
      },
      answers: {
        goal: { choose: "Помогать выбрать товар или услугу", calculate: "Считать цену или выгоду", leads: "Собирать заявки", engage: "Вовлекать аудиторию", invite: "Приглашать или поздравлять", teach: "Обучать или проверять знания" },
        audience: { clients: "Клиенты", staff: "Сотрудники или ученики", guests: "Гости мероприятия", community: "Подписчики сообщества", wide: "Широкая аудитория" },
        outcome: { advice: "Подходящий вариант или совет", number: "Расчёт", test: "Результат теста", impression: "Впечатление или подарок", game: "Игровой результат", contact: "Возможность связаться с вами" },
        mechanic: { steps: "Несколько простых шагов", branches: "Разные вопросы для разных ответов", formula: "Расчёт по формуле", gameplay: "Небольшая игровая механика", help: "Пока не знаю — нужна помощь" },
        style: { simple: "Просто и аккуратно", brand: "В стиле моего бренда", illustrated: "С иллюстрациями и анимацией", unusual: "Максимально необычно" },
        connections: { none: "Ничего не нужно", telegram: "Telegram", email: "Email", website: "Существующий сайт", crm: "CRM или другая система" },
        deadline: { week: "До 7 дней", twoWeeks: "Через 1–2 недели", month: "Через 2–4 недели", unknown: "Точной даты пока нет" },
        budget: { low: "До 20 000 ₽", medium: "20 000–35 000 ₽", high: "35 000–50 000 ₽", premium: "Более 50 000 ₽", unknown: "Пока не знаю" }
      },
      examples: [
        ["Интерактивный квиз", "Помогает выбрать товар, услугу или направление."],
        ["Калькулятор", "Считает цену, выгоду или комплектацию."],
        ["Интерактивное приглашение", "Рассказывает историю события и собирает ответы гостей."],
        ["Промо-страница", "Вовлекает аудиторию и ведёт к целевому действию."],
        ["Мини-игра", "Даёт бренду короткий игровой контакт с аудиторией."]
      ],
      telegramMessage: "Здравствуйте! Я прошёл подборщик Darles Games.\n\nМне подойдёт: {result}.\nЗадача: {goal}.\nНужно: {extras}.\nСрок: {time}.\nОриентир: {price}.\n\nХочу обсудить проект."
    },
    en: {
      themeLabel: "Demo style", themeBusiness: "Business", themeBright: "Bright",
      startEyebrow: "Interactive solution finder", startTitle: "Find the right web format for your task",
      startText: "Answer 8 short questions to see a suitable solution, timeline, and estimated price.",
      startNote: "One product, three visual styles. A client version is adapted to your brand.",
      startButton: "Start", examplesLink: "What can you create?",
      examplesEyebrow: "Formats", examplesTitle: "What we can build", close: "Close",
      questionCount: "Question {current} of {total}", back: "Back", next: "Next",
      selectSeveral: "You can select several options.", scrollTitle: "Your future product",
      scrollEmpty: "Your answers will appear here.", calculating: "Building your solution…",
      resultEyebrow: "Result", resultPrefix: "Recommended", why: "Why it fits",
      included: "Included", time: "Timeline", price: "Price", more: "Possible additions",
      secondary: "Another option", discuss: "Discuss the project", telegram: "Telegram", vk: "VK",
      emailLabel: "Email", copyResult: "Copy result", copied: "Result copied",
      restart: "Start again", budgetFits: "The estimate appears to fit your budget range.",
      budgetLow: "We can start with a smaller version and keep the core value.",
      budgetHigh: "Your budget leaves room for additional features.",
      deadlineTight: "The timeline can be shortened by starting with the minimum version.",
      workingDays: "business days", from: "from", to: "to",
      resultNames: {
        quiz: "Interactive quiz or test", calculator: "Interactive calculator",
        invitation: "Interactive invitation", promo: "Interactive promo page",
        miniGame: "Branded mini-game"
      },
      resultReasons: {
        quiz: "It guides people through clear questions and gives them a personalized result.",
        calculator: "It calculates price, value, or configuration from selected parameters.",
        invitation: "It turns an event or greeting into a personal interactive story.",
        promo: "It engages the audience with a short scenario and leads to a target action.",
        miniGame: "It holds attention with one simple mechanic and branded presentation."
      },
      featureNames: {
        questions: "6–10 clear questions", simpleBranches: "Simple logic and branching", personalResult: "Personalized result",
        responsive: "Desktop and mobile layout", contact: "Contact through a selected channel",
        inputs: "Inputs and switches", formula: "Formulas", calculation: "Live and final calculation", explanation: "Result explanation",
        story: "Custom scenario", animation: "Animation", gallery: "Gallery or timeline", attendance: "RSVP", interactiveDetail: "Interactive story detail",
        shortScenario: "Short interactive scenario", progress: "Progress", reward: "Result or reward", cta: "Target action", analytics: "Analytics events when needed",
        oneMechanic: "One clear mechanic", brandElements: "Brand elements", shortSession: "Short game session", score: "Game result", finalCta: "Target action after play"
      },
      extraNames: {
        branches: "branching", formulas: "formula-based calculation", gameMechanic: "a game mechanic", brandStyle: "brand styling",
        illustratedStyle: "illustrations and animation", premiumStyle: "a custom premium presentation", basicContact: "Telegram or email",
        externalSystem: "CRM connection", embed: "website embedding"
      },
      summaryLabels: { goal: "Goal", audience: "Audience", outcome: "Outcome", mechanic: "Mechanic", style: "Style", connections: "Connections", deadline: "Timeline", budget: "Budget" },
      questions: {
        goal: "What should your web product do?", audience: "Who will use it?",
        outcome: "What should a person get at the end?", mechanic: "How should it work?",
        style: "How should it look?", connections: "What should it connect to?",
        deadline: "When do you need it?", budget: "What budget range do you have?"
      },
      answers: {
        goal: { choose: "Help choose a product or service", calculate: "Calculate price or value", leads: "Collect leads", engage: "Engage the audience", invite: "Invite or congratulate", teach: "Teach or test knowledge" },
        audience: { clients: "Customers", staff: "Employees or students", guests: "Event guests", community: "Community followers", wide: "A broad audience" },
        outcome: { advice: "A suitable option or advice", number: "A calculation", test: "A test result", impression: "An impression or gift", game: "A game result", contact: "A way to contact you" },
        mechanic: { steps: "A few simple steps", branches: "Different questions for different answers", formula: "Formula-based calculation", gameplay: "A small game mechanic", help: "Not sure — I need guidance" },
        style: { simple: "Simple and clean", brand: "In my brand style", illustrated: "With illustrations and animation", unusual: "Highly distinctive" },
        connections: { none: "No connections", telegram: "Telegram", email: "Email", website: "Existing website", crm: "CRM or another system" },
        deadline: { week: "Within 7 days", twoWeeks: "In 1–2 weeks", month: "In 2–4 weeks", unknown: "No fixed date yet" },
        budget: { low: "Up to $350", medium: "$350–$600", high: "$600–$850", premium: "More than $850", unknown: "Not sure yet" }
      },
      examples: [
        ["Interactive quiz", "Helps people choose a product, service, or direction."],
        ["Calculator", "Calculates price, value, or configuration."],
        ["Interactive invitation", "Tells an event story and collects guest responses."],
        ["Promo page", "Engages an audience and leads to a target action."],
        ["Mini-game", "Creates a short branded game interaction."]
      ],
      telegramMessage: "Hello! I completed the Darles Games solution finder.\n\nRecommended: {result}.\nGoal: {goal}.\nNeeded: {extras}.\nTimeline: {time}.\nEstimate: {price}.\n\nI would like to discuss the project."
    }
  }
};
