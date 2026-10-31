import { answerKnownFact } from './storyEngine.js';
import { equivalentQuestion } from './questionMeaning.js';

// Authored routes also accept conservative grammatical equivalence. All routes
// retain the same knowledge/evidence gate; claims never supply evidence.
const clean=text=>String(text).toLowerCase().replaceAll('ё','е').replace(/[?!.,:;«»]/gu,' ').replace(/\s+/gu,' ').trim();
const service=(reason,reply)=>({status:'UNKNOWN',reason,reply,understood:false,factId:null,category:null,service:true,parsed:{intent:'conversation',confidence:'low',unresolvedSlots:[],candidates:[]}});

export function investigationTurn({text,witnessId,story,state}) {
  const value=clean(text);
  const config=story.dialogue.investigation;
  if(!config)return null;
  const follow=state.context?.dialogue?.lastFactId;
  const intent=['почему','почему так','объясни','объясните','что это значит','как это связано'].includes(value)?'explain':['а потом','что было дальше','и дальше'].includes(value)?'next':null;
  const nextFactId=intent&&config.followUps?.[follow]?.[witnessId]?.[intent];
  if(nextFactId){
    const fact=story.facts.find(f=>f.id===nextFactId);
    if(fact)return answerKnownFact({factId:fact.id,witnessId,story,state,parsed:{intent:'why',confidence:'high',factId:fact.id,subject:fact.subject,predicate:fact.predicate,object:fact.object,negated:false}});
  }
  if(['что мы знаем','какие есть улики','подведи итог','что уже известно'].includes(value)) {
    const lines=(state.transcript || []).filter(line=>line.role==='npc'&&line.factId);
    const unique=[...new Map(lines.map(line=>[line.factId,line])).values()].slice(-4);
    return service('RECAP',unique.length?unique.map(line=>`${story.characters.find(c=>c.id===line.witnessId).name}: «${line.text}»`).join(' '):'Пока у нас только то, что нашли утром. Начнём с вопросов свидетелям.');
  }
  for(const [intent,phrases] of Object.entries(config.reactions || {})) {
    if(phrases.includes(value))return service('REACTION',config.voices[witnessId][intent]);
  }
  const matches=(config.queries || []).filter(q=>q.witnessId===witnessId&&(q.phrases.some(p=>clean(p)===value)||equivalentQuestion(text,q.phrases,witnessId)));
  const ids=[...new Set(matches.map(q=>q.factId))];
  if(ids.length!==1)return null;
  const fact=story.facts.find(f=>f.id===ids[0]);
  if(!fact)return null;
  return answerKnownFact({factId:fact.id,witnessId,story,state,parsed:{intent:'what',confidence:'high',factId:fact.id,subject:fact.subject,predicate:fact.predicate,object:fact.object,negated:false}});
}

export function investigationLead(story,state,witnessId) {
  return story.dialogue.investigation?.leads?.find(lead=>lead.witnessId===witnessId&&lead.requires.every(id=>(state.discoveredFacts || []).includes(id))&&!(state.discoveredFacts || []).includes(lead.until));
}
