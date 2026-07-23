# Catch the Discount — Commercial HTML5 Template

An adaptive HTML5 Canvas promo game. The player controls a wizard, catches bonuses, reaches the target score, and receives a promo code.

The template suits shops, online courses, cafés, delivery services, salons, marketplaces, giveaways, and seasonal campaigns.

## Features

- No npm packages, build process, or external libraries.
- Mouse, touch, and keyboard controls.
- Start, game, victory, and defeat screens.
- Web Audio API sound without audio files.
- Russian and English localization through `?lang=ru|en`.
- Client settings in the `CONFIG` object in `main.js`.

## Running locally

Open `index.html` in a modern browser or serve the parent repository through a static HTTP server.

## Configuration

Change the promo code, target score, and attempts in `main.js`:

```js
promoCode: "MAGIC10",
targetScore: 100,
startingLives: 3,
```

Localized interface copy is stored in `LOCALIZATION`. Colors are defined in `CONFIG.colors`; item values, colors, speed, and spawn weights are in `CONFIG.items`.

## Files

- `index.html` — semantic screen, HUD, and button markup.
- `style.css` — responsive layout and animation.
- `main.js` — localization, configuration, game loop, Canvas graphics, controls, effects, and sound.

The logical scene is 360×640 and scales to the available screen size.
