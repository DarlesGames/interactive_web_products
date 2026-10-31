import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { browserClient } from './browser-client.mjs';
const b=await browserClient();const {call,evaluate}=b;
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const send=text=>evaluate(`document.querySelector('#message').value=${JSON.stringify(text)};document.querySelector('#message').dispatchEvent(new Event('input'));document.querySelector('#composer').requestSubmit()`);
const count=()=>evaluate("Number(document.querySelector('#question-count').textContent)");
const safe=async()=>{assert.ok(await evaluate("!document.body.textContent.includes('запасной ключ') && !document.body.textContent.includes('ноутбук своей сестры') && !document.body.textContent.includes('Быстрые свидания')"));};
const fits=async()=>assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
const correct='В комнату вошла София. Она искала старый ноутбук своей сестры. Она получила запасной ключ и вошла вечером. Когда она включила компьютер, старая программа отправила сообщение автоматически';
try {
  for(const width of [360,1280]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:width===360});
    await b.load();await safe();await fits();await b.screenshot(`case-home-${width}`);
    await click('#start');assert.ok(await evaluate("document.querySelector('#description').textContent.includes('22:17')"));await safe();await fits();await b.screenshot(`case-brief-${width}`);
    await click('#witnesses');assert.equal(await evaluate("document.querySelectorAll('[data-witness]').length"),5);await safe();await fits();await b.screenshot(`case-witnesses-${width}`);
    await click('[data-witness=lena]');await send('София искала ноутбук?');assert.equal(await count(),1);assert.equal(await evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent"),'Я этого не знаю.');
    await click('[data-witness=maxim]');await send('Ты отправил сообщение?');assert.equal(await count(),2);assert.ok(await evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent.includes('не отправлял')"));
    await send('Ты сообщение написал?');assert.equal(await count(),2);
    await click('#hint');assert.ok(await evaluate("document.querySelector('#shown-hints').textContent.includes('технического входа')"));
    await send('Компьютер включился сам?');assert.equal(await count(),3);assert.equal(await evaluate("document.querySelectorAll('#shown-hints .advice').length"),1);
    await click('[data-witness=anya]');await send('Ты его видел?');assert.equal(await count(),4);assert.ok(await evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent.includes('имеешь в виду')"));
    await click('[data-witness=ilya]');await send('Ты видел Софию у технического входа?');assert.equal(await count(),5);
    await click('[data-witness=sofia]');await send('Ты искала ноутбук?');assert.equal(await count(),6);assert.equal(await evaluate("document.querySelectorAll('#shown-hints .advice').length"),2);
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    assert.ok(await evaluate("(()=>{const last=[...document.querySelectorAll('.message.npc')].at(-1).getBoundingClientRect();const area=document.querySelector('#messages').getBoundingClientRect();return last.top>=area.top&&last.bottom<=area.bottom})()"));
    await fits();await safe();await b.screenshot(`case-investigation-${width}`);
    await send('<script>window.injected=true</script>');assert.equal(await evaluate('window.injected===true'),false);
    for(let i=0;i<3;i++)await send(`непонятный вопрос ${i}`);
    assert.equal(await evaluate("document.querySelectorAll('#shown-hints .advice').length"),3);assert.equal(await evaluate("document.querySelector('#hint').disabled"),true);
    await evaluate("document.querySelector('#message').value='Черновик свидетелю';document.querySelector('#message').dispatchEvent(new Event('input'))");
    await click('#version');await send('В комнате была София');assert.ok(await evaluate("document.querySelector('#version-feedback').textContent.includes('1 из 4')"));await safe();await fits();await b.screenshot(`case-partial-${width}`);
    await click('#back');assert.equal(await evaluate("document.querySelector('#message').value"),'Черновик свидетелю');
    const total=await count();await click('[data-witness=maxim]');await click('[data-witness=sofia]');assert.equal(await count(),total);assert.equal(await evaluate("document.querySelector('#message').value"),'Черновик свидетелю');
    await evaluate("document.querySelector('#message').value='';document.querySelector('#message').dispatchEvent(new Event('input'));document.querySelector('#composer').requestSubmit()");assert.equal(await count(),total);
    await click('#version');await send('София ноутбук ключ автоматически');assert.ok(await evaluate("document.querySelector('#version-feedback').textContent.includes('не смог разобрать')"));await safe();
    const unsafeVersions=[
      'В комнате была София. Старый ноутбук искала Лена. Запасной ключ получила Аня. Когда включился компьютер, старая программа отправила сообщение автоматически.',
      'В комнате была сестра Софии. Она искала старый ноутбук своей сестры. Она получила запасной ключ. Когда она включила компьютер, старая программа отправила сообщение автоматически.',
      correct+'. София не получала ключ.',
      correct+'. В комнате была не София.',
      correct+'. Компьютер не включался.'
    ];
    for(const version of unsafeVersions){await send(version);assert.ok(await evaluate("!document.querySelector('#solution') && !!document.querySelector('#version-feedback')"));await safe();}
    await send(correct);assert.ok(await evaluate("document.querySelector('#solution').textContent.includes('София искала')"));assert.equal(await evaluate("document.querySelectorAll('#solution').length"),1);await fits();await b.screenshot(`case-solved-${width}`);
    await call('Page.handleJavaScriptDialog',{accept:false}).catch(()=>{}); // no dialog until reset click
    const dialog=call('Runtime.evaluate',{expression:"document.querySelector('#reset').click()"});
    await new Promise(resolve=>setTimeout(resolve,50));await call('Page.handleJavaScriptDialog',{accept:false});await dialog;assert.ok(await evaluate("!!document.querySelector('#solution')"));
    const reset=call('Runtime.evaluate',{expression:"document.querySelector('#reset').click()"});await new Promise(resolve=>setTimeout(resolve,50));await call('Page.handleJavaScriptDialog',{accept:true});await reset;
    await click('#start');await click('#witnesses');assert.equal(await count(),0);await safe();
    await click('[data-witness=maxim]');await send('Когда вы уходили вы выключили компьютер?');
    assert.equal(await count(),1);assert.equal(await evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent"),'Я не могу сказать, выключал ли я компьютер. Я говорил, что ушёл в 21:30.');
    assert.ok(await evaluate("!document.querySelector('#solution')"));await safe();await fits();await b.screenshot(`case-natural-question-${width}`);
    await send('Скажите, пожалуйста, вы отправляли сообщение?');assert.equal(await count(),2);assert.equal(await evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent"),'Нет, я его не отправлял.');
    console.log(`PASS ${width}px: full flow, five witnesses, knowledge, counters/hints, drafts, rejected wrong actors/negation, guarded solution, reset`);
    console.log(`PASS ${width}px: natural departure question is recognized but unknown; polite plural query uses the authored fact`);
  }
  // Real subfolder URLs, without creating or publishing a repository.
  const root=fileURLToPath(new URL('../',import.meta.url));
  const host=http.createServer(async(request,response)=>{try{const relative=new URL(request.url,'http://localhost').pathname.slice('/repo/'.length)||'index.html';const file=path.resolve(root,relative);if(!file.startsWith(root)){response.writeHead(403).end();return;}const data=await readFile(file);response.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[path.extname(file)]||'text/plain'});response.end(data);}catch{response.writeHead(404).end();}});
  await new Promise(resolve=>host.listen(0,'127.0.0.1',resolve));
  try{await b.load(`http://127.0.0.1:${host.address().port}/repo/`);await click('#start');await click('#witnesses');assert.equal(await evaluate("document.querySelectorAll('[data-witness]').length"),5);console.log('PASS /repo/ relative CSS, JS and case JSON');}finally{await call('Page.navigate',{url:'about:blank'});host.closeAllConnections();await new Promise(resolve=>host.close(resolve));}
  assert.deepEqual(b.errors,[]);assert.deepEqual(b.failed,[]);console.log('PASS no browser errors or missing local resources');
}finally{b.close();}
