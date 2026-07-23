# HTML5 Diagnostic and Lead-Generation Quiz

A static diagnostic quiz for online schools, experts, courses, children’s centers, and small businesses. Visitors answer questions, receive a result, and can open a Google Form.

## Features

- Start, quiz, and result screens.
- Progress indicator and score-based results.
- Google Form request button and fallback contacts.
- Restart flow.
- Russian and English localization through `?lang=ru|en`.
- Separate data files for questions, results, and interface copy.

## Running locally

```bash
py -m http.server 5173
```

Open `http://localhost:5173`. ES modules require an HTTP server.

## Editing

- Russian questions: `src/data/questions.js`
- Russian results: `src/data/results.js`
- Russian interface copy and form URL: `src/data/texts.js`
- English localization: `src/data/localization.en.js`
- Layout and appearance: `src/css/`
- Header contacts: `index.html`

Score keys in questions must match result keys in `src/data/results.js`. If `texts.form.formUrl` is empty, fallback contacts are displayed.

## Deployment

Upload the complete product folder to any static host, including GitHub Pages, Netlify, Vercel, or a conventional FTP host.

## Limitations

There is no backend, analytics, spam protection, or built-in privacy-policy flow. A privacy policy is required when a production form collects personal data.
