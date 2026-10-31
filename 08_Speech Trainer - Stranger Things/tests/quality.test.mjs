import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { answerQuestion } from '../src/core/storyEngine.js';
import { createState,selectWitness,submitQuestion } from '../src/core/state.js';
import { evaluateSolution } from '../src/core/solution.js';
const story=JSON.parse(await readFile(new URL('../data/cases/case-001.json',import.meta.url)));
const answer=(text,witnessId='ilya',state={})=>answerQuestion({text,witnessId,story,state});
const correct='В комнату вошла София. Она искала старый ноутбук своей сестры. Она получила запасной ключ и вошла вечером. Когда она включила компьютер, старая программа отправила сообщение автоматически';
const evaluate=text=>evaluateSolution({text,criteria:story.solutionCriteria});

test('accusative object cannot be promoted to the witness subject',()=>{
 assert.equal(answer('Илью видела София у входа?').status,'UNKNOWN');
 assert.equal(answer('Илью заметила София у технического входа?').status,'UNKNOWN');
 assert.equal(answer('Софию у входа видел Илья?').status,'YES');
});

test('wrong pronoun gender is unresolved, not an alias for the last actor',()=>{
 let state=selectWitness(createState(story),'maxim',story);
 state=submitQuestion({text:'Максим отправил сообщение?',requestId:'one',state,story}).state;
 assert.equal(answer('Она отправила сообщение?','maxim',state).status,'UNKNOWN');
 state=selectWitness(state,'sofia',story);
 state=submitQuestion({text:'София искала ноутбук?',requestId:'two',state,story}).state;
 assert.equal(answer('Он искал ноутбук?','sofia',state).status,'UNKNOWN');
});

test('a unique multiword laptop reference remains available in the same conversation',()=>{
 let state=selectWitness(createState(story),'sofia',story);
 state=submitQuestion({text:'Ты искала старый ноутбук?',requestId:'one',state,story}).state;
 assert.equal(answer('Ты его искала?','sofia',state).status,'YES');
 assert.equal(answer('Ты её искала?','sofia',state).status,'UNKNOWN');
 assert.equal(answer('Ты его искала?','sofia',selectWitness(state,'sofia',story)).status,'UNKNOWN');
});

test('object-first actors in a hypothesis must not inherit Sofia by default',()=>{
 const wrong='В комнате была София. Старый ноутбук искала Лена. Запасной ключ получила Аня. Когда включился компьютер, старая программа отправила сообщение автоматически.';
 const result=evaluate(wrong);
 assert.notEqual(result.verdict,'CORRECT');
 assert.ok(!result.matched.includes('why'));assert.ok(!result.matched.includes('how'));
});

test('verbs added to a keyword salad do not unlock the answer',()=>{
 const text='София ноутбук ключ программа компьютер автоматически была искала получила отправила включила в комнате старый запасной';
 assert.notEqual(evaluate(text).verdict,'CORRECT');
});

test('a named sister or a reported subject is not Sofia performing the room action',()=>{
 for(const who of ['В комнате была сестра Софии','София думала, что кто-то вошёл в комнату']) {
   const text=who+'.'+correct.split('.').slice(1).join('.');
   assert.notEqual(evaluate(text).verdict,'CORRECT',who);
   assert.ok(!evaluate(text).matched.includes('who'),who);
 }
});

test('imperfect negative and contradictory account cannot retain a passed criterion',()=>{
 assert.notEqual(evaluate(correct+'. София не получала ключ.').verdict,'CORRECT');
 assert.notEqual(evaluate(correct+'. Компьютер не запускался, а сообщение не пришло.').verdict,'CORRECT');
});

test('negative questions keep unambiguous replies for positive and negative facts',()=>{
 const no=answer('Ты не отправлял сообщение?','maxim');
 assert.equal(no.status,'YES');assert.equal(no.reply,'Нет, я его не отправлял.');
 const seen=answer('Ты не видел Софию у входа?');
 assert.equal(seen.status,'NO');assert.equal(seen.reply,'Я видел Софию у технического входа.');
 for(const text of ['Не ты отправил сообщение?','Ты отправил не сообщение?','Ты не не отправлял сообщение?'])assert.equal(answer(text,'maxim').status,'UNKNOWN');
});

test('five bounded A2 form errors still resolve subject, action and object',()=>{
 for(const [witnessId,text,status] of [
   ['maxim','Ты отправлять сообщение?','NO'],
   ['anya','София быть в здании после 21:30?','YES'],
   ['sofia','Ты искать ноутбук?','YES'],
   ['ilya','Ты видеть Софию у входа?','YES'],
   ['lena','Ты сделать фотографию?','NO']
 ]) assert.equal(answer(text,witnessId).status,status,text);
});

test('speech-like time formatting is normalized without accepting a different hour',()=>{
 assert.equal(answer('София была в здании после 21 30?','anya').status,'YES');
 assert.equal(answer('София была в здании после 23 30?','anya').status,'UNKNOWN');
});

test('unknown recipient is not discarded as a filler word',()=>{
 assert.equal(answer('София искала мне ноутбук?','sofia').status,'UNKNOWN');
});

test('five false-answer formulations use only the two authored false facts',()=>{
 for(const [witness,text,factId] of [['maxim','Ты отправил сообщение?','f_maxim_sent'],['maxim','Ты написал это сообщение?','f_maxim_sent'],['maxim','Ты сообщение послал?','f_maxim_sent'],['lena','Ты сделала фотографию?','f_lena_photo'],['lena','Ты сняла снимок?','f_lena_photo']]) {
   const result=answer(text,witness);assert.equal(result.status,'NO');assert.equal(result.factId,factId);assert.ok(result.reply.length>10);
 }
});

test('expanded story preserves seed truth and knowledge boundaries',()=>{
 assert.equal(story.facts.length,21);
 assert.equal(story.facts.filter(fact=>fact.value===false).length,3);
 assert.ok(story.facts.every(fact=>fact.importance==='relevant'));
 assert.deepEqual(story.facts.find(fact=>fact.id==='f_ghost_traces').knownBy,[]);
 assert.deepEqual(story.facts.find(fact=>fact.id==='f_sofia_laptop').knownBy,['sofia']);
});

test('pronoun agreement follows the last noun form, not only the shared fact ID',()=>{
 let state=selectWitness(createState(story),'lena',story);
 state=submitQuestion({text:'Ты сняла снимок?',requestId:'one',state,story}).state;
 assert.equal(answer('Ты его сняла?','lena',state).status,'NO');
 state=submitQuestion({text:'Ты сделала фотографию?',requestId:'two',state,story}).state;
 assert.equal(answer('Ты её сняла?','lena',state).status,'NO');
 assert.equal(answer('Ты его сняла?','lena',state).status,'UNKNOWN');
});

test('finding the laptop is not evidence supplied by the search fact',()=>{
 assert.equal(answer('Ты найти ноутбук?','sofia').status,'UNKNOWN');
 assert.equal(answer('Ты хотела найти ноутбук?','sofia').status,'YES');
});

test('explicitly negating the actor invalidates the corresponding solution element',()=>{
 for(const [clause,id] of [['В комнате была не София.','who'],['Старый ноутбук искала не София.','why'],['Не София получила запасной ключ.','how']]) {
   const result=evaluate(correct+'. '+clause);
   assert.notEqual(result.verdict,'CORRECT',clause);
   assert.ok(!result.matched.includes(id),clause);
 }
});

test('denying the computer start contradicts the message explanation',()=>{
 for(const clause of ['Компьютер не запускался.','Компьютер не включался.','Не включился компьютер.']) {
   const result=evaluate(correct+'. '+clause);
   assert.notEqual(result.verdict,'CORRECT',clause);
   assert.ok(!result.matched.includes('message'),clause);
 }
});
