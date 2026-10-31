import { answerKnownFact } from './storyEngine.js';
import { normalize } from './normalize.js';

export function buildPracticeQuestion(goal,choices=[]) {
  if(!goal?.parts?.length)return '';
  const chunks=goal.parts.map((part,index)=>part.options.includes(choices[index])?choices[index]:part.options[0]);
  return chunks.join(' ').replace(/\s+([?!.])/gu,'$1')+(goal.punctuation ?? '?');
}

// The coach proposes language practice, never decides truth or opens a fact.
// Return a whitelist of public teaching copy, without replies or secret IDs.
export function conversationCoach({story,state,witnessId}) {
  const goals=story.dialogue.learning?.goals || [];
  const discovered=new Set(state.discoveredFacts || []);
  const canPractice=(goal,id)=>goal.witnessIds.includes(id)&&!discovered.has(goal.factId)&&answerKnownFact({factId:goal.factId,witnessId:id,story,state}).understood;
  const pending=state.context?.dialogue?.pending;
  const pendingWords=pending?normalize(pending.text,{witnessId}).tokens:[];
  const offeredTopic=story.dialogue.topics.find(t=>t.id===state.context?.dialogue?.offer?.topicId);
  const priority=goal=>pendingWords.includes(story.facts.find(f=>f.id===goal.factId)?.predicate)?2:offeredTopic?.factIds.includes(goal.factId)?1:0;
  const visible=goals.filter(goal=>canPractice(goal,witnessId)).sort((a,b)=>priority(b)-priority(a));
  const clean=goal=>({id:goal.id,title:goal.title,task:goal.task,tip:goal.tip,starter:goal.starter,parts:goal.parts.map(part=>({label:part.label,options:[...part.options]})),punctuation:goal.punctuation ?? '?'});
  const repair=!!state.context?.dialogue?.pending?'missing':['NO_MATCH','NO_FACT','AMBIGUOUS','CLARIFY'].includes(state.context?.dialogue?.lastReason)?'unclear':null;
  const nextWitnesses=story.characters.filter(c=>c.id!==witnessId).map(c=>({id:c.id,name:c.name,role:c.role,goal:goals.find(goal=>canPractice(goal,c.id))})).filter(c=>c.goal).map(({id,name,role,goal})=>({id,name,role,task:goal.task}));
  return {goals:visible.map(clean),repair,repairText:repair==='missing'?'Свидетель просит уточнить вопрос. Назови человека или предмет целиком. Например, вместо «его» — «компьютер».':repair?'Попробуй задать один короткий вопрос. Можно собрать его ниже, изменить и отправить самому.':'Сначала реши, что хочешь узнать. Затем составь вопрос или задай его своими словами.',nextWitnesses:visible.length?[]:nextWitnesses.slice(0,3),complete:!visible.length&&!nextWitnesses.length};
}
