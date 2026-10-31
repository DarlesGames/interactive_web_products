import { normalize } from './normalize.js';
import { answerTurn } from './chatbot.js';
import { nextHints } from './hints.js';
export function createState(story) {
  return {storyId:story.id,phase:'active',activeWitnessId:null,context:{},transcript:[],submittedRequestIds:[],uniqueQuestionKeys:[],totalQuestions:0,understoodQuestions:0,unknownQuestions:0,hintIdsShown:[],hypothesisAttempts:0,questionCategories:[],discoveredFacts:[],drafts:{},hypothesisDraft:'',lastEvaluation:null};
}
export function selectWitness(state,id,story) {
  if(!story.characters.some(character=>character.id===id)) return state;
  const last=state.transcript.findLast(line=>line.witnessId===id&&line.role==='npc');
  return {...state,activeWitnessId:id,context:{lastReply:last?.text}};
}
export function submitQuestion({text,requestId,state,story}) {
  if(typeof text!=='string'||!text.trim()||text.length>2000||!requestId||state.phase!=='active'||!state.activeWitnessId||state.submittedRequestIds.includes(requestId)) return {state,result:null,accepted:false};
  const result=answerTurn({text,witnessId:state.activeWitnessId,story,state});
  const parsed=result.parsed;
  const key=state.activeWitnessId+':'+(parsed.confidence==='high'&&parsed.factId?`${parsed.subject}:${parsed.predicate}:${parsed.object}:${parsed.negated}:${parsed.intent}`:normalize(text,{witnessId:state.activeWitnessId}).text);
  const accepted=!result.service&&parsed.intent!=='repeat'&&!state.uniqueQuestionKeys.includes(key);
  const context=parsed.intent==='repeat'||result.service
    ?{...state.context,lastReply:result.reply,lastGuidance:result.guidance || ''}
    :{lastReply:result.reply,lastGuidance:result.guidance || '',lastSubject:parsed.confidence==='high'?parsed.subject:null,lastObjectTokens:parsed.confidence==='high'?parsed.referenceTokens:null,lastObjectGender:parsed.confidence==='high'?parsed.referenceGender:null};
  if(result.nextDialogue)context.dialogue=result.nextDialogue;
  const next={
    ...state,
    submittedRequestIds:[...state.submittedRequestIds,requestId],
    uniqueQuestionKeys:accepted?[...state.uniqueQuestionKeys,key]:state.uniqueQuestionKeys,
    totalQuestions:state.totalQuestions+(accepted?1:0),
    understoodQuestions:state.understoodQuestions+(accepted&&result.understood?1:0),
    unknownQuestions:state.unknownQuestions+(accepted&&!result.understood?1:0),
    transcript:[...state.transcript,{role:'student',witnessId:state.activeWitnessId,text},{role:'npc',witnessId:state.activeWitnessId,text:result.reply,guidance:result.guidance || '',status:result.status,factId:result.factId}],
    context,
    questionCategories:accepted&&result.understood?[...new Set([...state.questionCategories,result.category])]:state.questionCategories,
    discoveredFacts:result.understood?[...new Set([...state.discoveredFacts,result.factId])]:state.discoveredFacts
  };
  next.hintIdsShown=[...next.hintIdsShown,...nextHints(story,next.hintIdsShown,next.totalQuestions)];
  return {state:next,result,accepted};
}
export function requestHint(state,story) {return {...state,hintIdsShown:[...state.hintIdsShown,...nextHints(story,state.hintIdsShown,state.totalQuestions,true)]};}
