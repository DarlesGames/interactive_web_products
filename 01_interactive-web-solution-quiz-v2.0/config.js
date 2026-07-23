(function () {
  "use strict";

  window.QUIZ_CONFIG = {
    schemaVersion: 1,
    product: {
      name: "Darles Games Solution Finder",
      defaultLanguage: "auto",
      defaultTheme: "magic",
      storageKey: "darles-product-001-state-v1"
    },

    contacts: {
      // Add the public Telegram username without @ before publishing.
      telegramUsername: ""
    },

    themes: {
      magic: {
        labels: { ru: "Magic", en: "Magic" },
        artifactLabels: {
          ru: "Свиток открывается с каждым ответом",
          en: "Each answer reveals another line"
        }
      },
      business: {
        labels: { ru: "Деловой", en: "Business" },
        artifactLabels: {
          ru: "Бриф заполняется с каждым ответом",
          en: "Each answer completes the brief"
        }
      },
      bright: {
        labels: { ru: "Яркий", en: "Bright" },
        artifactLabels: {
          ru: "Бренд-карта собирается с каждым ответом",
          en: "Each answer builds the brand card"
        }
      }
    },

    ui: {
      ru: {
        documentTitle: "Подбор веб-решения — Darles Games",
        description: "Интерактивный подборщик веб-решения Darles Games: формат, срок и предварительная стоимость.",
        skip: "К содержанию",
        brandHome: "Darles Games — на стартовый экран",
        brandSubtitle: "Интерактивные веб-решения",
        footer: "Индивидуальные интерактивные веб-решения",
        language: "Язык",
        themeLegend: "Стиль демо",
        startEyebrow: "Интерактивный подборщик",
        startTitle: "Подберём веб-формат под вашу задачу",
        startText: "8 коротких вопросов — и вы увидите подходящее решение, срок и цену.",
        startButton: "Начать подбор",
        continueButton: "Продолжить подбор",
        examplesButton: "Какие форматы мы создаём?",
        styleNote: "Это один продукт в трёх стилях. Клиентская версия оформляется под ваш бренд.",
        timeNote: "Около 2 минут",
        artifactEmpty: "Здесь постепенно проявится ваш проект",
        questionCount: "Вопрос {current} из {total}",
        chooseOne: "Выберите один вариант",
        chooseMany: "Можно выбрать несколько вариантов",
        back: "Назад",
        next: "Далее",
        required: "Сначала выберите ответ",
        calculatingEyebrow: "Ответы собраны",
        calculatingTitle: "Собираем подходящее решение",
        calculatingText: "Задача, формат и функции складываются в понятный результат.",
        resultEyebrow: "Ваш результат",
        resultLead: "Вам подойдёт",
        why: "Почему",
        included: "Что войдёт",
        price: "Предварительная цена",
        timeline: "Срок разработки",
        extra: "Что учтено в оценке",
        secondResult: "Ещё может подойти: {result}",
        discuss: "Обсудить проект",
        copy: "Скопировать результат",
        copied: "Результат скопирован",
        telegramFallback: "Контакт Telegram ещё не указан. Результат скопирован.",
        restart: "Пройти заново",
        businessDays: "{min}–{max} рабочих дней",
        budgetFit: "Похоже, решение укладывается в ваш ориентир.",
        budgetBelow: "Можно начать с упрощённой версии и сохранить главное.",
        budgetAbove: "В бюджете есть место для дополнительных функций.",
        deadlineTight: "Срок можно сократить, если начать с минимальной версии.",
        estimateNote: "Это ориентир. Точная оценка — после короткого обсуждения задачи.",
        examplesEyebrow: "Что можно создать",
        examplesTitle: "Пять понятных форматов",
        examplesClose: "Закрыть",
        noExtras: "Базовая версия без дополнительных подключений",
        summaryTitle: "Ваш проект",
        requestGreeting: "Здравствуйте! Я прошёл подборщик Darles Games.",
        requestFit: "Мне подойдёт",
        requestTask: "Задача",
        requestNeed: "Нужно",
        requestTimeline: "Срок",
        requestPrice: "Предварительная цена",
        requestClose: "Хочу обсудить проект.",
        none: "базовая версия"
      },
      en: {
        documentTitle: "Web solution finder — Darles Games",
        description: "Darles Games interactive web solution finder: format, timeline and preliminary price range.",
        skip: "Skip to content",
        brandHome: "Darles Games — go to start",
        brandSubtitle: "Interactive web solutions",
        footer: "Custom interactive web solutions",
        language: "Language",
        themeLegend: "Demo style",
        startEyebrow: "Interactive solution finder",
        startTitle: "Find the right web format for your goal",
        startText: "8 short questions — get a clear solution, timeline and price range.",
        startButton: "Find my solution",
        continueButton: "Continue",
        examplesButton: "What can you build?",
        styleNote: "This is one product in three styles. Your version will match your brand.",
        timeNote: "About 2 minutes",
        artifactEmpty: "Your project will appear here, one answer at a time",
        questionCount: "Question {current} of {total}",
        chooseOne: "Choose one option",
        chooseMany: "Choose any that apply",
        back: "Back",
        next: "Next",
        required: "Choose an answer first",
        calculatingEyebrow: "Answers collected",
        calculatingTitle: "Building your best-fit solution",
        calculatingText: "Your goal, format and features are becoming one clear result.",
        resultEyebrow: "Your result",
        resultLead: "Best fit",
        why: "Why it fits",
        included: "What's included",
        price: "Estimated price",
        timeline: "Build time",
        extra: "Included in the estimate",
        secondResult: "Another good option: {result}",
        discuss: "Discuss this project",
        copy: "Copy result",
        copied: "Result copied",
        telegramFallback: "Telegram contact is not configured yet. The result was copied.",
        restart: "Start again",
        businessDays: "{min}–{max} business days",
        budgetFit: "This solution looks close to your budget range.",
        budgetBelow: "We can start smaller and keep the core value.",
        budgetAbove: "Your budget leaves room for extra features.",
        deadlineTight: "A smaller first version can help meet your deadline.",
        estimateNote: "This is a guide. The final quote follows a short project discussion.",
        examplesEyebrow: "What we can build",
        examplesTitle: "Five clear formats",
        examplesClose: "Close",
        noExtras: "Core version without extra connections",
        summaryTitle: "Your project",
        requestGreeting: "Hello! I completed the Darles Games solution finder.",
        requestFit: "Best fit",
        requestTask: "Goal",
        requestNeed: "Requirements",
        requestTimeline: "Timeline",
        requestPrice: "Estimated price",
        requestClose: "I'd like to discuss this project.",
        none: "core version"
      }
    },

    questions: [
      {
        id: "goal",
        type: "single",
        title: { ru: "Что должен делать ваш веб-продукт?", en: "What should your web product do?" },
        revealLabel: { ru: "Задача", en: "Goal" },
        answers: [
          {
            id: "choose",
            label: { ru: "Помогать выбрать товар или услугу", en: "Help people choose a product or service" },
            summary: { ru: "помочь с выбором", en: "help people choose" },
            scores: { quiz: 6, calculator: 1, promo: 1 }
          },
          {
            id: "calculate",
            label: { ru: "Считать цену или выгоду", en: "Calculate a price or benefit" },
            summary: { ru: "рассчитать цену или выгоду", en: "calculate a price or benefit" },
            scores: { quiz: 1, calculator: 6 },
            modifiers: ["formulas"]
          },
          {
            id: "leads",
            label: { ru: "Собирать заявки", en: "Collect enquiries" },
            summary: { ru: "собирать заявки", en: "collect enquiries" },
            scores: { quiz: 4, calculator: 1, promo: 2 }
          },
          {
            id: "engage",
            label: { ru: "Вовлекать аудиторию", en: "Engage an audience" },
            summary: { ru: "вовлекать аудиторию", en: "engage an audience" },
            scores: { quiz: 1, promo: 5, miniGame: 3 }
          },
          {
            id: "invite",
            label: { ru: "Приглашать или поздравлять", en: "Invite or celebrate" },
            summary: { ru: "приглашать или поздравлять", en: "invite or celebrate" },
            scores: { invitation: 6, promo: 1 }
          },
          {
            id: "teach",
            label: { ru: "Обучать или проверять знания", en: "Teach or check knowledge" },
            summary: { ru: "обучать или проверять знания", en: "teach or check knowledge" },
            scores: { quiz: 5, promo: 1, miniGame: 1 }
          }
        ]
      },
      {
        id: "audience",
        type: "single",
        title: { ru: "Кто будет им пользоваться?", en: "Who will use it?" },
        revealLabel: { ru: "Аудитория", en: "Audience" },
        answers: [
          {
            id: "clients",
            label: { ru: "Клиенты", en: "Customers" },
            summary: { ru: "клиенты", en: "customers" },
            scores: { quiz: 2, calculator: 2, promo: 1 }
          },
          {
            id: "team",
            label: { ru: "Сотрудники или ученики", en: "Employees or learners" },
            summary: { ru: "сотрудники или ученики", en: "employees or learners" },
            scores: { quiz: 3, promo: 1 }
          },
          {
            id: "event",
            label: { ru: "Гости мероприятия", en: "Event guests" },
            summary: { ru: "гости мероприятия", en: "event guests" },
            scores: { invitation: 4, promo: 1 }
          },
          {
            id: "community",
            label: { ru: "Подписчики сообщества", en: "Community followers" },
            summary: { ru: "подписчики сообщества", en: "community followers" },
            scores: { quiz: 1, promo: 3, miniGame: 2 }
          },
          {
            id: "wide",
            label: { ru: "Широкая аудитория", en: "A broad audience" },
            summary: { ru: "широкая аудитория", en: "a broad audience" },
            scores: { promo: 2, miniGame: 4 }
          }
        ]
      },
      {
        id: "outcome",
        type: "single",
        title: { ru: "Что человек должен получить в конце?", en: "What should people get at the end?" },
        revealLabel: { ru: "Результат", en: "Outcome" },
        answers: [
          {
            id: "recommendation",
            label: { ru: "Подходящий вариант или совет", en: "A recommendation or best option" },
            summary: { ru: "персональная рекомендация", en: "a personal recommendation" },
            scores: { quiz: 6, calculator: 1 }
          },
          {
            id: "calculation",
            label: { ru: "Расчёт", en: "A calculation" },
            summary: { ru: "понятный расчёт", en: "a clear calculation" },
            scores: { quiz: 1, calculator: 6 },
            modifiers: ["formulas"]
          },
          {
            id: "testResult",
            label: { ru: "Результат теста", en: "A test result" },
            summary: { ru: "результат теста", en: "a test result" },
            scores: { quiz: 5, promo: 1 }
          },
          {
            id: "impression",
            label: { ru: "Впечатление или подарок", en: "An experience or gift" },
            summary: { ru: "впечатление или подарок", en: "an experience or gift" },
            scores: { invitation: 5, promo: 2, miniGame: 1 }
          },
          {
            id: "gameResult",
            label: { ru: "Игровой результат", en: "A game score" },
            summary: { ru: "игровой результат", en: "a game score" },
            scores: { promo: 1, miniGame: 6 }
          },
          {
            id: "contact",
            label: { ru: "Возможность связаться с вами", en: "A way to contact you" },
            summary: { ru: "удобный переход к заявке", en: "an easy next step to enquire" },
            scores: { quiz: 3, promo: 2 }
          }
        ]
      },
      {
        id: "mechanic",
        type: "single",
        title: { ru: "Как это должно работать?", en: "How should it work?" },
        revealLabel: { ru: "Механика", en: "How it works" },
        answers: [
          {
            id: "simple",
            label: { ru: "Несколько простых шагов", en: "A few simple steps" },
            summary: { ru: "несколько простых шагов", en: "a few simple steps" },
            scores: { quiz: 2, invitation: 1, promo: 1 }
          },
          {
            id: "branches",
            label: { ru: "Разные вопросы для разных ответов", en: "Different paths for different answers" },
            summary: { ru: "несколько веток", en: "several paths" },
            scores: { quiz: 4 },
            modifiers: ["branches"]
          },
          {
            id: "formula",
            label: { ru: "Расчёт по формуле", en: "A formula-based calculation" },
            summary: { ru: "расчёт по формуле", en: "a formula-based calculation" },
            scores: { calculator: 6 },
            modifiers: ["formulas"]
          },
          {
            id: "game",
            label: { ru: "Небольшая игровая механика", en: "A small game mechanic" },
            summary: { ru: "небольшая игровая механика", en: "a small game mechanic" },
            scores: { promo: 2, miniGame: 6 },
            modifiers: ["gameMechanic"]
          },
          {
            id: "unknown",
            label: { ru: "Пока не знаю — нужна помощь", en: "Not sure — I need guidance" },
            summary: { ru: "механику нужно подобрать", en: "the mechanic needs to be chosen" },
            scores: {}
          }
        ]
      },
      {
        id: "style",
        type: "single",
        title: { ru: "Как должен выглядеть продукт?", en: "How should it look?" },
        revealLabel: { ru: "Стиль", en: "Style" },
        answers: [
          {
            id: "clean",
            label: { ru: "Просто и аккуратно", en: "Clean and simple" },
            summary: { ru: "простой и аккуратный", en: "clean and simple" },
            scores: {}
          },
          {
            id: "brand",
            label: { ru: "В стиле моего бренда", en: "Matched to my brand" },
            summary: { ru: "в стиле бренда", en: "matched to the brand" },
            scores: {},
            modifiers: ["brandStyle"]
          },
          {
            id: "illustrated",
            label: { ru: "С иллюстрациями и анимацией", en: "With illustrations and animation" },
            summary: { ru: "с иллюстрациями и анимацией", en: "with illustrations and animation" },
            scores: {},
            modifiers: ["illustratedStyle"]
          },
          {
            id: "unique",
            label: { ru: "Максимально необычно", en: "Distinctive and one-of-a-kind" },
            summary: { ru: "необычный индивидуальный", en: "distinctive and custom" },
            scores: {},
            modifiers: ["premiumStyle"]
          }
        ]
      },
      {
        id: "connections",
        type: "multi",
        title: { ru: "С чем его нужно связать?", en: "What should it connect to?" },
        revealLabel: { ru: "Подключения", en: "Connections" },
        answers: [
          {
            id: "none",
            label: { ru: "Ничего не нужно", en: "Nothing else" },
            summary: { ru: "без дополнительных подключений", en: "no extra connections" },
            scores: {},
            exclusive: true
          },
          {
            id: "telegram",
            label: { ru: "Telegram", en: "Telegram" },
            summary: { ru: "Telegram", en: "Telegram" },
            scores: {},
            modifiers: ["basicContact"]
          },
          {
            id: "email",
            label: { ru: "Email", en: "Email" },
            summary: { ru: "email", en: "email" },
            scores: {},
            modifiers: ["basicContact"]
          },
          {
            id: "site",
            label: { ru: "Существующий сайт", en: "An existing website" },
            summary: { ru: "встраивание на сайт", en: "website embedding" },
            scores: {},
            modifiers: ["embed"]
          },
          {
            id: "crm",
            label: { ru: "CRM или другая система", en: "CRM or another system" },
            summary: { ru: "CRM или внешняя система", en: "CRM or an external system" },
            scores: {},
            modifiers: ["externalSystem"]
          }
        ]
      },
      {
        id: "deadline",
        type: "single",
        title: { ru: "Когда нужен запуск?", en: "When do you need to launch?" },
        revealLabel: { ru: "Желаемый срок", en: "Target launch" },
        answers: [
          {
            id: "week",
            label: { ru: "До 7 дней", en: "Within 7 days" },
            summary: { ru: "до 7 дней", en: "within 7 days" },
            scores: {},
            desiredMaxDays: 7
          },
          {
            id: "twoWeeks",
            label: { ru: "Через 1–2 недели", en: "In 1–2 weeks" },
            summary: { ru: "1–2 недели", en: "1–2 weeks" },
            scores: {},
            desiredMaxDays: 10
          },
          {
            id: "month",
            label: { ru: "Через 2–4 недели", en: "In 2–4 weeks" },
            summary: { ru: "2–4 недели", en: "2–4 weeks" },
            scores: {},
            desiredMaxDays: 20
          },
          {
            id: "unknown",
            label: { ru: "Точной даты пока нет", en: "No fixed date yet" },
            summary: { ru: "дата пока не определена", en: "no fixed date yet" },
            scores: {},
            desiredMaxDays: null
          }
        ]
      },
      {
        id: "budget",
        type: "single",
        title: { ru: "На какой бюджет вы ориентируетесь?", en: "What budget range do you have in mind?" },
        revealLabel: { ru: "Бюджет", en: "Budget" },
        answers: [
          {
            id: "starter",
            label: { ru: "До 20 000 ₽", en: "Up to $350" },
            summary: { ru: "до 20 000 ₽", en: "up to $350" },
            scores: {},
            budget: { ru: [0, 20000], en: [0, 350] }
          },
          {
            id: "standard",
            label: { ru: "20 000–35 000 ₽", en: "$350–600" },
            summary: { ru: "20 000–35 000 ₽", en: "$350–600" },
            scores: {},
            budget: { ru: [20000, 35000], en: [350, 600] }
          },
          {
            id: "advanced",
            label: { ru: "35 000–50 000 ₽", en: "$600–900" },
            summary: { ru: "35 000–50 000 ₽", en: "$600–900" },
            scores: {},
            budget: { ru: [35000, 50000], en: [600, 900] }
          },
          {
            id: "premium",
            label: { ru: "Более 50 000 ₽", en: "More than $900" },
            summary: { ru: "более 50 000 ₽", en: "more than $900" },
            scores: {},
            budget: { ru: [50000, Infinity], en: [900, Infinity] }
          },
          {
            id: "unknown",
            label: { ru: "Пока не знаю", en: "Not sure yet" },
            summary: { ru: "бюджет нужно уточнить", en: "budget to be discussed" },
            scores: {},
            budget: { ru: null, en: null }
          }
        ]
      }
    ],

    results: {
      quiz: {
        title: { ru: "Интерактивный квиз или тест", en: "Interactive quiz or test" },
        shortTitle: { ru: "Квиз или тест", en: "Quiz or test" },
        description: {
          ru: "Он поможет человеку сделать выбор, получить личный результат и перейти к следующему шагу.",
          en: "It helps people choose, get a personal result and take the next step."
        },
        features: {
          ru: ["6–10 коротких вопросов", "Понятный личный результат", "Возврат к прошлому вопросу", "Удобная работа на телефоне"],
          en: ["6–10 short questions", "A clear personal result", "Back navigation", "Mobile-friendly layout"]
        },
        timeline: [5, 8],
        defaultModifiers: []
      },
      calculator: {
        title: { ru: "Интерактивный калькулятор", en: "Interactive calculator" },
        shortTitle: { ru: "Калькулятор", en: "Calculator" },
        description: {
          ru: "Он покажет цену, комплектацию или выгоду по данным, которые вводит пользователь.",
          en: "It shows a price, package or benefit based on the user's inputs."
        },
        features: {
          ru: ["Понятные поля и переключатели", "Расчёт по вашим правилам", "Пояснение результата", "Передача параметров заявки"],
          en: ["Clear fields and controls", "Calculation using your rules", "Result explanation", "Enquiry details included"]
        },
        timeline: [7, 12],
        defaultModifiers: ["formulas"]
      },
      invitation: {
        title: { ru: "Интерактивное приглашение", en: "Interactive invitation" },
        shortTitle: { ru: "Приглашение", en: "Invitation" },
        description: {
          ru: "Оно превратит событие, поздравление или личную историю в запоминающуюся веб-страницу.",
          en: "It turns an event, celebration or personal story into a memorable web page."
        },
        features: {
          ru: ["Индивидуальный сценарий", "Анимация и история", "Галерея или программа", "Подтверждение участия"],
          en: ["A custom story", "Animation and narrative", "Gallery or schedule", "RSVP action"]
        },
        timeline: [7, 12],
        defaultModifiers: []
      },
      promo: {
        title: { ru: "Промо-страница с интерактивом", en: "Interactive promo page" },
        shortTitle: { ru: "Промо-страница", en: "Promo page" },
        description: {
          ru: "Она вовлечёт аудиторию в короткий сценарий и мягко приведёт к нужному действию.",
          en: "It engages the audience in a short experience and leads to one clear action."
        },
        features: {
          ru: ["Короткий интерактивный сценарий", "Видимый прогресс", "Результат или награда", "Целевая кнопка"],
          en: ["A short interactive flow", "Visible progress", "A result or reward", "A clear call to action"]
        },
        timeline: [8, 15],
        defaultModifiers: []
      },
      miniGame: {
        title: { ru: "Брендированная мини-игра", en: "Branded mini-game" },
        shortTitle: { ru: "Мини-игра", en: "Mini-game" },
        description: {
          ru: "Она привлечёт внимание, даст короткий игровой опыт и сделает бренд заметнее.",
          en: "It captures attention with a short game experience and makes the brand memorable."
        },
        features: {
          ru: ["Одна понятная механика", "Фирменные элементы", "Короткая игровая сессия", "Результат и целевая кнопка"],
          en: ["One clear mechanic", "Branded visuals", "A short play session", "Score and call to action"]
        },
        timeline: [12, 20],
        defaultModifiers: ["gameMechanic"]
      }
    },

    scoring: {
      secondResultThreshold: 0.8,
      tieBreakPriority: ["quiz", "calculator", "promo", "invitation", "miniGame"]
    },

    pricing: {
      ru: {
        locale: "ru-RU",
        currency: "RUB",
        base: [18000, 22000],
        modifiers: {
          branches: { range: [5000, 10000], label: "ветвящийся сценарий" },
          formulas: { range: [5000, 12000], label: "формулы и расчёт" },
          gameMechanic: { range: [10000, 20000], label: "игровая механика" },
          brandStyle: { range: [5000, 8000], label: "оформление в стиле бренда" },
          illustratedStyle: { range: [8000, 12000], label: "иллюстрации и анимация" },
          premiumStyle: { range: [12000, 15000], label: "индивидуальная арт-подача" },
          basicContact: { range: [2000, 5000], label: "Telegram или email" },
          externalSystem: { range: [7000, 15000], label: "CRM или внешняя система" },
          embed: { range: [3000, 7000], label: "встраивание на сайт" }
        }
      },
      en: {
        locale: "en-US",
        currency: "USD",
        base: [300, 380],
        modifiers: {
          branches: { range: [90, 170], label: "branching flow" },
          formulas: { range: [90, 200], label: "formulas and calculations" },
          gameMechanic: { range: [180, 350], label: "game mechanic" },
          brandStyle: { range: [90, 140], label: "brand-matched design" },
          illustratedStyle: { range: [140, 220], label: "illustration and animation" },
          premiumStyle: { range: [200, 280], label: "custom art direction" },
          basicContact: { range: [35, 80], label: "Telegram or email" },
          externalSystem: { range: [130, 280], label: "CRM or external system" },
          embed: { range: [50, 120], label: "website embedding" }
        }
      }
    },

    timelineModifiers: {
      branches: [2, 4],
      formulas: [3, 5],
      gameMechanic: [0, 0],
      brandStyle: [1, 2],
      illustratedStyle: [3, 7],
      premiumStyle: [4, 8],
      basicContact: [1, 2],
      externalSystem: [3, 6],
      embed: [1, 2]
    }
  };
}());
