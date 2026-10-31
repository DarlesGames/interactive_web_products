import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {conversationCoach,buildPracticeQuestion} from '../src/core/conversationCoach.js';
import {createState,selectWitness,submitQuestion} from '../src/core/state.js';
import {answerTurn} from '../src/core/chatbot.js';
const story=JSON.parse(await readFile(new URL('../data/cases/case-001.json',import.meta.url)));
let seq=0;
const send=(state,text)=>submitQuestion({state,text,story,requestId:String(++seq)});
const coach=(state,id=state.activeWitnessId)=>conversationCoach({story,state,witnessId:id});
const combinations=parts=>parts.reduce((rows,part)=>rows.flatMap(row=>part.options.map(option=>[...row,option])),[[]]);

for(const goal of story.dialogue.learning.goals)test(`every assembled practice question is understood: ${goal.id}`,()=>{
 const fact=story.facts.find(f=>f.id===goal.factId);
 for(const id of goal.witnessIds){
  const state={...selectWitness(createState(story),id,story),discoveredFacts:fact.revealPolicy?.requires || []};
  assert.ok(coach(state).goals.some(g=>g.id===goal.id));
  for(const choices of combinations(goal.parts)){
   const text=buildPracticeQuestion(goal,choices);const result=answerTurn({text,witnessId:id,story,state});
   assert.equal(result.factId,goal.factId,text);assert.equal(result.understood,true,text);
  }
 }
});

test('practice model contains teaching language, not secret answers or internal data',()=>{
 for(const c of story.characters){
  const state=selectWitness(createState(story),c.id,story);const before=structuredClone(state);const model=coach(state);
  const text=JSON.stringify(model);for(const secret of ['revealPolicy','knownBy','factId','solution','моя сестра','запасной ключ','скопировала файлы'])assert.ok(!text.includes(secret));
  assert.deepEqual(state,before);assert.equal(state.totalQuestions,0);assert.deepEqual(state.discoveredFacts,[]);
 }
});

test('goals respect knowledge and all prerequisites, then disappear when answered',()=>{
 for(const goal of story.dialogue.learning.goals){
  const fact=story.facts.find(f=>f.id===goal.factId);
  for(const c of story.characters){
   let state={...selectWitness(createState(story),c.id,story),discoveredFacts:fact.revealPolicy?.requires || []};
   assert.equal(coach(state).goals.some(g=>g.id===goal.id),goal.witnessIds.includes(c.id)&&fact.knownBy.includes(c.id));
   if(!goal.witnessIds.includes(c.id))continue;
   const result=send(state,buildPracticeQuestion(goal));assert.equal(result.result.factId,goal.factId);
   assert.ok(!coach(result.state).goals.some(g=>g.id===goal.id));
   for(const missing of fact.revealPolicy?.requires || []){
    state={...state,discoveredFacts:fact.revealPolicy.requires.filter(id=>id!==missing)};
    assert.ok(!coach(state).goals.some(g=>g.id===goal.id));
   }
  }
 }
});

test('supports entering and ending a conversation without awarding questions',()=>{
 for(const c of story.characters){
  let state=selectWitness(createState(story),c.id,story);
  for(const text of ['Здравствуйте! Можно задать вам вопрос?','Можно вас спросить?','Спасибо за помощь.']){
   const turn=send(state,text);assert.equal(turn.result.reason,'SOCIAL');assert.equal(turn.accepted,false);state=turn.state;
  }
  assert.equal(state.totalQuestions,0);assert.equal(coach(state).repair,null);
 }
});

test('repair distinguishes an incomplete object and an unrecognized question',()=>{
 let state=selectWitness(createState(story),'maxim',story);
 state=send(state,'Вы отправили?').state;assert.equal(coach(state).repair,'missing');assert.equal(coach(state).goals[0].id,'practice-9');
 state=send(state,'непонятные слова').state;assert.equal(coach(state).repair,'unclear');
});

test('exhausted witness gives useful destinations, reset starts practice again',()=>{
 let state=selectWitness(createState(story),'maxim',story);
 // Exhaust current knowledge, including the later testimony about helping Sofia.
 state={...state,discoveredFacts:story.facts.filter(f=>f.knownBy.includes('maxim')).map(f=>f.id)};
 let model=coach(state);assert.equal(model.goals.length,0);assert.ok(model.nextWitnesses.length);
 for(const next of model.nextWitnesses)assert.ok(coach(selectWitness(state,next.id,story)).goals.length);
 state={...state,discoveredFacts:story.facts.map(f=>f.id)};model=coach(state);assert.equal(model.complete,true);assert.deepEqual(model.nextWitnesses,[]);
 assert.ok(coach(selectWitness(createState(story),'maxim',story)).goals.length);
});

test('supported goals alone permit a full investigation without guessing wording',()=>{
 let state=createState(story);
 for(let i=0;i<40;i++){
  let progress=false;
  for(const c of story.characters){
   state=selectWitness(state,c.id,story);const goal=coach(state).goals[0];
   if(goal){state=send(state,buildPracticeQuestion(goal)).state;progress=true;}
  }
  if(!progress)break;
 }
 for(const id of ['f_room_admission','f_sister','f_key','f_program','f_photo_age'])assert.ok(state.discoveredFacts.includes(id),id);
 assert.equal(state.discoveredFacts.length,20); // The inaccessible ghost proposition has no practice goal.
});
