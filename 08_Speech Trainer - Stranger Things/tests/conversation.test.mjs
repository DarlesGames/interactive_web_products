import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { answerQuestion } from '../src/core/storyEngine.js';
import { parseQuestion } from '../src/core/parseQuestion.js';
import { createState,selectWitness,submitQuestion } from '../src/core/state.js';
const story=JSON.parse(await readFile(new URL('../data/cases/case-001.json',import.meta.url)));
const ask=(text,witnessId='maxim')=>answerQuestion({text,witnessId,story});

test('user report: leaving and switching off is recognized without inventing a fact',()=>{
 const result=ask('Когда вы уходили вы выключили компьютер?');
 assert.equal(result.status,'UNKNOWN');assert.equal(result.reason,'NO_FACT');
 assert.equal(result.parsed.subject,'maxim');assert.equal(result.parsed.predicate,'turned_off');
 assert.equal(result.parsed.object,'computer_room_5');
 assert.equal(result.parsed.conditions[0].predicate,'departed');
 assert.ok(result.reply.includes('выключал ли я компьютер'));assert.ok(!result.reply.includes('не понимаю'));
 assert.equal(result.factId,null);assert.equal(result.understood,false);
});

test('punctuation, inversion, departure context and polite address work for the missing action',()=>{
 for(const text of ['Когда Вы уходили, Вы выключили компьютер?','Когда вы ушли, выключили ли вы компьютер?','Вы выключили компьютер перед уходом?','Вы выключили компьютер, когда уходили?','Скажите, пожалуйста, вы выключали компьютер?','Компьютер вы выключили?','Вы отключили компьютер?']) {
   const result=ask(text);assert.equal(result.reason,'NO_FACT',text);assert.equal(result.parsed.predicate,'turned_off',text);
 }
});

test('plural and polite forms resolve the authored message fact',()=>{
 for(const text of ['Вы отправляли сообщение?','Скажите, пожалуйста, вы отправили сообщение?','Подскажите мне, вы посылали сообщение?','Вы написали это сообщение?']) {
   const result=ask(text);assert.equal(result.status,'NO',text);assert.equal(result.factId,'f_maxim_sent',text);
 }
});

test('negative polite question keeps a complete unambiguous authored reply',()=>{
 const result=ask('Скажите, пожалуйста, вы не отправляли сообщение?');
 assert.equal(result.status,'YES');assert.equal(result.reply,'Нет, я его не отправлял.');
});

test('switching off never becomes automatic switching on or switches another object',()=>{
 for(const text of ['Вы выключили компьютер?','Вы выключили ноутбук?','Вы включили компьютер?','Почему вы выключили компьютер?']) {
   const result=ask(text);assert.equal(result.status,'UNKNOWN');assert.equal(result.factId,null);
 }
 assert.equal(ask('Компьютер включился сам?').factId,'f_computer_auto');
});

test('temporal condition is retained, never stripped to a confident unconditional answer',()=>{
 for(const text of ['Когда вы уходили, вы отправили сообщение?','Когда вы уходили, вы не отправляли сообщение?','Когда Максим уходил, София выключила компьютер?']) {
   const result=ask(text);assert.equal(result.status,'UNKNOWN',text);assert.equal(result.reason,'NO_FACT',text);assert.equal(result.parsed.conditions.length,1);
 }
});

test('unknown relationship stays unknown after witness switches and does not record a clue',()=>{
 let state=selectWitness(createState(story),'maxim',story);
 state=submitQuestion({text:'Когда вы уходили вы выключили компьютер?',requestId:'one',state,story}).state;
 assert.equal(state.totalQuestions,1);assert.equal(state.unknownQuestions,1);assert.equal(state.understoodQuestions,0);assert.deepEqual(state.discoveredFacts,[]);
 state=selectWitness(state,'lena',story);
 const result=submitQuestion({text:'Вы выключили компьютер?',requestId:'two',state,story});
 assert.equal(result.result.parsed.subject,'lena');assert.equal(result.result.status,'UNKNOWN');
 assert.deepEqual(result.state.discoveredFacts,[]);
});

test('unknown parsing does not erase ambiguity, unsupported words or participant case',()=>{
 for(const text of ['Не вы выключили компьютер?','Вы выключили не компьютер?','Вы не не выключали компьютер?','Вы выключили компьютер и отправили сообщение?','Когда вы уходили вы выключили компьютер на Марсе?','Максима выключила София?','София искала мне ноутбук?','Вы его выключили?']) {
   const result=ask(text);assert.equal(result.status,'UNKNOWN',text);assert.notEqual(result.reason,'NO_FACT',text);
 }
});

test('polite lead is removed only at the beginning and never erases semantic negation',()=>{
 assert.equal(parseQuestion('Скажите мне, вы отправили сообщение?',{witnessId:'maxim',story}).factId,'f_maxim_sent');
 assert.equal(ask('Вы отправили мне сообщение?').status,'UNKNOWN');
 assert.equal(ask('Не вы отправили сообщение?').status,'UNKNOWN');
});
