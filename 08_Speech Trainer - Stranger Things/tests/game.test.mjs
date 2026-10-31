import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createState,selectWitness,submitQuestion,requestHint } from '../src/core/state.js';
import { evaluateSolution } from '../src/core/solution.js';
const story=JSON.parse(await readFile(new URL('../data/cases/case-001.json',import.meta.url)));
const start=()=>selectWitness(createState(story),'maxim',story);
const send=(state,text,id)=>submitQuestion({state,text,requestId:id,story});
test('empty, duplicate request and semantic duplicate do not grow counters',()=>{
 let state=start();assert.equal(send(state,'','empty').state,state);
 state=send(state,'Ты отправил сообщение?','one').state;
 assert.equal(send(state,'Ты отправил сообщение?','one').state,state);
 const duplicate=send(state,'Ты сообщение написал?','two');assert.equal(duplicate.state.totalQuestions,1);assert.equal(duplicate.accepted,false);
});
test('unique unknowns count, switching keeps statistics and resets pronouns',()=>{
 let state=send(start(),'Ты отправил сообщение?','one').state;
 assert.equal(send(state,'Ты его написал?','two').result.status,'NO');
 state=selectWitness(state,'lena',story);
 assert.equal(state.totalQuestions,1);assert.equal(send(state,'Ты его видел?','three').result.status,'UNKNOWN');
 state=send(state,'Вчера стол зелёный','four').state;
 assert.equal(state.totalQuestions,2);assert.equal(state.unknownQuestions,1);assert.equal(state.transcript[0].witnessId,'maxim');
});
test('manual hint at question 2 does not repeat at 3; auto thresholds 6 and 9',()=>{
 let state=start();for(let i=1;i<=2;i++)state=send(state,`неясный вопрос ${i}`,String(i)).state;
 state=requestHint(state,story);assert.deepEqual(state.hintIdsShown,['hint-1']);
 for(let i=3;i<=9;i++){state=send(state,`неясный вопрос ${i}`,String(i)).state;if(i===3)assert.deepEqual(state.hintIdsShown,['hint-1']);if(i===6)assert.deepEqual(state.hintIdsShown,['hint-1','hint-2']);}
 assert.deepEqual(state.hintIdsShown,['hint-1','hint-2','hint-3']);
 assert.deepEqual(requestHint(state,story).hintIdsShown,state.hintIdsShown);
});
test('all hints manually then 3/6/9 never duplicate, reset is clean',()=>{
 let state=start();for(let i=0;i<5;i++)state=requestHint(state,story);
 for(let i=0;i<10;i++)state=send(state,`непонятное ${i}`,String(i)).state;
 assert.equal(state.hintIdsShown.length,3);
 const fresh=createState(story);assert.equal(fresh.totalQuestions,0);assert.deepEqual(fresh.transcript,[]);assert.deepEqual(fresh.hintIdsShown,[]);assert.equal(fresh.hypothesisAttempts,0);
});
const correct='В комнату вошла София. Она искала старый ноутбук своей сестры. Она получила запасной ключ и вошла вечером. Когда она включила компьютер, старая программа отправила сообщение автоматически';
test('canonical full version matches four semantic relations',()=>{
 const result=evaluateSolution({text:correct,criteria:story.solutionCriteria});assert.equal(result.verdict,'CORRECT');assert.equal(result.matched.length,4);
});
test('full answer from supplied data is accepted; explicit contradictions are not',()=>{
 assert.equal(evaluateSolution({text:story.solution,criteria:story.solutionCriteria}).verdict,'CORRECT');
 for(const tail of [' Она не искала ноутбук.',' Она не получила ключ.',' Программа не отправила сообщение.'])assert.notEqual(evaluateSolution({text:correct+'.'+tail,criteria:story.solutionCriteria}).verdict,'CORRECT');
});
test('one name and three elements are partial, no answer text leaks in feedback',()=>{
 for(const text of ['София','В комнате была София',correct.split('.').slice(0,3).join('.')]) {
   const result=evaluateSolution({text,criteria:story.solutionCriteria});assert.equal(result.verdict,'PARTIAL');assert.ok(!result.feedback.includes('запасной ключ'));assert.ok(!result.feedback.includes('старый ноутбук'));
 }
});
test('keyword lists, negation and wrong actors never pass',()=>{
 for(const text of ['София старый ноутбук запасной ключ автоматически','Марина вошла в комнату. Она искала старый ноутбук. Она получила запасной ключ. Старая программа отправила сообщение автоматически.','В комнате не была София. Она не искала старый ноутбук. Она не получила запасной ключ.','Компьютер яблоко потому вчера']) assert.notEqual(evaluateSolution({text,criteria:story.solutionCriteria}).verdict,'CORRECT',text);
 assert.equal(evaluateSolution({text:'София ноутбук ключ автоматически',criteria:story.solutionCriteria}).verdict,'UNPARSEABLE');
});
test('state transitions do not mutate inputs',()=>{
 const state=start();const before=structuredClone(state);send(state,'Ты отправил сообщение?','one');assert.deepEqual(state,before);
});
