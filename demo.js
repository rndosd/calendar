(() => {
  const demo = document.getElementById('demo');
  const get = id => document.getElementById(`demo-${id}`);
  const inbox = get('messages');
  const calendar = get('days');
  const detail = get('detail');
  const importButton = get('import');
  const resetButton = get('reset');
  const finishButton = get('finish');
  const status = get('status');
  const attachment = get('attachment');

  const notes = [
    {
      id: 'field-trip', subject: '체험학습 계획서 제출 안내', sender: '샘플 교무부', received: 0,
      body: '선생님, 오늘 오후 4시 30분까지 반별 체험학습 계획서를 보내 주세요. 첨부한 양식에 참가 인원과 이동 방법을 적어 주시면 됩니다.',
      title: '체험학습 계획서 제출', day: 0, time: '16:30', kind: '마감',
      file: {
        name: '체험학습 계획서 양식.txt',
        contents: '체험학습 계획서\n\n학년·반: __________\n참가 학생: ______명\n인솔 교사: ______명\n장소: __________\n이동 방법: __________'
      }
    },
    {
      id: 'training', subject: '연수 참석 여부 회신 부탁드립니다', sender: '샘플 연구부', received: -2,
      body: '다음 주 수업 나눔 연수 참석 여부를 내일 오후 5시까지 회신해 주세요. 참석이 어려운 경우에도 알려 주세요.',
      title: '연수 참석 여부 회신', day: -1, time: '17:00', kind: '마감'
    },
    {
      id: 'meeting', subject: '수업 나눔 협의 시간 안내', sender: '샘플 학년부', received: 0,
      body: '내일 오후 3시 20분에 과학실에서 수업 나눔 협의가 있습니다. 서로 나눌 수업 사례를 한 가지씩 준비해 주세요.',
      title: '수업 나눔 협의', day: 1, time: '15:20', kind: '일정'
    }
  ];
  const dates = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' });
  const weekdays = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' });
  const dayNames = ['어제', '오늘', '내일'];
  const emptyMessage = status.textContent;
  const done = new Set();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  let imported = false;
  let opened;

  function dateAt(offset) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return date;
  }

  function noteRow(note, title, meta) {
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.noteId = note.id;
    button.setAttribute('aria-haspopup', 'dialog');
    const name = document.createElement('strong');
    name.textContent = title;
    const context = document.createElement('span');
    context.className = 'demo-meta';
    context.textContent = meta;
    button.append(name, context);
    row.append(button);
    return row;
  }

  function renderCalendar() {
    calendar.replaceChildren(...dayNames.map((label, index) => {
      const offset = index - 1;
      const date = dateAt(offset);
      const day = document.createElement('section');
      day.className = 'demo-day';
      if (offset === 0) day.dataset.current = '';
      const heading = document.createElement('h4');
      heading.textContent = label;
      const dayLabel = document.createElement('span');
      dayLabel.className = 'demo-day-date';
      dayLabel.textContent = `${dates.format(date)} (${weekdays.format(date)})`;
      heading.append(dayLabel);
      const tasks = document.createElement('ul');
      tasks.className = 'demo-tasks';
      if (imported) {
        for (const note of notes.filter(item => item.day === offset)) {
          const completed = done.has(note.id);
          const item = noteRow(note, note.title, completed ? '✓ 완료' : `${note.time} · ${note.kind}`);
          item.firstChild.dataset.kind = note.kind;
          if (completed) item.firstChild.dataset.done = '';
          tasks.append(item);
        }
      }
      day.append(heading, tasks);
      return day;
    }));
  }

  function openNote(event) {
    const trigger = event.target.closest('button[data-note-id]');
    if (!trigger) return;
    const note = notes.find(item => item.id === trigger.dataset.noteId);
    const fromCalendar = event.currentTarget === calendar;
    opened = { note, container: event.currentTarget };
    get('detail-title').textContent = fromCalendar ? note.title : note.subject;
    get('detail-date').textContent = fromCalendar ? `${dayNames[note.day + 1]} ${note.time} · ${note.kind}` : '브리티 받은 쪽지';
    get('detail-sender').textContent = `${note.sender} · ${dates.format(dateAt(note.received))} 받은 쪽지`;
    get('detail-body').textContent = note.body;
    attachment.open = false;
    attachment.hidden = !note.file;
    get('attachment-name').textContent = note.file?.name ?? '';
    get('attachment-body').textContent = note.file?.contents ?? '';
    finishButton.hidden = !fromCalendar || note.kind !== '마감';
    finishButton.textContent = done.has(note.id) ? '완료 취소' : '완료';
    detail.showModal();
  }

  inbox.replaceChildren(...notes.map(note => noteRow(note, note.subject, note.sender + (note.file ? ' · 첨부 1' : ''))));
  get('count').textContent = `${notes.length}통`;
  get('calendar-title').textContent = `${dates.format(dateAt(-1))} – ${dates.format(dateAt(1))}`;
  inbox.addEventListener('click', openNote);
  calendar.addEventListener('click', openNote);

  importButton.addEventListener('click', () => {
    imported = true;
    importButton.disabled = true;
    resetButton.disabled = false;
    renderCalendar();
    status.textContent = '마감 2건과 일정 1건을 달력에 올렸어요. 오늘 할 일을 눌러 원문을 열어 보세요.';
    calendar.querySelector('[data-current] button').focus();
  });
  resetButton.addEventListener('click', () => {
    imported = false;
    done.clear();
    importButton.disabled = false;
    resetButton.disabled = true;
    renderCalendar();
    status.textContent = emptyMessage;
    importButton.focus();
  });
  finishButton.addEventListener('click', () => {
    const { note } = opened;
    const completed = !done.has(note.id);
    if (completed) done.add(note.id);
    else done.delete(note.id);
    renderCalendar();
    status.textContent = completed ? `‘${note.title}’을 완료했어요.` : `‘${note.title}’을 다시 할 일로 돌렸어요.`;
    detail.close();
  });
  detail.addEventListener('close', () => {
    if (detail.open || !opened) return;
    opened.container.querySelector(`[data-note-id="${opened.note.id}"]`)?.focus();
    opened = undefined;
  });

  renderCalendar();
  demo.querySelector('.demo-board').hidden = false;
})();
