# Darles Games — Interactive Web Products

A public library of standalone bilingual HTML5 demos: quizzes, solution finders, promo mini-games, interactive greetings, and invitations.

## Product catalog

- [Web solution quiz — version 1](https://darlesgames.github.io/darles-interactive-web-products/00_interactive-web-solution-quiz-v1.0/) — the first demo of a quiz that helps identify the right web product format.

- [Web solution quiz — version 2](https://darlesgames.github.io/darles-interactive-web-products/01_interactive-web-solution-quiz-v2.0/) — an updated solution finder with several visual themes, timeline and price estimates, and a personalized recommendation.

- [Classic web product quiz](https://darlesgames.github.io/darles-interactive-web-products/02_standart_quiz__diagnostic/) — a classic diagnostic quiz that helps select a suitable interactive product format.

- [Magic web product quiz](https://darlesgames.github.io/darles-interactive-web-products/03_magic_quiz_diagnostic/) — a magical variation of the diagnostic quiz presented in the Darles Games style.

- [Catch the discount!](https://darlesgames.github.io/darles-interactive-web-products/04_catch_discount/) — a short promo mini-game for earning a discount, promo code, bonus, or another reward.

- [Wedding greeting](https://darlesgames.github.io/darles-interactive-web-products/05_creeting_cards/) — an interactive wedding greeting with wishes, sound, animation, and personalized content.

Open the [complete Darles Games product catalog](https://darlesgames.github.io/darles-interactive-web-products/) to browse and filter all demos.

## Languages

The catalog and every product support Russian and English. The selected language is stored in `localStorage` under `darlesLanguage` and passed to demos through `?lang=ru` or `?lang=en`.

## Repository structure

```text
/
├── index.html
├── catalog/
│   ├── catalog.css
│   ├── catalog.js
│   └── products.json
├── 00_interactive-web-solution-quiz-v1.0/
├── 01_interactive-web-solution-quiz-v2.0/
├── 02_standart_quiz__diagnostic/
├── 03_magic_quiz_diagnostic/
├── 04_catch_discount/
└── 05_creeting_cards/
```

Every product remains standalone and does not depend on files from another product folder. The catalog requires no npm packages, build process, backend, or external framework.


## Darles Games Attribution License

You are free to use, copy, modify, and share materials from this repository. Attribution to Darles Games is appreciated but not required.

Third-party libraries, fonts, images, and other components remain subject to their own licenses and notices.

The materials are provided “as is”, without warranty.