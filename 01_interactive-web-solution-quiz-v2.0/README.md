# PRODUCT-001 — Interactive Solution Finder

A static Darles Games prototype with no npm packages, backend, or database.

## Running locally

Open `index.html` in a browser or upload the folder to any static host.

## Features

- Eight questions with back navigation.
- Three themes: Darles Magic, Business, and Bright.
- Russian and English localization inherited through `?lang=ru|en`.
- RUB estimates for Russian and USD estimates for English.
- Recommendations across five product formats.
- A secondary recommendation when scores are close.
- Price, timeline, and budget-fit estimates.
- A prepared Telegram result message.
- Session progress storage.
- Mobile and `iframe` support.

## Before publishing

Set the public Telegram username in `config.js` without the `@` character:

```js
contacts: {
  telegramUsername: "your_username"
}
```

Questions, results, weights, timelines, prices, and localized interface copy are stored in `config.js`. Application logic is in `app.js`, and styles are in `styles.css`.
