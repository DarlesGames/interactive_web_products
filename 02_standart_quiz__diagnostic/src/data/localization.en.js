export const questionsEn = [
  {
    id: "project-type",
    title: "What do you want to promote?",
    hint: "Choose the option that best matches your work.",
    options: [
      { id: "online-school", label: "An online school, course, or training", scores: { warmup: 2, diagnostic: 1 } },
      { id: "expert", label: "Consulting or expert services", scores: { consult: 2, diagnostic: 1 } },
      { id: "kids-center", label: "A children’s center, studio, or club", scores: { selection: 2, consult: 1 } },
      { id: "local-business", label: "A local small business or service", scores: { consult: 2, selection: 1 } },
    ],
  },
  {
    id: "client-doubt",
    title: "What most often stops someone from submitting a request?",
    hint: "This answer helps identify which interactive quiz would be most useful.",
    options: [
      { id: "fit", label: "They do not know whether the product or service fits them", scores: { diagnostic: 2 } },
      { id: "choice", label: "They cannot choose a course, service, plan, or direction", scores: { selection: 2 } },
      { id: "trust", label: "They need more examples, value, and explanation before they trust it", scores: { warmup: 2 } },
      { id: "talk", label: "They want to ask a real person a quick question", scores: { consult: 2 } },
    ],
  },
  {
    id: "average-check",
    title: "How much does your product or service usually cost?",
    hint: "The higher the price, the more important it is to explain the value and next step in advance.",
    options: [
      { id: "low", label: "Up to $100", scores: { selection: 1, warmup: 1 } },
      { id: "middle", label: "$100–$500", scores: { diagnostic: 2 } },
      { id: "high", label: "$500–$1,500", scores: { consult: 2, warmup: 1 } },
      { id: "premium", label: "More than $1,500", scores: { consult: 2, diagnostic: 1 } },
    ],
  },
  {
    id: "traffic-source",
    title: "Where will people usually enter this quiz from?",
    hint: "The traffic source affects the question length and final offer.",
    options: [
      { id: "ads", label: "Advertising, a website, or a landing page", scores: { selection: 2 } },
      { id: "social", label: "Social media, a blog, or direct messages", scores: { warmup: 2 } },
      { id: "database", label: "An email list, student base, or subscriber list", scores: { diagnostic: 2 } },
      { id: "offline", label: "An offline location, QR code, or local community", scores: { consult: 2 } },
    ],
  },
  {
    id: "lead-goal",
    title: "What do you want to receive after someone completes the quiz?",
    hint: "Choose the main business outcome.",
    options: [
      { id: "phone", label: "Their contact details for a quick conversation", scores: { consult: 2 } },
      { id: "program", label: "Clarity on which product or service to offer", scores: { selection: 2 } },
      { id: "segment", label: "Insight into their task, interest, and purchase readiness", scores: { diagnostic: 2 } },
      { id: "warm", label: "A reason to share useful material and continue the conversation", scores: { warmup: 2 } },
    ],
  },
  {
    id: "result-depth",
    title: "What result should someone see at the end?",
    hint: "The result should be useful without replacing your sales process or consultation.",
    options: [
      { id: "short", label: "A short selection of two or three clear options", scores: { selection: 2 } },
      { id: "diagnosis", label: "An explanation of the situation and main problem", scores: { diagnostic: 2 } },
      { id: "plan", label: "A short action plan and invitation to a consultation", scores: { consult: 2 } },
      { id: "content", label: "A useful tip and an offer to receive the next part", scores: { warmup: 2 } },
    ],
  },
  {
    id: "main-risk",
    title: "Which problem do you want to solve first?",
    hint: "This answer helps shape the final screen and request button.",
    options: [
      { id: "few-leads", label: "There are too few leads and we need to test interest faster", scores: { selection: 1, consult: 1 } },
      { id: "cold-leads", label: "We get leads, but people are often not ready to buy", scores: { diagnostic: 2 } },
      { id: "long-explain", label: "Explaining the value of the product or service takes too long", scores: { warmup: 2 } },
      { id: "unclear-offer", label: "There is no clear first step for submitting a request", scores: { consult: 1, diagnostic: 1 } },
    ],
  },
];

export const resultsEn = {
  diagnostic: {
    badge: "Customer insight",
    title: "An interactive quiz with a clear result",
    short: "People need to understand their situation and see why your solution may fit.",
    explanation: "This format reveals a person’s task, level of interest, and main concern before the first conversation. You can begin with their specific situation instead of starting from zero.",
    recommendation: "Create three or four result types, such as choosing a direction, building trust, needing a consultation, or being ready to submit a request. End with an invitation to leave contact details for a short review.",
    steps: [
      "Describe your main customer types in plain language.",
      "Prepare questions about goals, timing, and the person’s main concern.",
      "Connect every result to a clear next step: a request, consultation, or solution selection.",
    ],
  },
  selection: {
    badge: "Quick selection",
    title: "An interactive product or service finder",
    short: "A person needs to quickly understand which course, service, program, or plan fits.",
    explanation: "A finder works well when you offer several courses, children’s activities, services, packages, plans, or programs. Instead of comparing everything manually, people answer a few questions and receive a clear recommendation.",
    recommendation: "Keep questions short, show the result immediately, and guide people toward requesting details, booking, or reserving a place.",
    steps: [
      "Divide your products or services into clear groups.",
      "Keep only the questions that truly affect the recommendation.",
      "Add a contact button for Telegram, phone, a request form, or VK.",
    ],
  },
  warmup: {
    badge: "Trust before conversion",
    title: "An interactive quiz with a useful result",
    short: "Before submitting a request, people need more value, confidence, and clarity.",
    explanation: "This format suits experts, online schools, and higher-priced programs where decisions are rarely immediate. The visitor receives a useful insight and you gain a reason to continue the conversation.",
    recommendation: "Give the visitor a simple result, demonstrate your expertise, and invite them to leave contact details for material, a consultation, or a personal review.",
    steps: [
      "Choose one clear topic for the quiz.",
      "Create a result that helps people recognize their situation.",
      "Prepare the next step after the request: material, a consultation, or a personal reply.",
    ],
  },
  consult: {
    badge: "Quick request",
    title: "An interactive consultation request quiz",
    short: "A person needs to describe their task quickly and receive an answer without a long journey through the website.",
    explanation: "This format removes unnecessary steps: the visitor answers a few practical questions and you receive a request with a clear task description.",
    recommendation: "Limit the flow to six or seven questions, ask only what matters, and provide a prominent contact button.",
    steps: [
      "Keep only questions that will help in the first conversation.",
      "Keep the form short: name, contact, and one comment.",
      "Prepare a quick response through Telegram, email, or a phone call.",
    ],
  },
};

export const textsEn = {
  start: {
    eyebrow: "Interactive lead-generation quiz",
    title: "Find the right interactive quiz for your project",
    lead: "Answer seven simple questions and receive a clear quiz format for an online school, expert, children’s center, or small business.",
    facts: ["7 questions", "2 minutes", "Instant result"],
    startButton: "Start quiz",
  },
  quiz: {
    questionLabel: "Question",
    of: "of",
    next: "Next",
    finish: "Show result",
    restart: "Start over",
    chooseHint: "Choose an option to continue.",
  },
  result: {
    headingPrefix: "Recommended format",
    diagnosisTitle: "What this means",
    recommendationTitle: "What you can do",
    nextStepsTitle: "First steps",
    restart: "Take the quiz again",
  },
  form: {
    title: "Submit a request",
    text: "Use the button to open the Google Form in a new tab.",
    submitButton: "Submit a request",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeIUB4QACw3EOvcY1AJ79UBZ7UFQlgWRh0XOFYC7BoT3Adn4w/viewform?usp=header",
    openNote: "The form opens in a new tab.",
    contactNotice: "After you submit the form, I will contact you using the details provided.\nTelegram: https://t.me/ProgrammerLeks\nVK: https://vk.ru/darlesgames\nEmail: darlesgames@yandex.ru",
    fallbackTitle: "Alternative contacts",
    emailLabel: "Email",
    telegram: "https://t.me/ProgrammerLeks",
    email: "darlesgames@yandex.ru",
    vk: "https://vk.ru/darlesgames",
  },
  page: {
    title: "Diagnostic quiz",
    description: "An HTML5 diagnostic and lead-generation quiz.",
    headerAria: "Product header",
    contactsAria: "Developer contacts",
    brandAria: "Darles Games",
    footer: "After viewing the result, you can open the request form or contact the developer.",
    introAria: "Quiz introduction",
    resultAria: "Quiz result",
    messageAria: "Message",
  },
};
