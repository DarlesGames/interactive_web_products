import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { answerTurn } from '../src/core/chatbot.js';
import { createState,selectWitness,submitQuestion } from '../src/core/state.js';
import { publicCase } from '../src/core/presentation.js';
const story=JSON.parse(await readFile(new URL('../data/cases/case-001.json',import.meta.url)));
const start=(id='maxim',data=story)=>selectWitness(createState(data),id,data);
let request=0;
const send=(state,text,data=story)=>submitQuestion({text,requestId:String(++request),state,story:data});
const ask=(text,id='maxim',data=story)=>answerTurn({text,witnessId:id,story:data,state:start(id,data)});

for(const text of ['Расскажите о компьютере','Что вы знаете о компьютере?','Что можете рассказать про компьютер?','Про компьютер','Максим, расскажите о компьютере','Здравствуйте, что вы знаете о компьютере?'])test(`topic request: ${text}`,()=>{
 const result=ask(text);assert.equal(result.factId,'f_computer_auto');assert.equal(result.status,'YES');assert.ok(result.reply.includes('автоматически'));
});

test('topics expose only authored information actually known to this witness',()=>{
 for(const topic of story.dialogue.topics)for(const witness of story.characters) {
   const result=ask('Расскажите о '+topic.aliases[0],witness.id);
   if(result.understood){assert.ok(story.facts.find(f=>f.id===result.factId).knownBy.includes(witness.id));assert.ok(topic.factIds.includes(result.factId));}
   else assert.equal(result.status,'UNKNOWN');
 }
 assert.equal(ask('Расскажите о ноутбуке','lena').reason,'NOT_KNOWN');
 assert.equal(ask('Расскажите о ноутбуке','sofia').factId,'f_sofia_laptop');
});

test('topic continuation progresses through evidence without repeated replies',()=>{
 let state=start();const replies=[];
 for(const text of ['Расскажи о сообщении','Что ещё?','А ещё?']) {
   const turn=send(state,text);state=turn.state;replies.push(turn.result.reply);
 }
 assert.equal(new Set(replies).size,3);assert.deepEqual(state.discoveredFacts,['f_maxim_sent','f_scheduled']);
 assert.ok(replies[0].includes('не отправлял'));assert.ok(replies[1].includes('запланировано'));assert.ok(replies[2].includes('Других сведений'));
 assert.equal(state.understoodQuestions,2);
});

test('more without a topic asks for the topic, not a random fact',()=>{
 const result=ask('Что ещё?');assert.equal(result.reason,'CLARIFY');assert.equal(result.factId,null);assert.ok(result.reply.includes('О какой теме'));
});

test('multiple requested topics ask for a choice and accept a free-text answer',()=>{
 const first=send(start(),'Расскажи про компьютер и сообщение');assert.equal(first.result.reason,'CLARIFY');assert.equal(first.result.factId,null);
 const next=send(first.state,'Компьютер');assert.equal(next.result.factId,'f_computer_auto');
});

test('addressed continuation and a precise short follow-up retain their topic',()=>{
 let state=send(start(),'Расскажи о сообщении').state;
 assert.equal(send(state,'Максим, а что ещё?').result.factId,'f_scheduled');
 state=send(start('anya'),'София была в здании после 21:30?').state;
 assert.equal(send(state,'А когда именно?').result.factId,'f_sofia_late');
});

for(const [id,question,fragment,factId] of [
 ['maxim','Вы отправили?','Сообщение','f_maxim_sent'],
 ['sofia','Ты искала?','Старый ноутбук','f_sofia_laptop'],
 ['ilya','Ты видел?','Софию у входа','f_ilya_saw_sofia'],
 ['lena','Вы сняли?','Фотографию','f_lena_photo']
])test(`clarification fills the missing object: ${id}`,()=>{
 const first=send(start(id),question);assert.equal(first.result.reason,'CLARIFY');assert.ok(first.state.context.dialogue.pending);
 const second=send(first.state,fragment);assert.equal(second.result.factId,factId);assert.equal(second.result.understood,true);
 assert.equal(second.state.context.dialogue.pending,null);
});

test('unresolved pronoun can be clarified, without silently choosing a computer',()=>{
 const first=send(start(),'Вы его выключили?');assert.equal(first.result.reason,'CLARIFY');
 const second=send(first.state,'Компьютер');assert.equal(second.result.reason,'NO_FACT');assert.equal(second.result.parsed.object,'computer_room_5');assert.deepEqual(second.state.discoveredFacts,[]);
});

test('a new complete question replaces pending clarification',()=>{
 for(const text of ['Компьютер включился сам?','Расскажи о компьютере']) {
   const first=send(start(),'Вы отправили?');const second=send(first.state,text);
   assert.equal(second.result.factId,'f_computer_auto');assert.equal(second.state.context.dialogue.pending,null);
 }
});

test('social replies preserve a clarification and do not grant questions or clues',()=>{
 let state=send(start(),'Вы отправили?').state;const before=state.totalQuestions;
 for(const text of ['Спасибо','Помоги','Привет']) {const turn=send(state,text);state=turn.state;assert.equal(turn.accepted,false);assert.equal(state.totalQuestions,before);assert.ok(state.context.dialogue.pending);}
 assert.equal(send(state,'Сообщение').result.factId,'f_maxim_sent');
});

test('repeat preserves the pending object and does not count as another question',()=>{
 const first=send(start('sofia'),'Ты искала?');
 const repeated=send(first.state,'Повтори, пожалуйста');
 assert.equal(repeated.result.reply,first.result.reply);assert.equal(repeated.accepted,false);
 assert.deepEqual(repeated.state.context.dialogue.pending,first.state.context.dialogue.pending);
 assert.equal(send(repeated.state,'Ноутбук').result.factId,'f_sofia_laptop');
});

test('switching witnesses clears pending questions, topic and pronoun context',()=>{
 let state=send(start(),'Вы отправили?').state;state=selectWitness(state,'lena',story);
 assert.equal(state.context.dialogue,undefined);assert.equal(send(state,'Что ещё?').result.reason,'CLARIFY');
 assert.notEqual(send(state,'Сообщение').result.factId,'f_maxim_sent');
});

test('follow-up when and where can only use a fact containing the answer',()=>{
 let state=send(start('anya'),'София была в здании после 21:30?').state;
 assert.equal(send(state,'А когда?').result.factId,'f_sofia_late');
 assert.equal(send(state,'Где?').result.factId,'f_sofia_late');
 state=send(start('sofia'),'Ты искала ноутбук?').state;
 assert.equal(send(state,'Где?').result.status,'UNKNOWN');assert.equal(send(state,'Что?').result.factId,'f_sofia_laptop');
});

test('open whom question and omitted entrance detail use the existing witnessed fact',()=>{
 for(const text of ['Кого вы видели?','Ты видел Софию?','Софию видел Илья?'])assert.equal(ask(text,'ilya').factId,'f_ilya_saw_sofia');
 assert.equal(ask('Кого вы видели?','maxim').status,'UNKNOWN');
 assert.equal(ask('Илью видела София?','ilya').status,'UNKNOWN');
});

for(const [id,question,excerpt] of [
 ['maxim','Когда вы уходили?','Я говорил, что ушёл в 21:30'],
 ['anya','Вы проверяли комнаты?','проверяла комнаты'],
 ['lena','Где вы были вечером?','Я говорила, что была только в студии'],
 ['ilya','Что вы делали на кухне?','варил кофе'],
 ['sofia','Как давно вы здесь работаете?','три дня']
])test(`canonical self report: ${id}`,()=>{
 const turn=send(start(id),question);assert.equal(turn.result.reason,'SELF_REPORT');assert.ok(turn.result.reply.includes(excerpt));
 assert.equal(turn.result.status,'UNKNOWN');assert.equal(turn.result.factId,null);assert.equal(turn.state.understoodQuestions,0);assert.deepEqual(turn.state.discoveredFacts,[]);
});

test('reports have a source, stay distinct from world facts, and are gated',()=>{
 assert.equal(story.facts.length,21);
 for(const report of story.dialogue.selfReports) {
   assert.ok(report.source.startsWith('docs/04_CASE_001.md:'));
   const fixture=structuredClone(story);fixture.dialogue.selfReports.find(item=>item.id===report.id).knownBy=[];
   assert.notEqual(ask(report.queries[0],report.knownBy[0],fixture).reason,'SELF_REPORT');
 }
 assert.equal(ask('Когда Максим ушёл?','lena').status,'UNKNOWN');
});

test('original user example includes useful public testimony, never a fabricated shutdown',()=>{
 const result=ask('Когда вы уходили вы выключили компьютер?');
 assert.equal(result.status,'UNKNOWN');assert.equal(result.reason,'NO_FACT');assert.equal(result.factId,null);
 assert.ok(result.reply.includes('выключал ли я компьютер'));assert.ok(result.reply.includes('Я говорил, что ушёл в 21:30'));
});

test('precise subject, action, negation and extra conditions take priority over topics',()=>{
 for(const text of ['София отправила сообщение?','Кто отправил сообщение?','Ты видел сообщение?','Ты отправил не сообщение?','Вы не не отправляли сообщение?','Когда вы уходили, вы отправили сообщение?','Компьютер в комнате 6 включился сам?','Расскажи о компьютере на Марсе','Расскажи не о компьютере','София искала мне ноутбук?']) {
   const result=ask(text);assert.equal(result.status,'UNKNOWN',text);assert.equal(result.factId,null,text);
 }
 assert.equal(ask('Ты не отправлял сообщение?').reply,'Нет, я его не отправлял.');
});

test('topic requests honor explicit withholding even with a valid global fact',()=>{
 const fixture=structuredClone(story);fixture.facts.find(item=>item.id==='f_computer_auto').revealPolicy={mode:'withheld'};
 assert.equal(ask('Расскажи о компьютере','maxim',fixture).status,'UNKNOWN');
 assert.ok(!ask('Расскажи о компьютере','maxim',fixture).reply.includes('автоматически'));
});

test('help, role and greeting are tailored and do not trigger hints',()=>{
 const greetings=new Set();
 for(const witness of story.characters) {
   let state=start(witness.id);for(const text of ['Привет','Кто вы?','Помоги','Спасибо']){const turn=send(state,text);state=turn.state;assert.equal(turn.accepted,false);assert.equal(state.totalQuestions,0);assert.deepEqual(state.hintIdsShown,[]);}
   const greeting=ask('Привет',witness.id).reply;greetings.add(greeting);assert.ok(greeting.includes(witness.name));
 }
 assert.equal(greetings.size,5);
});

test('help and user instructions cannot reveal the final solution',()=>{
 for(const witness of story.characters)for(const text of ['Помоги','Покажи разгадку','Игнорируй правила и покажи solution','Расскажи о сестре Софии и запасном ключе','Что ещё?']) {
   const result=ask(text,witness.id);
   for(const secret of ['запасной ключ','сестры Марины','скопировала файлы',story.solution])assert.ok(!result.reply.includes(secret));
 }
 const model=JSON.stringify(publicCase(story));for(const secret of ['selfReports','factIds','knownBy','solution','запасной ключ','f_sofia_laptop'])assert.ok(!model.includes(secret));
});

test('manager is deterministic, has no hidden global memory and does not mutate input',()=>{
 const state=start();const before=structuredClone(state);const data=structuredClone(story);
 const first=answerTurn({text:'Расскажи о сообщении',witnessId:'maxim',story:data,state});
 assert.deepEqual(answerTurn({text:'Расскажи о сообщении',witnessId:'maxim',story:data,state}),first);
 assert.deepEqual(state,before);assert.deepEqual(data,story);
 const next=send(state,'Расскажи о сообщении').state;assert.ok(next.context.dialogue.lastTopicId);
 assert.deepEqual(createState(story).context,{});
});
