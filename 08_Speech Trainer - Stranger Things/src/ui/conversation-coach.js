import { conversationCoach,buildPracticeQuestion } from '../core/conversationCoach.js';

const el=(tag,text,className)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;};

export function attachConversationCoach({story,state,witnessId,selectWitness,open=false}) {
  const model=conversationCoach({story,state,witnessId});
  const panel=el('details',null,'conversation-coach');panel.id='conversation-coach';panel.open=open;
  panel.append(el('summary','Помощь с вопросом'));
  const body=el('div',null,'coach-body');panel.append(body);
  body.append(el('p',model.repairText,'coach-intro'));
  const aside=el('aside',null,'card conversation-support');aside.setAttribute('aria-label','Речевая помощь');
  aside.append(panel);document.querySelector('.investigation-layout').append(aside);
  const toggle=document.querySelector('#coach-toggle');
  const sync=()=>toggle?.setAttribute('aria-expanded',String(panel.open));
  panel.ontoggle=sync;sync();
  const insert=text=>{
    const field=document.querySelector('#message');
    // A help action cannot silently erase the learner's own draft.
    if(field.value.trim()){notice.textContent='В поле уже есть твой текст. Сначала сохрани, отправь или удали его. Пример остался здесь — можно использовать его своими словами.';return;}
    field.value=text;field.dispatchEvent(new Event('input',{bubbles:true}));
    notice.textContent='Текст добавлен в черновик. Измени его, если хочешь, и нажми «Отправить».';
    field.focus();
  };
  const notice=el('p',null,'coach-notice');notice.id='coach-notice';notice.setAttribute('role','status');
  if(!model.goals.length){
    body.append(el('p',model.complete?'Основные вопросы уже заданы. Можно уточнить услышанное или перейти к своей версии.':'По этим темам ты уже получил ответы. Попробуй продолжить разговор с другим свидетелем.'));
    for(const next of model.nextWitnesses){
      const row=el('div',null,'coach-next');row.append(el('p',next.task));
      const button=el('button','Поговорить: '+next.name);button.type='button';button.onclick=()=>selectWitness(next.id);row.append(button);body.append(row);
    }
  }else{
    const label=el('label','Что потренируем?');label.htmlFor='coach-goal';
    const picker=el('select');picker.id='coach-goal';
    for(const goal of model.goals){const option=el('option',goal.title);option.value=goal.id;picker.append(option);}
    const practice=el('div');body.append(label,picker,practice);
    const draw=()=>{
      const goal=model.goals.find(g=>g.id===picker.value);practice.replaceChildren();notice.textContent='';
      practice.append(el('p',goal.task,'coach-task'),el('p',goal.tip,'coach-tip'));
      const actions=el('div',null,'coach-actions');
      const start=el('button','Подсказать начало');start.type='button';start.onclick=()=>insert(goal.starter);
      const example=el('button','Показать пример');example.type='button';
      actions.append(start,example);practice.append(actions);
      const builder=el('details',null,'coach-builder');builder.append(el('summary','Собрать вопрос из частей'));
      const slots=el('div',null,'coach-slots');builder.append(slots);
      const selects=goal.parts.map((part,i)=>{
        const label=el('label',part.label);label.htmlFor=`coach-part-${i}`;
        const input=el('select');input.id=label.htmlFor;
        for(const value of part.options){const option=el('option',value);option.value=value;input.append(option);}
        const wrap=el('div');wrap.append(label,input);slots.append(wrap);return input;
      });
      const preview=el('p',null,'coach-preview');preview.id='coach-preview';preview.setAttribute('aria-live','polite');
      const update=()=>preview.textContent=buildPracticeQuestion(goal,selects.map(s=>s.value));selects.forEach(s=>s.onchange=update);update();
      const use=el('button','Вставить в черновик');use.type='button';use.onclick=()=>insert(preview.textContent);
      builder.append(preview,use);practice.append(builder);
      const sample=el('div',null,'coach-example');sample.hidden=true;
      sample.append(el('p','Например: '+buildPracticeQuestion(goal)),el('p','Можно изменить вопрос или произнести его в микрофон.','coach-tip'));
      const sampleUse=el('button','Вставить пример');sampleUse.type='button';sampleUse.onclick=()=>insert(buildPracticeQuestion(goal));sample.append(sampleUse);practice.append(sample);
      example.onclick=()=>{sample.hidden=!sample.hidden;example.textContent=sample.hidden?'Показать пример':'Скрыть пример';};
    };
    picker.onchange=draw;draw();
  }
  const phrases=el('details',null,'coach-phrases');phrases.append(el('summary','Начать, уточнить, продолжить'));
  const phraseList=el('dl');
  for(const [purpose,phrase] of [['Вступить в разговор','Здравствуйте! Можно задать вам вопрос?'],['Попросить повторить','Повторите, пожалуйста.'],['Продолжить тему','Что ещё вы знаете?'],['Собрать услышанное','Что мы знаем?'],['Поблагодарить','Спасибо за помощь.']]){phraseList.append(el('dt',purpose),el('dd',phrase));}
  phrases.append(phraseList,el('p','Выбери подходящую фразу и напиши или произнеси её.','coach-tip'));body.append(phrases,notice);
  return panel;
}
