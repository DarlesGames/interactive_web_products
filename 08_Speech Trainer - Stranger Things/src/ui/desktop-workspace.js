const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
const withoutIds=node=>{node.removeAttribute('id');node.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));return node;};

// Pagination is a presentation of the full transcript, never a change to game state.
function paginate(root,{label='Страница',last=false,before=false}={}) {
  const originals=[...root.children];originals.forEach(n=>n.hidden=true);
  const entries=[];
  for(let i=0;i<originals.length;i++){
    if(originals[i].matches('.message.student')&&originals[i+1]?.matches('.message.npc')){
      const turn=make('div',null,'conversation-turn');
      for(const original of [originals[i],originals[++i]]){const copy=withoutIds(original.cloneNode(true));copy.hidden=false;turn.append(copy);}
      entries.push(turn);
    }else{const copy=withoutIds(originals[i].cloneNode(true));copy.hidden=false;entries.push(copy);}
  }
  const flow=make('div',null,'page-content');root.append(flow);
  const bar=make('nav',null,'page-controls');bar.setAttribute('aria-label',label);
  const previous=make('button','← Раньше');const next=make('button','Дальше →');
  previous.type=next.type='button';const count=make('span');count.setAttribute('aria-live','polite');bar.append(previous,count,next);
  if(before)root.before(bar);else root.append(bar);
  let pages=[],current=0,raf=0,disposed=false,first=true;
  const show=index=>{current=Math.max(0,Math.min(index,pages.length-1));flow.replaceChildren(...(pages[current] || []));count.textContent=`${current+1} / ${Math.max(1,pages.length)}`;previous.disabled=current===0;next.disabled=current>=pages.length-1;};
  const height=()=>root.clientHeight-parseFloat(getComputedStyle(root).paddingTop)-parseFloat(getComputedStyle(root).paddingBottom)-(before?0:bar.offsetHeight+8);
  const oversized=node=>{
    const fragments=[];
    const blocks=node.matches('.message')?[...node.querySelectorAll('p,.dialogue-guidance')]:[node];
    for(const block of blocks){
      const words=block.textContent.split(/\s+/u).filter(Boolean);let start=0;
      while(start<words.length){
        const fragment=node.matches('.message')?node.cloneNode(false):make('div');fragment.hidden=false;
        if(node.matches('.message'))fragment.append(node.querySelector('.speaker')?.cloneNode(true) || make('span'));
        const copy=withoutIds(block.cloneNode(false));fragment.append(copy);
        let lo=1,hi=words.length-start,best=1;
        while(lo<=hi){const mid=(lo+hi)>>1;copy.textContent=words.slice(start,start+mid).join(' ');flow.replaceChildren(fragment);if(flow.scrollHeight<=height()+1){best=mid;lo=mid+1;}else hi=mid-1;}
        copy.textContent=words.slice(start,start+best).join(' ');fragments.push(fragment);start+=best;
      }
    }
    return fragments;
  };
  const rebuild=()=>{
    if(disposed||root.clientHeight<25)return;
    const onLast=current===pages.length-1;pages=[];let page=[];flow.replaceChildren();
    for(const original of entries){
      const copy=withoutIds(original.cloneNode(true));copy.hidden=false;
      flow.replaceChildren(copy);
      const units=flow.scrollHeight>height()+1
        ?copy.matches('.conversation-turn')?[...copy.children].flatMap(message=>{flow.replaceChildren(message);return flow.scrollHeight>height()+1?oversized(message):[message];}):oversized(copy)
        :[copy];
      for(const unit of units){
        flow.replaceChildren(...page,unit);
        if(page.length&&flow.scrollHeight>height()+1){pages.push(page);page=[];}
        page.push(unit);
      }
    }
    if(page.length)pages.push(page);
    show(first&&last||onLast?pages.length-1:current);first=false;
  };
  previous.onclick=()=>show(current-1);next.onclick=()=>show(current+1);
  const observer=new ResizeObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(rebuild);});observer.observe(root);observer.observe(bar);
  rebuild();
  return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();bar.remove();flow.remove();originals.forEach(n=>n.hidden=false);};
}

function coachTabs(panel){
  const body=panel.querySelector('.coach-body');const tabs=make('nav',null,'coach-tabs');tabs.setAttribute('aria-label','Разделы речевой помощи');
  panel.querySelector('summary').after(tabs);
  const views=[['task','Задача'],['build','Собрать'],['example','Пример'],['phrases','Фразы']];
  const select=view=>{
    panel.dataset.coachView=view;
    for(const b of tabs.children)b.setAttribute('aria-pressed',String(b.dataset.view===view));
    const detail=panel.querySelector(view==='build'?'.coach-builder':'.coach-phrases');if(detail)detail.open=true;
    if(view==='example'){const example=panel.querySelector('.coach-example');if(example)example.hidden=false;}
  };
  for(const [view,label] of views){const b=make('button',label);b.type='button';b.dataset.view=view;b.onclick=()=>select(view);tabs.append(b);}
  const click=event=>{
    if(event.target.closest('.coach-builder>summary')){event.preventDefault();select('build');}
    if(event.target.closest('button')?.textContent==='Показать пример')select('example');
  };
  const change=event=>{if(event.target.id==='coach-goal')select('task');};
  body.addEventListener('click',click);body.addEventListener('change',change);select('task');
  return ()=>{tabs.remove();delete panel.dataset.coachView;body.removeEventListener('click',click);body.removeEventListener('change',change);};
}

export function attachDesktopWorkspace(){
  const media=window.matchMedia('(min-width:861px)');let cleanups=[];
  const reset=()=>{for(const cleanup of cleanups.reverse())cleanup();cleanups=[];};
  const apply=()=>{
    reset();if(!media.matches)return;
    const messages=document.querySelector('#messages');if(!messages)return;
    const panel=document.querySelector('#conversation-coach');if(panel)cleanups.push(coachTabs(panel));
    const notes=document.querySelector('#case-notes');const contents=notes?.querySelector('.notes-body');
    if(notes&&contents){
      const dialog=make('dialog',null,'case-reader');dialog.setAttribute('aria-label','Материалы расследования');
      const heading=make('header');heading.append(make('h2','Материалы расследования'));
      const close=make('button','Закрыть ×');close.type='button';heading.append(close);
      const view=make('div',null,'case-reader-body');dialog.append(heading,view);document.querySelector('.chat').append(dialog);
      const rows=[];
      for(const child of contents.children){
        if(child.matches('h3'))rows.push(child.cloneNode(true));
        else for(const entry of child.children){const row=make('div');row.append(entry.cloneNode(true));rows.push(row);}
      }
      view.append(...rows);
      let destroyPages=null;
      const open=event=>{if(!event.target.closest('#case-notes>summary'))return;event.preventDefault();notes.open=false;if(!dialog.open){dialog.showModal();destroyPages=paginate(view,{label:'Материалы'});}};
      const resetOpen=()=>{if(notes.open)notes.open=false;};
      notes.querySelector('summary').setAttribute('aria-haspopup','dialog');
      notes.addEventListener('click',open);notes.addEventListener('toggle',resetOpen);close.onclick=()=>dialog.close();
      dialog.onclose=()=>{notes.open=false;destroyPages?.();destroyPages=null;};
      cleanups.push(()=>{notes.removeEventListener('click',open);notes.removeEventListener('toggle',resetOpen);notes.querySelector('summary').removeAttribute('aria-haspopup');destroyPages?.();dialog.remove();});
    }
  };
  media.addEventListener('change',apply);apply();
  return ()=>{media.removeEventListener('change',apply);reset();};
}
