import assert from 'node:assert/strict';
import { browserClient } from './browser-client.mjs';
const b=await browserClient();const {call,evaluate}=b;
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const send=text=>evaluate(`document.querySelector('#message').value=${JSON.stringify(text)};document.querySelector('#message').dispatchEvent(new Event('input'));document.querySelector('#composer').requestSubmit()`);
const reply=()=>evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent");
const tip=()=>evaluate("[...document.querySelectorAll('.dialogue-guidance')].at(-1)?.textContent || ''");
const count=()=>evaluate("Number(document.querySelector('#question-count').textContent)");
const safe=async()=>assert.ok(await evaluate("!document.querySelector('#solution')&&!document.body.textContent.includes('запасной ключ')&&!document.body.textContent.includes('сестры Марины')"));
const enter=async()=>{await b.load();await click('#start');await click('#witnesses');await click('[data-witness=maxim]');};
const fits=async()=>{
 await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
 assert.ok(await evaluate("(()=>{const last=[...document.querySelectorAll('.message.npc')].at(-1).getBoundingClientRect();const area=document.querySelector('#messages').getBoundingClientRect();return last.top>=area.top-1&&last.bottom<=area.bottom+1})()"));
};
try {
 for(const width of [360,1280]) {
  await call('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:width===360});await enter();
  assert.ok((await reply()).includes('Расскажу, что знаю.'));assert.ok(!(await reply()).includes('Отвечу на то'));
  await send('Люблю играть в футбол');assert.ok((await tip()).includes('о компьютере'));assert.equal(await count(),1);await safe();await fits();await b.screenshot(`case-guidance-offer-${width}`);
  await send('Давай');assert.ok((await reply()).includes('включился автоматически'));assert.equal(await count(),2);
  await click('#case-notes summary');assert.ok(await evaluate("!document.querySelector('#discoveries').textContent.includes('Могу рассказать')"));
  await send('???');await send('Всё ещё непонятно');assert.ok((await tip()).includes('Что вы знаете о сообщении?'));await fits();await b.screenshot(`case-guidance-question-${width}`);
  await send('Нет, расскажите о сообщении');assert.equal(await reply(),'Нет, я его не отправлял.');await send('Что ещё?');assert.ok((await reply()).includes('запланировано'));
  await send('Вы отправили?');assert.equal(await evaluate("document.querySelector('label[for=message]').textContent"),'Твоё уточнение');
  const before=await count();await send('Отмена');assert.equal(await count(),before);assert.equal(await evaluate("document.querySelector('label[for=message]').textContent"),'Твой вопрос');
  await click('[data-witness=lena]');await send('Да');assert.ok((await tip()).includes('о фотографии'));assert.ok(!(await reply()).includes('включился автоматически'));
  await send('фотаграфия');assert.ok((await reply()).includes('какую тему'));assert.ok((await tip()).includes('о фотографии'));await send('Да');assert.ok((await reply()).includes('не снимала'));
  await send('Нет');assert.ok((await tip()).includes('о комнате')); // New photo testimony is declined first, then her studio statement.
  await send('Нет');assert.ok((await tip()).includes('список свидетелей'));await send('Нет');assert.ok((await tip()).includes('Моя версия'));
  const total=await count();await send('Да');assert.ok(await evaluate("document.querySelector('label[for=message]').textContent==='Твоя версия'"));assert.equal(await count(),total);await safe();await click('#back');
  assert.equal(await evaluate("document.querySelector('#active-name').textContent"),'Лена');
  await enter();await send('Вы отправили сообщение?');await send('Помоги');
  for(let i=0;i<3;i++)await send('Другая тема');assert.ok((await tip()).includes('список свидетелей'));
  const prior=await count();await send('Да');assert.equal(await evaluate("document.querySelectorAll('[data-witness]').length"),5);assert.equal(await count(),prior);
  await click('[data-witness=maxim]');assert.ok(await evaluate("document.querySelector('#messages').textContent.includes('Нет, я его не отправлял.')"));await safe();
  console.log(`PASS ${width}px: unknown -> offer -> consent; example question; declines, typo, cancellation, evidence separation, navigation without reset, readable guidance`);
 }
 assert.deepEqual(b.errors,[]);assert.deepEqual(b.failed,[]);console.log('PASS no JS errors or missing guidance resources');
}finally{await call('Page.navigate',{url:'about:blank'});b.close();}
