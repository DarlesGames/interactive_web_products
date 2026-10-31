import { parseQuestion } from './parseQuestion.js';
const unknown=(reason,reply,parsed)=>({status:'UNKNOWN',reason,factId:null,category:null,reply,understood:false,parsed});
export function answerQuestion({text,witnessId,story,state={}}) {
  const parsed=parseQuestion(text,{story,witnessId,context:state.context || {}});
  if(parsed.intent==='repeat') return unknown('REPEAT',state.context?.lastReply || 'Пока нечего повторять. Задай вопрос о деле.',parsed);
  if(parsed.confidence==='medium') {
    const selfComputer=parsed.subject===witnessId&&parsed.predicate==='turned_off'&&parsed.object==='computer_room_5';
    const verb=['maxim','ilya'].includes(witnessId)?'выключал':'выключала';
    return unknown('NO_FACT',selfComputer?`Я не могу сказать, ${verb} ли я компьютер.`:'Я понимаю вопрос, но не знаю ответа.',parsed);
  }
  if(parsed.confidence!=='high') return unknown(parsed.unresolvedSlots.includes('ambiguous')?'AMBIGUOUS':'NO_MATCH',parsed.unresolvedSlots.includes('reference')?'Что именно ты имеешь в виду?':'Мне не совсем понятен вопрос. Попробуй спросить иначе.',parsed);
  return answerKnownFact({factId:parsed.factId,witnessId,story,parsed,state});
}

// All dialogue routes use the same access gate, including topic requests.
export function answerKnownFact({factId,witnessId,story,state={},parsed={intent:'topic',negated:false}}) {
  const fact=story.facts.find(item=>item.id===factId);
  if(!fact || !story.characters.some(character=>character.id===witnessId)) return unknown('NO_MATCH','Я этого не знаю.',parsed);
  if(typeof fact.value!=='boolean'||!fact.knownBy?.includes(witnessId)) return unknown('NOT_KNOWN','Я этого не знаю.',parsed);
  if(fact.revealPolicy && fact.revealPolicy.mode!=='public') {
    const policy=fact.revealPolicy;
    const unlocked=policy.mode==='evidence'&&policy.requires?.length>0&&policy.requires.every(id=>(state.discoveredFacts || []).includes(id));
    if(!unlocked)return unknown('WITHHELD',policy.reply || 'Я пока не хочу об этом говорить.',parsed);
  }
  const reply=fact.responses?.[witnessId] || story.responsesByFact?.[fact.id]?.[witnessId];
  if(!reply) return unknown('NOT_KNOWN','Я этого не знаю.',parsed);
  return {status:fact.importance==='irrelevant'?'IRRELEVANT':fact.value!==parsed.negated?'YES':'NO',reason:'KNOWN',factId:fact.id,category:parsed.intent,reply,understood:true,parsed};
}
