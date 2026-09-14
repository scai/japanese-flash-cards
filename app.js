'use strict';
const examples = [
  {id:'sample-1',name:'示例教材 · 第 1 课',cards:[{japanese:'私',reading:'わたし',chinese:'我'},{japanese:'学生',reading:'がくせい',chinese:'学生'},{japanese:'先生',reading:'せんせい',chinese:'老师'},{japanese:'日本',reading:'にほん',chinese:'日本'},{japanese:'中国',reading:'ちゅうごく',chinese:'中国'},{japanese:'友達',reading:'ともだち',chinese:'朋友'}]},
  {id:'sample-2',name:'示例教材 · 第 2 课',cards:[{japanese:'本',reading:'ほん',chinese:'书'},{japanese:'辞書',reading:'じしょ',chinese:'词典'},{japanese:'時計',reading:'とけい',chinese:'钟表；手表'},{japanese:'傘',reading:'かさ',chinese:'伞'},{japanese:'鞄',reading:'かばん',chinese:'包'},{japanese:'鉛筆',reading:'えんぴつ',chinese:'铅笔'}]}
];
const $ = id => document.getElementById(id);
let sets = [...examples], selected = new Set(['sample-1']), deck = [], position = 0, revealed = false;
function validateSets(value) {
  const batch = Array.isArray(value) ? value : [value];
  if (!batch.length || batch.length > 100) throw new Error('文件需包含 1–100 个词卡集。');
  return batch.map(set => {
    if (!set || typeof set.name !== 'string' || !set.name.trim() || set.name.length > 120 || !Array.isArray(set.cards) || !set.cards.length || set.cards.length > 5000) throw new Error('每个词卡集需有 name 和 1–5000 张 cards。');
    const cards = set.cards.map(card => {
      if (!card || ['japanese','chinese'].some(key => typeof card[key] !== 'string' || !card[key].trim() || card[key].length > 500) || (card.reading !== undefined && (typeof card.reading !== 'string' || card.reading.length > 500))) throw new Error('每张卡需有 japanese、chinese，reading 为可选的读音。');
      return {japanese:card.japanese.trim(),chinese:card.chinese.trim(),reading:(card.reading || '').trim()};
    });
    return {id:'import-'+crypto.randomUUID(),name:set.name.trim(),cards};
  });
}
try {
  const saved = localStorage.getItem('kotoba-imports');
  if (saved) sets.push(...validateSets(JSON.parse(saved)));
} catch { $('import-status').textContent = '未能读取本机保存的词表，请重新导入。'; }
function renderSets() {
  $('sets').replaceChildren();
  sets.forEach(set => {
    const label = document.createElement('label'); label.className = 'set';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = selected.has(set.id);
    input.addEventListener('change', () => { input.checked ? selected.add(set.id) : selected.delete(set.id); rebuild(); });
    const copy = document.createElement('span'), title = document.createElement('strong'), count = document.createElement('small');
    title.textContent = set.name; count.textContent = `${set.cards.length} 个单词`;
    copy.append(title,count); label.append(input,copy); $('sets').append(label);
  });
  $('set-count').textContent = `${sets.length} 课`;
}
function rebuild() {
  deck = sets.filter(set => selected.has(set.id)).flatMap(set => set.cards.map(card => ({...card,lesson:set.name})));
  if (document.querySelector('input[name="order"]:checked').value === 'random') {
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i],deck[j]] = [deck[j],deck[i]]; }
  }
  position = 0; revealed = false; render();
}
function render() {
  const card = deck[position], zh = $('direction').value === 'zh';
  $('loaded').textContent = `已选 ${selected.size} 课 · ${deck.length} 词`;
  $('lesson').textContent = card ? card.lesson : '准备开始';
  $('counter').textContent = card ? `${position + 1} / ${deck.length}` : '0 / 0';
  $('face-label').textContent = card ? (revealed ? '答案 / ANSWER' : zh ? '中文 / CHINESE' : '日语 / JAPANESE') : '选择词卡集';
  $('word').textContent = card ? (zh && !revealed ? card.chinese : card.japanese) : '先选一课吧';
  $('word').lang = zh && !revealed ? 'zh-CN' : 'ja';
  $('reading').textContent = card && revealed ? card.reading : '';
  $('meaning').textContent = card && revealed ? card.chinese : '';
  $('flip-hint').textContent = card ? (revealed ? '点击卡片，返回正面 ↻' : '点击卡片，查看答案 ↻') : '在词卡集中勾选想练习的课程';
  $('card').disabled = !card; $('flip').disabled = !card; $('restart').disabled = !card;
  $('previous').disabled = !card || position === 0; $('next').disabled = !card || position === deck.length - 1;
  $('flip').textContent = revealed ? '返回正面' : '查看答案';
  $('card').setAttribute('aria-label', card ? `${revealed ? '答案' : '词卡'}：${$('word').textContent}${revealed ? `，${card.reading}，${card.chinese}` : ''}。点击翻面` : '请先选择词卡集');
  $('progress').max = deck.length || 1; $('progress').value = card ? position + 1 : 0;
}
function flip() { if (deck.length) { revealed = !revealed; render(); } }
function move(delta) { if (position + delta >= 0 && position + delta < deck.length) { position += delta; revealed = false; render(); } }
$('card').addEventListener('click',flip); $('flip').addEventListener('click',flip);
$('previous').addEventListener('click',() => move(-1)); $('next').addEventListener('click',() => move(1));
$('restart').addEventListener('click',rebuild);
document.querySelectorAll('input[name="order"]').forEach(input => input.addEventListener('change',rebuild));
$('direction').addEventListener('change',() => { revealed = false; render(); });
document.addEventListener('keydown',event => {
  if (/INPUT|SELECT|TEXTAREA|BUTTON|A/.test(event.target.tagName) || event.altKey || event.ctrlKey || event.metaKey) return;
  if (['ArrowLeft','ArrowRight',' '].includes(event.key)) { event.preventDefault(); event.key === ' ' ? flip() : move(event.key === 'ArrowLeft' ? -1 : 1); }
});
$('import-button').addEventListener('click',() => $('import-file').click());
$('import-file').addEventListener('change',async event => {
  const files = [...event.target.files]; if (!files.length) return;
  try {
    const imported = [];
    for (const file of files) { if (file.size > 2 * 1024 * 1024) throw new Error('每个文件不能超过 2 MB。'); imported.push(...validateSets(JSON.parse(await file.text()))); }
    sets.push(...imported); imported.forEach(set => selected.add(set.id));
    let message = `已导入 ${imported.length} 个词卡集。`;
    try { localStorage.setItem('kotoba-imports',JSON.stringify(sets.filter(set => !set.id.startsWith('sample-')))); message += '已保存在此浏览器。'; }
    catch { message += '浏览器无法保存，刷新后需重新导入。'; }
    $('import-status').textContent = message; renderSets(); rebuild();
  } catch (error) { $('import-status').textContent = `导入失败：${error instanceof SyntaxError ? 'JSON 格式不正确，请参考模板。' : error.message}`; }
  event.target.value = '';
});
renderSets(); rebuild();
