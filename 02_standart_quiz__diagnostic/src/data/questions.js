export const questions = [
  {
    id: "project-type",
    title: "Что вы хотите продвигать?",
    hint: "Выберите вариант, который ближе всего к вашей деятельности.",
    options: [
      {
        id: "online-school",
        label: "Онлайн-школа, курс или обучение",
        scores: { warmup: 2, diagnostic: 1 },
      },
      {
        id: "expert",
        label: "Консультации или услуги эксперта",
        scores: { consult: 2, diagnostic: 1 },
      },
      {
        id: "kids-center",
        label: "Детский центр, студия или кружки",
        scores: { selection: 2, consult: 1 },
      },
      {
        id: "local-business",
        label: "Малый бизнес или услуги в городе",
        scores: { consult: 2, selection: 1 },
      },
    ],
  },
  {
    id: "client-doubt",
    title: "Что чаще всего мешает человеку оставить заявку?",
    hint: "Этот ответ поможет выбрать, какой интерактивный тест будет полезнее.",
    options: [
      {
        id: "fit",
        label: "Не понимает, подходит ли ему ваш продукт или услуга",
        scores: { diagnostic: 2 },
      },
      {
        id: "choice",
        label: "Не может выбрать курс, услугу, тариф или направление",
        scores: { selection: 2 },
      },
      {
        id: "trust",
        label: "Пока не доверяет и хочет больше примеров, пользы и объяснений",
        scores: { warmup: 2 },
      },
      {
        id: "talk",
        label: "Хочет быстро задать вопрос живому человеку",
        scores: { consult: 2 },
      },
    ],
  },
  {
    id: "average-check",
    title: "Сколько обычно стоит ваш продукт или услуга?",
    hint: "Чем выше цена, тем важнее заранее объяснить пользу и следующий шаг.",
    options: [
      {
        id: "low",
        label: "До 5 000 рублей",
        scores: { selection: 1, warmup: 1 },
      },
      {
        id: "middle",
        label: "От 5 000 до 30 000 рублей",
        scores: { diagnostic: 2 },
      },
      {
        id: "high",
        label: "От 30 000 до 100 000 рублей",
        scores: { consult: 2, warmup: 1 },
      },
      {
        id: "premium",
        label: "Больше 100 000 рублей",
        scores: { consult: 2, diagnostic: 1 },
      },
    ],
  },
  {
    id: "traffic-source",
    title: "Откуда люди чаще всего будут попадать в этот тест?",
    hint: "Источник переходов влияет на длину вопросов и финальное предложение.",
    options: [
      {
        id: "ads",
        label: "Из рекламы, сайта или посадочной страницы",
        scores: { selection: 2 },
      },
      {
        id: "social",
        label: "Из соцсетей, блога или личных сообщений",
        scores: { warmup: 2 },
      },
      {
        id: "database",
        label: "Из рассылки, базы учеников или подписчиков",
        scores: { diagnostic: 2 },
      },
      {
        id: "offline",
        label: "Из офлайн-точки, QR-кода или местного сообщества",
        scores: { consult: 2 },
      },
    ],
  },
  {
    id: "lead-goal",
    title: "Что вы хотите получить после прохождения теста?",
    hint: "Выберите главный результат для бизнеса.",
    options: [
      {
        id: "phone",
        label: "Контакт человека для быстрой связи",
        scores: { consult: 2 },
      },
      {
        id: "program",
        label: "Понимание, какой продукт или услугу ему предложить",
        scores: { selection: 2 },
      },
      {
        id: "segment",
        label: "Понимание задачи, интереса и готовности к покупке",
        scores: { diagnostic: 2 },
      },
      {
        id: "warm",
        label: "Повод отправить полезный материал и вернуться к разговору",
        scores: { warmup: 2 },
      },
    ],
  },
  {
    id: "result-depth",
    title: "Какой результат должен увидеть человек в конце?",
    hint: "Результат должен быть полезным, но не заменять вашу продажу или консультацию.",
    options: [
      {
        id: "short",
        label: "Короткий подбор из 2-3 понятных вариантов",
        scores: { selection: 2 },
      },
      {
        id: "diagnosis",
        label: "Объяснение ситуации и главной проблемы",
        scores: { diagnostic: 2 },
      },
      {
        id: "plan",
        label: "Краткий план действий и приглашение на консультацию",
        scores: { consult: 2 },
      },
      {
        id: "content",
        label: "Полезный совет и предложение получить продолжение",
        scores: { warmup: 2 },
      },
    ],
  },
  {
    id: "main-risk",
    title: "Какую проблему вы хотите решить в первую очередь?",
    hint: "Ответ поможет точнее сформулировать финальный экран и кнопку заявки.",
    options: [
      {
        id: "few-leads",
        label: "Заявок мало, нужно быстрее проверить интерес людей",
        scores: { selection: 1, consult: 1 },
      },
      {
        id: "cold-leads",
        label: "Заявки есть, но люди часто не готовы покупать",
        scores: { diagnostic: 2 },
      },
      {
        id: "long-explain",
        label: "Приходится долго объяснять ценность продукта или услуги",
        scores: { warmup: 2 },
      },
      {
        id: "unclear-offer",
        label: "Нет понятного первого шага для заявки",
        scores: { consult: 1, diagnostic: 1 },
      },
    ],
  },
];
