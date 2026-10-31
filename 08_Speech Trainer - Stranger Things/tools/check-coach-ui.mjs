import assert from 'node:assert/strict';
import {browserClient} from './browser-client.mjs';
const b=await browserClient();const {call,evaluate}=b;
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const send=text=>evaluate(`document.querySelector('#message').value=${JSON.stringify(text)};document.querySelector('#message').dispatchEvent(new Event('input'));document.querySelector('#composer').requestSubmit()`);
const count=()=>evaluate("Number(document.querySelector('#question-count').textContent)");
const choose=id=>evaluate(`document.querySelector('#coach-goal').value=${JSON.stringify(id)};document.querySelector('#coach-goal').dispatchEvent(new Event('change'))`);
const button=text=>evaluate(`[...document.querySelectorAll('#conversation-coach button')].find(b=>b.textContent===${JSON.stringify(text)}).click()`);
const enter=async()=>{await b.load();await click('#start');await click('#witnesses');await click('[data-witness=maxim]');};
try{
 for(const width of [360,1280]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:width===360});await enter();
  assert.equal(await evaluate("document.querySelector('#conversation-coach').open"),width>860);
  if(width<=860)await click('#coach-toggle');
  assert.ok(await evaluate("document.querySelector('.coach-task').textContent.includes('компьютер')"));
  assert.ok(await evaluate("!document.querySelector('#conversation-coach').textContent.includes('запасной ключ')&&!document.querySelector('#conversation-coach').textContent.includes('моя сестра')"));
  const initial=await evaluate("document.querySelectorAll('.message').length");
  await button('Подсказать начало');assert.equal(await evaluate("document.querySelector('#message').value"),'Компьютер ');assert.equal(await count(),0);
  await evaluate("document.querySelector('#message').value='Мой вопрос';document.querySelector('#message').dispatchEvent(new Event('input'))");
  await button('Подсказать начало');assert.equal(await evaluate("document.querySelector('#message').value"),'Мой вопрос');assert.ok(await evaluate("document.querySelector('#coach-notice').textContent.includes('уже есть')"));
  await evaluate("document.querySelector('#message').value='';document.querySelector('#message').dispatchEvent(new Event('input'))");
  await click('.coach-builder summary');
  await evaluate("document.querySelector('#coach-part-1').value='включился автоматически';document.querySelector('#coach-part-1').dispatchEvent(new Event('change'))");
  await button('Вставить в черновик');assert.equal(await evaluate("document.querySelector('#message').value"),'Компьютер включился автоматически?');
  assert.equal(await count(),0);assert.equal(await evaluate("document.querySelectorAll('.message').length"),initial);
  await b.screenshot(`case-coach-builder-${width}`);
  await click('#send');assert.ok(await evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent.includes('включился автоматически')"));assert.equal(await count(),1);
  assert.notEqual(await evaluate("document.querySelector('#coach-goal').value"),'practice-8');
  await click('#conversation-coach>summary');assert.equal(await evaluate("document.querySelector('#conversation-coach').open"),false);
  await send('абракадабра');assert.equal(await evaluate("document.querySelector('#conversation-coach').open"),width>860);
  if(width<=860)await click('#coach-toggle');
  assert.ok(await evaluate("document.querySelector('.coach-intro').textContent.includes('один короткий вопрос')"));
  await choose('practice-9');await button('Показать пример');assert.equal(await evaluate("document.querySelector('.coach-example').hidden"),false);
  const before=await count();await button('Вставить пример');assert.equal(await count(),before);
  assert.equal(await evaluate("document.querySelector('#message').value"),'Вы отправили сообщение?');
  await click('[data-witness=lena]');assert.ok(await evaluate("document.querySelector('.coach-task').textContent.includes('Лены')"));
  await click('[data-witness=maxim]');assert.equal(await evaluate("document.querySelector('#message').value"),'Вы отправили сообщение?');
  await click('#send');await send('Сообщение было запланировано заранее?');
  await choose('practice-11');await button('Показать пример');assert.ok(await evaluate("document.querySelector('.coach-example').textContent.includes('Почему пришло сообщение?')"));
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await b.screenshot(`case-coach-example-${width}`);
  // Whole flow works through language supports. No app-state injection or hidden facts.
  await enter();
  for(const [id,goalId] of [['anya','practice-1'],['anya','practice-2'],['ilya','practice-3'],['sofia','practice-4'],['anya','practice-5'],['sofia','practice-6'],['maxim','practice-8'],['maxim','practice-9'],['maxim','practice-10'],['maxim','practice-11']]){
   await click(`[data-witness=${id}]`);await choose(goalId);await button('Показать пример');await button('Вставить пример');
   const n=await count();await click('#send');assert.equal(await count(),n+1,goalId);
   assert.equal(await evaluate("[...document.querySelectorAll('.message.npc')].at(-1).textContent.includes('Мне не совсем понятен')"),false);
  }
  assert.equal(await evaluate("!!document.querySelector('#solution')"),false);
  await click('[data-witness=ilya]');await send('Что вы точно видели?');await send('Марина работала здесь год назад?');
  assert.equal(await evaluate("document.querySelectorAll('#coach-goal').length"),0);
  assert.ok(await evaluate("document.querySelectorAll('.coach-next button').length>0"));
  await click('.coach-next button');assert.ok(await evaluate("!!document.querySelector('#coach-goal')"));
  console.log(`PASS ${width}px: progressive language support, valid assembled variants, manual editable send, draft protection, automatic repair, witness isolation, whole supported investigation, next witness, no overflow`);
 }
 assert.deepEqual(b.errors,[]);assert.deepEqual(b.failed,[]);
}finally{await call('Page.navigate',{url:'about:blank'});b.close();}
