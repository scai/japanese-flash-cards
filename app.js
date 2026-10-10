'use strict';
const examples = [
  {id:'sample-1',name:'示例教材 · 第 1 课',cards:[{japanese:'私',reading:'わたし',chinese:'我'},{japanese:'学生',reading:'がくせい',chinese:'学生'},{japanese:'先生',reading:'せんせい',chinese:'老师'},{japanese:'日本',reading:'にほん',chinese:'日本'},{japanese:'中国',reading:'ちゅうごく',chinese:'中国'},{japanese:'友達',reading:'ともだち',chinese:'朋友'}]},
];
const $ = id => document.getElementById(id);
// Transcribed from the supplied Lesson 27 page, in textbook order:
// 単語 (24), 会話 (5), 読み物 (15). I/II indicate verb groups.
const lesson27 = {id:'lesson-27',name:'第 27 课 · 何でも 作れるんですね',cards:[
  {japanese:'飼います',reading:'かいます',chinese:'飼養（動詞 I）'},
  {japanese:'走ります［道を～］',reading:'はしります［みちを～］',chinese:'跑、奔馳［在路上］（動詞 I）'},
  {japanese:'見えます［山が～］',reading:'みえます［やまが～］',chinese:'看得見［山］（動詞 II）'},
  {japanese:'聞こえます［音が～］',reading:'きこえます［おとが～］',chinese:'聽得見［聲音］（動詞 II）'},
  {japanese:'できます［道が～］',reading:'できます［みちが～］',chinese:'建好、修好［道路］（動詞 II）'},
  {japanese:'開きます［教室を～］',reading:'ひらきます［きょうしつを～］',chinese:'開［教室］（動詞 I）'},
  {japanese:'心配［な］',reading:'しんぱい［な］',chinese:'擔心'},
  {japanese:'ペット',reading:'ペット',chinese:'寵物'},
  {japanese:'鳥',reading:'とり',chinese:'鳥'},
  {japanese:'声',reading:'こえ',chinese:'聲音'},
  {japanese:'波',reading:'なみ',chinese:'波浪'},
  {japanese:'花火',reading:'はなび',chinese:'煙火'},
  {japanese:'道具',reading:'どうぐ',chinese:'工具'},
  {japanese:'クリーニング',reading:'クリーニング',chinese:'（乾）洗、洗衣'},
  {japanese:'家',reading:'いえ',chinese:'家、住宅'},
  {japanese:'マンション',reading:'マンション',chinese:'公寓'},
  {japanese:'キッチン',reading:'キッチン',chinese:'廚房'},
  {japanese:'～教室',reading:'～きょうしつ',chinese:'～教室'},
  {japanese:'パーティールーム',reading:'パーティールーム',chinese:'宴會廳'},
  {japanese:'方',reading:'かた',chinese:'人（「ひと」的尊敬語）'},
  {japanese:'～後',reading:'～ご',chinese:'～後（時間上）'},
  {japanese:'～しか',reading:'～しか',chinese:'只～（後接否定）'},
  {japanese:'ほかの',reading:'ほかの',chinese:'其他的'},
  {japanese:'はっきり',reading:'はっきり',chinese:'清楚地'},
  {japanese:'家具',reading:'かぐ',chinese:'家具'},
  {japanese:'本棚',reading:'ほんだな',chinese:'書架'},
  {japanese:'いつか',reading:'いつか',chinese:'什麼時候'},
  {japanese:'建てます',reading:'たてます',chinese:'建、蓋（動詞 II）'},
  {japanese:'すばらしい',reading:'すばらしい',chinese:'很棒、了不起'},
  {japanese:'子どもたち',reading:'こどもたち',chinese:'孩子們'},
  {japanese:'大好き［な］',reading:'だいすき［な］',chinese:'非常喜歡'},
  {japanese:'主人公',reading:'しゅじんこう',chinese:'主人翁'},
  {japanese:'形',reading:'かたち',chinese:'形狀、樣子'},
  {japanese:'不思議［な］',reading:'ふしぎ［な］',chinese:'不可思議'},
  {japanese:'ポケット',reading:'ポケット',chinese:'口袋'},
  {japanese:'例えば',reading:'たとえば',chinese:'例如'},
  {japanese:'付けます',reading:'つけます',chinese:'戴上（動詞 II）'},
  {japanese:'自由に',reading:'じゆうに',chinese:'自由地、隨意地'},
  {japanese:'空',reading:'そら',chinese:'天空'},
  {japanese:'飛びます',reading:'とびます',chinese:'飛、飛翔（動詞 I）'},
  {japanese:'昔',reading:'むかし',chinese:'過去、以前'},
  {japanese:'自分',reading:'じぶん',chinese:'自己'},
  {japanese:'将来',reading:'しょうらい',chinese:'將來'},
  {japanese:'ドラえもん',reading:'ドラえもん',chinese:'哆啦 A 夢（動漫登場人物的名字）'}
]};
const textbookLessons = [...imageLessons, {...lesson27, number:27, source:'第27課 何でも 作れるんですね.jpg'}].sort((a,b) => a.number - b.number);
let sets = [...textbookLessons,...examples], selected = new Set(['lesson-27']), deck = [], position = 0, revealed = false;
let history = [], session = null, reviewed = new Set();
// Content-based identity survives shuffling and vocabulary insertions.
const cardKey = (setId, card) => JSON.stringify([setId,card.japanese,card.reading,card.chinese]);
const allCards = sets.flatMap(set => set.cards.map(card => ({...card,lesson:set.name,key:cardKey(set.id,card),setId:set.id})));
let starred = new Set(), practiceMode = 'lessons';
function renderStar() {
  const card = deck[position], on = !!card && starred.has(card.key);
  $('star').disabled = !card;
  $('star').setAttribute('aria-pressed',String(on));
  $('star').setAttribute('aria-label',on ? '取消星标' : '添加星标');
  $('star').title = on ? '取消星标' : '添加星标';
  $('star').textContent = on ? '★' : '☆';
}
$('star').addEventListener('click',() => {
  const card = deck[position];
  if (!card) return;
  starred.has(card.key) ? starred.delete(card.key) : starred.add(card.key);
  savePreferences(); renderStar();
});
document.querySelectorAll('[data-practice]').forEach(button => button.addEventListener('click',() => {
  closeMenu(); practiceMode = button.dataset.practice; rebuild(); $('card').focus();
}));
const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let activeSpeech = null;
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let voiceEnabled = false, recognition = null, voiceTimer = null, voiceStartTimer = null;
function voiceButtonState(state) {
  $('microphone-label').textContent = state;
  $('microphone').setAttribute('aria-label',`语音输入：${state}`);
}
function stopVoice() {
  clearTimeout(voiceTimer); voiceTimer = null;
  clearTimeout(voiceStartTimer); voiceStartTimer = null;
  const previous = recognition; recognition = null;
  if (previous) previous.abort();
  voiceButtonState(voiceEnabled ? '等待回答' : '语音关闭');
}
function normalizeAnswer(text) {
  return text.normalize('NFKC').replace(/［[^］]*］|\[[^\]]*\]/g,'')
    .replace(/[\s\p{P}\p{S}]/gu,'').replace(/[ァ-ヶ]/g,char => String.fromCharCode(char.charCodeAt(0)-0x60));
}
function canListen() {
  return voiceEnabled && deck.length && !revealed
    && !document.querySelector('dialog[open]') && $('app-menu').hidden;
}
function voiceWaitingMessage() {
  if (!voiceEnabled) return '';
  if (!deck.length) return '请先选择词卡集。';
  if (revealed) return '语音输入已开启。返回中文正面或切换下一张后开始监听。';
  return '语音输入已开启，等待开始监听。';
}
function startVoice() {
  if (!canListen() || recognition || voiceTimer) return;
  stopPronunciation();
  const listener = new Recognition(); recognition = listener;
  listener.lang = 'ja-JP'; listener.interimResults = false; listener.maxAlternatives = 5;
  let feedback = '没听清，请再试一次。';
  let retry = true;
  listener.onstart = () => {
    if (recognition !== listener) return;
    clearTimeout(voiceStartTimer); voiceStartTimer = null;
    $('voice-status').textContent = '正在监听，请说出日语答案…';
    voiceButtonState('正在监听');
  };
  listener.onresult = event => {
    if (recognition !== listener || !canListen()) return;
    const entry = deck[position];
    const answers = [entry.japanese,entry.reading].filter(Boolean).map(normalizeAnswer).filter(Boolean);
    const transcripts = Array.from(event.results[event.resultIndex]).map(result => normalizeAnswer(result.transcript));
    if (transcripts.some(text => answers.includes(text))) {
      retry = false;
      $('face-label').textContent = '✅'; $('face-label').title = '回答正确';
      $('voice-status').textContent = '回答正确！';
      voiceButtonState('回答正确');
      voiceTimer = setTimeout(() => { voiceTimer = null; if (canListen()) flip(); },1000);
      listener.stop();
    } else {
      // A shared prefix or substantial contained phrase is useful retry feedback,
      // but only a complete normalized answer advances the card.
      const close = transcripts.some(text => text.length >= 2 && answers.some(answer =>
        (answer.includes(text) || text.includes(answer)) && Math.min(text.length,answer.length) / Math.max(text.length,answer.length) >= 0.5));
      feedback = close ? '很接近了，请再试一次。' : '还不正确，请再试一次。';
      $('voice-status').textContent = feedback;
    }
  };
  listener.onerror = event => {
    if (recognition !== listener) return;
    clearTimeout(voiceStartTimer); voiceStartTimer = null;
    if (['not-allowed','service-not-allowed','audio-capture','network','language-not-supported'].includes(event.error)) {
      retry = false; voiceEnabled = false;
      $('microphone').setAttribute('aria-pressed','false');
      const errors = {
        'not-allowed':'麦克风权限被拒绝。请在浏览器地址栏的网站设置中允许麦克风，然后重新开启语音输入。',
        'service-not-allowed':'浏览器不允许使用语音识别服务，请检查浏览器设置或更换浏览器。',
        'audio-capture':'无法访问麦克风，请检查设备连接和系统麦克风权限。',
        'network':'无法连接语音识别服务，请检查网络后重新开启语音输入。',
        'language-not-supported':'此浏览器的语音识别服务不支持日语。'
      };
      feedback = errors[event.error];
    }
    $('voice-status').textContent = feedback;
    voiceButtonState(voiceEnabled ? '请再试试' : '语音不可用');
  };
  listener.onend = () => {
    if (recognition !== listener) return;
    clearTimeout(voiceStartTimer); voiceStartTimer = null;
    recognition = null;
    if (retry && canListen()) {
      $('voice-status').textContent = feedback;
      voiceButtonState('请再试试');
      voiceTimer = setTimeout(() => { voiceTimer = null; startVoice(); },500);
    }
  };
  $('voice-status').textContent = '正在启动麦克风，请允许浏览器使用麦克风…';
  voiceButtonState('正在启动');
  voiceStartTimer = setTimeout(() => {
    if (recognition !== listener) return;
    voiceEnabled = false; stopVoice();
    $('microphone').setAttribute('aria-pressed','false');
    $('voice-status').textContent = '麦克风未能启动。请检查浏览器的麦克风权限提示和系统权限，然后重新开启语音输入。';
    voiceButtonState('启动失败');
  },15000);
  try { listener.start(); }
  catch { voiceEnabled = false; stopVoice(); $('microphone').setAttribute('aria-pressed','false'); $('voice-status').textContent = '无法启动语音输入，请重试。'; voiceButtonState('启动失败'); }
}
$('microphone').addEventListener('click',() => {
  stopVoice();
  if (!Recognition) { $('voice-status').textContent = '此浏览器不支持语音输入。'; voiceButtonState('语音不支持'); return; }
  voiceEnabled = !voiceEnabled;
  $('microphone').setAttribute('aria-pressed',String(voiceEnabled));
  $('voice-status').textContent = voiceWaitingMessage();
  voiceButtonState(voiceEnabled ? '等待回答' : '语音关闭');
  startVoice();
});
window.addEventListener('pagehide',stopVoice);
function stopPronunciation() {
  if (activeSpeech) {
    activeSpeech = null;
    window.speechSynthesis.cancel();
  }
  $('speech-status').textContent = '';
}
function pronounce() {
  const card = deck[position];
  if (!card || !revealed || !$('auto-pronounce').checked) return;
  if (!speechSupported) {
    $('speech-status').textContent = '此浏览器不支持日语发音。';
    return;
  }
  stopPronunciation();
  // Speak the printed reading, excluding usage notes and placeholder marks.
  const text = (card.reading || card.japanese).replace(/［[^］]*］|\[[^\]]*\]/g, '').replace(/[～〜]/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  const voice = window.speechSynthesis.getVoices().find(voice => /^ja(?:[-_]|$)/i.test(voice.lang));
  if (voice) utterance.voice = voice;
  activeSpeech = utterance;
  utterance.onend = () => { if (activeSpeech === utterance) activeSpeech = null; };
  utterance.onerror = () => {
    if (activeSpeech !== utterance) return;
    activeSpeech = null;
    $('speech-status').textContent = '无法播放日语发音，请检查设备的日语语音设置后重试。';
  };
  try { window.speechSynthesis.speak(utterance); }
  catch { utterance.onerror(); }
}
window.addEventListener('pagehide', stopPronunciation);
function saveLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { $('storage-status').textContent = '浏览器无法保存更改；本次仍可练习，但刷新后可能丢失设置和记录。'; }
}
function savePreferences() {
  saveLocal('kotoba-preferences', {selected:[...selected],starred:[...starred],order:$('order').value,navigationSide:$('navigation-side').value,autoPronounce:$('auto-pronounce').checked});
}
try {
  const prefs = JSON.parse(localStorage.getItem('kotoba-preferences') || 'null');
  if (prefs) {
    if (Array.isArray(prefs.starred)) starred = new Set(prefs.starred.filter(key => typeof key === 'string' && allCards.some(card => card.key === key)));
    // The former Lesson 2 sample is now the complete textbook lesson.
    if (Array.isArray(prefs.selected)) selected = new Set(prefs.selected.map(id => id === 'sample-2' ? 'lesson-2' : id).filter(id => sets.some(set => set.id === id)));
    if (['ordered','random'].includes(prefs.order)) $('order').value = prefs.order;
    if (typeof prefs.autoPronounce === 'boolean') $('auto-pronounce').checked = prefs.autoPronounce;
    if (['left','right'].includes(prefs.navigationSide)) $('navigation-side').value = prefs.navigationSide;
  }
  const savedHistory = JSON.parse(localStorage.getItem('kotoba-history') || '[]');
  if (Array.isArray(savedHistory)) history = savedHistory.filter(item => item && typeof item.id === 'string' && Number.isFinite(Date.parse(item.startedAt)) && Array.isArray(item.lessons) && item.lessons.every(name => typeof name === 'string') && Number.isInteger(item.reviewed) && item.reviewed > 0 && Number.isInteger(item.total) && item.total >= item.reviewed).slice(0,100);
} catch { $('storage-status').textContent = '部分本机设置或历史无法读取，已使用默认值。'; }
function recordReview() {
  if (reviewed.has(position)) return;
  reviewed.add(position);
  if (!session) {
    session = {id:crypto.randomUUID(),startedAt:new Date().toISOString(),lessons:[...(practiceMode === 'starred' ? ['星标词练习'] : []),...new Set(deck.map(card => card.lesson))],total:deck.length,reviewed:0,order:$('order').value,direction:'zh'};
    history.unshift(session); history = history.slice(0,100);
  }
  session.reviewed = reviewed.size;
  saveLocal('kotoba-history',history);
}
function renderHistory() {
  $('history-empty').hidden = history.length > 0;
  $('history-list').replaceChildren();
  history.forEach(item => {
    const row = document.createElement('li'), title = document.createElement('strong'), details = document.createElement('p'), lessons = document.createElement('p');
    title.textContent = new Date(item.startedAt).toLocaleString('zh-CN',{month:'long',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
    details.textContent = `已复习 ${item.reviewed} / ${item.total} 张 · ${item.reviewed === item.total ? '已完成' : '未完成'} · ${item.order === 'random' ? '随机' : '顺序'} · ${item.direction === 'zh' ? '中文正面' : '日语正面'}`;
    lessons.textContent = item.lessons.join('、'); row.append(title,details,lessons); $('history-list').append(row);
  });
}
function closeMenu() { $('app-menu').hidden = true; $('menu-button').setAttribute('aria-expanded','false'); }
$('menu-button').addEventListener('click', () => {
  const opening = $('app-menu').hidden;
  stopVoice();
  $('app-menu').hidden = !opening; $('menu-button').setAttribute('aria-expanded',String(opening));
  if (opening) $('app-menu').querySelector('button').focus();
  else startVoice();
});
document.addEventListener('click',event => { if (!event.target.closest('.menu-wrap')) { closeMenu(); startVoice(); } });
document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click',() => {
  stopVoice();
  closeMenu();
  if (button.dataset.panel === 'history-panel') renderHistory();
  $(button.dataset.panel).showModal();
}));
document.querySelectorAll('dialog').forEach(panel => {
  panel.querySelector('.close-panel').addEventListener('click',() => panel.close());
  panel.addEventListener('close',() => { $('menu-button').focus(); startVoice(); });
});
function renderSets() {
  $('sets').replaceChildren();
  sets.forEach(set => {
    const label = document.createElement('label'); label.className = 'set';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = selected.has(set.id);
    input.addEventListener('change', () => { input.checked ? selected.add(set.id) : selected.delete(set.id); practiceMode = 'lessons'; savePreferences(); rebuild(); });
    const copy = document.createElement('span'), title = document.createElement('strong'), count = document.createElement('small');
    title.textContent = set.name; count.textContent = `${set.cards.length} 个单词`;
    copy.append(title,count); label.append(input,copy); $('sets').append(label);
  });
  $('set-count').textContent = `${sets.length} 课`;
}
function rebuild() {
  session = null; reviewed = new Set();
  deck = allCards.filter(card => practiceMode === 'starred' ? starred.has(card.key) : selected.has(card.setId));
  if ($('order').value === 'random') {
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i],deck[j]] = [deck[j],deck[i]]; }
  }
  position = 0; revealed = false; render();
}
function render() {
  stopVoice();
  $('voice-status').textContent = voiceWaitingMessage();
  stopPronunciation();
  const card = deck[position];
  $('loaded').textContent = practiceMode === 'starred' ? `星标练习 · ${deck.length} 词` : `已选 ${selected.size} 课 · ${deck.length} 词`;
  document.querySelectorAll('[data-practice]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.practice === practiceMode)));
  renderStar();
  $('choose-sets').hidden = !!card;
  $('lesson').textContent = card ? card.lesson : '准备开始';
  $('counter').textContent = card ? `${position + 1} / ${deck.length}` : '0 / 0';
  $('face-label').textContent = card ? (revealed ? '💡' : '❓') : '📚';
  $('face-label').title = card ? (revealed ? '答案' : '问题') : '选择词卡集';
  $('face-label').setAttribute('aria-hidden','true');
  $('word').textContent = card ? (!revealed ? card.chinese : card.japanese) : (practiceMode === 'starred' ? '还没有星标词' : '先选一课吧');
  $('word').lang = !revealed ? 'zh-CN' : 'ja';
  $('reading').textContent = card && revealed ? card.reading : '';
  $('meaning').textContent = card && revealed ? card.chinese : '';
  $('flip-hint').textContent = card ? (revealed ? '点击卡片，返回正面 ↻' : '点击卡片，查看答案 ↻') : (practiceMode === 'starred' ? '在课程练习中点击 ☆ 添加星标' : '在词卡集中勾选想练习的课程');
  $('card').disabled = !card; $('restart').disabled = !card;
  $('previous').disabled = !card || position === 0; $('next').disabled = !card || position === deck.length - 1;
  $('card').setAttribute('aria-label', card ? `${revealed ? '答案' : '词卡'}：${$('word').textContent}${revealed ? `，${card.reading}，${card.chinese}` : ''}。点击翻面` : '请先选择词卡集');
  $('progress').max = deck.length || 1; $('progress').value = card ? position + 1 : 0;
  sizePortraitCard();
  startVoice();
}
// Size for the larger face so flipping never changes the card's dimensions.
function sizePortraitCard() {
  const card = $('card');
  if (!window.matchMedia('(orientation: portrait)').matches) {
    $('card-shell').style.removeProperty('max-height');
    return;
  }
  const parts = ['word','reading','meaning'].map($);
  const original = parts.map(el => el.textContent);
  const measure = values => {
    parts.forEach((el,i) => { el.textContent = values[i]; });
    return parts.filter(el => el.textContent).reduce((sum, el) => {
      const style = getComputedStyle(el);
      return sum + el.getBoundingClientRect().height + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    }, 0);
  };
  const entry = deck[position];
  let contentHeight;
  try {
    contentHeight = entry ? Math.max(
      measure([entry.chinese,'','']),
      measure([entry.japanese,entry.reading,entry.chinese])
    ) : measure(original);
  } finally {
    parts.forEach((el,i) => { el.textContent = original[i]; });
  }
  const style = getComputedStyle(card);
  const chromeHeight = $('face-label').getBoundingClientRect().height + $('flip-hint').getBoundingClientRect().height
    + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  $('card-shell').style.maxHeight = `${Math.ceil(Math.max(contentHeight / 0.4, contentHeight + chromeHeight + 16))}px`;
}
new ResizeObserver(sizePortraitCard).observe(document.querySelector('.practice'));
document.fonts.ready.then(sizePortraitCard);
function flip() { if (deck.length) { revealed = !revealed; if (revealed) recordReview(); render(); if (revealed) pronounce(); } }
function move(delta) { if (position + delta >= 0 && position + delta < deck.length) { position += delta; revealed = false; render(); } }
let touchStartX = 0, touchStartY = 0, touchStartTime = 0, swiped = false, lastSwipeTime = 0;
function onSwipeStart(x, y) {
  touchStartX = x;
  touchStartY = y;
  touchStartTime = Date.now();
  swiped = false;
}
function onSwipeEnd(x, y) {
  if (!deck.length || Date.now() - lastSwipeTime < 300) return;
  if (document.querySelector('dialog[open]') || !$('app-menu').hidden) return;
  const diffX = x - touchStartX, diffY = y - touchStartY, elapsed = Date.now() - touchStartTime;
  if (Math.abs(diffX) >= 40 && Math.abs(diffX) > Math.abs(diffY) * 1.25 && elapsed < 1000) {
    swiped = true;
    lastSwipeTime = Date.now();
    move(diffX < 0 ? 1 : -1);
    setTimeout(() => { swiped = false; }, 400);
  }
}
const card = $('card');
card.addEventListener('touchstart', e => {
  if (e.touches.length === 1) onSwipeStart(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });
card.addEventListener('touchend', e => {
  if (e.changedTouches.length === 1) onSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}, { passive: true });
card.addEventListener('touchcancel', () => { swiped = false; });
if (window.PointerEvent) {
  card.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') onSwipeStart(e.clientX, e.clientY); });
  card.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') onSwipeEnd(e.clientX, e.clientY); });
  card.addEventListener('pointercancel', () => { swiped = false; });
}
card.addEventListener('click', () => {
  if (swiped) { swiped = false; return; }
  flip();
});
$('previous').addEventListener('click',() => move(-1)); $('next').addEventListener('click',() => move(1));
$('restart').addEventListener('click',rebuild);
$('order').addEventListener('change',() => { savePreferences(); rebuild(); });
$('auto-pronounce').addEventListener('change',() => { savePreferences(); stopPronunciation(); });
function applyNavigationSide() { document.body.dataset.navigationSide = $('navigation-side').value; }
$('navigation-side').addEventListener('change',() => { applyNavigationSide(); savePreferences(); });
applyNavigationSide();
document.addEventListener('keydown',event => {
  if (event.key === 'Escape' && !$('app-menu').hidden) { closeMenu(); $('menu-button').focus(); startVoice(); return; }
  if (document.querySelector('dialog[open]') || !$('app-menu').hidden) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.isContentEditable) return;
  // The card is a button: keep its native Space/Enter activation, but allow
  // navigation shortcuts while it (or its contents) has focus.
  if (event.target.closest('#card')) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
    }
    return;
  }
  if (/INPUT|SELECT|TEXTAREA|BUTTON|A/.test(event.target.tagName)) return;
  if (['ArrowLeft','ArrowRight',' '].includes(event.key)) { event.preventDefault(); event.key === ' ' ? flip() : move(event.key === 'ArrowLeft' ? -1 : 1); }
});
renderSets(); rebuild();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
