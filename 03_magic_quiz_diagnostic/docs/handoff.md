# Magic HTML5 Quiz Client Handoff

## Purpose

This is a static diagnostic quiz with a magical Darles Games presentation. A visitor answers questions, receives a suitable result, and can open a Google Form to submit a request.

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
- Russian interface copy: `src/data/texts.js`
- English localization: `src/data/localization.en.js`
- Magic guide component: `src/components/magicGuide.js`
- Colors and appearance: `src/css/style.css`
- Header contact links: `index.html`

## Adapting the quiz for a client

Update the start copy, questions, result copy, and score categories. Complete the quiz several times in Russian and English and confirm that the recommendations remain logical.

## Request form

The final button uses `texts.form.submitButton`. The Google Form URL is stored in `texts.form.formUrl`. Configure real contact and privacy information before production use.

## Pre-publication checklist

- The full flow works from start to result.
- Both `?lang=ru` and `?lang=en` show the correct language.
- Mobile screens have no horizontal overflow.
- The request button opens the correct Google Form.
- A privacy policy is available if the form collects real personal data.
