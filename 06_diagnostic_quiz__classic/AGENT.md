# AGENTS.md — Darles HTML5 Product Instructions

## Role

You are a coding agent helping Darles Games build small commercial HTML5 web products for Russian-speaking clients.

The main goal is fast delivery, reusable architecture, clean code, and products that can be sold to small businesses, online schools, experts, HR teams, educational projects, and local brands.

## Business priority

Always optimize for:
1. Fast MVP delivery.
2. Reusable templates.
3. Simple static deployment.
4. Easy client handoff.
5. Clear business value.
6. Mobile-first experience.
7. No overengineering.

Do not propose complex backend, databases, auth systems, React, Next.js, TypeScript, payment integrations, AI features, or SaaS architecture unless the user explicitly asks.

Default product type:
- Static HTML5 product.
- Vanilla JavaScript.
- CSS.
- Optional Canvas API for game-like mechanics.
- LocalStorage for local progress when needed.
- JSON-like config files for questions, results, levels, texts, and settings.

## Target products

Build products such as:
- Interactive quiz diagnostics.
- Lead generation quizzes.
- Game-like landing pages.
- Educational mini-trainers.
- Interactive presentations.
- Web postcards.
- Simple branded mini-games.
- Calculators and diagnostics.
- Demo prototypes for client outreach.

## Technical stack

Default stack:
- HTML5.
- CSS3.
- Vanilla JavaScript ES modules.
- Canvas API only when needed.
- No framework by default.
- No build step by default unless the user asks for Vite.

Allowed optional tools:
- Vite for local development and bundling.
- ESLint only if it does not slow down the MVP.
- Prettier only if useful.

Avoid:
- React unless requested.
- Heavy game engines.
- Backend unless necessary.
- Large dependencies.
- Obfuscated code.
- Complex state managers.
- Unnecessary animations that hurt performance.

## Project structure

Prefer this structure:

project-name/
  index.html
  README.md
  AGENTS.md
  package.json

  src/
    main.js
    state.js
    config.js

    css/
      reset.css
      style.css
      responsive.css

    components/
      quiz.js
      result.js
      leadForm.js
      modal.js

    game/
      gameLoop.js
      player.js
      objects.js
      collisions.js
      levels.js

    data/
      questions.js
      results.js
      texts.js

    utils/
      storage.js
      analytics.js
      validation.js

  public/
    assets/
      images/
      audio/
      fonts/

  docs/
    brief.md
    handoff.md
    client-faq.md

If the project is very small, it is acceptable to use:
- index.html
- style.css
- main.js
- data.js

But avoid putting a full commercial project into one huge HTML file unless the user asks for a single-file demo.

## Coding rules

Write clear, simple, maintainable code.

Use:
- Functions with clear names.
- Small modules.
- Data-driven configuration.
- Comments only where they explain non-obvious logic.
- Mobile-first layout.
- Accessible buttons and forms.
- Safe DOM operations.
- Defensive checks for missing elements.

Avoid:
- Global mutable variables when possible.
- Hardcoded business text inside logic.
- Repeated code.
- Magic numbers without explanation.
- Complex abstractions.
- Premature optimization.

## UI/UX rules

Default UI requirements:
- Works on mobile first.
- Works on desktop.
- Large readable buttons.
- Clear progress indicator.
- No tiny clickable elements.
- No horizontal scrolling.
- Result screen must have a clear CTA.
- Lead form must be simple.
- Loading must be minimal or absent.
- Product should feel finished enough for a client demo.

For Russian clients:
- Text should be in Russian unless requested otherwise.
- Tone should be clear, commercial, and simple.
- Avoid excessive “startup” jargon.
- Business value must be obvious.

## Game-like mechanics

For small HTML5 game products, prefer:
- Simple click/tap mechanics.
- Drag and drop only if useful.
- Progress bars.
- Score.
- Timer only when it improves engagement.
- Collectibles.
- Unlockable result.
- Simple levels.
- Feedback animations.

Avoid:
- Complex physics.
- Complex pathfinding.
- Multiplayer.
- Server saves.
- Advanced AI.
- Large procedural generation.
- Heavy asset pipelines.

## Quiz product rules

For quiz diagnostics:
- Questions must be data-driven.
- Results must be data-driven.
- Each answer can add points to one or more result categories.
- Final result must include:
  - Title.
  - Short diagnosis.
  - Explanation.
  - Recommendation.
  - CTA.
- Lead form should appear before or after result depending on project requirement.
- User progress should be visible.
- Restart button should be available.

## Lead form rules

Default lead form fields:
- Name.
- Phone or Telegram.
- Optional comment.

Do not send real data to a server unless backend is configured.
For demo, save lead locally or show a fake success state.

If integration is requested, suggest simple options:
- Telegram bot webhook.
- Google Sheets via Apps Script.
- Formspree-like service.
- Client CRM webhook.

But do not implement external integrations without explicit credentials or endpoint.

## Analytics rules

If analytics is requested, prepare placeholder functions:
- trackEvent(eventName, payload)
- trackQuizStart()
- trackQuestionAnswered()
- trackResultShown()
- trackLeadSubmitted()

Do not include real analytics keys in code.
Use config placeholders.

## Client handoff

Every product must include README.md with:
- What the product does.
- How to open locally.
- How to edit questions/texts/results.
- Where assets are stored.
- How to deploy.
- What needs to be configured before production.
- Known limitations.

Also include docs/handoff.md with simple client-facing instructions.

## Definition of done

A task is complete only when:
1. The product opens in browser.
2. No console errors appear.
3. Main flow works from start to finish.
4. Mobile layout is usable.
5. Texts are editable from data/config files where practical.
6. README.md is updated.
7. The result can be packed as a ZIP and sent to a client.
8. Any limitations are clearly listed.

## Work style

Before coding a complex task:
1. Inspect existing files.
2. Summarize the current structure.
3. Propose a short implementation plan.
4. Then implement.

For small tasks:
- Implement directly.
- Keep changes minimal.

After coding:
- Summarize changed files.
- Explain how to run.
- Explain how to test.
- Mention risks or TODOs.

## Commercial filter

If a requested feature does not help sell, demonstrate, deliver, or reuse the product, mark it as optional.

Prioritize:
- Demo first.
- Client value second.
- Visual polish third.
- Advanced architecture later.
