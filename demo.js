// 대문 체험: 가상 쪽지 9통을 가져와 실제 앱처럼 정리해 보는 화면.
// 쪽지·사람·학교는 모두 가상이고, 결과는 미리 정해 둔 것이다(AI를 부르지 않는다).
(() => {
  const root = document.getElementById('demo');
  if (!root) return;
  const $ = id => document.getElementById('dm-' + id);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));

  const today = new Date(); today.setHours(12, 0, 0, 0);
  const at = o => { const d = new Date(today); d.setDate(d.getDate() + o); return d; };
  const WD = '일월화수목금토';
  const md = d => `${d.getMonth() + 1}/${d.getDate()}(${WD[d.getDay()]})`;
  const short = d => `${d.getMonth() + 1}/${d.getDate()}`;

  // 쪽지: recv = 받은 날(오늘 기준), task = 정리된 업무
  const NOTES = [
    { id: 'n1', from: '샘플 교무부', subject: '체험학습 계획서 제출 안내', recv: -3, time: '09:12', task: 'plan',
      body: '선생님, 반별 체험학습 계획서를 오늘 오후 4시 30분까지 제출해 주세요.\n첨부한 양식에 참가 인원과 이동 방법, 인솔 교사를 적어 주시면 됩니다.',
      file: { name: '체험학습 계획서 양식.hwpx', title: '현장체험학습 계획서', rows: [['학년·반', ''], ['체험 장소', ''], ['일시', '      년    월    일 (    )'], ['참가 학생', '        명 (불참        명)'], ['인솔 교사', ''], ['이동 방법', '□ 도보   □ 버스   □ 기타'], ['안전 교육', '□ 실시   (일시:            )']] } },
    { id: 'n2', from: '샘플 연구부', subject: '수업 나눔 연수 참석 여부 회신 요청', recv: -2, time: '14:40', task: 'training',
      body: '다음 주 수업 나눔 연수 참석 여부를 내일 오후 5시까지 회신 쪽지로 알려 주세요.\n참석이 어려운 경우에도 꼭 회신 부탁드립니다.' },
    { id: 'n3', from: '샘플 학년부', subject: '수업 나눔 협의회 안내', recv: -1, time: '16:05', task: 'meeting',
      body: '모레 오후 3시 20분, 과학실에서 수업 나눔 협의회가 있습니다.\n각 반에서 나눌 수업 사례를 한 가지씩 준비해 주세요.' },
    { id: 'n4', from: '샘플 보건실', subject: '급식 알레르기 조사서 회수', recv: -1, time: '10:22', task: 'allergy',
      body: '가정으로 보낸 급식 알레르기 조사서를 걷어 사흘 뒤까지 보건실로 보내 주세요.\n미제출 학생은 명단만 따로 적어 주시면 됩니다.',
      file: { name: '알레르기 조사서 회수 명단.hwpx', title: '급식 알레르기 조사서 회수 현황', rows: [['학년·반', ''], ['재적', '        명'], ['회수', '        명'], ['미제출 학생', ''], ['특이 사항', '']] } },
    { id: 'n5', from: '샘플 교무부', subject: '학부모 상담 주간 운영 안내', recv: -1, time: '11:48', task: 'consult',
      body: '학부모 상담 주간을 운영합니다. 기간 중 상담 일정은 각 반에서 학부모와 직접 정해 주세요.\n상담 기록은 기간이 끝난 뒤 학년 협의 때 함께 보겠습니다.' },
    { id: 'n6', from: '샘플 연구부', subject: '[재안내] 수업 나눔 연수 참석 회신', recv: 0, time: '08:31', task: 'training', again: true,
      body: '아직 회신하지 않으신 분들은 내일 오후 5시까지 참석 여부를 알려 주세요.' },
    { id: 'n7', from: '샘플 행정실', subject: '주차장 바닥 도색 공사 안내', recv: 0, time: '08:10', task: 'parking',
      body: '이번 주말 주차장 바닥 도색 공사가 있습니다. 금요일 퇴근 때 차량을 학교 밖으로 옮겨 주세요.' },
    { id: 'n8', from: '샘플 친목회', subject: '친목회 회비 결산 공유', recv: 0, time: '07:55', task: 'club',
      body: '이번 달 친목회 회비 사용 내역을 공유합니다. 궁금한 점은 친목회 총무에게 말씀해 주세요.' },
    { id: 'n9', from: '샘플 학년부', subject: '학년 행사 참가 인원 회신', recv: -4, time: '13:15', task: 'event',
      body: '학년 행사 참가 인원을 어제까지 회신해 주세요. 반별로 참가·불참 인원만 적어 주시면 됩니다.' },
  ];
  NOTES.sort((a, b) => a.recv - b.recv || a.time.localeCompare(b.time));
  // 지난달에 받아 둔 쪽지(처음부터 처리한 것에 있음)
  const OLD = { id: 'n0', from: '샘플 교무부', subject: '학급 운영 계획서 양식 안내', recv: -36, time: '09:40', task: 'old',
    body: '2학기 학급 운영 계획서 양식을 보냅니다. 학기 초에 쓰신 계획서에서 바뀐 부분만 고쳐 제출해 주세요.',
    file: { name: '학급 운영 계획서 양식.hwpx', title: '2학기 학급 운영 계획서', rows: [['학년·반', ''], ['담임', ''], ['학급 목표', ''], ['생활 지도', ''], ['학부모 소통', ''], ['바뀐 점', '']] } };

  const TASKS = {
    plan: { type: 'todo', title: '체험학습 계획서 제출', day: 0, time: '16:30', notes: ['n1'] },
    training: { type: 'todo', title: '수업 나눔 연수 참석 회신', day: 1, time: '17:00', notes: ['n2', 'n6'] },
    allergy: { type: 'todo', title: '급식 알레르기 조사서 회수', day: 3, notes: ['n4'] },
    event: { type: 'todo', title: '학년 행사 참가 인원 회신', day: -1, notes: ['n9'] },
    meeting: { type: 'event', title: '수업 나눔 협의회', day: 2, time: '15:20', place: '과학실', notes: ['n3'] },
    consult: { type: 'period', title: '학부모 상담 주간', day: 3, end: 7, notes: ['n5'] },
    parking: { type: 'info', title: '주차장 바닥 도색 공사', notes: ['n7'] },
    club: { type: 'hidden', title: '친목회 회비 결산 공유', notes: ['n8'] },
    old: { type: 'todo', title: '학급 운영 계획서 제출', day: -32, notes: ['n0'] },
  };
  const ALL_NOTES = [...NOTES, OLD];
  const note = id => ALL_NOTES.find(n => n.id === id);

  const REPLIES = {
    training: [
      ['참석할게요', ['안녕하세요, 선생님. 다음 주 수업 나눔 연수에 참석하겠습니다. 안내해 주셔서 감사합니다.', '안녕하세요. 수업 나눔 연수 참석 여부 회신드립니다. 참석하겠습니다. 준비할 것이 있으면 알려 주세요.']],
      ['못 가요', ['안녕하세요, 선생님. 다음 주 수업 나눔 연수는 학급 일정과 겹쳐 참석이 어렵습니다. 미리 안내해 주셔서 감사합니다.', '안녕하세요. 아쉽지만 이번 수업 나눔 연수는 참석이 어렵습니다. 자료가 나오면 공유 부탁드립니다. 감사합니다.']],
    ],
    plan: [
      ['오늘 낼게요', ['안녕하세요. 체험학습 계획서 확인했습니다. 오늘 오후 중으로 제출하겠습니다. 감사합니다.']],
      ['조금 늦어요', ['안녕하세요. 참가 인원 확인이 늦어져 계획서를 내일 오전까지 제출해도 될지 여쭙습니다. 양해 부탁드립니다.']],
    ],
  };
  const REPLY_DEFAULT = [['확인했어요', ['안녕하세요. 보내 주신 내용 확인했습니다. 기한 안에 처리하겠습니다. 감사합니다.']]];

  const S = {};
  function reset() {
    Object.assign(S, { imported: false, busy: false, revealed: new Set(['old']), done: new Set(['old']), important: new Set(['event']),
      memo: {}, tab: 'todo', query: '', sel: null, reply: null, missions: new Set(), read: new Set() });
  }

  // ---------- 계산 ----------
  const T = id => TASKS[id];
  const shown = () => Object.keys(TASKS).filter(id => S.revealed.has(id));
  function tabOf(id) {
    if (S.done.has(id)) return 'done';
    const t = T(id).type;
    return t === 'info' ? 'info' : t === 'hidden' ? 'hidden' : 'todo';
  }
  function whenText(id) {
    const t = T(id);
    if (t.type === 'period') return `${short(at(t.day))}~${short(at(t.end))}`;
    if (t.day == null) return '';
    if (S.done.has(id)) return short(at(t.day));
    if (t.day < 0 && t.type === 'todo') return `${-t.day}일 지남`;
    if (t.day === 0) return t.time ? `오늘 ${t.time}` : '오늘';
    if (t.day === 1) return '내일';
    return short(at(t.day));
  }
  function group(id) {
    const t = T(id);
    if (t.type === 'todo' && t.day < 0) return '지남';
    if (t.day === 0 || (t.type === 'period' && t.day <= 0 && t.end >= 0)) return '오늘';
    if (t.day < 7) return '이번 주';
    return '다음';
  }
  function haystack(id) {
    const t = T(id);
    return [t.title, ...t.notes.map(n => { const x = note(n); return [x.subject, x.body, x.from, x.file?.name].join(' '); })].join(' ');
  }
  function resultOf(n) {
    const t = T(n.task);
    if (n.again) return ['같은 일로 묶음', 'merge'];
    if (t.type === 'todo') return [`할 일 · ${t.day < 0 ? '기한 지남' : short(at(t.day)) + '까지'}`, 'todo'];
    if (t.type === 'event') return [`일정 · ${short(at(t.day))}`, 'event'];
    if (t.type === 'period') return [`기간 · ${short(at(t.day))}~${short(at(t.end))}`, 'event'];
    if (t.type === 'info') return ['알아 둘 것', 'info'];
    return ['할 일 없음 · 숨김', 'hidden'];
  }

  // ---------- 그리기 ----------
  function renderInbox() {
    const ul = $('inbox');
    ul.replaceChildren(...[...NOTES].reverse().map(n => {
      const li = el('li');
      const b = el('button', 'dm-msg');
      b.type = 'button'; b.dataset.note = n.id;
      if (!S.read.has(n.id)) b.classList.add('unread');
      const tag = el('span', 'dm-tag');
      if (S.revealed.has(n.task) && S.read.has(n.id)) { const [txt, k] = resultOf(n); tag.textContent = txt; tag.dataset.k = k; }
      b.append(el('span', 'dm-from', `${n.from} · ${n.recv === 0 ? n.time : short(at(n.recv))}${n.file ? ' · 📎 첨부' : ''}`), el('strong', '', n.subject), tag);
      b.disabled = !S.imported;
      li.append(b);
      return li;
    }));
    $('unread').textContent = NOTES.filter(n => !S.read.has(n.id)).length || '';
  }

  function renderTabs() {
    const counts = { todo: 0, info: 0, done: 0, hidden: 0 };
    for (const id of shown()) counts[tabOf(id)]++;
    const names = [['todo', '할 일'], ['info', '확인할 것'], ['done', '처리한 것'], ['hidden', '숨긴 것']];
    $('tabs').replaceChildren(...names.map(([k, label]) => {
      const b = el('button', 'dm-tab');
      b.type = 'button'; b.dataset.tab = k;
      b.setAttribute('aria-pressed', String(S.tab === k && !S.query));
      b.append(el('span', '', label), el('em', '', String(counts[k])));
      return b;
    }));
  }

  function row(id, opts = {}) {
    const t = T(id);
    const li = el('li', 'dm-row');
    if (S.sel === id) li.classList.add('sel');
    if (S.done.has(id)) li.classList.add('done');
    if (t.type === 'todo') {
      const c = el('button', 'dm-check');
      c.type = 'button'; c.dataset.check = id;
      c.setAttribute('aria-label', S.done.has(id) ? `${t.title} 완료 취소` : `${t.title} 완료`);
      li.append(c);
    } else li.append(el('span', 'dm-mark ' + t.type));
    const b = el('button', 'dm-open');
    b.type = 'button'; b.dataset.open = id;
    if (opts.search) b.dataset.search = '1';
    const name = el('span', 'dm-name');
    if (S.important.has(id)) name.append(el('i', 'dm-dot'));
    name.append(el('span', 'dm-t', t.title));
    if (t.notes.length > 1) name.append(el('small', 'dm-n', `${t.notes.length}건`));
    if (S.memo[id]) name.append(el('small', 'dm-n', '메모'));
    const sub = opts.search ? (note(t.notes[0]).file?.name ? '📎 ' + note(t.notes[0]).file.name.replace('.hwpx', '') : whenText(id)) : whenText(id);
    const w = el('span', 'dm-when', sub);
    if (opts.search) w.classList.add('file');
    if (t.type === 'todo' && t.day < 0 && !S.done.has(id) && !opts.search) w.classList.add('late');
    b.append(name, w);
    li.append(b);
    return li;
  }

  function renderList() {
    const box = $('list');
    box.replaceChildren();
    const q = S.query.trim();
    if (q) {
      const hits = Object.keys(TASKS).filter(id => S.revealed.has(id) && haystack(id).includes(q));
      box.append(el('p', 'dm-group', `검색 결과 ${hits.length}`));
      const ul = el('ul');
      hits.forEach(id => ul.append(row(id, { search: true })));
      box.append(ul);
      if (!hits.length) box.append(el('p', 'dm-empty', '찾는 말이 들어간 업무·쪽지가 없어요.'));
      return;
    }
    const ids = shown().filter(id => tabOf(id) === S.tab);
    if (!ids.length) {
      box.append(el('p', 'dm-empty', !S.imported && S.tab === 'todo' ? '아직 가져온 쪽지가 없어요.\n위의 ‘브리티에서 가져오기’를 눌러 보세요.' : '비어 있어요.'));
      return;
    }
    if (S.tab === 'todo') {
      for (const g of ['지남', '오늘', '이번 주', '다음']) {
        const gs = ids.filter(id => group(id) === g).sort((a, b) => T(a).day - T(b).day);
        if (!gs.length) continue;
        const h = el('p', 'dm-group' + (g === '지남' ? ' late' : ''), `${g} `);
        h.append(el('span', '', String(gs.length)));
        box.append(h);
        const ul = el('ul');
        gs.forEach(id => ul.append(row(id)));
        box.append(ul);
      }
    } else {
      const ul = el('ul');
      ids.forEach(id => ul.append(row(id)));
      box.append(ul);
    }
  }

  function renderGrid() {
    const g = $('grid');
    g.replaceChildren();
    const off0 = -((today.getDay() + 6) % 7); // 이번 주 월요일
    '월화수목금토일'.split('').forEach((d, i) => g.append(el('span', 'dm-wd' + (i === 6 ? ' sun' : i === 5 ? ' sat' : ''), d)));
    for (let i = 0; i < 14; i++) {
      const o = off0 + i;
      const d = at(o);
      const cell = el('div', 'dm-day');
      if (o < 0) cell.classList.add('past');
      cell.append(el('span', 'dm-num' + (o === 0 ? ' today' : '') + (d.getDay() === 0 ? ' sun' : d.getDay() === 6 ? ' sat' : ''), String(d.getDate())));
      for (const id of shown()) {
        const t = T(id);
        if (t.type !== 'period' || o < t.day || o > t.end) continue;
        const head = o === t.day || d.getDay() === 1;
        const p = el('button', 'dm-chip period' + (head ? '' : ' cont') + (o === t.end || d.getDay() === 0 ? ' last' : ''), head ? t.title : '');
        p.type = 'button'; p.dataset.open = id; p.setAttribute('aria-label', t.title);
        if (S.sel === id) p.classList.add('sel');
        cell.append(p);
      }
      for (const id of shown()) {
        const t = T(id);
        if (!(t.type === 'todo' || t.type === 'event') || t.day !== o) continue;
        const c = el('button', `dm-chip ${t.type}`);
        c.type = 'button'; c.dataset.open = id;
        if (S.done.has(id)) c.classList.add('done');
        if (S.sel === id) c.classList.add('sel');
        if (S.important.has(id)) c.append(el('i', 'dm-dot'));
        c.append(el('span', 'dm-t', (t.time && t.type === 'event' ? t.time + ' ' : '') + t.title));
        if (t.notes.length > 1) c.append(el('small', 'dm-n', `${t.notes.length}건`));
        cell.append(c);
      }
      g.append(cell);
    }
    $('month').innerHTML = `${today.getMonth() + 1}월 <small>${today.getFullYear()}년</small>`;
  }

  function btn(cls, text, data) {
    const b = el('button', cls, text); b.type = 'button';
    for (const [k, v] of Object.entries(data || {})) b.dataset[k] = v;
    return b;
  }

  function renderDetail() {
    const box = $('detail');
    const id = S.sel;
    if (!id) { box.hidden = true; box.replaceChildren(); return; }
    const t = T(id);
    const done = S.done.has(id);
    box.hidden = false;
    box.replaceChildren();
    const top = el('div', 'dm-d-top');
    top.append(el('span', 'dm-kind', { todo: '할 일', event: '일정', period: '기간', info: '알아 둘 것', hidden: '숨긴 것' }[t.type]));
    const x = btn('dm-x', '×', { act: 'close' }); x.setAttribute('aria-label', '자세히 닫기');
    top.append(x);
    box.append(top, el('h4', 'dm-d-title', t.title));

    const imp = btn('dm-imp', '중요', { act: 'imp' }); imp.setAttribute('aria-pressed', String(S.important.has(id)));
    box.append(imp);

    if (t.type === 'todo') {
      const line = el('div', 'dm-due' + (done ? ' done' : ''));
      const c = btn('dm-check', '', { check: id }); c.setAttribute('aria-label', done ? '완료 취소' : '완료 표시');
      const txt = el('span', 'dm-due-t');
      txt.append(el('b', '', `${md(at(t.day))}${t.time ? ' ' + t.time : ''}까지`));
      if (t.day < 0 && !done) txt.append(el('em', 'late', ` ${-t.day}일 지남`));
      line.append(c, txt, btn('dm-btn', done ? '되돌리기' : '완료', { check: id }));
      box.append(line);
    } else if (t.type === 'event') {
      box.append(el('div', 'dm-due', `● ${md(at(t.day))} ${t.time}${t.place ? ' · ' + t.place : ''}`));
    } else if (t.type === 'period') {
      box.append(el('div', 'dm-due', `${md(at(t.day))} ~ ${md(at(t.end))}`));
    } else if (t.type === 'info') {
      box.append(el('p', 'dm-hint', '할 일은 없지만 알아 두면 좋은 쪽지라 따로 모았어요.'));
    } else {
      box.append(el('p', 'dm-hint', '할 일이 없는 쪽지라 목록에서 뺐어요. 원문은 여기 그대로 있어요.'));
    }

    if (t.notes.length > 1) box.append(el('p', 'dm-merge', `같은 내용의 쪽지 ${t.notes.length}통을 한 업무로 묶었어요.`));

    box.append(el('h5', '', '쪽지 원문'));
    for (const nid of t.notes) {
      const n = note(nid);
      const card = el('article', 'dm-orig');
      card.append(el('p', 'dm-o-from', `${n.from} · ${md(at(n.recv))} ${n.time} 받음`), el('p', 'dm-o-body', n.body));
      if (n.file) {
        const f = btn('dm-file', '', { file: nid });
        f.append(el('span', 'dm-hwp', '한'), el('span', 'dm-fname', n.file.name), el('em', '', '열기'));
        card.append(f);
      }
      box.append(card);
    }

    if (S.memo[id] != null) {
      const m = el('textarea', 'dm-memo-box'); m.value = S.memo[id]; m.dataset.memo = id; m.rows = 2; m.placeholder = '예: 인원은 금요일에 다시 확인';
      m.setAttribute('aria-label', '메모');
      box.append(m);
    }

    if (S.reply?.id === id) {
      const r = el('div', 'dm-reply');
      r.append(el('h5', '', '답장 초안'));
      const opts = el('div', 'dm-intents');
      opts.append(el('span', '', '하고 싶은 말'));
      (REPLIES[id] || REPLY_DEFAULT).forEach(([label], i) => {
        const b = btn('', label, { intent: String(i) });
        b.setAttribute('aria-pressed', String(S.reply.intent === i));
        opts.append(b);
      });
      r.append(opts);
      const ta = el('textarea', 'dm-draft'); ta.rows = 4; ta.value = S.reply.text; ta.id = 'dm-draft'; ta.setAttribute('aria-label', '답장 초안');
      r.append(ta);
      const row2 = el('div', 'dm-d-btns');
      row2.append(btn('dm-btn ghost', '다시 다듬기', { act: 'again' }), btn('dm-btn solid', '답장 복사', { act: 'copy' }));
      r.append(row2);
      box.append(r);
    }

    const foot = el('div', 'dm-d-foot');
    if (S.memo[id] == null) foot.append(btn('dm-link', '+ 메모', { act: 'memo' }));
    if (t.type === 'todo' && !done && S.reply?.id !== id) foot.append(btn('dm-btn', '답장 쓰기', { act: 'reply' }));
    foot.append(btn('dm-btn', '프로젝트에서 시작', { act: 'project' }));
    box.append(foot);
  }

  const ORDER = ['import', 'file', 'reply', 'done', 'search'];
  function renderMissions() {
    const next = ORDER.find(m => !S.missions.has(m));
    $('missions').querySelectorAll('li').forEach(li => {
      li.classList.toggle('ok', S.missions.has(li.dataset.m));
      li.classList.toggle('now', li.dataset.m === next);
    });
    $('finish').hidden = !!next;
    coachSoon();
  }

  // ---------- 다음에 누를 곳 ----------
  // 지금 상태에서 다음에 누를 자리와 말풍선 문구를 고른다.
  function nextStep() {
    const next = ORDER.find(m => !S.missions.has(m));
    const D = s => $('detail').querySelector(s);
    const L = s => $('list').querySelector(s);
    if (S.busy) return null;
    if (!$('viewer').hidden) return [$('viewer').querySelector('.dm-x'), '양식을 봤으면 닫아 주세요'];
    if (next === 'import') return [$('import'), '여기를 눌러 쪽지를 가져와 보세요'];
    if (next === 'file') {
      if (S.sel !== 'plan') return [L('[data-open="plan"]'), '오늘 마감인 이 일을 눌러 보세요'];
      return [D('[data-file="n1"]'), '붙어 온 양식을 바로 열어 보세요'];
    }
    if (next === 'reply') {
      if (S.sel !== 'training') return [L('[data-open="training"]'), '회신해야 하는 이 일을 눌러 보세요'];
      return [D('[data-act="reply"]'), '답장 쓰기를 눌러 보세요'];
    }
    if (next === 'done') {
      if (S.reply && S.reply.id === S.sel && !S.reply.copied) return [D('[data-act="copy"]'), '복사해서 메신저 답장 창에 붙여 넣으면 돼요'];
      if (S.sel && T(S.sel).type === 'todo' && !S.done.has(S.sel)) return [D('.dm-due .dm-btn'), '이제 다 했으니 완료를 눌러 보세요'];
      return [L('[data-check="plan"]') || L('.dm-check'), '네모를 눌러도 끝낸 일로 옮겨져요'];
    }
    if (next === 'search') {
      if (!S.query.includes('양식')) return [$('search'), '여기에 ‘양식’이라고 입력해 보세요'];
      return [L('[data-open="old"]'), '지난달에 받은 쪽지예요. 눌러 보세요'];
    }
    return null;
  }
  let coachTarget = null, coachRaf = 0;
  function coachSoon() { cancelAnimationFrame(coachRaf); coachRaf = requestAnimationFrame(() => coach()); }
  function coach(onlyMove) {
    const bubble = $('coach');
    const step = onlyMove ? (coachTarget && [coachTarget, bubble.textContent]) : nextStep();
    const target = step && step[0];
    if (!onlyMove && target !== coachTarget) {
      coachTarget?.classList.remove('dm-target');
      coachTarget = target || null;
      if (target) {
        target.classList.add('dm-target');
        // 목록·자세히 안에서 가려져 있으면 그 안에서만 스크롤한다.
        const box = target.closest('.dm-list, .dm-detail');
        if (box) {
          const tr = target.getBoundingClientRect(), br = box.getBoundingClientRect();
          if (tr.top < br.top + 8 || tr.bottom > br.bottom - 8) box.scrollTop += tr.top - br.top - br.height / 2 + tr.height / 2;
        }
      }
    }
    if (!target || !target.isConnected) { bubble.hidden = true; return; }
    if (!onlyMove) bubble.textContent = step[1];
    const stage = $('stage').getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const box = target.closest('.dm-list, .dm-detail, .dm-messenger ul');
    const b = box?.getBoundingClientRect();
    if (!t.width || (b && (t.bottom < b.top || t.top > b.bottom))) { bubble.hidden = true; return; }
    bubble.hidden = false;
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    const cx = t.left - stage.left + t.width / 2;
    const left = Math.max(6, Math.min(cx - bw / 2, stage.width - bw - 6));
    const below = t.bottom - stage.top + 12;
    const up = below + bh > stage.height - 6;
    bubble.style.left = left + 'px';
    bubble.style.top = (up ? t.top - stage.top - bh - 12 : below) + 'px';
    bubble.dataset.up = up ? '1' : '';
    bubble.style.setProperty('--arrow', Math.max(14, Math.min(cx - left, bw - 14)) + 'px');
  }

  function render() {
    renderInbox(); renderTabs(); renderList(); renderGrid(); renderDetail(); renderMissions();
    $('import').disabled = S.imported || S.busy;
    $('import').textContent = S.imported ? '새 쪽지 없음' : S.busy ? '가져오는 중…' : '브리티에서 가져오기';
  }

  // ---------- 동작 ----------
  function mission(m) {
    if (S.missions.has(m)) return;
    S.missions.add(m);
    renderMissions();
  }
  let toastTimer;
  function toast(text) {
    const t = $('toast');
    t.textContent = text; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
  }
  function select(id, fromSearch) {
    S.sel = id; S.reply = null;
    for (const n of T(id).notes) S.read.add(n);
    if (fromSearch && id === 'old') { mission('search'); toast('지난달 쪽지와 양식이 그대로 나와요.'); }
    render();
    $('detail').querySelector('.dm-x')?.focus({ preventScroll: true });
  }
  function toggleDone(id) {
    if (S.done.has(id)) { S.done.delete(id); toast(`‘${T(id).title}’을 다시 할 일로 돌렸어요.`); }
    else { S.done.add(id); toast(`‘${T(id).title}’ 끝! 처리한 것으로 옮겼어요.`); }
    if (S.reply?.id === id) S.reply = null;
    render();
    if (S.done.has(id)) mission('done');
  }
  async function typeDraft(text) {
    const token = Symbol(); S.reply.token = token;
    const ta = () => document.getElementById('dm-draft');
    for (let i = 0; i <= text.length; i += 2) {
      if (S.reply?.token !== token) return;
      S.reply.text = text.slice(0, i);
      if (ta()) ta().value = S.reply.text;
      await sleep(14);
    }
    if (S.reply?.token !== token) return;
    S.reply.text = text;
    if (ta()) ta().value = text;
  }
  function startReply(id, intent = 0, v = 0) {
    const set = (REPLIES[id] || REPLY_DEFAULT)[intent];
    S.reply = { id, intent, v, text: '' };
    renderDetail();
    const rb = $('detail').querySelector('.dm-reply');
    if (rb) $('detail').scrollTo({ top: rb.offsetTop - 16, behavior: reduce ? 'auto' : 'smooth' });
    typeDraft(set[1][v % set[1].length]);
    if (id === 'training') mission('reply');
  }

  async function importNotes() {
    if (S.imported || S.busy) return;
    S.busy = true; S.tab = 'todo'; S.query = ''; $('search').value = '';
    render();
    coach();
    for (let i = 0; i < NOTES.length; i++) {
      const n = NOTES[i];
      $('progress').textContent = `쪽지 읽는 중 ${i + 1}/${NOTES.length}`;
      const box = $('inbox'), cur = () => box.querySelector(`[data-note="${n.id}"]`);
      cur()?.classList.add('reading');
      if (cur()) box.scrollTop = Math.max(0, cur().parentElement.offsetTop - box.clientHeight / 2);
      await sleep(280);
      S.read.add(n.id);
      S.revealed.add(n.task);
      renderInbox(); renderTabs(); renderList(); renderGrid();
      cur()?.classList.add('flash');
    }
    S.busy = false; S.imported = true;
    $('inbox').scrollTop = 0;
    $('progress').textContent = '9통 → 할 일 4 · 일정 2 · 확인할 것 1 · 숨김 1';
    render();
    mission('import');
    toast('[재안내] 쪽지는 먼저 온 쪽지와 같은 일로 묶었어요.');
  }

  root.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || !root.contains(b)) return;
    if (b.id === 'dm-import') return importNotes();
    if (b.id === 'dm-restart') { reset(); $('search').value = ''; $('progress').textContent = ''; $('viewer').hidden = true; coachSoon(); render(); $('missions').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return; }
    if (b.dataset.tab) { S.tab = b.dataset.tab; S.query = ''; $('search').value = ''; return render(); }
    if (b.dataset.check) return toggleDone(b.dataset.check);
    if (b.dataset.open) return select(b.dataset.open, !!b.dataset.search);
    if (b.dataset.note) return select(note(b.dataset.note).task);
    if (b.dataset.file) return openFile(note(b.dataset.file));
    if (b.dataset.intent) return startReply(S.reply.id, +b.dataset.intent, 0);
    switch (b.dataset.act) {
      case 'close': S.sel = null; S.reply = null; return render();
      case 'closefile': $('viewer').hidden = true; coachSoon(); return;
      case 'imp': S.important.has(S.sel) ? S.important.delete(S.sel) : S.important.add(S.sel); return render();
      case 'memo': S.memo[S.sel] = ''; render(); $('detail').querySelector('.dm-memo-box')?.focus(); return;
      case 'reply': return startReply(S.sel, 0, 0);
      case 'again': return startReply(S.reply.id, S.reply.intent, S.reply.v + 1);
      case 'copy': {
        const text = document.getElementById('dm-draft')?.value || '';
        try { navigator.clipboard?.writeText(text).catch(() => {}); } catch {}
        if (S.reply) S.reply.copied = true;
        coachSoon();
        toast('복사했어요. 메신저 답장 창에 붙여 넣으면 끝이에요.');
        return;
      }
      case 'project': toast('실제 앱에서는 이 쪽지와 첨부를 Codex나 Claude Code로 넘겨 초안을 맡길 수 있어요.'); return;
    }
  });
  function openFile(n) {
    const v = $('viewer');
    v.replaceChildren();
    const page = el('div', 'dm-page');
    const bar = el('div', 'dm-page-bar');
    bar.append(el('span', 'dm-hwp', '한'), el('span', '', n.file.name));
    const c = btn('dm-x', '×', { act: 'closefile' }); c.setAttribute('aria-label', '양식 닫기');
    bar.append(c);
    const doc = el('div', 'dm-doc');
    doc.append(el('h6', '', n.file.title));
    const tb = el('table');
    n.file.rows.forEach(([k, val]) => { const tr = el('tr'); tr.append(el('th', '', k), el('td', '', val)); tb.append(tr); });
    doc.append(tb);
    page.append(bar, doc, el('p', 'dm-doc-foot', '샘플 양식이에요. 실제 앱에서는 받아 둔 파일이 한글에서 바로 열려요.'));
    v.append(page);
    v.hidden = false;
    c.focus();
    mission('file');
    coachSoon();
  }
  root.addEventListener('input', e => {
    if (e.target.id === 'dm-search') { S.query = e.target.value; renderTabs(); renderList(); renderMissions(); }
    if (e.target.dataset.memo) S.memo[e.target.dataset.memo] = e.target.value;
  });
  root.addEventListener('change', e => { if (e.target.dataset.memo) renderList(); });
  root.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('viewer').hidden) { $('viewer').hidden = true; coachSoon(); return; }
    if (S.sel) { S.sel = null; S.reply = null; render(); }
  });
  $('stage').addEventListener('scroll', () => coach(true), true);
  addEventListener('resize', () => coach(true));
  $('viewer').addEventListener('click', e => { if (e.target === $('viewer')) $('viewer').hidden = true; coachSoon(); });

  $('date').textContent = `${today.getMonth() + 1}월 ${today.getDate()}일 ${WD[today.getDay()]}요일`;
  reset();
  render();
  $('missions').hidden = false;
  $('stage').hidden = false;
  $('note').hidden = false;
})();
