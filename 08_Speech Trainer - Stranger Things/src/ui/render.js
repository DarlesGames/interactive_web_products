import { attachSpeechInput } from './speech-input.js';
import { attachConversationCoach } from './conversation-coach.js';
import { portrait,icon,decorateControls } from './visuals.js';
import { attachDesktopWorkspace } from './desktop-workspace.js';
const app=document.querySelector('#app');
let voice=null;
let disposeWorkspace=null;
function screen(markup,chat=false) {disposeWorkspace?.();disposeWorkspace=null;voice?.dispose();voice=null;document.body.classList.toggle('in-chat',chat);document.body.dataset.view=chat?'investigation':'page';app.innerHTML=markup;queueMicrotask(()=>decorateControls(app));}
function element(tag,text,className) {const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
function headingFocus(){document.querySelector('main h1')?.focus();}
export function announce(text){document.querySelector('#announcement').textContent=text;}
function stats(state) {return `<div class="case-stats"><span>Вопросы: <strong id="question-count">${state.totalQuestions}</strong></span><span>Подсказки: ${state.hintIdsShown.length}/3</span><span>Версии: ${state.hypothesisAttempts}</span></div>`;}
function fillCase(data) {document.querySelectorAll('[data-case-title]').forEach(node=>node.textContent=data.title);}
export function showHome(data,start) {
  screen('<section class="home-scene"><div class="hero-copy"><p class="eyebrow"><span class="status-light" aria-hidden="true"></span>Интерактивное расследование · Русский A2</p><h1 tabindex="-1"><span>Очень</span> <span>странные</span> <span>дела</span></h1><p class="intro">За каждой репликой — новая зацепка.<br>За каждой зацепкой — чья-то история.</p><p class="hero-description">Разговаривай со свидетелями, задавай вопросы по-русски и раскрой тайну комнаты №5.</p><button id="start" class="primary">Начать расследование</button><p class="hero-meta">Голосом или текстом <span>·</span> В своём темпе</p></div><div class="scene-caption"><span>КОВОРКИНГ «ПЯТЫЙ ЭТАЖ»</span><strong>22:17</strong><span>Свет ещё горит.</span></div></section><section class="home-case-strip"><span class="file-label">ДОСЬЕ<br><b>001</b></span><div><p class="eyebrow">Доступное дело</p><h2 data-case-title></h2><p>Закрытая комната. Пять свидетелей. Одно необъяснимое сообщение.</p></div><span class="case-seal">ДЕЛО<br>ОТКРЫТО</span></section><ol class="steps home-steps"><li><span class="step-number">01</span><div><strong>Изучи материалы</strong><p>Прочитай завязку и первые улики.</p></div></li><li><span class="step-number">02</span><div><strong>Вступи в разговор</strong><p>Спроси своими словами. Если трудно — используй речевую опору.</p></div></li><li><span class="step-number">03</span><div><strong>Соедини зацепки</strong><p>Сравни ответы и предложи свою версию.</p></div></li></ol>');
  document.body.dataset.view='home';
  fillCase(data);document.querySelector('#start').onclick=start;
}
export function showBrief(data,next) {
  screen('<section class="brief card"><p class="eyebrow">Материалы дела №001</p><h1 tabindex="-1" data-case-title></h1><p id="description" class="intro"></p><h2>Что известно сначала</h2><ul id="clues" class="clues"></ul><div class="advice"><strong>Твоя задача</strong><p>Выясни, кто был в комнате, зачем, как попал внутрь и почему пришло сообщение.</p></div><p class="muted">Не все свидетели знают одно и то же. Если свидетель не знает ответа, он скажет «не знаю». Если он не понял вопрос, то попросит уточнить его или предложит другую тему.</p><button id="witnesses" class="primary">Перейти к свидетелям →</button></section>');
  fillCase(data);document.querySelector('#description').textContent=data.description;
  const evidence=element('div','','evidence-arrangement');evidence.setAttribute('aria-hidden','true');
  evidence.innerHTML='<div class="evidence-photo"><span>22:17</span><p>«Я всё ещё здесь.<br>Не выключайте свет».</p></div><div class="evidence-note"><span>КОМНАТА</span><strong>№ 5</strong><small>Коворкинг «Пятый этаж»</small></div>';
  document.querySelector('#description').before(evidence);document.body.dataset.view='brief';
  for(const clue of data.publicClues)document.querySelector('#clues').append(element('li',clue));
  document.querySelector('#witnesses').onclick=next;headingFocus();
}
export function showWitnesses(data,state,select,back) {
  screen('<section><p class="eyebrow">Дело №001 · Свидетели</p><h1 tabindex="-1">С кем поговорим?</h1><p class="muted">Можно вернуться к любому свидетелю. Вопросы, подсказки и улики общие для всего дела.</p>'+stats(state)+'<div id="witness-grid" class="witness-grid"></div><button id="back">К материалам дела</button></section>');
  for(const witness of data.characters) {
    const card=element('article','', 'card witness-card');
    const image=portrait(witness);card.append(image,element('h2',witness.name,'sr-only'),element('p',witness.role,'sr-only'),element('p',witness.profile,'muted'));
    const button=element('button','Поговорить','primary full');button.dataset.witness=witness.id;button.onclick=()=>select(witness.id);card.append(button);document.querySelector('#witness-grid').append(card);
  }
  document.body.dataset.view='witnesses';
  document.querySelector('#back').onclick=back;headingFocus();
}
function bindComposer({draft,send,change,maxLength=2000,label='Твой вопрос',buttonText='Отправить'}) {
  const form=document.querySelector('#composer');
  form.innerHTML='<label for="message"></label><div class="input-row"><textarea id="message" rows="2" required placeholder="Напиши своими словами…"></textarea><button id="send" type="submit" class="primary" disabled></button></div><p class="fine-print">Enter — отправить · Shift+Enter — новая строка</p>';
  form.querySelector('label').textContent=label;
  const field=form.querySelector('textarea');field.maxLength=maxLength;field.value=draft || '';
  const button=form.querySelector('#send');button.textContent=buttonText;button.disabled=!field.value.trim();
  field.oninput=()=>{button.disabled=!field.value.trim();change?.(field.value);};
  const submit=event=>{event.preventDefault();if(!field.value.trim()||button.disabled)return;voice?.cancel();button.disabled=true;send(field.value.trim());};
  form.onsubmit=submit;
  field.onkeydown=event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing)submit(event);};
  voice=attachSpeechInput(field);
  if(!window.matchMedia('(max-width:860px)').matches)field.focus({preventScroll:true});
}
export function showInvestigation(data,state,story,actions) {
  const witness=data.characters.find(item=>item.id===state.activeWitnessId);
  const previousCoach=document.querySelector('#conversation-coach');
  const keepCoachOpen=previousCoach?.open;
  screen('<section><div class="case-toolbar"><div><p class="eyebrow">Расследование · Дело №001</p><h1 tabindex="-1" data-case-title></h1></div><div class="case-actions"><button id="hint">Подсказка</button><button id="version" class="primary">Моя версия</button></div></div>'+stats(state)+'<div class="chat-layout investigation-layout"><aside class="card witness-panel"><h2>Свидетели</h2><nav id="witness-nav" aria-label="Выбор свидетеля"></nav><button id="all-witnesses" class="full">Карточки свидетелей</button><button id="reset" class="full">Сбросить дело</button></aside><section class="card chat"><header class="chat-header"><div><strong id="active-name"></strong><p id="active-role" class="muted"></p></div><span class="badge">Дело №001</span></header><details id="case-notes"><summary>Материалы, улики и подсказки</summary><div class="notes-body"><h3>Исходные улики</h3><ul id="initial-clues"></ul><h3>Открытые подсказки</h3><div id="shown-hints"></div><h3>Записанные ответы</h3><div id="discoveries"></div></div></details><div id="messages" class="messages" role="region" aria-label="Переписка со свидетелем" tabindex="0"></div><p id="request-note" class="request-note" role="status"></p><form id="composer" class="composer"></form></section></div></section>',true);
  fillCase(data);document.querySelector('#active-name').textContent=witness.name;document.querySelector('#active-role').textContent=witness.role;
  const coachToggle=element('button','Помощь','coach-toggle');coachToggle.id='coach-toggle';coachToggle.type='button';coachToggle.setAttribute('aria-controls','conversation-coach');coachToggle.setAttribute('aria-label','Открыть или свернуть помощь с вопросом');
  document.querySelector('.chat-header').append(coachToggle);
  const dossier=element('details','','active-dossier');dossier.open=window.matchMedia('(min-width:1101px)').matches;
  dossier.append(element('summary','Портрет свидетеля'));
  const figure=element('figure','','active-portrait');figure.append(portrait(witness));dossier.append(figure);
  document.querySelector('.witness-panel h2').after(dossier);
  const profile=element('p',witness.profile,'witness-profile');figure.append(profile);
  const notes=document.querySelector('#case-notes');
  notes.ontoggle=()=>{
    document.querySelector('.chat')?.classList.toggle('notes-open',notes.open);
    requestAnimationFrame(()=>{const messages=document.querySelector('#messages');if(messages)messages.scrollTop=messages.scrollHeight;});
  };
  for(const item of data.characters) {
    const button=element('button','');button.dataset.witness=item.id;button.setAttribute('aria-pressed',String(item.id===witness.id));button.append(icon('chat'),element('strong',item.name),element('span',item.role));button.onclick=()=>actions.select(item.id);document.querySelector('#witness-nav').append(button);
  }
  const nav=document.querySelector('#witness-nav');const active=nav.querySelector('[aria-pressed=true]');
  if(nav.scrollWidth>nav.clientWidth)nav.scrollLeft+=active.getBoundingClientRect().left-nav.getBoundingClientRect().left-(nav.clientWidth-active.offsetWidth)/2;
  for(const clue of data.publicClues) document.querySelector('#initial-clues').append(element('li',clue));
  for(const hint of story.hints.filter(item=>state.hintIdsShown.includes(item.id))) document.querySelector('#shown-hints').append(element('p',hint.text,'advice'));
  if(!state.hintIdsShown.length)document.querySelector('#shown-hints').append(element('p','Подсказки появятся после 3, 6 и 9 разных вопросов. Можно запросить следующую вручную.'));
  for(const id of state.discoveredFacts) {
    const line=state.transcript.find(item=>item.factId===id);
    const author=data.characters.find(item=>item.id===line.witnessId);
    document.querySelector('#discoveries').append(element('p',`${author.name}: ${line.text}`));
  }
  if(!state.discoveredFacts.length)document.querySelector('#discoveries').append(element('p','Здесь появятся ответы свидетелей по делу.'));
  const messages=document.querySelector('#messages');
  const greeting=element('div','', 'message npc');greeting.append(element('span',witness.name,'speaker'),element('p',witness.greeting || `Я ${witness.name}. Задавай вопросы о деле. Расскажу, что знаю.`));messages.append(greeting);
  if(!state.transcript.some(line=>line.witnessId===witness.id))messages.append(element('p','Можно попросить рассказать о теме, затем спросить «Что ещё?». Если не знаешь, с чего начать, напиши «Помоги».','fine-print'));
  for(const line of state.transcript.filter(item=>item.witnessId===witness.id)) {
    const node=element('div','',`message ${line.role==='student'?'student':'npc'}`);node.append(element('span',line.role==='student'?'Ты':witness.name,'speaker'),element('p',line.text));
    if(line.role==='npc'&&line.guidance)node.append(element('div',line.guidance,'dialogue-guidance'));
    messages.append(node);
  }
  bindComposer({draft:state.drafts[witness.id],send:actions.send,label:state.context.dialogue?.pending?'Твоё уточнение':'Твой вопрос'});
  document.querySelector('#composer').append(document.querySelector('#request-note'));
  const last=state.transcript.findLast(line=>line.role==='npc'&&line.witnessId===witness.id);
  const needsHelp=!!state.context.dialogue?.pending||['NO_MATCH','NO_FACT','AMBIGUOUS','CLARIFY'].includes(state.context.dialogue?.lastReason);
  const wide=window.matchMedia('(min-width:861px)').matches;
  const coachPanel=attachConversationCoach({story,state,witnessId:witness.id,selectWitness:actions.select,open:(wide&&(needsHelp||!last))||!!keepCoachOpen});
  coachToggle.onclick=()=>{
    coachPanel.open=!coachPanel.open;coachToggle.setAttribute('aria-expanded',String(coachPanel.open));
    if(coachPanel.open){coachPanel.querySelector('summary').focus({preventScroll:true});if(!window.matchMedia('(min-width:861px)').matches)coachPanel.scrollIntoView({block:'start'});}
  };
  messages.scrollTop=messages.scrollHeight;
  document.querySelector('#version').onclick=actions.version;
  document.querySelector('#all-witnesses').onclick=actions.witnesses;
  document.querySelector('#hint').disabled=state.hintIdsShown.length>=story.hints.length;
  document.querySelector('#hint').onclick=actions.hint;
  document.querySelector('#reset').onclick=()=>{voice?.cancel();actions.reset();};
  disposeWorkspace=attachDesktopWorkspace();
}
export function showVersion(data,state,submit,back) {
  screen('<section class="result-wrap"><p class="eyebrow">Дело №001 · Моя версия</p><h1 tabindex="-1">Как всё произошло?</h1><p class="muted">Напиши связный рассказ: кто был в комнате, что искал, как вошёл и почему пришло сообщение.</p>'+stats(state)+'<div class="card"><form id="composer" class="composer version-composer"></form><div id="version-feedback" role="status"></div><button id="back" class="full">Вернуться к расследованию</button></div></section>');
  bindComposer({draft:state.hypothesisDraft,send:submit,maxLength:5000,label:'Твоя версия',buttonText:'Проверить'});
  if(state.lastEvaluation) {
    const result=state.lastEvaluation;
    document.querySelector('#version-feedback').append(element('p',result.feedback,'advice'));
    const labels={who:'Кто был в комнате',why:'Зачем',how:'Как попал внутрь',message:'Причина сообщения'};
    for(const [id,label] of Object.entries(labels))document.querySelector('#version-feedback').append(element('p',`${result.matched.includes(id)?'✓':'—'} ${label}: ${result.matched.includes(id)?'верно':'нужно уточнить'}`));
  }
  document.querySelector('#back').onclick=back;headingFocus();
}
export function showSolved(data,state,solution,reset) {
  if(state.phase!=='solved'||state.lastEvaluation?.verdict!=='CORRECT') throw new Error('Result unavailable');
  screen('<section class="result-wrap"><p class="eyebrow">Дело №001 раскрыто</p><h1 tabindex="-1">Версия подтверждена</h1><div class="card"><h2 data-case-title></h2><p id="solution"></p><ul id="solved-checks"></ul>'+stats(state)+'<p id="outcome"></p><p id="categories"></p><p class="fine-print">Это статистика расследования. Грамматика и произношение не оценивались.</p><button id="reset" class="primary full">Начать заново</button></div></section>');
  fillCase(data);document.querySelector('#solution').textContent=solution;
  document.body.dataset.view='solved';
  for(const label of ['Кто был в комнате','Что искала','Как попала внутрь','Почему пришло сообщение'])document.querySelector('#solved-checks').append(element('li',`✓ ${label}: верно`));
  document.querySelector('#outcome').textContent=`Вопросов с ответом по фактам: ${state.understoodQuestions}. Вопросов без подтверждённого ответа: ${state.unknownQuestions}. Все четыре части версии верны.`;
  const labels={confirmation:'проверка предположения',who:'кто',whom:'кого',when:'когда',where:'где',what:'что',topic:'разговор по теме'};
  document.querySelector('#categories').textContent=`Какие вопросы удалось разобрать: ${state.questionCategories.map(id=>labels[id] || id).join(', ') || 'пока нет'}.`;
  document.querySelector('#reset').onclick=reset;headingFocus();
}
export function showError(){screen('<section class="card"><h1>Не удалось открыть дело</h1><p>Проверь локальный сервер и обнови страницу.</p><a href="./">Обновить</a></section>');}
