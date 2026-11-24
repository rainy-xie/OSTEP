registerTrack('concurrency', [
  {
    id: 'shared-state',
    title: '线程与共享状态',
    summary: '同一进程里的线程各有寄存器和栈，却能读写同一个全局计数器。',
    insight: '在 simple-race.s 里，一次加一要从内存读数，在寄存器里加一，再写回内存。线程切换会保留各自的寄存器值，所以两个线程可能拿着同一份旧值继续计算。',
    question: '地址 2000 初值为 0。两个线程各加一，每执行一条指令就轮换。两个线程结束时，地址 2000 里是多少？',
    answer: '是 1。两个线程先后读到 0，各自算出 1，又先后把 1 写回。把中断间隔从 1 改为 4，观察第二个线程读到的初值和最终结果。',
    resources: [
      { path: 'homework/threads-intro/simple-race.s', label: '逐行跟踪一次加一' },
      { path: 'homework/threads-intro/README.md', label: '学习读取线程交错轨迹' },
      { path: 'code/threads-api/thread_create.c', label: '在 C 中创建并等待线程' }
    ],
    command: 'python3 homework/threads-intro/x86.py -p homework/threads-intro/simple-race.s -t 2 -i 1 -M 2000 -c'
  },
  {
    id: 'mutual-exclusion',
    title: '锁与临界区',
    summary: '用同一把锁包住读、改、写，让每个线程都能看到前一次更新。',
    insight: 'test-and-set.s 用一条 xchg 指令把 1 写进锁，同时取回旧值。拿到 0 的线程进入临界区，拿到 1 的线程循环重试，直到持锁线程把锁清零。',
    question: '两个线程还是各加一，也还是每条指令切换一次。如果读写计数器前都要取得同一把锁，最后的 count 是多少？',
    answer: '是 2。第一个线程写回 1 才放锁，第二个线程随后读到 1，再写回 2。看轨迹中的 mutex 和 count 两列，可以定位两次写回发生在哪一次持锁期间。',
    resources: [
      { path: 'homework/threads-locks/test-and-set.s', label: '跟踪原子交换与自旋' },
      { path: 'homework/threads-locks/README.md', label: '比较不同锁的实现' }
    ],
    command: 'python3 homework/threads-locks/x86.py -p homework/threads-locks/test-and-set.s -t 2 -a bx=1 -i 1 -M mutex,count -c'
  },
  {
    id: 'condition-variables',
    title: '条件变量',
    summary: '缓冲区暂时为空时，消费者可以交出锁，睡到有机会继续取数据。',
    insight: '在 pc.c 中，消费者持锁检查 num_full，为 0 就调用 Cond_wait。等待会原子地释放锁并让线程睡眠。线程重新拿到锁以后，while 会再次检查 num_full。',
    question: '生产者放入唯一一件商品，唤醒消费者 A。如果消费者 B 抢先拿到锁并取走商品，A 重新拿到锁后该做什么？',
    answer: 'A 应再看一次 num_full。此时它已经回到 0，A 要继续等待。通知只说明缓冲区曾经有货，从收到通知到取得锁之间，其他线程仍能改变缓冲区。',
    resources: [
      { path: 'code/threads-cv/pc.c', label: '对照生产和消费时的 while 循环' },
      { path: 'homework/threads-cv/main-two-cvs-if.c', label: '比较使用 if 的版本' },
      { path: 'projects/concurrency-webserver/README.md', label: '把有界队列用于并发服务器项目' }
    ]
  },
  {
    id: 'semaphores',
    title: '信号量',
    summary: '用可累积的许可表示空槽和已有数据，让生产者与消费者各取所需。',
    insight: '在信号量版缓冲区中，生产者先用 wait 取得一个 empty 许可，放入数据后再用 post 增加一个 full 许可。消费者反向操作，另有一把初值为 1 的锁保护缓冲区和下标。',
    question: '容量为 2，初始空槽有两个，消费者暂时没有运行。生产者完成两次放入后，第三次放入会停在哪一步？',
    answer: '它停在 Sem_wait(&empty)。此时两个空槽许可都已用完，full 有两个许可。消费者取走一件并执行 Sem_post(&empty) 后，生产者就能取得这个空槽许可。',
    resources: [
      { path: 'code/threads-sema/producer_consumer_works.c', label: '对照 empty、full 和 mutex 的初值' },
      { path: 'code/threads-sema/join.c', label: '看初值为零的信号量怎样记录完成事件' },
      { path: 'homework/threads-sema/README.md', label: '尝试信号量同步练习' }
    ]
  },
  {
    id: 'lock-order',
    title: '死锁与加锁顺序',
    summary: '同时需要多把锁时，先画出每个线程持有哪把锁、正在等哪把锁。',
    insight: 'deadlock.c 中，两个线程按相反顺序请求 L1 和 L2。如果各自都拿到第一把锁，就会同时等待对方放锁。给这两把锁约定统一的获取顺序，可以消掉这条循环等待链。',
    question: '若两个线程都改成先拿 L1 再拿 L2，一个线程拿到 L1 后被切走，另一个线程会停在哪里？还能形成原来的死锁吗？',
    answer: '另一个线程停在 L1，此时手里没有 L2。持有 L1 的线程恢复运行后仍可取得 L2，完成工作并放锁，这两个线程之间的循环等待就消失了。',
    resources: [
      { path: 'code/threads-bugs/deadlock.c', label: '标出两个线程的取锁顺序' },
      { path: 'homework/threads-bugs/vector-global-order.c', label: '看双向向量操作如何统一取锁顺序' }
    ]
  }
]);
