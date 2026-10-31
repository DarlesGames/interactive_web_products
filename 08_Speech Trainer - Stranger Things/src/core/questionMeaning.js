import { normalize,personNames } from './normalize.js';

// Conservative equivalence, not similarity scoring: every meaningful token must
// match. Keep participant cases, prepositions, dates and unfamiliar conditions.
// Negation and multi-clause questions remain with the relational parser.
export function prepareQuestion(text) {
  return String(text ?? '').trim()
    .replace(/^(?:а\s+)?(?:(?:ты|вы)\s+)?(?:можешь|можете|могли бы вы|мог бы ты|не могли бы вы|не мог бы ты)\s+(?:мне\s+)?(?:сказать|подсказать|рассказать|объяснить)[\s,:]*/iu,'')
    .replace(/^(?:а\s+)?(?:скажи|скажите|подскажи|подскажите|расскажи|расскажите)(?:\s+мне)?[\s,:]+(?=(?:пожалуйста[\s,:]+)?(?:кто|кого|кому|когда|где|почему|зачем|как|чей|что|вы|ты)(?=[\s?!,]|$))/iu,'')
    .replace(/^(?:мне интересно|я хочу узнать|хотелось бы узнать)[\s,:]+/iu,'')
    .replace(/(?:^|[\s,]+)пожалуйста(?:[\s,]+|(?=[?!]|$))/giu,' ')
    .replace(/^[\s,:]+/u,'').replace(/^а\s+/iu,'').replace(/\s+/gu,' ').trim();
}

const synonyms={
  присутствовал:'was_in',присутствовала:'was_in',присутствовали:'was_in',
  оставался:'was_in',оставались:'was_in',находилось:'was_in',
  дали:'gave',дала:'gave',дал:'gave',давали:'gave',передали:'gave',передала:'gave',передал:'gave',выдали:'gave',выдала:'gave',выдал:'gave',
  попали:'entered',вошли:'entered',входили:'entered',попадали:'entered',
  получили:'received',взяли:'received',брали:'received',получали:'received',
  помогал:'helped',помогала:'helped',помогали:'helped',помог:'helped',помогли:'helped',
  открыто:'open',открытым:'open',открыта:'open',открытой:'open',
  открыл:'opened',открыла:'opened',открыли:'opened',открывал:'opened',открывали:'opened',
  вышел:'exited',вышла:'exited',вышли:'exited',выходил:'exited',выходили:'exited',
  услышал:'heard',услышала:'heard',услышали:'heard',слышал:'heard',слышали:'heard',
  прислал:'sent',прислала:'sent',прислали:'sent',присылали:'sent',
  самопроизвольно:'automatic',самостоятельно:'automatic',
  владельцем:'owner',владелец:'owner',принадлежал:'belonged',принадлежит:'belonged',
};
const cases={
  аню:'acc',софию:'acc',лену:'acc',илью:'acc',марину:'acc',
  ани:'gen',софии:'oblique',лены:'gen',ильи:'gen',марины:'gen',
  аней:'inst',софией:'inst',леной:'inst',ильей:'inst',мариной:'inst',максимом:'inst',
  максима:'oblique',максиму:'dat',
};

export function questionMeaning(text,witnessId) {
  let value=prepareQuestion(text).toLowerCase().replaceAll('ё','е');
  // Deictic words refer to this case, but explicit other dates/locations remain.
  value=value.replace(/(?:в\s+)?(?:тот|этот)\s+вечер|тем\s+вечером/gu,'вечером')
    .replace(/(?:в\s+)?(?:том|этом)\s+здании/gu,'в здании')
    .replace(/(^|\s)(?:тут|здесь)(?=[\s?!,.]|$)/gu,'$1в здании')
    .replace(/сам(?:а|о)?\s+по\s+себе/gu,'автоматически')
    .replace(/по какой причине/gu,'почему').replace(/каким образом/gu,'как')
    .replace(/во сколько/gu,'когда')
    .replace(/кто\s+из\s+(?:людей|сотрудников|посетителей)/gu,'кто')
    .replace(/кому\s+(?:принадлежит|принадлежал)\s+(?:старый\s+)?ноутбук/gu,'чей ноутбук');
  const n=normalize(value,{witnessId});
  if(n.tokens.some(t=>['не','ни','нет','без','или','и','если'].includes(t)||t.startsWith('unresolved_')))return null;
  // Exclude clauses/claims instead of discarding their additional meaning.
  if(/[,;.]\s*\p{L}/u.test(value)) {
    // Commas after an introductory phrase have already been removed above.
    return null;
  }
  const tokens=n.tokens.map((token,i)=>{
    const source=n.sources[i];
    if(personNames[token])return `${token}:${cases[source] || (['ты','вы',personNames[token]].includes(source)?'nom':source)}`;
    return synonyms[source] || token;
  }).filter(t=>!['ли','пожалуйста'].includes(t));
  // Optional evening context for the open question about people in the case.
  if(tokens.includes('кто')&&tokens.includes('was_in')&&tokens.every(t=>['кто','was_in','в','coworking','evening'].includes(t))) {
    return 'who:present:case-evening';
  }
  return tokens.length?tokens.sort().join('|'):null;
}

export function equivalentQuestion(text,examples,witnessId) {
  const meaning=questionMeaning(text,witnessId);
  return meaning!==null&&examples.some(example=>questionMeaning(example,witnessId)===meaning);
}

export function matchQuestionMeaning(text,story,witnessId) {
  const meaning=questionMeaning(text,witnessId);
  if(!meaning)return [];
  const matches=[];
  for(const route of story.dialogue?.semanticQuestions || []) {
    if((!route.witnessId||route.witnessId===witnessId)&&equivalentQuestion(text,route.phrases,witnessId))matches.push(route.factId);
  }
  for(const mapping of story.questionMappings || []) {
    const fact=story.facts.find(f=>f.id===mapping.factId);
    if(!fact)continue;
    const subject=personNames[fact.subject] || mapping.subjectAliases[0];
    for(const predicate of mapping.predicateAliases)for(const object of mapping.objectAliases) {
      const base=`${subject} ${predicate} ${object}`;
      if([base,...(mapping.timeAliases || []).map(time=>`${base} ${time}`)].some(q=>questionMeaning(q,witnessId)===meaning))matches.push(fact.id);
    }
  }
  return [...new Set(matches)];
}
