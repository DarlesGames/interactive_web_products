export function nextHints(story,shown,total,manual=false) {
  const unseen=story.hints.filter(hint=>!shown.includes(hint.id));
  return (manual?unseen.slice(0,1):unseen.filter(hint=>hint.threshold<=total)).map(hint=>hint.id);
}
