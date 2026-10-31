import { answerKnownFact } from './storyEngine.js';
import { investigationLead } from './investigationDialogue.js';

export function hasNewInformation(topic,{story,witnessId,state,seenReports=[],excludeFactId=null}) {
  const unseenFact=topic.factIds.some(factId=>factId!==excludeFactId&&!(state.discoveredFacts || []).includes(factId)&&answerKnownFact({factId,witnessId,story,state}).understood);
  const unseenReport=(story.dialogue.selfReports || []).some(report=>report.topicId===topic.id&&report.knownBy.includes(witnessId)&&!seenReports.includes(report.id));
  return unseenFact||unseenReport;
}

export function addGuidance(result,{story,witnessId,state,memory,decline=false,preferredTopicId=null}) {
  if(result.navigation)return result;
  if(result.understood&&result.factId)state={...state,discoveredFacts:[...new Set([...(state.discoveredFacts || []),result.factId])]};
  const next=result.nextDialogue;
  if(result.reason==='REPEAT'&&state.context?.lastGuidance)return {...result,guidance:state.context.lastGuidance};
  const profile=story.dialogue.witnesses[witnessId];
  const blocked=new Set(next.declinedTopics || []);
  if(decline&&memory.offer?.type==='topic')blocked.add(memory.offer.topicId);
  next.declinedTopics=[...blocked];
  const available=profile.topics.map(id=>story.dialogue.topics.find(topic=>topic.id===id)).filter(topic=>topic&&!blocked.has(topic.id)&&hasNewInformation(topic,{story,witnessId,state,seenReports:next.seenReports,excludeFactId:result.factId}));
  const preferred=available.find(topic=>topic.id===preferredTopicId);
  const current=available.find(topic=>topic.id===next.lastTopicId);
  const different=available.find(topic=>!(memory.offeredTopics || []).includes(topic.id));
  const topic=preferred || (result.understood?current:null) || different || available.find(topic=>topic.id!==memory.offer?.topicId) || available[0];
  let guidance;
  if(topic) {
    next.offer={type:'topic',topicId:topic.id};
    next.offeredTopics=[...new Set([...(memory.offeredTopics || []),topic.id])];
    const failures=next.failures || 0;
    if(failures>1&&topic.question)guidance=`Попробуй спросить: «${topic.question}» Или просто напиши «Расскажи».`;
    else guidance=`Могу рассказать ${topic.about}. Хочешь?`;
  } else {
    const rejected=new Set(next.declinedNavigation || []);
    if(decline&&memory.offer?.type==='navigation')rejected.add(memory.offer.action);
    next.declinedNavigation=[...rejected];
    const action=!rejected.has('witnesses')?'witnesses':!rejected.has('version')?'version':null;
    next.offer=action?{type:'navigation',action}:null;
    guidance=action==='witnesses'?'Можно поговорить с другим свидетелем. Открыть список свидетелей?':action==='version'?'Можно перейти к своей версии. Открыть экран «Моя версия»?':'Хорошо. Когда будешь готов, задай свой вопрос или выбери другого свидетеля.';
  }
  const lead=investigationLead(story,{...state,discoveredFacts:[...(state.discoveredFacts || []),...(result.factId?[result.factId]:[])]},witnessId);
  if(lead&&!decline&&!next.pending)guidance=lead.text+' '+guidance;
  return {...result,guidance};
}

// Fuzzy recognition can only offer a topic for confirmation, never answer a fact.
export function typoTopic(text,topics,publicIds) {
  const value=text.toLowerCase().replaceAll('ё','е').replace(/[?!.,]+$/u,'').trim().replace(/^(?:про|о|об)\s+/u,'');
  if(!/^[а-я]{5,20}$/u.test(value))return null;
  const distance=(a,b)=>{
    let row=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++) {
      const next=[i];
      for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));
      row=next;
    }
    return row[b.length];
  };
  const matches=topics.filter(topic=>publicIds.includes(topic.id)&&topic.aliases.some(alias=>/^[а-я]{5,20}$/u.test(alias)&&distance(value,alias)===1));
  return matches.length===1?matches[0]:null;
}
