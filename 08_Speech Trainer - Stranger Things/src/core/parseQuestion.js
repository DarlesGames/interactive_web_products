import { normalize,phraseIn,personNames,referenceGender } from './normalize.js';
import { parseRelation,stripQuestionLead } from './parseRelation.js';
import { matchQuestionMeaning } from './questionMeaning.js';
const filler=new Set('а ли это этот эту то действительно правда пожалуйста скажи скажите знаешь знаете в на у'.split(' '));
const personIds=new Set(['anya','maxim','lena','ilya','sofia','marina']);
const bestAlias=(aliases,tokens,context,subject=null)=>aliases.map(alias=>normalize(alias,context).tokens).filter(words=>!subject||words.includes(subject)).map(words=>phraseIn(tokens,words)).filter(Boolean).sort((a,b)=>b.length-a.length)[0];

export function parseQuestion(text,{story,witnessId,context={}}={}) {
  const normalized=normalize(stripQuestionLead(text),{...context,witnessId});
  const tokens=normalized.tokens;
  const base={intent:'unclear',subject:null,predicate:null,object:null,location:null,time:null,negated:false,confidence:'low',unresolvedSlots:[],normalizedText:normalized.text,candidates:[]};
  if(!String(text ?? '').trim()) return {...base,intent:'empty'};
  if(/^(повтори|повторите)( пожалуйста)?$/.test(normalized.text)) return {...base,intent:'repeat',confidence:'high'};
  if(tokens.some(token=>token.startsWith('unresolved_'))) return {...base,unresolvedSlots:['reference']};
  if(/^(я знаю|я думаю|мне кажется)/i.test(String(text).trim())) return base;
  const negation=tokens.filter(token=>token==='не').length;
  if(negation>1) return {...base,unresolvedSlots:['negation']};
  const intent=tokens.includes('кто')?'who':tokens.includes('кого')?'whom':tokens.includes('когда')?'when':tokens.includes('где')?'where':tokens.includes('почему')?'why':tokens.includes('как')?'how':tokens.includes('что')?'what':'confirmation';
  const candidates=[];
  for(const mapping of story?.questionMappings || []) {
    const fact=story.facts.find(item=>item.id===mapping.factId);
    if(!fact) continue;
    const subject=bestAlias(mapping.subjectAliases || [],tokens,{...context,witnessId},fact.subject);
    const predicate=bestAlias(mapping.predicateAliases || [],tokens,{...context,witnessId});
    const object=bestAlias(mapping.objectAliases || [],tokens,{...context,witnessId});
    // A single open slot is allowed only when the rest uniquely identifies a fact.
    const subjectOpen=intent==='who' && !subject && fact.subject!=='someone' && !tokens.some(token=>personIds.has(token));
    const objectOpen=(intent==='what'||intent==='whom'&&fact.predicate==='saw') && !object;
    if((!subject&&!subjectOpen)||!predicate||(!object&&!objectOpen)) continue;
    if(subject&&personNames[fact.subject]) {
      const index=subject.at+subject.tokens.indexOf(fact.subject);
      if(![personNames[fact.subject],'ты','вы','он','она'].includes(normalized.sources[index]))continue;
    }
    // Keep accusative participant roles when normalization collapses name forms.
    // "Илью видела София" must never become "Илья видел Софию".
    if(object&&object.tokens.some((token,offset)=>personNames[token]&&normalized.sources[object.at+offset]===personNames[token]))continue;
    if((subjectOpen||objectOpen)&&!fact.value) continue;
    if(intent==='why'||intent==='how') continue; // No confirmed causal facts in the seed table.
    const time=bestAlias(mapping.timeAliases || [],tokens,{...context,witnessId});
    if(tokens.some(token=>/^time\d+$/.test(token))&&!time) continue;
    if(negation && tokens.indexOf('не')!==predicate.at-1) continue;
    const consumed=new Set();
    for(const match of [subject,predicate,object,time].filter(Boolean)) for(let i=match.at;i<match.at+match.length;i++) consumed.add(i);
    const unknown=tokens.filter((token,index)=>!consumed.has(index)&&!filler.has(token)&&!['не','кто','кого','что','когда','где'].includes(token));
    if(unknown.length) continue;
    const objectTokens=object?.tokens || [];
    const gender=referenceGender(objectTokens,object?normalized.sources.slice(object.at,object.at+object.length):[],context.lastObjectGender);
    candidates.push({factId:fact.id,subject:fact.subject,predicate:fact.predicate,object:fact.object,objectTokens,referenceTokens:gender?objectTokens:null,referenceGender:gender,time:time?.tokens.join(' ') || null,location:fact.object.includes('room')?'room_5':null});
  }
  const distinct=[...new Map(candidates.map(candidate=>[candidate.factId,candidate])).values()];
  if(distinct.length===0) {
    const equivalent=matchQuestionMeaning(text,story,witnessId);
    if(equivalent.length===1){
      const fact=story.facts.find(f=>f.id===equivalent[0]);
      return {...base,intent,subject:fact.subject,predicate:fact.predicate,object:fact.object,factId:fact.id,confidence:'high',candidates:equivalent};
    }
    if(equivalent.length>1)return {...base,intent,candidates:equivalent,unresolvedSlots:['ambiguous']};
    const relation=parseRelation(normalized);
    if(relation)return {...base,...relation};
  }
  if(distinct.length!==1) return {...base,intent,negated:!!negation,candidates:distinct.map(item=>item.factId),unresolvedSlots:distinct.length>1?['ambiguous']:['fact']};
  return {...base,...distinct[0],intent,negated:!!negation,confidence:'high',candidates:[distinct[0].factId]};
}
