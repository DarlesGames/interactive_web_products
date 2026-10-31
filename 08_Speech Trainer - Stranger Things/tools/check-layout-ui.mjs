import assert from 'node:assert/strict';
import {browserClient} from './browser-client.mjs';
const b=await browserClient();const {call,evaluate}=b;
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const position=()=>evaluate("(()=>{const chat=document.querySelector('.chat').getBoundingClientRect();const help=document.querySelector('.conversation-support').getBoundingClientRect();const input=document.querySelector('#composer').getBoundingClientRect();const messages=document.querySelector('#messages').getBoundingClientRect();return {right:help.left>=chat.right-1,below:help.top>=chat.bottom-1,adjacent:document.querySelector('#messages').nextElementSibling.id==='composer',gap:input.top-messages.bottom,inputY:input.top+scrollY}})()");
try{
 for(const width of [320,360,390,768,1024,1280]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:width<=860});
  await b.load();await click('#start');await click('#witnesses');await click('[data-witness=maxim]');
  let layout=await position();assert.ok(layout.adjacent);assert.ok(Math.abs(layout.gap)<2);
  assert.ok(width>860?layout.right:layout.below);
  assert.equal(await evaluate("!!document.querySelector('.chat #conversation-coach')"),false);
  const sizes=await evaluate("Object.fromEntries(['.message.npc p','#message','.coach-intro','.coach-tip','.voice-feedback p','.case-stats','.composer label'].map(s=>[s,parseFloat(getComputedStyle(document.querySelector(s)).fontSize)]))");
  assert.ok(sizes['.message.npc p']>=17);assert.ok(sizes['#message']>=17);
  for(const [key,size] of Object.entries(sizes))assert.ok(size>=14,key);
  const inputY=layout.inputY;
  if(width<=860)await click('#coach-toggle');
  await click('.coach-builder summary');
  layout=await position();assert.ok(layout.adjacent);assert.ok(Math.abs(layout.inputY-inputY)<2,'opening help moves composer');
  await evaluate("[...document.querySelectorAll('#conversation-coach button')].find(b=>b.textContent==='Вставить в черновик').click()");
  assert.ok(await evaluate("document.querySelector('#message').value.includes('Компьютер')"));
  assert.equal(await evaluate("document.querySelector('#question-count').textContent"),'0');
  await click('#send');assert.ok((await position()).adjacent);
  assert.equal(await evaluate("document.querySelector('#question-count').textContent"),'1');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  await b.screenshot(`case-layout-${width}`);
  if(width===390){
   await call('Emulation.setDeviceMetricsOverride',{width,height:520,deviceScaleFactor:1,mobile:true});
   assert.ok(await evaluate("(()=>{const t=document.querySelector('#message');t.focus();t.scrollIntoView({block:'center'});return t.getBoundingClientRect().height>=80&&document.documentElement.scrollWidth<=innerWidth})()"));
  }
  console.log(`PASS ${width}px: composer immediately follows transcript, separate ${width>860?'right':'lower'} help, help cannot move input, readable fonts, editable insertion, manual send, no overflow`);
 }
 assert.deepEqual(b.errors,[]);assert.deepEqual(b.failed,[]);
}finally{await call('Page.navigate',{url:'about:blank'});b.close();}
