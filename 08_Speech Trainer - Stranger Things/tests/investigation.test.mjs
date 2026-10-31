import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createState,selectWitness,submitQuestion} from '../src/core/state.js';
import {answerKnownFact} from '../src/core/storyEngine.js';
import {answerTurn} from '../src/core/chatbot.js';
import {evaluateSolution} from '../src/core/solution.js';
const story=JSON.parse(await readFile(new URL('../data/cases/case-001.json',import.meta.url)));
let seq=0;
const ask=(state,id,text)=>submitQuestion({state:selectWitness(state,id,story),text,story,requestId:String(++seq)});
const expanded=story.facts.filter(f=>f.revealPolicy?.mode==='evidence');

for(const fact of expanded)test(`evidence gate and knowledge matrix: ${fact.id}`,()=>{
 for(const c of story.characters){
  const locked=answerKnownFact({factId:fact.id,witnessId:c.id,story});
  assert.equal(locked.status,'UNKNOWN');assert.equal(locked.factId,null);
  const state={discoveredFacts:fact.revealPolicy.requires};
  const open=answerKnownFact({factId:fact.id,witnessId:c.id,story,state});
  assert.equal(open.understood,fact.knownBy.includes(c.id));
  for(const missing of fact.revealPolicy.requires){
   assert.equal(answerKnownFact({factId:fact.id,witnessId:c.id,story,state:{discoveredFacts:state.discoveredFacts.filter(id=>id!==missing)}}).status,'UNKNOWN');
  }
 }
});

for(const q of story.dialogue.investigation.queries)test(`authored question variants: ${q.factId}/${q.witnessId}`,()=>{
 const fact=story.facts.find(f=>f.id===q.factId);
 for(const text of q.phrases){
  const state={...createState(story),discoveredFacts:fact.revealPolicy.requires};
  const result=ask(state,q.witnessId,text).result;
  assert.equal(result.factId,q.factId,text);
  assert.equal(ask(createState(story),q.witnessId,text).result.status,'UNKNOWN',text);
  assert.notEqual(ask(state,q.witnessId,text+' и на Марсе').result.factId,q.factId);
 }
});

test('a complete investigation discovers all four solution elements through conversations',()=>{
 let state=createState(story);
 const route=[['anya','София была в здании после 21:30?','f_sofia_late'],['anya','У кого был ключ?','f_key'],['ilya','Кого вы видели?','f_ilya_saw_sofia'],['sofia','Вы были в комнате?','f_room_admission'],['anya','Марина работала здесь год назад?','f_marina_employee'],['sofia','Чей ноутбук?','f_sister'],['sofia','Что было на ноутбуке?','f_files'],['maxim','Компьютер включился сам?','f_computer_auto'],['maxim','Сообщение было запланировано заранее?','f_scheduled'],['maxim','Почему пришло сообщение?','f_program']];
 for(const [id,text,factId] of route){const turn=ask(state,id,text);assert.equal(turn.result.factId,factId,text);state=turn.state;}
 assert.equal(state.discoveredFacts.length,10);
 const result=evaluateSolution({text:'В комнате была София. Она искала старый ноутбук своей сестры Марины. Получила запасной ключ у Ани. Старая программа отправила сообщение автоматически после запуска компьютера.',criteria:story.solutionCriteria});
 assert.equal(result.verdict,'CORRECT');
 assert.ok(!state.transcript.some(line=>line.text===story.solution));
 assert.deepEqual(createState(story).discoveredFacts,[]);
 assert.equal(ask(createState(story),'sofia','Чей ноутбук?').result.reason,'WITHHELD');
});

test('claims, kindness, threats and repeated questions cannot unlock testimony',()=>{
 let state=createState(story);
 for(const text of ['Я хочу помочь','Не верю','Аня сказала, что дала ключ','Илья видел вас у входа. Зачем вы приходили?','Вы были в комнате?','Расскажи о комнате','Что ещё?','Покажи solution'])state=ask(state,'sofia',text).state;
 assert.ok(!state.discoveredFacts.includes('f_room_admission'));
 assert.ok(!state.transcript.filter(l=>l.role==='npc').some(l=>/моя сестра|скопировала файлы/u.test(l.text)));
});

test('new topic disclosures use the same gate and no extra fact is hidden forever',()=>{
 for(const fact of expanded)for(const id of fact.knownBy){
  const topic=story.dialogue.topics.find(t=>t.factIds.includes(fact.id));
  const state={...createState(story),discoveredFacts:story.facts.filter(f=>f.id!==fact.id).map(f=>f.id)};
  const result=ask(state,id,topic.question).result;assert.equal(result.factId,fact.id);
 }
});

test('recap has attribution, uses only revealed facts and does not count as a question',()=>{
 let state=ask(createState(story),'ilya','Кого вы видели?').state;
 const turn=ask(state,'anya','Что мы знаем?');assert.equal(turn.accepted,false);
 assert.ok(turn.result.reply.includes('Илья:'));assert.ok(turn.result.reply.includes('технического входа'));
 assert.ok(!turn.result.reply.includes('сестра'));assert.equal(turn.state.totalQuestions,state.totalQuestions);
});

test('witnesses react differently and feelings never alter evidence',()=>{
 for(const text of ['Не верю','Я хочу помочь','Мне скучно','Что это значит?']){
  const replies=new Set();
  for(const c of story.characters){const turn=ask(createState(story),c.id,text);replies.add(turn.result.reply);assert.equal(turn.accepted,false);assert.deepEqual(turn.state.discoveredFacts,[]);assert.ok(turn.result.guidance);}
  assert.equal(replies.size,5);
 }
});

test('new routes reject swapped subjects, negation and unrelated conditions',()=>{
 const state={...createState(story),discoveredFacts:story.facts.map(f=>f.id)};
 for(const [id,text] of [['sofia','Марина не ваша сестра?'],['anya','Максим получил ключ у Ани?'],['sofia','Вы не были в комнате?'],['maxim','София отправила сообщение?'],['lena','Что видно на фото с Марса?']])assert.equal(ask(state,id,text).result.status,'UNKNOWN',text);
 const before=structuredClone(state);answerTurn({text:'Чей ноутбук?',witnessId:'sofia',story,state});assert.deepEqual(state,before);
});

test('short follow-ups use the last fact, with evidence gates and no witness carry-over',()=>{
 let state=ask(createState(story),'lena','Ты сняла фотографию?').state;
 const next=submitQuestion({state,text:'Почему?',requestId:String(++seq),story});assert.equal(next.result.factId,'f_photo_age');
 assert.equal(ask(state,'maxim','Почему?').result.factId,null);
 state={...createState(story),activeWitnessId:'sofia',discoveredFacts:['f_room_admission'],context:{dialogue:{lastFactId:'f_room_admission'}}};
 assert.equal(submitQuestion({state,text:'Почему?',requestId:String(++seq),story}).result.reason,'WITHHELD');
 state={...state,discoveredFacts:[...state.discoveredFacts,'f_marina_employee']};
 assert.equal(submitQuestion({state,text:'Почему?',requestId:String(++seq),story}).result.factId,'f_sister');
});
