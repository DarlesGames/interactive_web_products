/* Pointer/keyboard darts and a small hidden negotiation influence. */
(function (T) {
  'use strict';
  const { clamp } = T;
  function radialScore(point) {
    const distance = Math.hypot(point.x, point.y);
    if (distance < 0.09) return 25;
    if (distance < 0.22) return 20;
    if (distance < 0.45) return Math.round(19 - (distance - 0.22) * 22);
    if (distance < 0.7) return Math.round(13 - (distance - 0.45) * 20);
    if (distance < 0.95) return Math.round(7 - (distance - 0.7) * 16);
    return distance < 1.05 ? 2 : 0;
  }
  function playerHit(aim, trust, random = Math.random) {
    const strength = clamp((trust - 50) / 50, 0, 1);
    const assist = T.config.assist;
    const pull = assist.maxPull * strength;
    const jitter = assist.maxJitter - (assist.maxJitter - assist.minJitter) * strength;
    const point = {
      x: clamp(aim.x * (1 - pull) + (random() - 0.5) * jitter, -1.15, 1.15),
      y: clamp(aim.y * (1 - pull) + (random() - 0.5) * jitter, -1.15, 1.15)
    };
    return { ...point, score: radialScore(point) };
  }
  function clientHit(trust, round, random = Math.random) {
    const range = trust < 35 ? [15, 23] : trust < 65 ? [10, 18] : trust < 82 ? [6, 14] : [3, 10];
    // Late strong negotiations distract Aristarkh; the first throw stays competitive.
    const max = trust >= 82 && round > 1 ? 5 : range[1];
    const score = range[0] + Math.floor(random() * (max - range[0] + 1));
    const radius = score >= 20 ? 0.15 : score >= 14 ? 0.32 : score >= 8 ? 0.57 : 0.82;
    const angle = random() * Math.PI * 2;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, score };
  }
  function matchScore(rawScore, trust, scoreboard, final = false) {
    // Negotiation subtly insures match points, never the physical hit coordinates.
    let score = trust >= T.config.assist.minimumTrust ? Math.max(rawScore, T.config.assist.minimumMatchScore) : rawScore;
    if (final && trust >= 82) score = Math.max(score, scoreboard.client - scoreboard.player + 1);
    return score;
  }
  function aimPoint(aim, time, reducedMotion = false) {
    if (reducedMotion) return { ...aim };
    const config = T.config.aim;
    const cycle = Math.PI * 2;
    return {
      x: clamp(aim.x + Math.sin(time * cycle / config.periodXMs) * config.amplitude + Math.sin(time * cycle / config.secondaryPeriodMs + 1.2) * config.secondaryAmplitude, -1.15, 1.15),
      y: clamp(aim.y + Math.cos(time * cycle / config.periodYMs) * config.amplitude + Math.sin(time * cycle / (config.secondaryPeriodMs * 1.17)) * config.secondaryAmplitude, -1.15, 1.15)
    };
  }
  class AimController {
    constructor(button, indicator, onThrow) {
      this.button = button;
      this.indicator = indicator;
      this.onThrow = onThrow;
      this.aim = { x: 0, y: 0 };
      this.active = true;
      this.listeners = [];
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.listen('pointermove', event => this.pointer(event));
      this.listen('pointerdown', event => this.pointer(event));
      this.listen('click', event => {
        if (!this.active) return;
        if (event.detail > 0) this.pointer(event);
        this.throw();
      });
      this.listen('keydown', event => {
        const directions = { ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0], ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1] };
        const direction = directions[event.key] || directions[event.key.toLowerCase()];
        if (direction) {
          event.preventDefault();
          this.aim.x = clamp(this.aim.x + direction[0] * 0.06, -1.1, 1.1);
          this.aim.y = clamp(this.aim.y + direction[1] * 0.06, -1.1, 1.1);
          this.paint(performance.now());
        } else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.throw(); }
      });
      this.tick = time => { if (this.active) { this.paint(time); this.frame = requestAnimationFrame(this.tick); } };
      this.frame = requestAnimationFrame(this.tick);
      this.button.focus({ preventScroll: true });
    }
    listen(type, callback) { this.button.addEventListener(type, callback); this.listeners.push([type, callback]); }
    pointer(event) {
      const bounds = this.button.getBoundingClientRect();
      this.aim.x = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1.15, 1.15);
      this.aim.y = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1.15, 1.15);
      this.paint(performance.now());
    }
    paint(time) {
      this.point = aimPoint(this.aim, time, this.reduced);
      this.indicator.style.left = `${50 + this.point.x * 50}%`;
      this.indicator.style.top = `${50 + this.point.y * 50}%`;
    }
    throw() {
      if (!this.active) return;
      if (!this.point) this.paint(performance.now());
      this.destroy();
      this.button.disabled = true;
      this.indicator.hidden = true;
      this.onThrow(this.point);
    }
    destroy() {
      this.active = false;
      cancelAnimationFrame(this.frame);
      this.listeners.forEach(([type, callback]) => this.button.removeEventListener(type, callback));
      this.listeners = [];
    }
  }
  T.darts = { radialScore, playerHit, clientHit, matchScore, aimPoint, AimController };
})(window.Training);
