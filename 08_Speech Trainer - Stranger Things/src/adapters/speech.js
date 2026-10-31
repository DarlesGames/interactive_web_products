// Web Speech lifecycle only: no DOM, dialogue, network calls or automatic send.
export function createSpeechAdapter({
  Recognition=globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition,
  isOnline=()=>globalThis.navigator?.onLine !== false,
  onUpdate=()=>{},
  setTimer=globalThis.setTimeout,
  clearTimer=globalThis.clearTimeout
} = {}) {
  const supported=typeof Recognition==='function';
  let disposed=false;
  let current=null;
  let state={phase:supported?'idle':'unsupported',active:false,finalText:'',interimText:'',error:null};
  const publish=patch=>{
    state={...state,...patch};
    if(!disposed) onUpdate({...state});
  };
  const valid=session=>!disposed && current===session;
  function detach(session,abort=false) {
    clearTimer(session.timer);
    current=null; // Invalidates already queued or captured event callbacks.
    const recognition=session.recognition;
    if(!recognition) return;
    recognition.onstart=recognition.onresult=recognition.onerror=recognition.onend=recognition.onnomatch=null;
    if(abort) {try {recognition.abort();} catch { /* Text mode remains usable. */ }}
  }
  function finish(session,patch,abort=false) {
    if(!valid(session)) return;
    detach(session,abort);
    publish({active:false,interimText:'',...patch});
  }
  function fail(session,error) {
    finish(session,{phase:'error',error,finalText:''},true);
  }
  function arm(session,milliseconds) {
    clearTimer(session.timer);
    session.timer=setTimer(()=>{
      if(session.finalText) finish(session,{phase:'ready',finalText:session.finalText,error:null},true);
      else fail(session,'timeout');
    },milliseconds);
  }
  return {
    supported,
    get active(){return !!current;},
    get state(){return {...state};},
    start() {
      if(disposed || current) return false;
      if(!supported) {publish({phase:'unsupported'});return false;}
      if(!isOnline()) {publish({phase:'error',error:'network',active:false,finalText:'',interimText:''});return false;}
      const session={recognition:null,finalText:'',timer:null};
      current=session;
      publish({phase:'starting',active:true,finalText:'',interimText:'',error:null});
      try {
        const recognition=new Recognition();
        session.recognition=recognition;
        recognition.lang='ru-RU';
        recognition.continuous=false;
        recognition.interimResults=true;
        recognition.maxAlternatives=1;
        recognition.onstart=()=>{if(valid(session) && state.phase==='starting') publish({phase:'listening'});};
        recognition.onresult=event=>{
          if(!valid(session)) return;
          const final=[];
          const interim=[];
          // Results is a current cumulative list: rebuild instead of appending
          // repeated final segments when later interim events arrive.
          for(let index=0;index<event.results.length;index++) {
            const result=event.results[index];
            const text=result[0]?.transcript?.trim();
            if(text) (result.isFinal?final:interim).push(text);
          }
          session.finalText=final.join(' ');
          publish({finalText:session.finalText,interimText:interim.join(' ')});
        };
        recognition.onerror=event=>{if(valid(session)) fail(session,event.error || 'unknown');};
        recognition.onnomatch=()=>fail(session,'no-speech');
        recognition.onend=()=>{
          if(!valid(session)) return;
          if(session.finalText) finish(session,{phase:'ready',finalText:session.finalText,error:null});
          else fail(session,'no-speech');
        };
        arm(session,30000);
        recognition.start();
        return true;
      } catch(error) {
        fail(session,error?.name==='NotAllowedError' || error?.name==='SecurityError'?'not-allowed':'start-failed');
        return false;
      }
    },
    stop() {
      const session=current;
      if(!session || state.phase==='stopping') return;
      if(state.phase==='starting') {
        finish(session,{phase:'cancelled',finalText:'',error:null},true);
        return;
      }
      publish({phase:'stopping'});
      try {arm(session,5000);session.recognition.stop();}
      catch {fail(session,'start-failed');}
    },
    cancel(error=null) {
      if(current) finish(current,{phase:error?'error':'cancelled',error,finalText:''},true);
    },
    dispose() {
      disposed=true;
      if(current) detach(current,true);
      state={phase:'disposed',active:false,finalText:'',interimText:'',error:null};
    }
  };
}

export function appendTranscript(draft,transcript,maxLength=2000) {
  const text=transcript.trim();
  if(!text) return draft;
  const next=draft+(draft && !/\s$/.test(draft)?' ':'')+text;
  return next.length<=maxLength?next:null;
}
