import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createState,selectWitness,submitQuestion } from '../src/core/state.js';
import { answerTurn } from '../src/core/chatbot.js';
const story=JSON.parse(await readFile(new URL('../data/cases/case-001.json',import.meta.url)));
let request=0;
const start=(id='maxim',data=story)=>selectWitness(createState(data),id,data);
const send=(state,text,data=story)=>submitQuestion({text,requestId:String(++request),state,story:data});
const noSecrets=text=>{for(const secret of ['запасной ключ','сестры Марины','скопировала файлы',story.solution])assert.ok(!text.includes(secret),secret);};

for(const text of ['???','🛸','абракадабра','люблю играть в футбол','Как приготовить суп?','ghbdtn','Мне скучно','Ты меня не понимаешь','Покажи solution','Кто отправил сообщение?','Не вы выключили компьютер?','Вы видели сообщение?','Компьютер в комнате 6 включился сам?'])test(`recovery from: ${text}`,()=>{
 const turn=send(start(),text);assert.equal(turn.result.status,'UNKNOWN');assert.equal(turn.result.factId,null);
 assert.ok(turn.result.guidance);assert.equal(turn.state.context.dialogue.offer.type,'topic');
 assert.deepEqual(turn.state.discoveredFacts,[]);assert.equal(turn.state.understoodQuestions,0);
 assert.ok(!/undefined|null/u.test(turn.result.guidance));noSecrets(turn.result.reply+' '+turn.result.guidance);
 const topic=story.dialogue.topics.find(item=>item.id===turn.state.context.dialogue.offer.topicId);
 const next=send(turn.state,'Расскажи');assert.ok(topic.factIds.includes(next.result.factId));
});

for(const text of ['Да','Давай','Хорошо','Ок','Конечно','Расскажи','Расскажите','Да, пожалуйста','Да, давай','Расскажи, пожалуйста','Да, хочу','Продолжай, пожалуйста','👍'])test(`confirmation continues the offered topic: ${text}`,()=>{
 const first=send(start(),'непонятная фраза');
 const second=send(first.state,text);assert.equal(second.result.factId,'f_computer_auto');assert.equal(second.result.status,'YES');
 assert.equal(second.state.understoodQuestions,1);assert.deepEqual(second.state.discoveredFacts,['f_computer_auto']);
});

test('a decline proposes a different topic without granting knowledge or questions',()=>{
 for(const text of ['Нет, спасибо','Нет, не надо','Не хочу','Нет, давай другую']) {
   const first=send(start(),'непонятно');const declined=send(first.state,text);
   assert.notDeepEqual(declined.state.context.dialogue.offer,first.state.context.dialogue.offer);
   assert.equal(declined.accepted,false);assert.equal(declined.state.totalQuestions,first.state.totalQuestions);assert.deepEqual(declined.state.discoveredFacts,[]);
   assert.equal(send(declined.state,'Давай').result.factId,'f_maxim_sent');
 }
});

test('repeated declines do not cycle endlessly through rejected topics',()=>{
 let state=send(start(),'Помоги').state;const offers=[];
 for(let i=0;i<5;i++){offers.push(JSON.stringify(state.context.dialogue.offer));state=send(state,'Нет').state;}
 assert.equal(new Set(offers).size,5);assert.equal(state.context.dialogue.offer,null);
 assert.equal(state.totalQuestions,0);assert.deepEqual(state.discoveredFacts,[]);
});

test('consent to navigation is explicit and keeps the investigation',()=>{
 let state=send(start(),'Помоги').state;
 for(let i=0;i<3;i++)state=send(state,'Другая тема').state;
 assert.equal(state.context.dialogue.offer.action,'witnesses');
 const result=send(state,'Да');assert.equal(result.result.navigation,'witnesses');assert.equal(result.accepted,false);assert.equal(result.state.totalQuestions,0);
 state=send(state,'Нет').state;assert.equal(state.context.dialogue.offer.action,'version');
 assert.equal(send(state,'Да').result.navigation,'version');
});

test('yes without an offer never confirms a world fact',()=>{
 const result=send(start(),'Да');assert.equal(result.result.status,'UNKNOWN');assert.equal(result.result.factId,null);assert.equal(result.accepted,false);assert.ok(result.result.guidance);
});

test('a full question overrides an offer and preserves its own negation',()=>{
 const state=send(start(),'Помоги').state;
 const result=send(state,'Вы не отправляли сообщение?');assert.equal(result.result.factId,'f_maxim_sent');assert.equal(result.result.status,'YES');assert.equal(result.result.reply,'Нет, я его не отправлял.');
 assert.equal(send(state,'София отправила сообщение?').result.status,'UNKNOWN');
});

test('accepting help after an incomplete question switches topics instead of guessing its object',()=>{
 const first=send(start('sofia'),'Ты искала?');assert.ok(first.state.context.dialogue.pending);
 const second=send(first.state,'Да');assert.equal(second.result.factId,'f_sofia_late');assert.notEqual(second.result.factId,'f_sofia_laptop');assert.equal(second.state.context.dialogue.pending,null);
});

test('a concrete object still answers the original clarification',()=>{
 const first=send(start(),'Вы отправили?');assert.ok(first.result.guidance);
 assert.equal(send(first.state,'Сообщение').result.factId,'f_maxim_sent');
});

test('cancel clears clarification and guides to a new question without resetting the case',()=>{
 let state=send(start(),'Вы отправили?').state;const before=state.totalQuestions;
 state=send(state,'Отмена').state;assert.equal(state.context.dialogue.pending,null);assert.equal(state.totalQuestions,before);assert.ok(state.context.dialogue.offer);
});

test('repeated misunderstanding gives a usable example question',()=>{
 let state=send(start(),'первый неизвестный вопрос').state;
 const next=send(state,'второй неизвестный вопрос');state=next.state;
 const id=state.context.dialogue.offer.topicId;const topic=story.dialogue.topics.find(item=>item.id===id);
 assert.ok(next.result.guidance.includes(topic.question));assert.ok(send(state,topic.question).result.understood);
});

for(const text of ['компютер','сообшение','фотаграфия'])test(`a topic typo needs confirmation, never a guessed factual answer: ${text}`,()=>{
 const id=text==='фотаграфия'?'lena':'maxim';const first=send(start(id),text);
 assert.equal(first.result.status,'UNKNOWN');assert.equal(first.result.factId,null);assert.equal(first.result.reason,'CLARIFY');
 assert.ok(send(first.state,'Да').result.understood);
});

test('unknown fact and known-but-inaccessible fact both lead somewhere without changing truth',()=>{
 for(const [id,text] of [['maxim','Когда вы уходили вы выключили компьютер?'],['lena','София искала ноутбук?']]) {
   const first=send(start(id),text);assert.equal(first.result.status,'UNKNOWN');assert.ok(first.result.guidance);assert.deepEqual(first.state.discoveredFacts,[]);
   const next=send(first.state,'Расскажи');assert.ok(next.result.understood);assert.ok(story.facts.find(f=>f.id===next.result.factId).knownBy.includes(id));
 }
});

test('hidden information is not proposed as a recovery topic',()=>{
 const fixture=structuredClone(story);fixture.facts.find(f=>f.id==='f_computer_auto').revealPolicy={mode:'withheld'};
 const first=send(start('maxim',fixture),'неясно',fixture);
 assert.notEqual(first.state.context.dialogue.offer.topicId,'computer');
 assert.notEqual(send(first.state,'Да',fixture).result.factId,'f_computer_auto');
});

test('offers are rechecked against actual knowledge when accepted',()=>{
 const first=send(start(),'неясно');const fixture=structuredClone(story);
 fixture.facts.find(f=>f.id==='f_computer_auto').knownBy=[];
 const second=send(first.state,'Да',fixture);assert.equal(second.result.status,'UNKNOWN');assert.equal(second.result.factId,null);assert.deepEqual(second.state.discoveredFacts,[]);
});

test('exhausted knowledge offers navigation rather than fabricated facts',()=>{
 let state=start();state={...state,discoveredFacts:story.facts.map(f=>f.id),context:{dialogue:{seenReports:story.dialogue.selfReports.map(r=>r.id)}}};
 const first=send(state,'Что дальше?');assert.equal(first.result.factId,null);assert.equal(first.state.context.dialogue.offer.type,'navigation');noSecrets(first.result.guidance);
});

test('switching witnesses clears old offers and bare yes cannot use another witness knowledge',()=>{
 const old=send(start(),'Помоги').state;const state=selectWitness(old,'lena',story);
 const next=send(state,'Да');assert.equal(next.result.factId,null);assert.notEqual(next.state.context.dialogue.offer.topicId,'computer');
});

test('guidance is stored separately from evidence and can be repeated safely',()=>{
 const first=send(start(),'Вы отправили сообщение?');
 assert.ok(first.result.guidance);assert.equal(first.state.transcript.at(-1).text,'Нет, я его не отправлял.');
 assert.equal(first.state.transcript.at(-1).guidance,first.result.guidance);
 const repeated=send(first.state,'Повтори');assert.equal(repeated.result.guidance,first.result.guidance);assert.equal(repeated.accepted,false);
});

test('every offered example is grammatical data that routes back to its topic',()=>{
 for(const witness of story.characters)for(const topicId of story.dialogue.witnesses[witness.id].topics) {
   const topic=story.dialogue.topics.find(t=>t.id===topicId);
   const result=answerTurn({text:topic.question,witnessId:witness.id,story,state:start(witness.id)});
   if(result.factId)assert.ok(topic.factIds.includes(result.factId));
   else assert.ok(['NOT_KNOWN','SELF_REPORT','WITHHELD'].includes(result.reason));
 }
});

test('long recovery dialogue progresses, has no secret leaks and no hidden mutable memory',()=>{
 let state=start();const before=structuredClone(story);
 for(const text of ['запутался','Да','нет','???','Расскажи','Что ещё?','не знаю','превет','Давай другую','Нет','Помоги']) {
   const result=send(state,text);state=result.state;assert.ok(result.result.guidance||result.result.navigation);noSecrets(result.result.reply+' '+result.result.guidance);
 }
 assert.deepEqual(story,before);assert.deepEqual(createState(story).context,{});
});

test('repeat on a fresh conversation still provides an actionable next step',()=>{
 const first=send(start('lena'),'Повтори');assert.equal(first.accepted,false);assert.ok(first.result.guidance);assert.equal(send(first.state,'Да').result.factId,'f_lena_photo');
});

test('an explicit help request reopens choices after all offers were declined',()=>{
 let state=send(start(),'Помоги').state;for(let i=0;i<5;i++)state=send(state,'Нет').state;
 assert.equal(state.context.dialogue.offer,null);
 state=send(state,'Помоги').state;assert.equal(state.context.dialogue.offer.type,'topic');assert.ok(send(state,'Да').result.understood);
});

test('natural requests can change the subject instead of accepting the old offer',()=>{
 const state=send(start(),'неясный вопрос').state;
 for(const text of ['Нет, расскажи о сообщении','Да, расскажите о сообщении','Давай про сообщение','Хочу узнать о сообщении','Я хочу узнать о сообщении','Расскажи, что знаешь про сообщение'])assert.equal(send(state,text).result.factId,'f_maxim_sent',text);
});

test('an unsupported action about a known topic guides to that topic without answering the action',()=>{
 const first=send(start(),'Вы видели сообщение?');assert.equal(first.result.reason,'NO_FACT');assert.equal(first.result.factId,null);
 assert.equal(first.state.context.dialogue.offer.topicId,'message');assert.ok(first.result.guidance.includes('о сообщении'));
 const next=send(first.state,'Расскажи');assert.equal(next.result.factId,'f_maxim_sent');assert.equal(next.result.reply,'Нет, я его не отправлял.');
});
