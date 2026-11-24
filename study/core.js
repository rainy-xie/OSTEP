'use strict';

const tracks = new Map();

function registerTrack(id, topics) {
  tracks.set(id, topics);
}

const trackInfo = {
  virtualization: {
    title: '虚拟化', english: 'Virtualization', icon: 'layers', concept: '进程 · 调度 · 内存',
    question: '一台机器，怎样让每个进程都像独占了 CPU 和内存？'
  },
  concurrency: {
    title: '并发', english: 'Concurrency', icon: 'fork', concept: '线程 · 锁 · 同步',
    question: '当线程交错运行，怎样让它们安全地共享同一份数据？'
  },
  persistence: {
    title: '持久性', english: 'Persistence', icon: 'database', concept: '磁盘 · 文件系统',
    question: '从一次写入到断电重启，文件系统怎样把数据留下来？'
  }
};

const icons = {
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  book: '<path d="M12 6c-2-2-6-2.8-10-2v15c4-.8 8 0 10 2 2-2 6-2.8 10-2V4c-4-.8-8 0-10 2Zm0 0v15"/>',
  network: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="2" y="16" width="6" height="5" rx="1"/><rect x="16" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
  fork: '<circle cx="6" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M6 7.5v9m0-2c0-4 12 0 12-7"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  play: '<path d="m8 4 12 8-12 8z"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  code: '<path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 3l-4 18"/>',
  terminal: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 9 3.5 3L6 15m6 0h5"/>',
  folder: '<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 9h18"/>',
  search: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/>',
  bulb: '<path d="M9 16c0-2-4-4-4-8a7 7 0 0 1 14 0c0 4-4 6-4 8Zm0 3h6m-5 3h4"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4V3Z"/>'
};

function icon(name) {
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + '</svg>';
}

function escapeText(value) {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML.replaceAll('"', '&quot;');
}

const pdfFile = '操作系统导论-OSTEP.pdf';
const categories = {
  reading: { title: '教材与笔记', icon: 'book' },
  code: { title: '示例代码', icon: 'code', description: '跟读 C 语言示例，观察系统调用。', path: 'code/' },
  homework: { title: '模拟练习', icon: 'terminal', description: '运行模拟器，核对你的预测。', path: 'homework/' },
  projects: { title: '课程项目', icon: 'folder', description: '从 shell 到文件系统，动手实现。', path: 'projects/' }
};

function resourceKind(path) {
  const dir = path.split('/')[0];
  return categories[dir] ? dir : 'reading';
}
