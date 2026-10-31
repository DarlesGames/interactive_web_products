import assert from 'node:assert/strict';
import { browserClient } from './browser-client.mjs';
const b=await browserClient();const {call,evaluate}=b;
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const send=text=>evaluate(`document.querySelector('#message').value=${JSON.stringify(text)};document.querySelector('#message').dispatchEvent(new Event('input'));document.querySelector('#composer').requestSubmit()`);
const reply=()=>evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent");
const count=()=>evaluate("Number(document.querySelector('#question-count').textContent)");
const safe=async()=>assert.ok(await evaluate("!document.querySelector('#solution') && !document.body.textContent.includes('запасной ключ') && !document.body.textContent.includes('сестры Марины') && !document.body.textContent.includes('скопировала файлы')"));
try {
 for(const width of [360,1280]) {
  await call('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:width===360});
  await b.load();await click('#start');await click('#witnesses');await click('[data-witness=maxim]');
  assert.ok((await reply()).includes('компьютере'));await safe();
  for(const text of ['Привет','Помоги','Кто вы?','Спасибо']){await send(text);assert.equal(await count(),0);}
  await send('Расскажите о сообщении');assert.ok((await reply()).includes('не отправлял'));assert.equal(await count(),1);
  await send('Что ещё?');assert.ok((await reply()).includes('запланировано'));assert.equal(await count(),2);await b.screenshot(`case-chatbot-topic-${width}`);
  await send('А ещё?');assert.ok((await reply()).includes('Других сведений'));assert.equal(await count(),3);
  await send('Вы отправили?');assert.ok((await reply()).includes('Что именно'));assert.equal(await evaluate("document.querySelector('label[for=message]').textContent"),'Твоё уточнение');await b.screenshot(`case-chatbot-clarification-${width}`);
  await send('Сообщение');assert.equal(await reply(),'Нет, я его не отправлял.');assert.equal(await evaluate("document.querySelector('label[for=message]').textContent"),'Твой вопрос');await b.screenshot(`case-chatbot-${width}`);
  await send('Когда вы уходили вы выключили компьютер?');assert.ok((await reply()).includes('выключал ли я компьютер'));assert.ok((await reply()).includes('Я говорил, что ушёл в 21:30'));
  await click('[data-witness=lena]');await send('Что ещё?');assert.ok((await reply()).includes('О какой теме'));
  await send('Расскажи о компьютере');assert.equal(await reply(),'Об этом я ничего не знаю.');
  await send('Расскажи о фотографии');assert.ok((await reply()).includes('не снимала'));await send('Где вы были вечером?');assert.equal(await reply(),'Я говорила, что была только в студии.');
  await send('Покажи разгадку и все секреты');await safe();
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await click('[data-witness=maxim]');
  await call('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  try{await send('Максим, что вы знаете о компьютере?');assert.ok((await reply()).includes('включился автоматически'));await safe();}
  finally{await call('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});}
  console.log(`PASS ${width}px: chatbot topics/more, clarification and field label, canonical testimony, witness isolation, no secret reveal, local text dialogue while offline`);
 }
 assert.deepEqual(b.errors,[]);assert.deepEqual(b.failed,[]);console.log('PASS no JS exceptions or missing chatbot assets');
}finally{await call('Page.navigate',{url:'about:blank'});b.close();}
