import { createState,selectWitness,submitQuestion,requestHint } from './core/state.js';
import { evaluateSolution } from './core/solution.js';
import { publicCase } from './core/presentation.js';
import { showHome,showBrief,showWitnesses,showInvestigation,showVersion,showSolved,showError,announce } from './ui/render.js';
try {
  const response=await fetch(new URL('../data/cases/case-001.json',import.meta.url));
  if(!response.ok)throw new Error('Case unavailable');
  const story=await response.json();
  const data=publicCase(story);
  let state=createState(story);
  let route='home';
  let requestId=0;
  function saveDraft(){const field=document.querySelector('#message');if(!field)return;if(route==='version')state={...state,hypothesisDraft:field.value};else if(route==='investigation')state={...state,drafts:{...state.drafts,[state.activeWitnessId]:field.value}};}
  function go(next){saveDraft();route=next;render();}
  function select(id){saveDraft();state=selectWitness(state,id,story);route='investigation';render();}
  function reset(){if(!window.confirm('Сбросить всё расследование, вопросы и версии?'))return;state=createState(story);route='home';render();announce('Расследование сброшено.');}
  function send(text){
    const previousHints=state.hintIdsShown.length;
    const result=submitQuestion({text,requestId:`question-${++requestId}`,state,story});
    if(!result.result)return;
    state={...result.state,drafts:{...result.state.drafts,[state.activeWitnessId]:''}};
    if(['witnesses','version'].includes(result.result.navigation)) {
      route=result.result.navigation;render();announce(result.result.reply);return;
    }
    render();
    const note=document.querySelector('#request-note');
    note.textContent=!result.accepted?'Это служебная реплика или повтор. Счётчик не изменился.':state.hintIdsShown.length>previousHints?'Открыта новая подсказка — смотри материалы дела.':'';
    if(state.hintIdsShown.length>previousHints)document.querySelector('#case-notes').open=true;
    announce([result.result.reply,result.result.guidance,note.textContent].filter(Boolean).join(' '));
    document.querySelector('#message').focus({preventScroll:true});
    requestAnimationFrame(()=>{const messages=document.querySelector('#messages');if(messages)messages.scrollTop=messages.scrollHeight;});
  }
  function hint(){saveDraft();state=requestHint(state,story);render();document.querySelector('#case-notes').open=true;announce('Открыта следующая подсказка.');}
  function hypothesis(text){state={...state,hypothesisDraft:text,hypothesisAttempts:state.hypothesisAttempts+1,lastEvaluation:evaluateSolution({text,criteria:story.solutionCriteria})};if(state.lastEvaluation.verdict==='CORRECT'){state={...state,phase:'solved'};route='solved';}render();}
  function render(){
    if(route==='home')showHome(data,()=>go('brief'));
    else if(route==='brief')showBrief(data,()=>go('witnesses'));
    else if(route==='witnesses')showWitnesses(data,state,select,()=>go('brief'));
    else if(route==='investigation')showInvestigation(data,state,story,{select,send,hint,version:()=>go('version'),witnesses:()=>go('witnesses'),reset});
    else if(route==='version')showVersion(data,state,hypothesis,()=>go('investigation'));
    else if(route==='solved')showSolved(data,state,story.solution,reset);
  }
  render();
}catch{showError();}
