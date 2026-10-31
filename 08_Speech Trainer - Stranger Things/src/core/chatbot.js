import { normalize,personNames,phraseIn } from './normalize.js';
import { stripQuestionLead } from './parseRelation.js';
import { answerQuestion,answerKnownFact } from './storyEngine.js';
import { addGuidance,typoTopic } from './guidance.js';
import { investigationTurn } from './investigationDialogue.js';
import { equivalentQuestion } from './questionMeaning.js';

const actions=new Set(['sent','searched_for','saw','took','turned_off','activated','turned_on','was_in','worked_at','left','received','entered','departed','planned','arrived']);
const plain=text=>String(text ?? '').toLowerCase().replaceAll('ё','е').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
const followUpIntents={когда:'when',где:'where',кого:'whom',что:'what'};
const meta=(reason,reply,{service=false,pending=null,intent='conversation'}={})=>({status:'UNKNOWN',reason,reply,understood:false,factId:null,category:null,service,pending,parsed:{intent,confidence:'low',unresolvedSlots:[],candidates:[]}});

function incompleteQuestion(text,witnessId,context) {
  const n=normalize(text,{...context,witnessId});
  const predicates=n.tokens.filter(token=>actions.has(token));
  const subjects=n.tokens.filter((token,index)=>personNames[token]&&[personNames[token],'ты','вы','он','она'].includes(n.sources[index]));
  if(predicates.length!==1||subjects.length!==1)return null;
  if(n.tokens.some(token=>![subjects[0],predicates[0],'не','ли','unresolved_object'].includes(token)))return null;
  if(n.tokens.includes('не')&&n.tokens.indexOf('не')!==n.tokens.indexOf(predicates[0])-1)return null;
  return {text,slot:'object'};
}

function fillQuestion(pending,text,witnessId) {
  const fragment=text.trim().replace(/^(?:я имею в виду|про|об|о)\s+/iu,'').replace(/[.!?]+$/u,'');
  const n=normalize(fragment,{witnessId});const tokens=n.tokens;
  if(!tokens.length||tokens.length>7||tokens.some((token,index)=>actions.has(token)||token.startsWith('unresolved_')||['кто','кого','что','когда','почему','как','где','расскажи','расскажите','повтори','повторите'].includes(token)||personNames[token]&&[personNames[token],'ты','вы','он','она'].includes(n.sources[index])))return null;
  const question=pending.text.replace(/[.!?]+$/u,'');
  return /(?:^|\s)(?:его|её|ее)(?=\s|$)/iu.test(question)
    ?question.replace(/(^|\s)(?:его|её|ее)(?=\s|$)/iu,(_,space)=>space+fragment)+'?'
    :question+' '+fragment+'?';
}

function topicRequest(text,topics,witnessId) {
  const request=text.replace(/[?!.,]+$/u,'').trim();
  const intro=/^(?:(?:а )?что (?:(?:ты|вы) )?(?:знаешь|знаете|можешь рассказать|можете рассказать) (?:о|об|про)|расскажи(?:те)?(?: мне)?(?:,? пожалуйста)?(?:,? что (?:(?:ты|вы) )?(?:знаешь|знаете))? (?:о|об|про)|(?:(?:я )?хочу узнать|можно узнать|давай(?:те)? поговорим) (?:о|об|про)|что известно (?:о|об|про)|что насчет|а что (?:с|насчет)|(?:а )?(?:про|об|о)|а)\s+/iu;
  const target=request.replace(intro,'');
  const find=fragment=>topics.find(topic=>[...topic.aliases,topic.about?.replace(/^(?:о|об|про)\s+/u,'')].filter(Boolean).some(alias=>normalize(alias,{witnessId}).text===normalize(fragment,{witnessId}).text));
  const topic=find(target);
  if(topic)return {topic};
  if(intro.test(request)) {
    const parts=target.split(/\s+и\s+/iu);
    const matches=parts.map(find);
    if(parts.length>1&&parts.length<=3&&matches.every(Boolean))return {choices:[...new Map(matches.map(item=>[item.id,item])).values()]};
  }
  return {};
}

// Dialogue is pure: all memory is passed in and returned, never kept globally.
// The manager can select existing evidence but cannot create or override it.
export function answerTurn({text,witnessId,story,state={}}) {
  const config=story.dialogue;
  const profile=config?.witnesses?.[witnessId];
  if(!profile)return answerQuestion({text,witnessId,story,state});
  const memory=state.context?.dialogue || {};
  const topics=config.topics || [];
  const help='Можем поговорить '+profile.topics.map(id=>topics.find(topic=>topic.id===id)?.about).filter(Boolean).join(', ')+'. Выбери, что тебе интересно.';
  const finish=(result,patch={},preserve=false,options={})=>{
    // A mentioned topic may guide a clarification; it never proves a fact.
    const mentionedText=normalize(text,{witnessId});
    // "Непонятная фраза" does not necessarily refer to the case's message.
    const words=mentionedText.tokens.filter((_,index)=>!['фраза','фразу'].includes(mentionedText.sources[index]));
    const mentioned=['NO_MATCH','NO_FACT','NOT_KNOWN'].includes(result.reason)&&!words.includes('не')
      ?topics.filter(topic=>profile.topics.includes(topic.id)&&topic.aliases.some(alias=>phraseIn(words,normalize(alias,{witnessId}).tokens)))
      :[];
    const preferredTopicId=mentioned.length===1?mentioned[0].id:null;
    return addGuidance({...result,nextDialogue:{...memory,pending:null,lastReason:result.reason,lastTopicId:result.understood?topics.find(topic=>topic.factIds.includes(result.factId))?.id || null:memory.lastTopicId,lastFactId:result.understood?result.factId:preserve?memory.lastFactId:null,failures:['NO_MATCH','NO_FACT','NOT_KNOWN','AMBIGUOUS'].includes(result.reason)?(memory.failures || 0)+1:0,...patch}},{story,witnessId,state,memory,preferredTopicId,...options});
  };
  const raw=String(text ?? '').trim();
  const p=plain(raw);
  const reaction=p.replace(/ (?:пожалуйста|спасибо)$/u,'');
  if(/^(?:(?:здравствуйте|привет|добрый день|добрый вечер) )?(?:можно задать (?:вам |тебе )?вопрос|можно (?:вас|тебя) спросить|можно спросить)$/.test(p))return finish(meta('SOCIAL','Конечно. Спрашивай, я слушаю.',{service:true}),{pending:memory.pending},true);
  const agree=/^(да|давай|давайте|ладно|хорошо|ок|окей|ага|конечно|расскажи|расскажите|продолжай|продолжите|хочу|можно|да расскажи|да расскажите|да давай|да хочу|давай расскажи)$/.test(reaction)||raw==='👍';
  const decline=/^(нет|не хочу|не надо|не нужно|нет не надо|нет не хочу|не рассказывай|не рассказывайте|другая тема|другую тему|давай другую|нет давай другую|что то другое)$/.test(reaction)||raw==='👎';
  if(agree&&memory.offer?.type==='topic') {
    const topic=topics.find(item=>item.id===memory.offer.topicId);
    if(topic)return answerTurn({text:'Расскажи '+topic.about,witnessId,story,state:{...state,context:{...state.context,dialogue:{...memory,pending:null,offer:null}}}});
  }
  if(agree&&memory.offer?.type==='navigation') {
    const action=memory.offer.action;
    return finish({...meta('NAVIGATION',action==='witnesses'?'Выбери, с кем хочешь поговорить.':'Опиши свою версию: кто был в комнате, зачем, как попал внутрь и почему пришло сообщение.',{service:true}),navigation:action},{offer:null,pending:null},true);
  }
  if(decline)return finish(meta('DECLINED','Хорошо, сменим тему.',{service:true}),{pending:null},true,{decline:true});
  if(/^(отмена|забудь вопрос|отменить уточнение|неважно|не важно)$/.test(p))return finish(meta('CANCELLED','Хорошо, оставим этот вопрос. Можешь задать другой.',{service:true}),{pending:null},true);
  if(agree)return finish(meta('CLARIFY','Давай выберем, о чём поговорить.',{service:true}),{pending:memory.pending},true);
  if(/^(привет|превет|приветик|здравствуй|здравствуйте|доброе утро|добрый день|добрый вечер|hello|hi)$/.test(p))return finish(meta('SOCIAL',profile.greeting,{service:true}),{pending:memory.pending},true);
  if(/^(спасибо|спасибо большое|спасибо за помощь|благодарю|понятно)$/.test(p))return finish(meta('SOCIAL','Пожалуйста. Если хочешь, продолжим.',{service:true}),{pending:memory.pending},true);
  if(/^(пока|до свидания)$/.test(p))return finish(meta('SOCIAL','До встречи. Если появятся вопросы, возвращайся.',{service:true}),{},true);
  if(/^(помоги|помогите|помги|помощь|подскажи|подскажите|что спросить|что можно спросить|о чем спросить|о чем можно спросить|не знаю что спросить|не знаю|не понимаю|я не понял|я не поняла|не очень понятно|я запутался|я запуталась|что дальше|как продолжить|с чего начать|не получается|ничего не понятно)$/.test(p))return finish(meta('HELP',help,{service:true}),{pending:memory.pending,declinedTopics:[],declinedNavigation:[]},true);
  if(/^(кто ты|кто вы|как тебя зовут|как вас зовут|кем ты работаешь|кем вы работаете)$/.test(p))return finish(meta('PROFILE',profile.roleReply,{service:true}),{},true);
  if(/^(повтори|повторите)( пожалуйста)?$/.test(p))return finish(answerQuestion({text:raw,witnessId,story,state}),{pending:memory.pending},true);
  if(/^(?:(?:я )?(?:люблю|играю|увлекаюсь)\s|(?:как )?(?:приготовить|приготовь)\s|расскажи анекдот|какая погода)/u.test(p))return finish(meta('OFF_TOPIC','Давай вернёмся к делу.'));

  let question=stripQuestionLead(raw.replace(/^(?:привет|здравствуйте|добрый вечер|добрый день)[,!:]?\s+/iu,''));
  const address=/^([\p{L}]+)\s*[,!:]\s*/u.exec(question);
  if(address&&plain(address[1])===plain(story.characters.find(character=>character.id===witnessId)?.name))question=stripQuestionLead(question.slice(address[0].length));
  question=question.replace(/^(?:да|нет)[,!:]?\s+(?=(?:давай(?:те)?|расскажи(?:те)?|про|о|об)\s)/iu,'').replace(/^давай(?:те)?\s+(?=(?:расскажи(?:те)?|про|о|об)\s)/iu,'');
  if(memory.pending?.slot==='object')question=fillQuestion(memory.pending,question,witnessId) || question;
  const investigation=investigationTurn({text:question,witnessId,story,state});
  if(investigation)return finish(investigation,{},investigation.service);
  const n=normalize(question,{witnessId});
  const report=(config.selfReports || []).find(item=>item.knownBy.includes(witnessId)&&(item.queries.some(query=>normalize(query,{witnessId}).text===n.text)||equivalentQuestion(question,item.queries,witnessId)));
  if(report)return finish(meta('SELF_REPORT',report.reply),{lastTopicId:report.topicId || null,seenReports:[...new Set([...(memory.seenReports || []),report.id])]});

  const short=plain(question).replace(/^а /u,'').replace(/ именно$/u,'');
  if(followUpIntents[short]&&memory.lastFactId) {
    const intent=followUpIntents[short];
    if(config.followUps?.[memory.lastFactId]?.includes(intent)) {
      const fact=story.facts.find(item=>item.id===memory.lastFactId);
      const parsed={intent,confidence:'high',factId:fact.id,subject:fact.subject,predicate:fact.predicate,object:fact.object,negated:false};
      return finish(answerKnownFact({factId:fact.id,witnessId,story,parsed,state}));
    }
    return finish(meta('NO_FACT','Этого я не знаю. Попробуй задать вопрос целиком.'),{},true);
  }

  const more=/^(что еще|а что еще|а еще|еще|расскажи еще|расскажите еще|что нибудь еще|что еще вы знаете)$/.test(plain(question));
  const topicQuery=more?{topic:topics.find(item=>item.id===memory.lastTopicId)}:topicRequest(question,topics,witnessId);
  if(topicQuery.choices)return finish(meta('CLARIFY','О чём поговорим сначала: '+topicQuery.choices.map(item=>item.about).join(' или ')+'?'));
  const topic=topicQuery.topic;
  if(more&&!topic)return finish(meta('CLARIFY','О какой теме ты хочешь узнать больше?'),{lastTopicId:null});
  if(topic) {
    const answers=topic.factIds.map(factId=>{
      const fact=story.facts.find(item=>item.id===factId);
      if(!fact)return null;
      return answerKnownFact({factId,witnessId,story,state,parsed:{intent:'topic',confidence:'high',factId,subject:fact.subject,predicate:fact.predicate,object:fact.object,negated:false}});
    });
    const accessible=answers.filter(result=>result?.understood);
    const fresh=accessible.find(result=>!(state.discoveredFacts || []).includes(result.factId));
    if(fresh)return finish(fresh,{lastTopicId:topic.id});
    const selfReport=(config.selfReports || []).find(item=>item.topicId===topic.id&&item.knownBy.includes(witnessId)&&!(memory.seenReports || []).includes(item.id));
    if(selfReport)return finish(meta('SELF_REPORT',selfReport.reply),{lastTopicId:topic.id,seenReports:[...(memory.seenReports || []),selfReport.id]});
    const withheld=answers.find(result=>result?.reason==='WITHHELD');
    if(withheld)return finish(withheld,{lastTopicId:topic.id});
    return finish(meta(accessible.length||more?'TOPIC_EXHAUSTED':'NOT_KNOWN',accessible.length||more?'Других сведений по этой теме у меня нет.':'Об этом я ничего не знаю.'),{lastTopicId:topic.id});
  }

  const suggestion=typoTopic(question,topics,profile.topics);
  if(suggestion)return finish(meta('CLARIFY','Мне не совсем понятно, какую тему ты имеешь в виду.'),{},false,{preferredTopicId:suggestion.id});

  const result=answerQuestion({text:question,witnessId,story,state});
  if(!result.understood&&['NO_MATCH','NO_FACT'].includes(result.reason)) {
    const pending=incompleteQuestion(question,witnessId,state.context);
    if(pending)return finish({...meta('CLARIFY','Что именно ты имеешь в виду? Уточни, пожалуйста, о ком или о чём ты спрашиваешь.'),parsed:result.parsed},{pending});
  }
  if(result.reason==='NO_FACT'&&result.parsed.conditions?.some(condition=>condition.subject===witnessId&&condition.predicate==='departed')) {
    const departure=config.selfReports.find(item=>item.id==='maxim_departure'&&item.knownBy.includes(witnessId));
    if(departure)return finish({...result,reply:result.reply+' '+departure.reply});
  }
  return finish(result,result.parsed.intent==='repeat'?{pending:memory.pending}:{},result.parsed.intent==='repeat');
}
