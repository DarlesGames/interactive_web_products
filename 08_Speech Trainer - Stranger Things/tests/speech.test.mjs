import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpeechAdapter,appendTranscript } from '../src/adapters/speech.js';

function setup({online=true,startError=null,stopError=null,ctorError=false}={}) {
  const instances=[];
  const updates=[];
  const timers=new Map();
  let nextTimer=0;
  class Recognition {
    constructor(){if(ctorError) throw new Error('unavailable');instances.push(this);this.starts=0;this.stops=0;this.aborts=0;}
    start(){this.starts++;if(startError) throw Object.assign(new Error('failed'),{name:startError});}
    stop(){this.stops++;if(stopError) throw new Error('failed');}
    abort(){this.aborts++;}
  }
  const adapter=createSpeechAdapter({Recognition,isOnline:()=>online,onUpdate:state=>updates.push(state),setTimer:callback=>{timers.set(++nextTimer,callback);return nextTimer;},clearTimer:id=>timers.delete(id)});
  const emit=(instance,...values)=>instance.onresult?.({results:values.map(([text,isFinal])=>Object.assign([{transcript:text}],{isFinal}))});
  return {adapter,instances,updates,timers,emit};
}

test('speech is lazy, one-shot, Russian, and starts only on request',()=>{
  const fixture=setup();
  const {adapter,instances}=fixture;
  assert.equal(adapter.supported,true);
  assert.equal(instances.length,0);
  assert.equal(adapter.active,false);
  adapter.start();
  const recognition=instances[0];
  assert.equal(recognition.starts,1);
  assert.equal(recognition.lang,'ru-RU');
  assert.equal(recognition.continuous,false);
  assert.equal(recognition.interimResults,true);
  assert.equal(adapter.state.phase,'starting');
  assert.equal(adapter.start(),false);
  assert.equal(instances.length,1);
  recognition.onstart();
  assert.equal(adapter.state.phase,'listening');
  adapter.dispose();
});

test('unsupported browser and offline state preserve text-only operation',()=>{
  const unsupported=createSpeechAdapter({Recognition:null});
  assert.equal(unsupported.supported,false);
  assert.equal(unsupported.start(),false);
  assert.equal(unsupported.active,false);
  const {adapter,instances}=setup({online:false});
  assert.equal(adapter.start(),false);
  assert.equal(adapter.state.error,'network');
  assert.equal(instances.length,0);
});

test('interim result is a preview; only final data becomes ready on end',()=>{
  const {adapter,instances,emit}=setup();
  adapter.start();
  const recognition=instances[0];
  recognition.onstart();
  emit(recognition,['Я люблю',false]);
  assert.equal(adapter.state.interimText,'Я люблю');
  assert.equal(adapter.state.finalText,'');
  assert.notEqual(adapter.state.phase,'ready');
  emit(recognition,['Я люблю футбол',true]);
  assert.notEqual(adapter.state.phase,'ready');
  recognition.onend();
  assert.equal(adapter.state.phase,'ready');
  assert.equal(adapter.state.finalText,'Я люблю футбол');
  assert.equal(adapter.active,false);
});

test('cumulative result events neither duplicate finals nor retain removed interim text',()=>{
  const {adapter,instances,emit}=setup();
  adapter.start();
  const recognition=instances[0];
  emit(recognition,['Привет',true],['Я люблю',false]);
  emit(recognition,['Привет',true],['Я люблю футбол',true],['и',false]);
  emit(recognition,['Привет',true],['Я люблю футбол',true]);
  recognition.onend();
  assert.equal(adapter.state.finalText,'Привет Я люблю футбол');
  assert.equal(adapter.state.interimText,'');
});

test('interim-only end and no-match never become a final transcript',()=>{
  for(const noMatch of [false,true]) {
    const {adapter,instances,emit}=setup();
    adapter.start();
    const recognition=instances[0];
    emit(recognition,['только предварительно',false]);
    noMatch?recognition.onnomatch():recognition.onend();
    assert.equal(adapter.state.phase,'error');
    assert.equal(adapter.state.error,'no-speech');
    assert.equal(adapter.state.finalText,'');
    assert.equal(adapter.active,false);
  }
});

for(const error of ['not-allowed','service-not-allowed','network','audio-capture','no-speech','aborted','language-not-supported','unknown']) test(`speech error ${error} ends the session without restart`,()=>{
  const {adapter,instances,timers,emit}=setup();
  adapter.start();
  const recognition=instances[0];
  const oldEnd=recognition.onend;
  const oldResult=recognition.onresult;
  emit(recognition,['черновой голос',false]);
  recognition.onerror({error});
  oldEnd();
  oldResult({results:[Object.assign([{transcript:'late result'}],{isFinal:true})]});
  assert.equal(adapter.state.error,error);
  assert.equal(adapter.state.phase,'error');
  assert.equal(adapter.state.finalText,'');
  assert.equal(instances.length,1);
  assert.equal(timers.size,0);
  assert.equal(adapter.active,false);
});

test('constructor and start exceptions fail safely and do not leak timers',()=>{
  for(const options of [{ctorError:true},{startError:'NotAllowedError'},{startError:'SecurityError'},{startError:'InvalidStateError'}]) {
    const {adapter,timers}=setup(options);
    assert.equal(adapter.start(),false);
    assert.equal(adapter.state.phase,'error');
    assert.equal(adapter.active,false);
    assert.equal(timers.size,0);
  }
});

test('stop waits for final result, double stop does nothing, startup stop cancels',()=>{
  const {adapter,instances,emit}=setup();
  adapter.start();instances[0].onstart();
  adapter.stop();adapter.stop();
  assert.equal(instances[0].stops,1);
  assert.equal(adapter.state.phase,'stopping');
  emit(instances[0],['Футбол',true]);instances[0].onend();
  assert.equal(adapter.state.phase,'ready');
  adapter.start();adapter.stop();
  assert.equal(adapter.state.phase,'cancelled');
  assert.equal(instances[1].aborts,1);
});

test('stop failure, timeout and connection loss leave no running capture',()=>{
  const broken=setup({stopError:true});
  broken.adapter.start();broken.instances[0].onstart();broken.adapter.stop();
  assert.equal(broken.adapter.state.phase,'error');
  assert.equal(broken.adapter.active,false);
  const timeout=setup();timeout.adapter.start();
  [...timeout.timers.values()][0]();
  assert.equal(timeout.adapter.state.error,'timeout');
  assert.equal(timeout.adapter.active,false);
  const offline=setup();offline.adapter.start();offline.adapter.cancel('network');
  assert.equal(offline.adapter.state.error,'network');
  assert.equal(offline.instances[0].aborts,1);
});

test('cancel and disposal ignore late callbacks and isolate subsequent sessions',()=>{
  const {adapter,instances,updates}=setup();
  adapter.start();
  const late=instances[0].onresult;
  adapter.cancel();
  adapter.start();
  late({results:[Object.assign([{transcript:'previous round'}],{isFinal:true})]});
  assert.equal(adapter.state.finalText,'');
  const end=instances[1].onend;
  adapter.dispose();
  const count=updates.length;
  end();
  assert.equal(updates.length,count);
  assert.equal(instances[1].aborts,1);
  assert.equal(adapter.active,false);
  assert.equal(adapter.start(),false);
  assert.equal(adapter.state.active,false);
  assert.equal(adapter.state.phase,'disposed');
});

test('append preserves draft, whitespace and length limit without sending anything',()=>{
  assert.equal(appendTranscript('','  Привет  '),'Привет');
  assert.equal(appendTranscript('Привет','Я люблю футбол'),'Привет Я люблю футбол');
  assert.equal(appendTranscript('Привет\n','Футбол'),'Привет\nФутбол');
  assert.equal(appendTranscript('Привет','',6),'Привет');
  assert.equal(appendTranscript('12345','6',5),null);
});
