registerTrack('virtualization', [
  {
    id: 'process-states',
    title: '进程与状态',
    summary: '一个进程等待磁盘时，另一个进程可以接着使用同一颗 CPU。',
    insight: '操作系统保存每个进程的程序计数器和寄存器，切换回来时就能从原处继续运行。发起同步 I/O 后，进程进入阻塞状态。I/O 完成后，它重新具备被调度的资格。',
    question: '进程 0 先发起 I/O，进程 1 有三条纯计算指令。模拟器在遇到 I/O 时切换进程，第 2 拍谁在使用 CPU？',
    answer: '进程 1。第 1 拍进程 0 发起请求，第 2 拍它在等待设备，此时进程 1 已经可以执行第一条计算指令。CPU 和设备可以同时忙碌。',
    resources: [
      { path: 'homework/cpu-intro/README.md', label: '阅读进程状态模拟器说明' },
      { path: 'handout.md', label: '回看仓库里的进程笔记' }
    ],
    command: 'python3 homework/cpu-intro/process-run.py -l 1:0,3:100 -L 2 -c'
  },
  {
    id: 'process-api',
    title: '进程 API',
    summary: '沿着一个子进程的生命期，理解 fork、exec 和 wait 各自做什么。',
    insight: 'fork 成功后，父子进程从同一处继续，靠不同的返回值选择分支。子进程可以用 exec 换成另一个程序，父进程可以用 wait 等到子进程退出并取得它的进程号。',
    question: '在 p2.c 中，子进程打印后休眠 1 秒，父进程在打印前调用 wait。即使系统先调度父进程，两条身份消息中谁的先出现？',
    answer: '子进程的先出现。父进程即使先运行，也会在 wait 处等到子进程退出，之后才打印自己的身份。休眠会推迟父进程的打印，顺序由 wait 保证。',
    resources: [
      { path: 'code/cpu-api/p2.c', label: '跟读父子进程的两个分支' },
      { path: 'code/cpu-api/p3.c', label: '看子进程如何用 exec 启动 wc' },
      { path: 'projects/processes-shell/README.md', label: '进阶项目 · 写一个 shell' }
    ]
  },
  {
    id: 'cpu-scheduling',
    title: 'CPU 调度',
    summary: '用同一组作业比较谁先得到响应、谁先执行完毕。',
    insight: '先到先服务（FIFO）让队首作业一直跑到结束，时间片轮转（RR）则让尚未完成的作业回到队尾。响应时间从到达算到首次运行，周转时间从到达算到完成。',
    question: 'A、B 在时刻 0 同时就绪，依次需要 6 秒和 2 秒，A 先运行。轮转时间片为 2 秒，忽略切换开销，B 的响应时间和周转时间各是多少？',
    answer: '响应时间是 2 秒，周转时间是 4 秒。A 占用最初的 2 秒，接着 B 用一个时间片跑完。若改为 FIFO，B 到第 6 秒才能开始，第 8 秒才结束。',
    resources: [
      { path: 'homework/cpu-sched/README.md', label: '比较 FIFO、SJF 与 RR' },
      { path: 'homework/cpu-sched-mlfq/README.md', label: '进阶练习 · 多级反馈队列' }
    ],
    command: 'python3 homework/cpu-sched/scheduler.py -p RR -q 2 -l 6,2 -c'
  },
  {
    id: 'address-spaces',
    title: '地址空间与重定位',
    summary: '从一个进程看到的地址，算出它实际访问的物理位置。',
    insight: '在基址和界限模型里，进程生成的虚拟地址是相对起点的偏移。只有偏移小于界限时，硬件才把它加到基址上。切换进程时换一组寄存器，相同的虚拟地址就能指向不同的内存。',
    question: '基址是 1000，地址空间长度为 32 字节。依次访问十进制虚拟地址 15 和 34，各会发生什么？',
    answer: '15 落在合法范围 0 到 31 内，物理地址是 1000 + 15 = 1015。34 已经越界，硬件会在地址转换时报告异常。',
    resources: [
      { path: 'homework/vm-mechanism/README.md', label: '手算基址与界限' },
      { path: 'code/vm-intro/va.c', label: '看代码、堆与栈的虚拟地址' },
      { path: 'homework/vm-segmentation/README.md', label: '进阶练习 · 分段地址转换' }
    ],
    command: 'python3 homework/vm-mechanism/relocation.py -b 1000 -l 32 -a 64 -s 3 -n 3 -c'
  },
  {
    id: 'page-tables',
    title: '分页与页表',
    summary: '把虚拟地址拆成页号和页内偏移，就能单独安排每一页的去向。',
    insight: '分页把虚拟空间切成等大的页，把物理内存切成同样大小的页框。硬件用虚拟页号查页表，把查到的物理页框号与原偏移拼成物理地址。TLB 会缓存近期的地址映射，加快后续查找。',
    question: '每页 4 KiB，虚拟页 3 映射到物理页框 6。虚拟地址 0x3229 会访问哪个物理地址？',
    answer: '0x6229。4 KiB 等于 0x1000 字节，因此低 12 位是页内偏移 0x229。页框 6 的起点是 0x6000，加上偏移就是这次访问的位置。',
    resources: [
      { path: 'homework/vm-paging/README.md', label: '对照线性页表逐项翻译' },
      { path: 'homework/vm-smalltables/README.md', label: '进阶练习 · 走一遍多级页表' }
    ],
    command: 'python3 homework/vm-paging/paging-linear-translate.py -s 0 -n 1 -v -c'
  },
  {
    id: 'page-replacement',
    title: '页面置换',
    summary: '可用页框都已占满时，刚刚的访问历史会影响下一次缺页。',
    insight: '访问合法但尚未驻留的页面会触发缺页异常，操作系统需要准备一个页框装入该页。如果必须腾出空间，最近最少使用（LRU）策略会挑出上次访问距今最久的驻留页。',
    question: '两个页框起初为空，按 0、1、0、2、0 的顺序访问虚拟页。使用 LRU 时，装入页 2 要淘汰谁？最后一次访问会命中吗？',
    answer: '淘汰页 1。第三次访问刷新了页 0 的最近使用时间，因此第四次访问留下页 0、装入页 2。最后的页 0 命中，五次访问合计两次命中、三次未命中。',
    resources: [
      { path: 'homework/vm-beyondphys-policy/README.md', label: '对照 LRU 与 FIFO 的淘汰顺序' },
      { path: 'homework/vm-beyondphys/README.md', label: '观察工作集与物理内存' }
    ],
    command: 'python3 homework/vm-beyondphys-policy/paging-policy.py -C 2 -p LRU -a 0,1,0,2,0 -c'
  }
]);
