# PROJECT BRIEF — Darles Games Interactive Web Product Library

## 1. Product

Create one public catalog repository for small interactive Darles Games HTML5 products:

```text
darles-interactive-web-products
```

The repository serves as both a public demo library and a stable source of links for the main Darles Games website. Simple quizzes, forms, greetings, and promo mini-games do not require separate repositories.

## 2. Adding products

A finished demo folder is copied into the repository root. Codex then checks the folder, adds catalog metadata, creates the card, verifies local and GitHub Pages compatibility, and leaves the internal mechanics unchanged unless explicitly requested.

Folders are not renamed automatically, even when their names contain a typo or unconventional formatting.

## 3. Current categories

### Quizzes and solution finders

Interactive products that ask questions, analyze answers, and return a recommendation, result, or estimate.

### Promo mini-games

Short game mechanics for discounts, promo codes, bonuses, campaigns, and audience engagement.

### Greetings and invitations

Interactive cards, greetings, invitations, and event pages.

Future categories should be added only when a real product exists. Possible additions include forms, calculators, interactive presentations, training tests, and branded mini-games.

## 4. Initial library

| # | Catalog title | Folder | Category |
|---:|---|---|---|
| 1 | Web solution quiz — version 1 | `00_interactive-web-solution-quiz-v1.0` | Quizzes and solution finders |
| 2 | Web solution quiz — version 2 | `01_interactive-web-solution-quiz-v2.0` | Quizzes and solution finders |
| 3 | Classic web product quiz | `02_standart_quiz__diagnostic` | Quizzes and solution finders |
| 4 | Magic web product quiz | `03_magic_quiz_diagnostic` | Quizzes and solution finders |
| 5 | Catch the discount! | `04_catch_discount` | Promo mini-games |
| 6 | Wedding greeting | `05_creeting_cards` | Greetings and invitations |

Folder names are preserved. Any rename requires a separate task and a complete link audit.

## 5. Architecture

```text
/
├── index.html
├── README.md
├── AGENTS.md
├── .nojekyll
├── catalog/
│   ├── catalog.css
│   ├── catalog.js
│   └── products.json
└── <standalone product folders>/
```

The catalog uses HTML5, CSS, JavaScript, and JSON. It has no npm dependency or build process.

## 6. Catalog page

The main page contains the Darles Games identity, library title, category filters, product cards, status labels, demo links, a Russian/English language switcher, and a rights notice. Demo links open in a new tab.

Search, accounts, payments, backend services, a CMS, an admin panel, automatic folder scanning, and a dynamic GitHub API are outside the first release.

## 7. Design

The catalog may use restrained Darles Games magic styling. It must remain modern, clean, readable, high-contrast, responsive from 360 px, and accessible with mouse, touch, and keyboard. Products remain visually independent.

## 8. Local development

Run from the repository root:

```powershell
py -m http.server 8080
```

Open:

```text
http://localhost:8080/
```

## 9. GitHub Pages

The planned URL is:

```text
https://darlesgames.github.io/darles-interactive-web-products/
```

All internal links must be relative so the site works from the repository subdirectory.

## 10. Public content

Demo versions, test copy, catalog assets, documentation, and estimated results may be public. Client data, contact databases, user submissions, credentials, private commercial documents, restricted core code, and materials that cannot be republished must remain private.

## 11. Rights

The repository does not use an open-source license.

```text
© 2026 Alexey Spirin. Published under the Darles Games brand.
All rights reserved.
```

Public visibility permits inspection of the implementation but does not grant resale or commercial-use rights. Third-party components retain their own licenses.

## 12. Release criteria

The first release is ready when the catalog works through a local HTTP server, displays all six products in three categories, all direct URLs open without critical errors, the interface works on mobile, links are subdirectory-safe, the repository can be published without a build step, public documentation is complete, and product logic remains intact except for documented compatibility and localization changes.
