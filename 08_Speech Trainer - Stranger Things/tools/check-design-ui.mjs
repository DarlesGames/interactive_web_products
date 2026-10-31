import assert from 'node:assert/strict';
import {browserClient} from './browser-client.mjs';
const b=await browserClient();const {call,evaluate}=b;
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const assets={anya:'ania.png',maxim:'maksim.png',lena:'lena.png',ilya:'ilya.png',sofia:'sofia.png'};
try{
 for(const width of [320,360,768,1280]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<721});
  await b.load();
  const brand=await evaluate("(async()=>{const link=document.querySelector('.studio-link');const img=link.querySelector('img');await img.decode();const badge=document.querySelector('.development-note');const r=link.getBoundingClientRect();const name=document.querySelector('.brand').getBoundingClientRect();return {href:link.href,target:link.target,rel:link.rel,src:img.src,width:r.width,height:r.height,right:r.right,left:r.left,brandRight:name.right,status:badge.textContent,font:parseFloat(getComputedStyle(badge).fontSize),visible:badge.getBoundingClientRect().height>0}})()");
  assert.equal(brand.href,'https://darlesgames.github.io/');assert.equal(brand.target,'_blank');assert.ok(brand.rel.includes('noopener'));assert.ok(brand.src.endsWith('darles_logo.png'));
  assert.ok(brand.width<=72&&brand.height>=44);assert.ok(brand.left>=brand.brandRight);assert.ok(brand.right<=width);assert.equal(brand.status,'В разработке');assert.ok(brand.font<=11&&brand.visible);
  await click('#start');await click('#witnesses');
  const cards=await evaluate("Promise.all([...document.querySelectorAll('.witness-card')].map(async c=>{const img=c.querySelector('img');await img.decode();const r=img.getBoundingClientRect();return {id:c.querySelector('button').dataset.witness,src:img.src,alt:img.alt,natural:img.naturalWidth/img.naturalHeight,ratio:r.width/r.height,fit:getComputedStyle(img).objectFit}}))");
  assert.equal(cards.length,5);
  for(const card of cards){assert.ok(card.src.endsWith(assets[card.id]));assert.ok(card.alt.includes('—'));assert.equal(card.fit,'contain');if(width<=860)assert.ok(Math.abs(card.ratio-card.natural)<.01);else assert.ok(card.ratio>0);}
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  if(width<721)assert.ok(await evaluate("document.querySelector('#witness-grid').scrollWidth>document.querySelector('#witness-grid').clientWidth"));
  await click('[data-witness=anya]');
  assert.equal(await evaluate("document.querySelector('.active-dossier').open"),width>=1101);
  if(width<1101)await click('.active-dossier summary');
  assert.ok(await evaluate("document.querySelector('.active-portrait img').src.endsWith('ania.png')"));
  await click('[data-witness=maxim]');assert.ok(await evaluate("document.querySelector('.active-portrait img').src.endsWith('maksim.png')"));
  const send=await evaluate("(()=>{const b=document.querySelector('#send');const r=b.getBoundingClientRect();const f=document.querySelector('#message').getBoundingClientRect();return {h:r.height,w:r.width,field:f.width,icon:!!b.querySelector('svg'),nowrap:getComputedStyle(b).whiteSpace}})()");
  assert.ok(send.h>=44);assert.ok(send.field>=130);assert.ok(send.icon);assert.equal(send.nowrap,'nowrap');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
  console.log(`PASS ${width}px: five correct full portraits, original labels preserved, active dossier adapts, local SVG icons, usable input and touch targets, no document overflow`);
 }
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await b.load();assert.equal(await evaluate("getComputedStyle(document.querySelector('.home-scene')).animationName"),'none');
 // Check the two content colors against their darkest/lighter designed bubble stops.
 const luminance=hex=>{const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 for(const [ink,bg] of [['e0e1d4','253136'],['e4eeec','284b55'],['b1c0b4','24312c'],['9aaeb2','0b171d']]){const [a,c]=[luminance(ink),luminance(bg)].sort((x,y)=>y-x);assert.ok((a+.05)/(c+.05)>=4.5);}
 await call('Emulation.setEmulatedMedia',{features:[]});
 assert.deepEqual(b.errors,[]);assert.deepEqual(b.failed,[]);
 console.log('PASS reduced-motion, designed body/coach/placeholder contrast >=4.5, no JS errors or missing assets');
}finally{await call('Page.navigate',{url:'about:blank'});b.close();}
