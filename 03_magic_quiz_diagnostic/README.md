# Magic HTML5 Diagnostic Quiz

A magical Darles Games variation of the static diagnostic and lead-generation quiz. It supports online schools, experts, courses, children’s centers, and small businesses.

## Features

- Magic guide presentation.
- Progress indicator and score-based results.
- Google Form request button.
- Russian and English localization through `?lang=ru|en`.
- Standalone data and localization files.

## Running locally

```bash
py -m http.server 5173
```

Open `http://localhost:5173`. ES modules require an HTTP server.

## Editing

- Russian questions: `src/data/questions.js`
- Russian results: `src/data/results.js`
- Russian interface copy: `src/data/texts.js`
- English localization: `src/data/localization.en.js`
- Magic presentation: `src/components/magicGuide.js`
- Styles: `src/css/`

Keep score keys aligned between questions and results. Deploy the complete folder to any static host.

## Limitations

There is no backend, analytics, spam protection, or built-in privacy-policy flow. A privacy policy is required when a production form collects personal data.
