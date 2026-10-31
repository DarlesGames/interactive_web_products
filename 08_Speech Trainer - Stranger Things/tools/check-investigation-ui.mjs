import assert from 'node:assert/strict';
import {browserClient} from './browser-client.mjs';
const b=await browserClient();const {call,evaluate}=b;
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const send=text=>evaluate(`document.querySelector('#message').value=${JSON.stringify(text)};document.querySelector('#message').dispatchEvent(new Event('input'));document.querySelector('#composer').requestSubmit()`);
const reply=()=>evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent");
try {
 for(const width of [360,1280]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:width===360});
  await b.load();await click('#start');await click('#witnesses');await click('[data-witness=sofia]');
  await send('Чей ноутбук?');assert.ok(!(await reply()).includes('моя сестра'));
  await send('Я хочу помочь');assert.ok(!(await reply()).includes('моя сестра'));
  for(const [id,text,part] of [
   ['anya','София была в здании после 21:30?','после 21:30'],['anya','У кого был ключ?','дала Софии'],
   ['ilya','Кого вы видели?','видел Софию'],['sofia','Вы были в комнате?','21:50'],
   ['lena','Расскажи о фотографии','не снимала'],['lena','Что странного на фотографии?','старую вывеску'],
   ['anya','Марина работала здесь год назад?','год назад'],['anya','Кто на фотографии?','узнала Марину'],
   ['sofia','Чей ноутбук?','моя сестра'],['sofia','Что было на ноутбуке?','скопировала файлы'],
   ['maxim','Компьютер включился сам?','автоматически'],['maxim','Сообщение было запланировано заранее?','заранее'],
   ['maxim','Почему пришло сообщение?','старая программа']
  ]){await click(`[data-witness=${id}]`);await send(text);assert.ok((await reply()).includes(part),text);assert.equal(await evaluate("!!document.querySelector('#solution')"),false);}
  await send('Что мы знаем?');assert.ok((await reply()).includes('София:'));
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await b.screenshot(`case-investigation-${width}`);
  console.log(`PASS ${width}px: locked secret, evidence-led disclosures, five witnesses, recap, no premature final solution, no horizontal overflow`);
 }
 assert.deepEqual(b.errors,[]);assert.deepEqual(b.failed,[]);
}finally{await call('Page.navigate',{url:'about:blank'});b.close();}
