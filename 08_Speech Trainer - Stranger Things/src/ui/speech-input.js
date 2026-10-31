import { createSpeechAdapter,appendTranscript } from '../adapters/speech.js';

const errors={
  'not-allowed':'Нет доступа к микрофону. Разреши доступ в настройках браузера или введи текст вручную.',
  'service-not-allowed':'Браузер запретил распознавание речи. Можно ввести текст вручную.',
  'network':'Голосовой ввод недоступен из-за ошибки сети. Можно ввести текст вручную.',
  'audio-capture':'Микрофон недоступен. Проверь подключение или введи текст вручную.',
  'no-speech':'Не удалось распознать речь. Попробуй ещё раз или напиши текст.',
  'language-not-supported':'Браузер не поддерживает распознавание русской речи. Можно ввести текст вручную.',
  'aborted':'Распознавание остановлено. Можно ввести текст вручную.',
  'timeout':'Время ожидания истекло. Попробуй ещё раз или напиши текст.',
  'start-failed':'Не удалось включить голосовой ввод. Можно ввести текст вручную.'
};

export function attachSpeechInput(field) {
  let draft='';
  let disposed=false;
  const row=document.createElement('div');
  row.className='voice-row';
  row.innerHTML='<button id="microphone" type="button" data-action="microphone" aria-pressed="false" aria-describedby="speech-status">Микрофон</button><div class="voice-feedback"><p id="speech-status" role="status" aria-live="polite" aria-atomic="true"></p><p id="speech-preview"></p></div>';
  field.closest('form').append(row);
  const button=row.querySelector('button');
  const status=row.querySelector('#speech-status');
  const preview=row.querySelector('#speech-preview');
  field.setAttribute('aria-describedby','speech-status');
  const adapter=createSpeechAdapter({onUpdate:update=>{
    if(disposed || !field.isConnected) return;
    button.setAttribute('aria-pressed',String(update.active));
    button.textContent=update.phase==='starting'?'Отменить':update.active?'Стоп':'Микрофон';
    button.disabled=update.phase==='stopping';
    preview.textContent=update.interimText?`Предварительно (не отправлено): ${update.interimText}`:'';
    if(update.phase==='starting') status.textContent='Запрашиваю доступ к микрофону…';
    else if(update.phase==='listening') status.textContent='Слушаю… Текст появится после завершения распознавания.';
    else if(update.phase==='stopping') status.textContent='Завершаю распознавание…';
    else if(update.phase==='cancelled') status.textContent='Распознавание остановлено. Твой текст сохранён.';
    else if(update.phase==='error') status.textContent=errors[update.error] || 'Не удалось распознать речь. Можно ввести текст вручную.';
    else if(update.phase==='ready') {
      preview.textContent=`Распознано: ${update.finalText}`;
      const next=appendTranscript(field.value,update.finalText,field.maxLength);
      if(field.value!==draft) status.textContent='Черновик изменён: распознанный текст не добавлен. Можно продолжать печатать.';
      else if(next===null) status.textContent='В поле не хватает места. Распознанный текст показан ниже, ничего не отправлено.';
      else {
        field.value=next;
        field.dispatchEvent(new Event('input',{bubbles:true}));
        status.textContent='Текст добавлен в поле. Проверь его и нажми «Отправить», когда будешь готов.';
        field.focus();
      }
    }
  }});
  button.hidden=!adapter.supported;
  status.textContent=adapter.supported?'Для распознавания речи браузер может передавать аудио своему сервису. Проверь текст перед отправкой.':'В этом браузере нет голосового ввода. Введи текст вручную.';
  button.onclick=()=>{
    if(adapter.active) adapter.stop();
    else {
      draft=field.value;
      const help=document.querySelector('#case-notes'); if(help) help.open=false;
      adapter.start();
    }
  };
  const edit=()=>{if(adapter.active) adapter.cancel();};
  const offline=()=>adapter.cancel('network');
  const hidden=()=>{if(document.hidden) adapter.cancel();};
  field.addEventListener('input',edit);
  window.addEventListener('offline',offline);
  document.addEventListener('visibilitychange',hidden);
  return {
    cancel:()=>{
      adapter.cancel();
      preview.textContent='';
      if(adapter.supported) status.textContent='Можно продолжить печатать или снова включить микрофон.';
    },
    dispose() {
      disposed=true;
      adapter.dispose();
      field.removeEventListener('input',edit);
      window.removeEventListener('offline',offline);
      document.removeEventListener('visibilitychange',hidden);
    }
  };
}
