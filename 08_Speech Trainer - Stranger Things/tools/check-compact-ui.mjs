import assert from 'node:assert/strict';
import {browserClient} from './browser-client.mjs';
const b=await browserClient();const {call,evaluate}=b;
const click=s=>evaluate(`document.querySelector(${JSON.stringify(s)}).click()`);
const send=t=>evaluate(`document.querySelector('#message').value=${JSON.stringify(t)};document.querySelector('#message').dispatchEvent(new Event('input'));document.querySelector('#composer').requestSubmit()`);
const frame=()=>evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
const fit=async selectors=>{
 await frame();
 const result=await evaluate(`(()=>{const bad=[];for(const s of ${JSON.stringify(selectors)})for(const e of document.querySelectorAll(s)){const r=e.getBoundingClientRect();if(r.height&&getComputedStyle(e).visibility!=='hidden'&&(r.top< -1||r.left< -1||r.right>innerWidth+1||r.bottom>innerHeight+1))bad.push({s,top:r.top,bottom:r.bottom,height:innerHeight});}return bad})()`);
 assert.deepEqual(result,[]);
 assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight+1'));
};
try{
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const [width,height] of [[1280,640],[1280,720],[1366,768],[1440,900],[1024,768],[1920,1080]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await b.load();
  await fit(['#start','.home-case-strip','.home-steps']);
  await click('#start');await fit(['#witnesses','#description','.clues','.advice']);
  await click('#witnesses');await fit(['.witness-card','#back']);
  await click('[data-witness=maxim]');await fit(['.witness-panel','.chat','.conversation-support','#send','#reset']);
  for(const view of ['task','build','example','phrases']){
   await click(`.coach-tabs [data-view=${view}]`);await fit(['.coach-tabs','.coach-notice']);
   const overflow=await evaluate("(()=>{const p=document.querySelector('.conversation-support');return p.scrollHeight-p.clientHeight})()");assert.ok(overflow<=2,`coach ${view} overflows by ${overflow}`);
  }
  await send('Компьютер включился сам?');await frame();
  const currentTurn=await evaluate("({text:document.querySelector('#messages').textContent,height:document.querySelector('#messages').clientHeight})");
  assert.ok(currentTurn.text.includes('Компьютер включился сам?')&&currentTurn.text.includes('включился автоматически'),JSON.stringify(currentTurn));
  for(let i=0;i<10;i++)await send('Непонятная реплика '+i);
  await fit(['.chat','#send','.conversation-support']);
  assert.ok(await evaluate("!document.querySelector('.case-reader').open"),'automatic hint interrupts conversation');
  assert.equal(await evaluate("document.querySelectorAll('.chat>.page-controls').length"),0);
  await send(Array.from({length:120},(_,i)=>'слово'+i).join(' '));await frame();
  const history=[await evaluate("[...document.querySelectorAll('#messages p,#messages .dialogue-guidance')].map(n=>n.textContent).join(' ')")];
  assert.ok(await evaluate("(()=>{const r=document.querySelector('#messages');return r.scrollHeight>r.clientHeight&&r.scrollTop>0&&getComputedStyle(r).overflowY==='auto'})()"),'chat should scroll to latest reply');
  await evaluate("document.querySelector('#messages').scrollTop=0");
  assert.equal(await evaluate("document.querySelector('#messages').scrollTop"),0);
  for(let i=0;i<10;i++)assert.ok(history.join(' ').includes('Непонятная реплика '+i));
  const words=new Set(history.join(' ').split(/\s+/u));
  for(let i=0;i<120;i++)assert.ok(words.has('слово'+i),'missing long-question word '+i);
  assert.equal(await evaluate("document.querySelector('#messages').nextElementSibling.id"),'composer');
  await click('#case-notes>summary');await frame();assert.ok(await evaluate("document.querySelector('.case-reader').open"));
  await fit(['.case-reader','.case-reader .page-controls']);
  const noteOverflow=await evaluate("(()=>{const p=document.querySelector('.case-reader-body');return p.scrollHeight-p.clientHeight})()");assert.ok(noteOverflow<=2,`reader overflows ${noteOverflow}`);
  await click('.case-reader header button');await click('#version');await fit(['#message','#send','#back']);
  console.log(`PASS ${width}x${height}: screens fit, chat scrolls, all help tabs fit, notes paginated, composer remains adjacent`);
  if(width===1366){await click('#back');await b.screenshot('case-compact-desktop');}
  if(width===1366)await click('#version');
  await send('В комнату вошла София. Она искала старый ноутбук своей сестры. Она получила запасной ключ и вошла вечером. Когда она включила компьютер, старая программа отправила сообщение автоматически');
  await fit(['#solution','#solved-checks','#reset','#categories']);
 }
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await b.load();await click('#start');await click('#witnesses');await click('[data-witness=maxim]');
 assert.ok(await evaluate('document.documentElement.scrollHeight>innerHeight'));
 assert.equal(await evaluate("document.querySelectorAll('.chat>.page-controls').length"),0);
 await click('[data-witness=anya]');
 await send('Кто был в тот вечер?');await frame();
 const anyaReply=await evaluate("document.querySelector('#messages .message.npc:last-child p').textContent");
 assert.ok(anyaReply.includes('София')&&!anyaReply.includes('не совсем понятен'),anyaReply);
 await b.screenshot('case-compact-mobile');
 assert.deepEqual(b.errors,[]);assert.deepEqual(b.failed,[]);
 console.log('PASS mobile scrolling and normal transcript preserved; no JS errors or missing resources');
}finally{await call('Emulation.setEmulatedMedia',{features:[]});await call('Page.navigate',{url:'about:blank'});b.close();}
