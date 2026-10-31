import { personNames } from './normalize.js';
import { prepareQuestion } from './questionMeaning.js';

// A separate, conservative layer for a comprehensible relationship that has
// no exact fact mapping. This layer NEVER authorizes a factual YES/NO.
const actions=new Set(['was_in','sent','searched_for','saw','turned_on','turned_off','activated','worked_at','took','left','received','entered']);
const entities=new Set([...Object.keys(personNames),'computer_room_5','old_laptop','message_22_17','photo_on_screen','wet_footprints','ghost','someone','coworking','room','room_5','entrance','key','program']);
const modifiers=new Set(['в','на','у','old','wet','technical','spare','automatic']);
const personSubject=(token,source)=>!!personNames[token]&&[personNames[token],'ты','вы','он','она'].includes(source);

export function stripQuestionLead(text) {
  return prepareQuestion(text).replace(/^(?:скажи|скажите|подскажи|подскажите)(?=[\s,:])(?:\s+мне)?[\s,:]*(?:пожалуйста[\s,:]*)?/iu,'');
}

export function parseRelation(normalized) {
  let entries=normalized.tokens.map((token,index)=>({token,source:normalized.sources[index]}));
  const conditions=[];
  let inheritedSubject=null;
  if(entries[0]?.token==='когда'&&personSubject(entries[1]?.token,entries[1]?.source)&&entries[2]?.token==='departed') {
    inheritedSubject=entries[1].token;
    conditions.push({subject:inheritedSubject,predicate:'departed'});
    entries=entries.slice(3);
  } else if(entries.at(-2)?.token==='перед'&&entries.at(-1)?.token==='departure') {
    conditions.push({subject:null,predicate:'departed'});entries=entries.slice(0,-2);
  } else {
    const at=entries.findIndex(entry=>entry.token==='когда');
    if(at>0) {
      const tail=entries.slice(at+1);
      if(tail.length===1&&tail[0].token==='departed'||tail.length===2&&personSubject(tail[0].token,tail[0].source)&&tail[1].token==='departed') {
        conditions.push({subject:tail.length===2?tail[0].token:null,predicate:'departed'});entries=entries.slice(0,at);
      }
    }
  }
  let intent='confirmation';
  if(['когда','где','почему','как'].includes(entries[0]?.token)) {
    intent={когда:'when',где:'where',почему:'why',как:'how'}[entries[0].token];entries=entries.slice(1);
  }
  entries=entries.filter(entry=>entry.token!=='ли');
  const verbs=entries.map((entry,index)=>actions.has(entry.token)?index:-1).filter(index=>index>=0);
  if(verbs.length!==1)return null;
  const verbIndex=verbs[0];
  let subjects=entries.map((entry,index)=>personSubject(entry.token,entry.source)?index:-1).filter(index=>index>=0);
  if(!subjects.length)subjects=entries.map((entry,index)=>index<verbIndex&&entities.has(entry.token)&&!personNames[entry.token]?index:-1).filter(index=>index>=0);
  if(subjects.length>1)return null;
  const subjectIndex=subjects[0];
  const subject=subjectIndex!==undefined?entries[subjectIndex].token:inheritedSubject;
  if(!subject||subjectIndex===undefined&&verbIndex>1)return null;
  const negations=entries.map((entry,index)=>entry.token==='не'?index:-1).filter(index=>index>=0);
  if(negations.length>1||negations.length===1&&negations[0]!==verbIndex-1)return null;
  const objectTokens=entries.filter((entry,index)=>index!==subjectIndex&&index!==verbIndex&&entry.token!=='не').map(entry=>entry.token);
  if(!objectTokens.some(token=>entities.has(token))||objectTokens.some(token=>!entities.has(token)&&!modifiers.has(token)))return null;
  if(['turned_off','activated'].includes(entries[verbIndex].token)&&!objectTokens.some(token=>['computer_room_5','old_laptop','program'].includes(token)))return null;
  // A nominative person left in the object slot is not an accusative object.
  if(entries.some((entry,index)=>index!==subjectIndex&&personSubject(entry.token,entry.source)))return null;
  for(const condition of conditions)if(!condition.subject)condition.subject=subject;
  return {intent,subject,predicate:entries[verbIndex].token,object:objectTokens.join(' '),negated:negations.length===1,conditions,confidence:'medium',unresolvedSlots:['fact'],candidates:[],factId:null};
}
