import assert from 'node:assert/strict';
import { browserClient } from './browser-client.mjs';
const b=await browserClient();const {call,evaluate}=b;
let injection;
async function load(unsupported=false,prefixed=false){
 if(injection)await call('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection});
 injection=(await call('Page.addScriptToEvaluateOnNewDocument',{source:`window.instances=[];window.speechOnline=true;Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>speechOnline});class FakeSpeech{constructor(){window.instances.push(this);this.aborts=0}start(){this.onstart?.()}stop(){}abort(){this.aborts++}result(text,isFinal){this.onresult?.({results:[Object.assign([{transcript:text}],{isFinal})]})}end(){this.onend?.()}fail(error){this.onerror?.({error})}}Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:${unsupported||prefixed?'undefined':'FakeSpeech'}});Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:${!unsupported&&prefixed?'FakeSpeech':'undefined'}});`})).identifier;
 await b.load();await evaluate("document.querySelector('#start').click();document.querySelector('#witnesses').click();document.querySelector('[data-witness=maxim]').click()");
}
const speech=async(text,isFinal)=>evaluate(`instances.at(-1).result(${JSON.stringify(text)},${isFinal})`);
const setDraft=text=>evaluate(`document.querySelector('#message').value=${JSON.stringify(text)};document.querySelector('#message').dispatchEvent(new Event('input'))`);
try{
 for(const width of [360,1280]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:width===360});await load();assert.equal(await evaluate('instances.length'),0);
  await evaluate("document.querySelector('#microphone').click()");await speech('Ты отправил',false);assert.equal(await evaluate("document.querySelector('#message').value"),'');assert.equal(await evaluate("Number(document.querySelector('#question-count').textContent)"),0);
  assert.equal(await evaluate('instances.at(-1).lang'),'ru-RU');
  await speech('Ты отправил фотографию?',true);await evaluate('instances.at(-1).end()');assert.equal(await evaluate("document.querySelector('#message').value"),'Ты отправил фотографию?');assert.equal(await evaluate("Number(document.querySelector('#question-count').textContent)"),0);
  await setDraft('Ты отправил сообщение?');
  await evaluate("document.querySelector('#composer').requestSubmit();document.querySelector('#composer').requestSubmit()");assert.equal(await evaluate("Number(document.querySelector('#question-count').textContent)"),1);assert.ok(await evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent.includes('не отправлял')"));
  await evaluate("document.querySelector('#version').click();document.querySelector('#microphone').click()");await speech('В комнате была София',true);await evaluate('instances.at(-1).end()');assert.ok(!await evaluate("!!document.querySelector('#version-feedback .advice')"));await evaluate("document.querySelector('#composer').requestSubmit()");assert.ok(await evaluate("document.querySelector('#version-feedback').textContent.includes('1 из 4')"));
  await b.screenshot(`case-voice-${width}`);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  console.log(`PASS ${width}px: voice question and version, editable draft, no interim/final auto-send, no duplicate count`);
 }
 await load(false,true);await evaluate("document.querySelector('#microphone').click()");assert.equal(await evaluate('instances.at(-1).lang'),'ru-RU');await speech('Ты отправил сообщение?',true);await evaluate('instances.at(-1).end()');assert.equal(await evaluate("Number(document.querySelector('#question-count').textContent)"),0);await evaluate("document.querySelector('#composer').requestSubmit()");assert.equal(await evaluate("Number(document.querySelector('#question-count').textContent)"),1);console.log('PASS prefixed API: ru-RU, final draft, manual send');
 await load();await evaluate("document.querySelector('#microphone').click();window.lateResult=instances.at(-1).onresult;window.lateEnd=instances.at(-1).onend;document.querySelector('[data-witness=lena]').click();lateResult({results:[Object.assign([{transcript:'previous witness'}],{isFinal:true})]});lateEnd()");assert.equal(await evaluate("document.querySelector('#message').value"),'');assert.equal(await evaluate('instances[0].aborts'),1);
 for(const error of ['not-allowed','network']){
  await setDraft('Ты сделала фотографию?');await evaluate("document.querySelector('#microphone').click()");await evaluate(`instances.at(-1).fail(${JSON.stringify(error)})`);assert.equal(await evaluate("document.querySelector('#message').value"),'Ты сделала фотографию?');await evaluate("document.querySelector('#composer').requestSubmit()");assert.ok(await evaluate("[...document.querySelectorAll('.message.npc p')].at(-1).textContent.includes('не снимала')"));
 }
 await load();await evaluate("speechOnline=false;document.querySelector('#microphone').click()");assert.equal(await evaluate('instances.length'),0);assert.ok(await evaluate("document.querySelector('#speech-status').textContent.includes('сети')"));await setDraft('Ты отправил сообщение?');await evaluate("document.querySelector('#composer').requestSubmit()");assert.equal(await evaluate("Number(document.querySelector('#question-count').textContent)"),1);console.log('PASS offline microphone preflight: no capture and text path works');
 await load(true);assert.equal(await evaluate("document.querySelector('#microphone').hidden"),true);await setDraft('Ты отправил сообщение?');await evaluate("document.querySelector('#composer').requestSubmit()");assert.equal(await evaluate("Number(document.querySelector('#question-count').textContent)"),1);
 assert.deepEqual(b.errors,[]);assert.deepEqual(b.failed,[]);console.log('PASS knowledge switch cancels capture; permission/network errors and unsupported API preserve text mode. Real microphone not tested.');
}finally{if(injection)await call('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection});await call('Page.navigate',{url:'about:blank'});b.close();}
