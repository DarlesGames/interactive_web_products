import { normalize,personNames } from './normalize.js';

// Small relation grammar for the four case-001 components. Tokens have to form
// a sentence frame, not just occur somewhere in the submitted version.
const actorPattern='(?:(?:не )?(?:sofia|anya|maxim|lena|ilya|marina|unresolved_subject))';
const goalTarget='(?:old old_laptop(?: (?:своей )?(?:sister|marina))?|old_laptop (?:своей )?(?:sister|marina))';
const keyTarget='(?:spare key(?: у anya)?|key у anya)';
const clauseFrames={
  who:[new RegExp(`^(?:${actorPattern} )?(?:не )?(?:was_in|entered) (?:в )?(?:room|room_5)(?: |$)`),new RegExp(`^(?:в )?(?:room|room_5) (?:не )?(?:was_in|entered) ${actorPattern}(?: |$)`)],
  why:[new RegExp(`^(?:${actorPattern} )?(?:не )?searched_for ${goalTarget}(?: |$)`),new RegExp(`^${goalTarget} (?:не )?searched_for ${actorPattern}(?: |$)`)],
  how:[new RegExp(`^(?:${actorPattern} )?(?:не )?received ${keyTarget}(?: |$)`),new RegExp(`^${keyTarget} (?:не )?received ${actorPattern}(?: |$)`)]
};
const negatives={
  why:new RegExp(`^(?:${actorPattern} )?не searched_for (?:old )?old_laptop(?: |$)`),
  how:new RegExp(`^(?:${actorPattern} )?не received (?:spare )?key(?: |$)`)
};
const verbs=new Set(['was_in','entered','searched_for','received','sent','arrived','activated']);
function subjectOf(normalized,previous) {
  const {tokens,sources}=normalized;
  const names=tokens.filter((token,index)=>personNames[token]===sources[index]);
  if(names.length===1)return names[0];
  if(names.length>1)return null;
  if(tokens.some((token,index)=>token==='sister'&&sources[index]==='сестра'))return 'other';
  if(sources.includes('он'))return ['maxim','ilya'].includes(previous)?previous:null;
  if(sources.includes('она'))return ['sofia','anya','lena','marina'].includes(previous)?previous:null;
  // Omitted subject is inherited only for a verb-led clause, never from a
  // genitive owner's name such as "сестра Софии" or "ноутбук Марины".
  return verbs.has(tokens[0])||tokens[0]==='не'&&verbs.has(tokens[1])?previous:null;
}
export function evaluateSolution({text,criteria}) {
  const matched=new Set();const blocked=new Set();
  let actor=null;let planBefore=false;let meaningful=false;
  const all=normalize(text).tokens;
  if(all.length===1&&all[0]==='sofia'&&String(text).trim().toLowerCase()==='софия')matched.add('who');
  const clauses=String(text ?? '').split(/[.!?;\n]+|,\s*(?:а|но)\s+/u).filter(clause=>clause.trim());
  for(const clause of clauses) {
    const source=clause.trim().replace(/^(?:я думаю|моя версия|мне кажется)\s*[, :]+/i,'');
    const n=normalize(source);const {tokens}=n;const has=word=>tokens.includes(word);
    const previousPlan=planBefore;planBefore=false;
    const reported=/(?:^|\s)(?:думал[аи]?|сказал[аи]?|считал[аи]?|если|либо|возможно)(?:\s|,|$)/iu.test(source);
    actor=subjectOf(n,actor);
    if(reported){actor=null;continue;}
    const add=(id,match)=>{
      if(!match)return;
      meaningful=true;
      if(actor!=='sofia'||/(?:^| )не (?:was_in|entered|searched_for|received|sofia|anya|maxim|lena|ilya|marina|unresolved_subject)/.test(match[0]))blocked.add(id);
      else matched.add(id);
    };
    const relationMatches={};
    for(const [id,frames] of Object.entries(clauseFrames)){
      relationMatches[id]=frames.map(frame=>frame.exec(n.text)).find(Boolean);
      add(id,relationMatches[id]);
    }
    if(relationMatches.why&&/(?:^| )в (?:room|room_5)(?: |$)/.test(n.text))add('who',relationMatches.why);
    for(const [id,frame] of Object.entries(negatives))if(frame.test(n.text)){meaningful=true;blocked.add(id);}

    if(/^(?:computer_room_5 (?:в room_5 )?не turned_on|не turned_on computer_room_5)(?: |$)/.test(n.text)) {
      meaningful=true;blocked.add('message');
    }

    // The message's delayed-plan property can carry into the immediately next
    // "оно ..." clause. It cannot be inherited across unrelated statements.
    const planDeclaration=/^message_22_17 (?:was_in )?(?:old )?(?:delayed|planned)(?: |$)/.test(n.text);
    if(planDeclaration&&!has('не'))planBefore=true;
    const programAction=/(?:^| )(?:old )?program (?:automatic )?(?:не )?sent (?:delayed )?message_22_17(?: |$)/.exec(n.text);
    const messageAction=/^(?:message_22_17|оно) (?:не )?(?:arrived|planned|sent)(?: |$)/.exec(n.text);
    const hasTrigger=/(?:когда (?:unresolved_subject |sofia )?activated (?:old )?computer_room_5|после (?:запуска|включения) (?:old )?computer_room_5)/.test(n.text);
    const automatic=has('automatic')||has('заранее');
    const scheduled=programAction&&/old program|delayed message_22_17/.test(programAction[0])||planDeclaration||previousPlan&&tokens[0]==='оно';
    if(programAction||messageAction) {
      meaningful=true;
      const action=programAction || messageAction;
      if(/(?:^| )не (?:sent|arrived|planned)/.test(action[0]))blocked.add('message');
      else if(scheduled&&automatic&&hasTrigger)matched.add('message');
    }
    if(actor==='sofia'&&has('sent')&&has('message_22_17')&&!has('program'))blocked.add('message');
  }
  for(const id of blocked)matched.delete(id);
  const ids=criteria.map(criterion=>criterion.id);
  const found=ids.filter(id=>matched.has(id));const missing=ids.filter(id=>!matched.has(id));
  const verdict=found.length===4&&ids.length===4&&!blocked.size?'CORRECT':found.length?'PARTIAL':blocked.size||meaningful?'INCORRECT':'UNPARSEABLE';
  return {verdict,matched:found,missing,feedback:verdict==='CORRECT'?'Все четыре части твоей версии верны.':verdict==='PARTIAL'?`Верно: ${found.length} из 4. Ещё нужно объяснить: ${criteria.filter(c=>missing.includes(c.id)).map(c=>c.title.toLowerCase()).join('; ')}.`:verdict==='INCORRECT'?'В версии есть противоречие. Сверь её с ответами свидетелей.':'Я не смог разобрать версию. Опиши связными предложениями, кто был в комнате, зачем, как вошёл и почему пришло сообщение.'};
}
