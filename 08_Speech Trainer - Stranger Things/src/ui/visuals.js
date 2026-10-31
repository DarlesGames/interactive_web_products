const asset=name=>new URL('../../assets/'+name,import.meta.url).href;
const portraits={anya:'ania.png',maxim:'maksim.png',lena:'lena.png',ilya:'ilya.png',sofia:'sofia.png'};

export function portrait(witness,className='witness-portrait') {
  const image=document.createElement('img');image.src=asset(portraits[witness.id]);
  image.alt=`${witness.name} — ${witness.role}`;image.className=className;
  image.width=296;image.height=685;image.decoding='async';return image;
}

export function icon(name) {
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','ui-icon');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
  const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href',asset('ui-icons.svg')+'#'+name);svg.append(use);return svg;
}

export function decorateControls(root) {
  const icons={start:'search',witnesses:'people',hint:'bulb',version:'notebook',back:'arrow-left',reset:'reset','all-witnesses':'people',send:'send','coach-toggle':'bulb'};
  for(const [id,name] of Object.entries(icons)){
    const button=root.querySelector('#'+id);if(button&&!button.querySelector('svg'))button.prepend(icon(name));
  }
  root.querySelectorAll('.witness-card button').forEach(button=>button.prepend(icon('chat')));
}
