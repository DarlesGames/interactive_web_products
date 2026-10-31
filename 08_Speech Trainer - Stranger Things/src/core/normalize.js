// Explicit local forms only. In particular, a laptop is never a computer alias.
const groups={
  sofia:'софия софию софии софией',anya:'аня аню ани аней',maxim:'максим максима максиму максимом',lena:'лена лену лены леной',ilya:'илья илью ильи ильей',marina:'марина марину марины мариной',
  computer_room_5:'компьютер компьютера компьютере компьютером',old_laptop:'ноутбук ноутбука ноутбуке ноутбуком',message_22_17:'сообщение сообщения сообщении сообщением письмо письма фразу фраза',photo_on_screen:'фото фотография фотографию фотографии снимок снимка',wet_footprints:'следы следов следами',ghost:'призрак призрака призраком',someone:'человек кто-нибудь',
  was_in:'был была было были быть находился находилась находились приходила оставалась находиться',sent:'отправил отправила отправили отправлял отправляла отправляли отправлять послал послала послали посылал посылала посылали написал написала писал писала писали написали отправилось',searched_for:'искала искал искали искать разыскивала разыскивал разыскивали',saw:'видел видела видели заметил заметила заметили увидел увидела увидели видеть',turned_on:'включился включилась включаться включался включалась запустился запустилась запускался запускалась',worked_at:'работала работал работали',took:'сделала сделали сделать сняла сняли сфотографировала сфотографировали',left:'оставил оставила сделал',planned:'запланировано запланировали запланированным',
  turned_off:'выключил выключила выключили выключал выключала выключали выключать отключил отключила отключили отключал отключала отключали',departed:'уходил уходила уходили ушел ушла ушли уходить',departure:'уходом уходе ухода',
  old:'старый старого старом старая старой старую',room:'комната комнату комнате комнаты',coworking:'коворкинг коворкинге коворкинга офис офисе здание здании',entrance:'вход входа входе',technical:'технический технического техническом',wet:'мокрый мокрые мокрых',automatic:'автоматически сам',sister:'сестра сестры сестру сестрой',key:'ключ ключа ключом',spare:'запасной запасного запасным',entered:'вошла вошел вошёл входила входил попала попал проникла',received:'получила получил получала получал взяла взял брала брал забрала',activated:'включила включил запустила запустил',program:'программа программы программой программу',arrived:'пришло появилось поступило',delayed:'отложенное отложенной отложенным',evening:'вечером вечер',
};
const forms=new Map(Object.entries(groups).flatMap(([lemma,words])=>words.split(' ').map(word=>[word.replaceAll('ё','е'),lemma])));
export const personNames={sofia:'софия',anya:'аня',maxim:'максим',lena:'лена',ilya:'илья',marina:'марина'};
const genders={sofia:'f',anya:'f',lena:'f',marina:'f',maxim:'m',ilya:'m',computer_room_5:'m',old_laptop:'m',message_22_17:'n',photo_on_screen:'f'};
export function referenceGender(tokens=[],sources=[],priorGender=null) {
  const entities=[...new Set(tokens.filter(token=>genders[token]))];
  if(entities.length!==1)return null;
  if(sources.some(word=>word==='его'||word==='ее')&&priorGender)return priorGender;
  if(sources.some(word=>['снимок','снимка'].includes(word)))return 'm';
  if(sources.includes('фото'))return 'n';
  if(sources.some(word=>['фраза','фразу'].includes(word)))return 'f';
  return genders[entities[0]];
}
export function normalize(text,context={}) {
  let value=String(text ?? '').toLowerCase().replaceAll('ё','е')
    .replace(/(после|до|в)\s+(\d{1,2})\s+(\d{2})(?!\d)/g,(_,p,h,m)=>`${p} time${h.padStart(2,'0')}${m} `)
    .replace(/(\d{1,2})[:.](\d{2})/g,(_,h,m)=>` time${h.padStart(2,'0')}${m} `)
    .replace(/после (?:девяти|девять) тридцати/g,'после time2130')
    .replace(/(?:комнат[аеуы]|пятой комнате)\s*(?:№|номер)?\s*(?:5|пять)(?!\d)/g,'room_5')
    .replace(/в пятой комнате/g,'в room_5').replace(/комнате номер пять/g,'room_5')
    .replace(/кто[ -](?:то|нибудь)/g,'someone').replace(/№/g,' номер ')
    .replace(/[^\p{L}\p{N}_\s]/gu,' ').replace(/\s+/g,' ').trim();
  const entries=value?value.split(' ').flatMap(word=>{
    let mapped=forms.get(word) || word;
    if(word==='ты'||word==='вы')mapped=context.witnessId || 'unresolved_subject';
    if(word==='она'||word==='он')mapped=context.lastSubject&&genders[context.lastSubject]===(word==='она'?'f':'m')?context.lastSubject:'unresolved_subject';
    if(word==='его'||word==='ее') {
      const gender=context.lastObjectGender || referenceGender(context.lastObjectTokens);
      mapped=gender&&(word==='ее'?gender==='f':gender!=='f')?context.lastObjectTokens:['unresolved_object'];
    }
    return (Array.isArray(mapped)?mapped:[mapped]).map(token=>({token,source:word}));
  }):[];
  const tokens=entries.map(entry=>entry.token);
  return {text:tokens.join(' '),tokens,sources:entries.map(entry=>entry.source)};
}
export function phraseIn(tokens,phrase) {
  const wanted=Array.isArray(phrase)?phrase:phrase.split(' ');
  const at=tokens.findIndex((_,index)=>wanted.every((word,offset)=>tokens[index+offset]===word));
  return at<0?null:{at,length:wanted.length,tokens:wanted};
}
