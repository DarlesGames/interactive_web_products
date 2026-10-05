/* Pure negotiation state: hidden trust, competency evidence and replay reset. */
(function (T) {
  'use strict';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  class GameState {
    constructor() { this.reset(); }
    reset() {
      this.sceneId = 'intro';
      this.trust = 50;
      this.competency = { discovery: 0, value: 0, objections: 0, risk: 0, close: 0 };
      this.choices = [];
      this.challengeSelections = [];
      this.challengeDone = false;
      this.darts = { player: 0, client: 0, round: 0, visible: false, hits: [] };
    }
    choose(scene, choice) {
      if (this.choices.some(item => item.sceneId === scene.id)) return false;
      this.trust = clamp(this.trust + choice.trust, 0, 100);
      Object.entries(choice.skills).forEach(([key, points]) => { this.competency[key] += points; });
      this.choices.push({ sceneId: scene.id, choiceId: choice.id, text: choice.text });
      return true;
    }
    finishChallenge(ids) {
      if (this.challengeDone) return null;
      this.challengeDone = true;
      this.challengeSelections = [...new Set(ids)].filter(id => T.scenario.challenge.cards.some(card => card.id === id)).slice(0, 3);
      const good = this.challengeSelections.filter(id => T.scenario.challenge.cards.find(card => card.id === id).kind === 'good').length;
      this.trust = clamp(this.trust + [-8, -3, 6, 15][good], 0, 100);
      if (good === 3) { this.competency.value++; this.competency.risk++; }
      return good === 3 ? 'strong' : good === 2 ? 'medium' : 'weak';
    }
    outcome() { return this.trust >= 82 ? 'strong' : this.trust >= 55 ? 'medium' : 'weak'; }
    debrief() {
      return T.scenario.competencies.map(item => ({ ...item, good: this.competency[item.id] >= item.threshold }));
    }
    observations() {
      const results = this.debrief();
      const weaknesses = results.filter(item => !item.good);
      if (weaknesses.length >= 2) return weaknesses.slice(0, this.outcome() === 'weak' ? 3 : 2);
      return [...weaknesses, ...results.filter(item => item.good)].slice(0, 2);
    }
  }
  T.GameState = GameState;
  T.clamp = clamp;
})(window.Training);
