# HTML5 Quiz Client Handoff

## Purpose

This is a static diagnostic quiz. A visitor answers questions, receives a suitable result, and can open a Google Form to submit a request.

## Quick start

1. Open the product folder.
2. Start a local server:

```bash
python -m http.server 5173
```

3. Open `http://localhost:5173` in a browser.

## Content that can be edited without a developer

- Russian questions and options: `src/data/questions.js`
- Russian results: `src/data/results.js`
- Russian button, form, and start-screen copy: `src/data/texts.js`
- English localization: `src/data/localization.en.js`
- Colors and appearance: `src/css/style.css`
- Header contact links: `index.html`

## Adapting the quiz for a client

1. Update the start-screen title and description.
2. Replace the questions.
3. Make sure score categories match the result keys.
4. Update the result copy.
5. Complete the quiz several times and confirm that the outcomes make sense in both languages.

## Request form

The final button uses `texts.form.submitButton`. The Google Form URL is stored in `texts.form.formUrl`. When the URL is empty, fallback Telegram, email, and VK contacts are displayed.

## Pre-publication checklist

- The full flow works from start to result.
- Both `?lang=ru` and `?lang=en` show the correct language.
- Mobile screens have no horizontal overflow.
- The request button opens the correct Google Form.
- A privacy policy is available if the form collects real personal data.
