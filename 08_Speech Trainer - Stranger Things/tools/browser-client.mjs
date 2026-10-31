import { mkdir,writeFile } from 'node:fs/promises';
export async function browserClient() {
  const pages=await(await fetch('http://127.0.0.1:9222/json/list')).json();
  const ws=new WebSocket(pages.find(page=>page.type==='page').webSocketDebuggerUrl);
  await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
  let id=0;const pending=new Map();const errors=[];const failed=[];
  ws.onmessage=({data})=>{const message=JSON.parse(data);if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);if(message.method==='Network.responseReceived'&&message.params.response.url.startsWith('http://127.0.0.1:')&&message.params.response.status>=400)failed.push(message.params.response.url);if(message.id){const job=pending.get(message.id);pending.delete(message.id);message.error?job.reject(message.error):job.resolve(message.result);}};
  const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
  await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await mkdir('.preview',{recursive:true});
  return {call,evaluate,errors,failed,close:()=>ws.close(),
    screenshot:async name=>{await evaluate("Promise.all([document.fonts.ready,...[...document.images].map(image=>image.decode().catch(()=>{})),...document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))])");const {cssContentSize}=await call('Page.getLayoutMetrics');const {data}=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:cssContentSize.width,height:cssContentSize.height,scale:1}});await writeFile(`.preview/${name}.png`,Buffer.from(data,'base64'));},
    load:async(url='http://127.0.0.1:8080/')=>{await call('Page.navigate',{url});await evaluate("new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{if(document.readyState==='complete'&&document.querySelector('#start')){clearInterval(t);resolve()}else if(++n>100){clearInterval(t);reject('Load timeout')}},30)})");}
  };
}
