import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { answerQuestion } from '../src/core/storyEngine.js';
import { parseQuestion } from '../src/core/parseQuestion.js';
import { normalize } from '../src/core/normalize.js';
import { publicCase } from '../src/core/presentation.js';
const story=JSON.parse(await readFile(new URL('../data/cases/case-001.json',import.meta.url)));
const cases=[
 ['anya','София была в здании после 21:30?','YES'],
 ['sofia','Ты была в здании после девяти тридцати?','YES'],
 ['maxim','Ты отправил сообщение?','NO'],
 ['maxim','Ты написал это сообщение?','NO'],
 ['maxim','Ты не отправлял сообщение?','YES'],
 ['maxim','Компьютер включился сам?','YES'],
 ['maxim','Сообщение было запланировано заранее?','YES'],
 ['sofia','Ты искала ноутбук?','YES'],
 ['sofia','Ты искала старый компьютер?','UNKNOWN'],
 ['ilya','Ты видел Софию у технического входа?','YES'],
 ['ilya','Марина работала здесь раньше?','YES'],
 ['anya','Марина работала здесь год назад?','YES'],
 ['lena','Ты сделала фотографию?','NO'],
 ['sofia','В комнате кто-то был?','YES'],
 ['lena','София искала ноутбук?','UNKNOWN'],
 ['anya','Компьютер включился сам?','UNKNOWN'],
 ['ilya','Максим отправил сообщение?','UNKNOWN'],
 ['maxim','Ты видел Софию у входа?','UNKNOWN'],
 ['lena','Призрак оставил мокрые следы?','UNKNOWN'],
 ['maxim','София отправила сообщение?','UNKNOWN'],
 ['anya','Ты видел подарок?','UNKNOWN'],
 ['maxim','Ты его видел?','UNKNOWN'],
 ['ilya','Вчера потому что книга зелёный','UNKNOWN'],
 ['sofia','Кто сделал мне чай вчера на Марсе?','UNKNOWN'],
 ['lena','Какая программа у Максима?','UNKNOWN'],
 ['anya','Повтори, пожалуйста','UNKNOWN'],
 ['maxim','Ты сообщение написал?','NO'],
 ['maxim','Ты написал фотографию?','UNKNOWN'],
 ['sofia','Ты искала старый ноутбук сестры?','YES'],
 ['ilya','Я знаю, что София пришла поздно','UNKNOWN']
];
for(const [index,[witnessId,text,status]] of cases.entries()) test(`manual ${String(index+1).padStart(2,'0')}: ${witnessId} ${text}`,()=>{
 const result=answerQuestion({text,witnessId,story});
 assert.equal(result.status,status,JSON.stringify(result));
 if(index===4)assert.equal(result.reply,'Нет, я его не отправлял.');
 if(result.understood)assert.ok(story.facts.find(f=>f.id===result.factId).knownBy.includes(witnessId));
});
test('normalization retains negation, time and laptop/computer distinction',()=>{
 assert.ok(normalize('ТЫ не отправлял сообщение в 22:17',{witnessId:'maxim'}).tokens.includes('не'));
 assert.ok(normalize('21:30').tokens.includes('time2130'));
 assert.notEqual(normalize('ноутбук').text,normalize('компьютер').text);
});
test('unknown fact is never implicitly false or irrelevant',()=>{
 for(const text of ['У тебя велосипед?','Максим видел сообщение?','София была в офисе после 23:30?','Максим не искал ключ?']) assert.equal(answerQuestion({text,witnessId:'maxim',story}).status,'UNKNOWN');
});
test('knowledge gates every world fact for every witness',()=>{
 for(const fact of story.facts)for(const witness of story.characters){
   const mapping=story.questionMappings.find(m=>m.factId===fact.id);
   if(!mapping)continue; // Authored expansion routes and all access gates have their own matrix tests.
   const name=story.characters.find(c=>c.id===fact.subject)?.name || mapping.subjectAliases.find(alias=>!['ты','она'].includes(alias));
   const text=[name,mapping.predicateAliases[0],mapping.objectAliases[0],mapping.timeAliases?.[0]].filter(Boolean).join(' ');
   const result=answerQuestion({text,witnessId:witness.id,story});
   if(!fact.knownBy.includes(witness.id))assert.equal(result.status,'UNKNOWN',`${fact.id}:${witness.id}`);
 }
});
test('explicit withheld and irrelevant policies with a test fixture, not invented case facts',()=>{
 const fixture=structuredClone(story);
 const fact=fixture.facts.find(f=>f.id==='f_maxim_sent');
 fact.revealPolicy={mode:'withheld'};
 assert.equal(answerQuestion({text:'Ты отправил сообщение?',witnessId:'maxim',story:fixture}).reason,'WITHHELD');
 delete fact.revealPolicy;fact.importance='irrelevant';
 assert.equal(answerQuestion({text:'Ты отправил сообщение?',witnessId:'maxim',story:fixture}).status,'IRRELEVANT');
});
test('multiple equal candidates remain unknown',()=>{
 const fixture=structuredClone(story);
 fixture.facts.push({...fixture.facts[1],id:'duplicate'});fixture.questionMappings.push({...fixture.questionMappings[1],factId:'duplicate'});
 const result=answerQuestion({text:'Ты отправил сообщение?',witnessId:'maxim',story:fixture});
 assert.equal(result.status,'UNKNOWN');assert.equal(result.reason,'AMBIGUOUS');
});
test('public UI model excludes solution, aliases and knowledge tables',()=>{
 const data=publicCase(story);
 const serialized=JSON.stringify(data);
 for(const forbidden of ['solution','knownBy','f_sofia_laptop','запасной ключ','ноутбук сестры'])assert.ok(!serialized.includes(forbidden),forbidden);
 assert.equal(data.characters.length,5);
});
test('extra unsupported action, subject, location or negation scope is not guessed',()=>{
 for(const text of ['Ты отправил сообщение и видел Софию?','Не Максим отправил сообщение?','Компьютер в комнате 6 включился сам?','Лена сняла фотографию Максима?'])assert.equal(answerQuestion({text,witnessId:'maxim',story}).status,'UNKNOWN',text);
 assert.equal(parseQuestion('Ты отправил сообщение?',{story,witnessId:'maxim'}).subject,'maxim');
});
test('open questions resolve a single positive fact, never an absent sender',()=>{
 assert.equal(answerQuestion({text:'Что ты искала?',witnessId:'sofia',story}).factId,'f_sofia_laptop');
 assert.equal(answerQuestion({text:'Когда София была в здании?',witnessId:'anya',story}).factId,'f_sofia_late');
 assert.equal(answerQuestion({text:'Кто отправил сообщение?',witnessId:'maxim',story}).status,'UNKNOWN');
});
