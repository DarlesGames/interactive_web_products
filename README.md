# Darles Games — Interactive Web Products

A public library of standalone HTML5 demos: quizzes, solution finders, promo mini-games, interactive greetings, invitations, and training simulators.

## Product catalog

- [Web solution quiz — version 1](https://darlesgames.github.io/interactive_web_products/00_interactive-web-solution-quiz-v1.0/) — the first demo of a quiz that helps identify the right web product format.

- [Web solution quiz — version 2](https://darlesgames.github.io/interactive_web_products/01_interactive-web-solution-quiz-v2.0/) — an updated solution finder with several visual themes, timeline and price estimates, and a personalized recommendation.

- [Classic web product quiz](https://darlesgames.github.io/interactive_web_products/02_standart_quiz__diagnostic/) — a classic diagnostic quiz that helps select a suitable interactive product format.

- [Magic web product quiz](https://darlesgames.github.io/interactive_web_products/03_magic_quiz_diagnostic/) — a magical variation of the diagnostic quiz presented in the Darles Games style.

- [Catch the discount!](https://darlesgames.github.io/interactive_web_products/04_catch_discount/) — a short promo mini-game for earning a discount, promo code, bonus, or another reward.

- [Wedding greeting](https://darlesgames.github.io/interactive_web_products/05_creeting_cards/) — an interactive wedding greeting with wishes, sound, animation, and personalized content.

- [Classic diagnostic quiz](https://darlesgames.github.io/interactive_web_products/06_diagnostic_quiz__classic/) — seven questions to choose an interactive test for a business, a personalized recommendation, and an inquiry through Google Forms.

- [Interactive training simulator](https://darlesgames.github.io/interactive_web_products/07_interactive_training_simulator/) — an Ares Frontier negotiation simulator with client dialogue, choices and consequences, a darts mini-game, and a skills debrief.

Open the [complete Darles Games product catalog](https://darlesgames.github.io/interactive_web_products/) to browse and filter all demos.

## Languages

The catalog and the original six products (folders `00`–`05`) support Russian and English. The selected language is stored in `localStorage` under `darlesLanguage` and passed to demos through `?lang=ru` or `?lang=en`. The classic diagnostic quiz (`06`) and interactive training simulator (`07`) currently run in Russian; their catalog cards are available in both languages.

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
├── 05_creeting_cards/
├── 06_diagnostic_quiz__classic/
└── 07_interactive_training_simulator/
```

Every product remains standalone and does not depend on files from another product folder. The catalog requires no npm packages, build process, backend, or external framework.

Products are grouped into quizzes and solution finders, promo mini-games, greetings and invitations, and learning and training simulators. Card titles, descriptions, categories, and links are configured in `catalog/products.json`.

## Local development

Run this command from the repository root:

```powershell
py -m http.server 8080
```

Open [the local catalog](http://localhost:8080/). Each demo also opens directly at `http://localhost:8080/<folder-name>/`. Use HTTP for the catalog's JSON loading and the products' ES modules.

## GitHub Pages

In the repository's **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/ (root)**, then save. These are the current publication settings for this repository.

The catalog is published at [darlesgames.github.io/interactive_web_products](https://darlesgames.github.io/interactive_web_products/). Each demo is published at the same base URL followed by its unchanged folder name. Add a new product folder with `index.html` and a matching entry in `catalog/products.json`, then push to `main` to publish it.


## Darles Games Attribution License

You are free to use, copy, modify, and share materials from this repository. Attribution to Darles Games is appreciated but not required.

Third-party libraries, fonts, images, and other components remain subject to their own licenses and notices.

The materials are provided “as is”, without warranty.
