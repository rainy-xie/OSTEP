// “page” 是仓库中文版 PDF 的实际页序，从 1 开始，供 #page= 使用。
const chapters = {
  'process-states': { chapter: 4, title: '抽象：进程', page: 31 },
  'process-api': { chapter: 5, title: '插叙：进程 API', page: 40 },
  'cpu-scheduling': { chapter: 7, title: '进程调度：介绍', page: 60 },
  'address-spaces': { chapter: 15, title: '机制：地址转换', page: 112 },
  'page-tables': { chapter: 18, title: '分页：介绍', page: 144 },
  'page-replacement': { chapter: 22, title: '超越物理内存：策略', page: 184 },
  'shared-state': { chapter: 26, title: '并发：介绍', page: 209 },
  'mutual-exclusion': { chapter: 28, title: '锁', page: 230 },
  'condition-variables': { chapter: 30, title: '条件变量', page: 260 },
  'semaphores': { chapter: 31, title: '信号量', page: 274 },
  'lock-order': { chapter: 32, title: '常见并发问题', page: 290 },
  'disk': { chapter: 37, title: '磁盘驱动器', page: 324 },
  'raid': { chapter: 38, title: '廉价冗余磁盘阵列（RAID）', page: 336 },
  'inode': { chapter: 40, title: '文件系统实现', page: 367 },
  'crash-consistency': { chapter: 42, title: '崩溃一致性：FSCK 和日志', page: 390 },
  'ssd': { chapter: 45, title: '关于持久的总结对话（FTL 延伸）', page: 427 },
};
