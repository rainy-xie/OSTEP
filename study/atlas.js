'use strict';

const byId = id => document.getElementById(id);
const index = new Map();
for (const [track, topics] of tracks) {
  topics.forEach((topic, position) => index.set(topic.id, { track, topic, position }));
}

const storageKey = 'ostep-atlas-progress-v1';
let state = { reviewed: [], last: null };
let temporary = false;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
  if (Array.isArray(saved.reviewed)) state.reviewed = [...new Set(saved.reviewed.filter(id => index.has(id)))];
  if (index.has(saved.last)) state.last = saved.last;
} catch { temporary = true; }

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    temporary = false;
  } catch { temporary = true; }
}

let selectedTrack = index.get(state.last)?.track || 'virtualization';
let selectedFilter = 'all';
let openedTopic = null;
let lessonOrigin = null;
let focusAfterLesson = null;
let scrollToTrack = false;
let overview = false;
const dialog = byId('lesson-dialog');
const search = byId('search');
const pad = n => String(n).padStart(2, '0');

function renderProgress() {
  const count = state.reviewed.length;
  const total = index.size;
  const percent = Math.round(100 * count / total);
  byId('progress').innerHTML = '<div class="ring" aria-hidden="true" style="--amount:' + percent + '%"><b>' + percent + '%</b></div>' +
    '<div class="progress-copy"><strong>复习进度</strong><small>已复习 ' + count + ' / ' + total + ' 个知识点' + (temporary ? '（本次浏览）' : '') + '</small></div>';
}

function renderMap() {
  const info = trackInfo[selectedTrack];
  const items = tracks.get(selectedTrack);
  byId('map-view').classList.toggle('overview', overview);
  const toggle = byId('overview-toggle');
  toggle.setAttribute('aria-expanded', String(overview));
  toggle.lastElementChild.textContent = overview ? '收起全图' : '展开全图';
  byId('branches').innerHTML = Object.entries(trackInfo).map(([key, item]) =>
    '<div class="branch-wrap" data-track="' + key + '"><button type="button" class="branch" data-branch="' + key + '" aria-pressed="' + (!overview && key === selectedTrack) + '" aria-controls="topics">' +
    icon(item.icon) + '<span class="branch-text"><b>' + item.title + '</b><small lang="en">' + item.english + '</small></span></button>' +
    '<span class="branch-concept">' + item.concept + '</span>' + (overview ? overviewTopics(key) : '') + '</div>'
  ).join('');

  const topics = byId('topics');
  topics.dataset.track = selectedTrack;
  topics.innerHTML = '<div class="track-head"><span class="track-art">' + icon(info.icon) + '</span><div class="track-eyebrow" lang="en">' + info.english +
    '</div><h2>' + info.title + '</h2><p>' + info.question + '</p></div><div class="topic-count"><b>知识点</b><small>' + pad(items.length) +
    ' 节</small></div><div class="topic-list">' + items.map((topic, i) => {
      const done = state.reviewed.includes(topic.id);
      return '<button class="topic-row" data-topic="' + topic.id + '"' + (done ? ' aria-label="' + topic.title + '，已复习"' : '') +
        '><span class="topic-num">' + (done ? icon('check') : pad(i + 1)) + '</span><span class="topic-name">' + topic.title + '</span>' + icon('chevron') + '</button>';
    }).join('') + '</div>';

  let resumeId = items[0].id;
  let hint = '建议起点';
  let action = '开始学习';
  if (state.last) {
    resumeId = state.last;
    hint = '上次读到';
    action = '继续学习';
    if (state.reviewed.includes(state.last)) {
      const order = [...index.keys()];
      const offset = order.indexOf(state.last) + 1;
      const next = [...order.slice(offset), ...order.slice(0, offset)].find(id => !state.reviewed.includes(id));
      if (next) { resumeId = next; hint = '下一节'; }
      else { hint = '已完成一轮复习'; action = '再看一遍'; }
    }
  }
  const resume = index.get(resumeId);
  byId('resume').innerHTML = '<span class="resume-symbol">' + icon(state.last ? 'bookmark' : 'play') +
    '</span><span class="resume-copy"><small>' + hint + '</small><b>' + trackInfo[resume.track].title + ' · ' + resume.topic.title +
    '</b></span><button data-topic="' + resumeId + '">' + action + '</button>';
}

function overviewTopics(key) {
  return '<ul class="overview-topics">' + tracks.get(key).map(topic => '<li><button data-topic="' + topic.id + '">' +
    '<span>' + escapeText(topic.title) + '</span>' + (state.reviewed.includes(topic.id) ? icon('check') : '') +
    '</button></li>').join('') + '</ul>';
}

function newTab(path) {
  return 'href="' + escapeText(encodeURI(path)) + '" target="_blank" rel="noopener"';
}

function renderEntries() {
  byId('entries').innerHTML = ['code','homework','projects'].map((id, i) => {
    const type = categories[id];
    return '<a class="entry-card" data-track="' + Object.keys(trackInfo)[i] + '" href="#library/' + id + '"><span class="entry-icon">' + icon(type.icon) +
      '</span><div><div class="label"><b>' + type.title + '</b><code>' + type.path + '</code></div><p>' + type.description + '</p></div>' + icon('chevron') + '</a>';
  }).join('');
}

function chapterSource(topic) {
  const ref = chapters[topic.id];
  return { label:'第 ' + ref.chapter + ' 章 · ' + ref.title, path: pdfFile + '#page=' + ref.page, display: '教材 PDF · 文件第 ' + ref.page + ' 页' };
}

const library = new Map();
function addSource(source, topic, track) {
  if (!library.has(source.path)) library.set(source.path, { ...source, kind: resourceKind(source.path), terms: new Set() });
  const entry = library.get(source.path);
  if (topic) { entry.terms.add(topic.title); entry.terms.add(trackInfo[track].title); }
}
addSource({path: pdfFile, label: '《操作系统导论》中文教材'});
addSource({path: 'handout.md', label: '我的章节笔记'});
for (const key of ['code', 'homework', 'projects']) addSource({path: key + '/README.md', label: categories[key].title + '总目录'});
for (const { track, topic } of index.values()) {
  addSource(chapterSource(topic), topic, track);
  for (const resource of topic.resources) addSource(resource, topic, track);
}

function renderFilters() {
  const types = [['all', '全部资料'], ...Object.entries(categories).map(([key, value]) => [key, value.title])];
  byId('filters').innerHTML = types.map(([key, label]) => '<button type="button" class="filter" data-filter="' + key +
    '" aria-pressed="' + (key === selectedFilter) + '">' + label + '</button>').join('');
}

function renderResults() {
  const needle = search.value.trim().toLowerCase();
  const found = [...library.values()].filter(item => (selectedFilter === 'all' || item.kind === selectedFilter) &&
    [item.label, item.path, item.display || '', ...item.terms].join(' ').toLowerCase().includes(needle));
  byId('match-count').textContent = found.length + ' 份资料';
  byId('results').innerHTML = found.length ? found.map(item => '<a class="result-link" ' + newTab(item.path) +
    '><span class="file-icon">' + icon(categories[item.kind].icon) + '</span><span class="source-text"><b>' + escapeText(item.label) +
    '</b><code>' + escapeText(item.display || item.path) + '</code></span><span class="meta">' + escapeText([...item.terms][0] || categories[item.kind].title) +
    '</span>' + icon('chevron') + '</a>').join('') : '<p class="empty">没有找到匹配的资料。可以换一个关键词，或切换到「全部资料」。</p>';
}

function renderLesson(record) {
  const { track, topic, position } = record;
  const info = trackInfo[track];
  const items = tracks.get(track);
  const done = state.reviewed.includes(topic.id);
  const sources = [chapterSource(topic), ...topic.resources];
  const content = byId('lesson');
  content.dataset.track = track;
  content.innerHTML = '<div class="lesson-head"><div class="lesson-kicker">' + icon(info.icon) + info.title + '<span>' + pad(position + 1) + ' / ' + pad(items.length) +
    '</span></div><h2 id="lesson-title" tabindex="-1">' + escapeText(topic.title) + '</h2><p>' + escapeText(topic.summary) +
    '</p><button type="button" class="close-btn" data-action="close" aria-label="关闭知识点">' + icon('close') + '</button></div>' +
    '<div class="lesson-main"><h3>理解机制</h3><p>' + escapeText(topic.insight) + '</p><div class="quiz"><h3>' + icon('bulb') + '先猜一猜</h3><p>' +
    escapeText(topic.question) + '</p><details><summary>查看参考答案</summary><p>' + escapeText(topic.answer) + '</p></details></div>' +
    (topic.command ? '<div class="command"><div class="command-head"><span>在仓库根目录运行</span><button type="button" data-action="copy">' +
      icon('copy') + '<span aria-live="polite">复制命令</span></button></div><code>' + escapeText(topic.command) + '</code></div>' : '') +
    '<h3>教材与仓库材料</h3>' + sources.map(item => '<a class="resource-link" ' + newTab(item.path) + '><span class="file-icon">' +
      icon(categories[resourceKind(item.path)].icon) + '</span><span><strong>' + escapeText(item.label) + '</strong><code>' + escapeText(item.display || item.path) + '</code></span></a>'
    ).join('') + '</div><div class="lesson-foot"><button class="primary-btn" type="button" data-action="review" aria-pressed="' + done + '">' +
    icon('check') + '<span>' + (done ? '已复习' : '标为已复习') + '</span></button><div class="foot-navigation"><button type="button" class="subtle-btn" data-action="prev"' +
    (position === 0 ? ' disabled' : '') + '>上一节</button><button type="button" class="subtle-btn" data-action="next"' + (position + 1 === items.length ? ' disabled' : '') + '>下一节</button></div></div>';
}

function showLesson(record) {
  openedTopic = record.topic.id;
  state.last = openedTopic;
  saveState();
  renderMap();
  renderProgress();
  renderLesson(record);
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  byId('lesson-title').focus({preventScroll:true});
}

function leaveLesson() {
  if (lessonOrigin) {
    history.back();
  } else {
    history.replaceState(null, '', '#track/' + selectedTrack);
    route();
  }
}

function route() {
  const [view, id] = location.hash.slice(1).split('/');
  const isLibrary = view === 'library';
  const wasLibrary = !byId('library-view').hidden;
  const record = view === 'lesson' ? index.get(id) : null;
  if (!record) overview = view === 'map' && id === 'all';
  if (view === 'track' && tracks.has(id)) selectedTrack = id;
  if (record) selectedTrack = record.track;
  const closing = openedTopic !== null && !record;
  if (closing) {
    if (dialog.open) dialog.close();
    openedTopic = null;
    lessonOrigin = null;
  }
  byId('map-view').hidden = isLibrary;
  byId('library-view').hidden = !isLibrary;
  byId('page-title').textContent = isLibrary ? '学习资料索引' : '操作系统学习地图';
  document.title = (record ? record.topic.title : byId('page-title').textContent) + ' · OSTEP';
  byId('page-intro').textContent = isLibrary ? '按知识点、文件名或路径，找到这次复习要用的材料。' : '从三个基本问题出发，串起教材、代码与练习。';
  byId(isLibrary ? 'nav-library' : 'nav-map').setAttribute('aria-current','page');
  byId(isLibrary ? 'nav-map' : 'nav-library').removeAttribute('aria-current');
  if (isLibrary) {
    selectedFilter = Object.hasOwn(categories,id) ? id : 'all';
    renderFilters();
    renderResults();
  } else if (record) {
    showLesson(record);
  } else {
    renderMap();
    requestAnimationFrame(() => drawChip(byId('chip')));
    if (closing) {
      (document.querySelector(focusAfterLesson || '.branch[aria-pressed="true"]') || byId('overview-toggle')).focus({preventScroll:true});
      focusAfterLesson = null;
    }
    if (scrollToTrack) {
      if (matchMedia('(max-width:760px)').matches) {
        byId('topics').focus({preventScroll:true});
        byId('topics').scrollIntoView({block:'start'});
      } else document.querySelector('.branch[aria-pressed="true"]').focus({preventScroll:true});
      scrollToTrack = false;
    }
  }
  if (wasLibrary !== isLibrary) window.scrollTo({top:0,behavior:'instant'});
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const { branch, topic, filter, action } = button.dataset;
  if (branch) {
    scrollToTrack = true;
    const hash = '#track/' + branch;
    if (location.hash === hash) route();
    else location.hash = hash;
  } else if (topic) {
    focusAfterLesson = button.closest('.resume') ? '#resume button' : button.closest('.overview-topics') ?
      '.overview-topics [data-topic="' + topic + '"]' : '.topic-list [data-topic="' + topic + '"]';
    lessonOrigin = location.href;
    location.hash = 'lesson/' + topic;
  } else if (filter) {
    const hash = '#library' + (filter === 'all' ? '' : '/' + filter);
    if (location.hash !== hash) {
      history.replaceState(null, '', hash);
      route();
      document.querySelector('[data-filter="' + filter + '"]').focus({preventScroll:true});
    }
  } else if (action === 'close') {
    leaveLesson();
  } else if (action === 'review') {
    const done = !state.reviewed.includes(openedTopic);
    state.reviewed = done ? [...state.reviewed, openedTopic] : state.reviewed.filter(id => id !== openedTopic);
    saveState();
    button.setAttribute('aria-pressed', String(done));
    button.querySelector('span').textContent = done ? '已复习' : '标为已复习';
    renderProgress(); renderMap();
  } else if (action === 'prev' || action === 'next') {
    const record = index.get(openedTopic);
    const target = tracks.get(record.track)[record.position + (action === 'next' ? 1 : -1)];
    if (target) { history.replaceState(null, '', '#lesson/' + target.id); route(); }
  } else if (action === 'copy') {
    copyCommand(button);
  }
});

byId('overview-toggle').addEventListener('click', () => {
  location.hash = overview ? 'track/' + selectedTrack : 'map/all';
});

async function copyCommand(button) {
  const command = index.get(openedTopic).topic.command;
  const label = button.querySelector('span');
  try {
    await navigator.clipboard.writeText(command);
    label.textContent = '已复制';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(button.closest('.command').querySelector('code'));
    selection.removeAllRanges();
    selection.addRange(range);
    label.textContent = document.execCommand('copy') ? '已复制' : '已选中，可手动复制';
  }
}

dialog.addEventListener('cancel', event => { event.preventDefault(); leaveLesson(); });
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) leaveLesson();
  }
});
search.addEventListener('input', renderResults);
window.addEventListener('hashchange', route);
for (const holder of document.querySelectorAll('[data-icon]')) holder.innerHTML = icon(holder.dataset.icon);
renderEntries();
renderProgress();
route();
const chip = byId('chip');
const chipObserver = new ResizeObserver(() => { if (chip.clientWidth) drawChip(chip); });
chipObserver.observe(chip);
