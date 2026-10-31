import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {answerTurn} from '../src/core/chatbot.js';
import {createState,selectWitness,submitQuestion} from '../src/core/state.js';
const story=JSON.parse(await readFile(new URL('../data/cases/case-001.json',import.meta.url)));
const ask=(text,witnessId='anya',state={})=>answerTurn({text,witnessId,story,state});
const variants=[
  ['anya','f_sofia_late',['Кто был в тот вечер?','Кто был здесь в тот вечер?','Кто в тот вечер был?','Кто был вечером?','Кто находился тут?','Кто присутствовал в коворкинге?','Кто из сотрудников был в здании?','Кто оставался допоздна?','Скажите, пожалуйста, кто был в тот вечер?','Можете рассказать, кто был в тот вечер?','Мне интересно, кто был в тот вечер?','Кто был в здании после 21:30?']],
  ['maxim','f_computer_auto',['Как запустился компьютер?','Компьютер сам по себе включился?','Автоматически компьютер запустился?','Можете сказать, компьютер включился сам?']],
  ['maxim','f_maxim_sent',['Сообщение вы отправили?','Можете сказать, вы отправляли сообщение?','Вы прислали сообщение?']],
  ['anya','f_key',['Кому вы передали ключ?','Кому ключ вы выдали?','Расскажите, пожалуйста, кому вы дали ключ?','У кого ключ был?']],
  ['sofia','f_key',['Как ты попала в комнату?','Как в комнату вы вошли?','Вы получили ключ у Ани?']],
  ['sofia','f_sister',['Кому принадлежал ноутбук?','Можете рассказать, чей ноутбук?','Чей вы искали ноутбук?']],
  ['sofia','f_files',['Что на ноутбуке было?','Можете сказать, какие документы?']],
  ['sofia','f_window',['Окно почему открыто?','По какой причине окно открыто?','Кто открывал окно?','Как вы выходили?']],
  ['maxim','f_program',['По какой причине пришло сообщение?','Сообщение почему пришло?']],
  ['lena','f_photo_age',['На фотографии что видно?','Старая фотография?']],
  ['anya','f_photo_marina',['На фото кто?','Спиной кто стоит?']],
  ['maxim','f_maxim_help',['Софии вы помогали?','Вы помогли Софии?']],
];
for(const [witnessId,factId,phrases] of variants)for(const text of phrases)test(`meaning: ${witnessId}: ${text}`,()=>{
  const fact=story.facts.find(f=>f.id===factId);
  const result=ask(text,witnessId,{discoveredFacts:fact.revealPolicy?.requires || []});
  assert.equal(result.factId,factId,JSON.stringify(result));
  if(fact.revealPolicy?.requires)assert.equal(ask(text,witnessId).reason,'WITHHELD');
});

for(const text of ['Кто был утром?','Кто был вчера утром?','Кто был в другом здании?','Кто был в тот вечер на Марсе?','Кто не был в тот вечер?','Кто был в тот вечер и отправил сообщение?','Кто был в комнате 7?','Кто был в здании до 21:30?','Кто будет в здании завтра?','Кто был в тот вечер в комнате?'])test(`do not generalize case presence: ${text}`,()=>{
  assert.equal(ask(text).status,'UNKNOWN');assert.equal(ask(text).factId,null);
});

test('open presence answer is limited to the witness knowledge, not a fabricated list',()=>{
  assert.equal(ask('Кто был в тот вечер?','lena').reason,'NOT_KNOWN');
  assert.equal(ask('Кто был в тот вечер?','maxim').reason,'NOT_KNOWN');
  assert.equal(ask('Кто был в тот вечер?','sofia').factId,'f_sofia_late');
  assert.ok(!ask('Кто был в тот вечер?').reply.includes('Марина'));
});

test('politeness composes with paraphrases rather than requiring each full sentence in a dictionary',()=>{
  for(const [witnessId,factId,phrases] of variants) {
    const fact=story.facts.find(f=>f.id===factId);
    for(const text of phrases.filter(p=>!p.startsWith('Можете')&&!p.startsWith('Скажите')&&!p.startsWith('Расскажите')&&!p.startsWith('Мне'))) {
      for(const lead of ['Вы можете сказать, ','Не могли бы вы подсказать, ']) {
        assert.equal(ask(lead+text,witnessId,{discoveredFacts:fact.revealPolicy?.requires || []}).factId,factId,lead+text);
      }
    }
  }
});

test('equivalence preserves roles, action, denial and extra conditions',()=>{
  const state={discoveredFacts:story.facts.map(f=>f.id)};
  for(const [id,text] of [
    ['anya','Аня получила ключ у Софии?'],['anya','Кому вы не дали ключ?'],
    ['anya','Кому вы дали не ключ?'],['anya','Кому вы дали ключ утром?'],
    ['maxim','Сообщение София отправила?'],['maxim','Вы прочитали сообщение?'],
    ['maxim','Вы выключили компьютер?'],['maxim','Ноутбук включился сам?'],
    ['sofia','Почему ноутбук оставил Марину?'],['sofia','Вы не были в комнате?'],
    ['maxim','Вы помогли не Софии?'],['maxim','София помогла вам?'],
    ['lena','Что видно на фотографии с Марса?'],
  ])assert.equal(ask(text,id,state).status,'UNKNOWN',text);
});

test('rephrased question has one meaning for statistics and unlocks only its own evidence',()=>{
  let state=selectWitness(createState(story),'anya',story);
  for(const [i,text] of ['Кто был в тот вечер?','Кто присутствовал здесь?','Кто был вечером?'].entries()) {
    state=submitQuestion({state,story,text,requestId:String(i)}).state;
  }
  assert.equal(state.totalQuestions,1);
  assert.deepEqual(state.discoveredFacts,['f_sofia_late']);
  assert.equal(ask('Кому вы передали ключ?','anya',state).factId,'f_key');
});
