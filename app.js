const STORAGE_KEY = 'careManagementDemoStateV1';

const SAMPLE_TRACKERS = [
  {
    id: 'daily-care',
    title: 'Daily care',
    kind: 'Example routine',
    tasks: [
      { id: 'daily-1', label: 'Morning routine', doneByDay: Array(7).fill(false) },
      { id: 'daily-2', label: 'Hydration check', doneByDay: Array(7).fill(false) },
      { id: 'daily-3', label: 'Evening routine', doneByDay: Array(7).fill(false) }
    ]
  },
  {
    id: 'health-support',
    title: 'Health support',
    kind: 'Example routine',
    tasks: [
      { id: 'health-1', label: 'Planned movement', doneByDay: Array(7).fill(false) },
      { id: 'health-2', label: 'Prepare for an appointment', doneByDay: Array(7).fill(false) },
      { id: 'health-3', label: 'Rest break', doneByDay: Array(7).fill(false) }
    ]
  },
  {
    id: 'home-support',
    title: 'Home support',
    kind: 'Example routine',
    tasks: [
      { id: 'home-1', label: 'Prepare a meal', doneByDay: Array(7).fill(false) },
      { id: 'home-2', label: 'Check household supplies', doneByDay: Array(7).fill(false) },
      { id: 'home-3', label: 'Reset a shared space', doneByDay: Array(7).fill(false) }
    ]
  }
];

const grid = document.getElementById('tracker-grid');
const newTrackerForm = document.getElementById('new-tracker-form');
const resetButton = document.getElementById('reset-demo');
const informationForm = document.getElementById('information-form');
const informationList = document.getElementById('information-records');
const recordType = document.getElementById('record-type');
const cancelEditButton = document.getElementById('cancel-edit');
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekViewButton = document.getElementById('week-view-button');
const checklistViewButton = document.getElementById('checklist-view-button');
const checklistDay = document.getElementById('checklist-day');
const checklistDayControl = document.getElementById('checklist-day-control');
let trackerView = 'week';
let selectedDay = (new Date().getDay() + 6) % 7;

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readTrackers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return SAMPLE_TRACKERS.map((tracker) => ({
        ...tracker,
        tasks: tracker.tasks.map((task) => ({ ...task, doneByDay: [...task.doneByDay] }))
      }));
    }

    const trackers = JSON.parse(saved);
    if (!Array.isArray(trackers)) return SAMPLE_TRACKERS;
    return trackers.map((tracker) => ({
      ...tracker,
      tasks: (Array.isArray(tracker.tasks) ? tracker.tasks : []).map((task) => ({
        ...task,
        doneByDay: Array.isArray(task.doneByDay) && task.doneByDay.length === 7
          ? task.doneByDay.map(Boolean)
          : WEEKDAYS.map((_, index) => Boolean(task.done && index === selectedDay))
      }))
    }));
  } catch {
    return SAMPLE_TRACKERS;
  }
}

function saveTrackers(trackers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackers));
  } catch {
    showStorageNotice();
  }
}

function showStorageNotice() {
  const notice = document.querySelector('.privacy-note p');
  notice.textContent = 'This browser could not save the demo changes. Your information was not sent to a server.';
}

function getWeekDates() {
  const today = new Date();
  const start = new Date(today);
  const mondayOffset = (today.getDay() + 6) % 7;
  start.setDate(today.getDate() - mondayOffset);
  start.setHours(0, 0, 0, 0);
  return WEEKDAYS.map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function updateWeekLabel() {
  const dates = getWeekDates();
  const start = dates[0];
  const end = dates[6];
  const options = { month: 'short', day: 'numeric' };
  document.getElementById('week-label').textContent = `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
}

function getTodayIndex() {
  return (new Date().getDay() + 6) % 7;
}

function renderTrackers() {
  const trackers = readTrackers();
  const weekDates = getWeekDates();
  const todayIndex = getTodayIndex();
  grid.replaceChildren();

  trackers.forEach((tracker) => {
    const card = document.createElement('article');
    card.className = 'tracker-card';

    const heading = document.createElement('div');
    heading.className = 'tracker-card-heading';
    const titleBlock = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = tracker.title;
    const kind = document.createElement('p');
    kind.className = 'tracker-kind';
    kind.textContent = tracker.kind || 'Custom tracker';
    titleBlock.append(title, kind);
    const completedCount = tracker.tasks.reduce((sum, task) => sum + task.doneByDay.filter(Boolean).length, 0);
    const progress = document.createElement('span');
    progress.className = 'progress-count';
    progress.textContent = `${completedCount}/${tracker.tasks.length * 7} this week`;
    heading.append(titleBlock, progress);

    const list = document.createElement('ul');
    list.className = 'task-list';
    if (trackerView === 'week') {
      const scroll = document.createElement('div');
      scroll.className = 'week-table-scroll';
      const table = document.createElement('table');
      table.className = 'week-table';
      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      const taskHeader = document.createElement('th');
      taskHeader.scope = 'col';
      taskHeader.textContent = 'Task';
      headRow.appendChild(taskHeader);

      WEEKDAYS.forEach((day, dayIndex) => {
        const cell = document.createElement('th');
        const isToday = dayIndex === todayIndex;
        cell.scope = 'col';
        cell.className = `week-day-heading${isToday ? ' current-day-heading' : ''}`;
        cell.title = weekDates[dayIndex].toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        if (isToday) cell.setAttribute('aria-current', 'date');
        const dayName = document.createElement('span');
        dayName.className = 'week-day-name';
        dayName.textContent = day;
        const dateNumber = document.createElement('span');
        dateNumber.className = 'week-date-number';
        dateNumber.textContent = String(weekDates[dayIndex].getDate());
        cell.append(dayName, dateNumber);
        if (isToday) {
          const todayTag = document.createElement('span');
          todayTag.className = 'today-tag';
          todayTag.textContent = 'Today';
          cell.appendChild(todayTag);
        }
        headRow.appendChild(cell);
      });

      const totalHeader = document.createElement('th');
      totalHeader.scope = 'col';
      totalHeader.textContent = 'Done';
      headRow.appendChild(totalHeader);
      thead.appendChild(headRow);
      const tbody = document.createElement('tbody');
      tracker.tasks.forEach((task) => {
        const row = document.createElement('tr');
        const name = document.createElement('th');
        name.scope = 'row';
        name.className = 'week-task-name';
        const nameContent = document.createElement('span');
        nameContent.textContent = task.label;
        const remove = document.createElement('button');
        remove.className = 'remove-task';
        remove.type = 'button';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove ${task.label}`);
        remove.addEventListener('click', () => removeTask(tracker.id, task.id));
        name.append(nameContent, remove);
        row.appendChild(name);

        task.doneByDay.forEach((done, dayIndex) => {
          const isToday = dayIndex === todayIndex;
          const cell = document.createElement('td');
          if (isToday) cell.className = 'current-day-column';
          const toggle = document.createElement('button');
          toggle.className = 'week-cell';
          toggle.type = 'button';
          toggle.setAttribute('aria-pressed', String(done));
          const fullDay = weekDates[dayIndex].toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
          toggle.setAttribute('aria-label', `${task.label}, ${fullDay}: ${done ? 'completed' : 'not completed'}`);
          toggle.textContent = done ? '✓' : '';
          toggle.addEventListener('click', () => toggleCompletion(tracker.id, task.id, dayIndex));
          cell.appendChild(toggle);
          row.appendChild(cell);
        });
        const doneCount = document.createElement('td');
        doneCount.className = 'week-row-total';
        doneCount.textContent = String(task.doneByDay.filter(Boolean).length);
        row.appendChild(doneCount);
        tbody.appendChild(row);
      });
      table.append(thead, tbody);
      scroll.appendChild(table);
      card.appendChild(heading);
      card.appendChild(scroll);
    } else {
      list.className = 'task-list checklist-list';
      tracker.tasks.forEach((task) => {
        const row = document.createElement('li');
        const done = task.doneByDay[selectedDay];
        row.className = `task-row${done ? ' is-done' : ''}`;
        const toggle = document.createElement('button');
        toggle.className = 'task-toggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-pressed', String(done));
        toggle.setAttribute('aria-label', `${done ? 'Mark incomplete' : 'Mark complete'}: ${task.label} for ${WEEKDAYS[selectedDay]}`);
        toggle.textContent = done ? '✓' : '';
        toggle.addEventListener('click', () => toggleCompletion(tracker.id, task.id, selectedDay));
        const label = document.createElement('span');
        label.className = 'task-label';
        label.textContent = task.label;
        const remove = document.createElement('button');
        remove.className = 'remove-task';
        remove.type = 'button';
        remove.title = `Remove ${task.label}`;
        remove.setAttribute('aria-label', `Remove ${task.label}`);
        remove.textContent = '×';
        remove.addEventListener('click', () => removeTask(tracker.id, task.id));
        row.append(toggle, label, remove);
        list.appendChild(row);
      });
      card.append(heading, list);
    }

    const addForm = document.createElement('form');
    addForm.className = 'add-task-form';
    const taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.maxLength = 70;
    taskInput.placeholder = 'Add a task';
    taskInput.setAttribute('aria-label', `New task for ${tracker.title}`);
    const addButton = document.createElement('button');
    addButton.className = 'add-task-button';
    addButton.type = 'submit';
    addButton.textContent = '+';
    addButton.setAttribute('aria-label', `Add task to ${tracker.title}`);
    addForm.append(taskInput, addButton);
    addForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const label = taskInput.value.trim();
      if (!label) return;
      const next = readTrackers();
      const current = next.find((item) => item.id === tracker.id);
      current?.tasks.push({ id: createId(), label, doneByDay: Array(7).fill(false) });
      saveTrackers(next);
      renderTrackers();
    });

    const removeTracker = document.createElement('button');
    removeTracker.className = 'remove-tracker';
    removeTracker.type = 'button';
    removeTracker.textContent = 'Remove tracker';
    removeTracker.addEventListener('click', () => {
      const next = readTrackers().filter((item) => item.id !== tracker.id);
      saveTrackers(next);
      renderTrackers();
    });

    card.append(addForm, removeTracker);
    grid.appendChild(card);
  });
}

function toggleCompletion(trackerId, taskId, dayIndex) {
  const trackers = readTrackers();
  const tracker = trackers.find((item) => item.id === trackerId);
  const task = tracker?.tasks.find((item) => item.id === taskId);
  if (task) task.doneByDay[dayIndex] = !task.doneByDay[dayIndex];
  saveTrackers(trackers);
  renderTrackers();
}

function removeTask(trackerId, taskId) {
  const trackers = readTrackers();
  const tracker = trackers.find((item) => item.id === trackerId);
  if (tracker) tracker.tasks = tracker.tasks.filter((task) => task.id !== taskId);
  saveTrackers(trackers);
  renderTrackers();
}

function setTrackerView(view) {
  trackerView = view;
  const weekSelected = view === 'week';
  weekViewButton.classList.toggle('is-selected', weekSelected);
  checklistViewButton.classList.toggle('is-selected', !weekSelected);
  weekViewButton.setAttribute('aria-pressed', String(weekSelected));
  checklistViewButton.setAttribute('aria-pressed', String(!weekSelected));
  checklistDayControl.hidden = weekSelected;
  renderTrackers();
}

WEEKDAYS.forEach((day, index) => {
  const option = document.createElement('option');
  option.value = String(index);
  option.textContent = day;
  option.selected = index === selectedDay;
  checklistDay.appendChild(option);
});
weekViewButton.addEventListener('click', () => setTrackerView('week'));
checklistViewButton.addEventListener('click', () => setTrackerView('checklist'));
checklistDay.addEventListener('change', () => {
  selectedDay = Number(checklistDay.value);
  renderTrackers();
});

function readInformationRecords() {
  try {
    const records = JSON.parse(localStorage.getItem('careManagementDemoInformationV1') || '[]');
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function saveInformationRecords(records) {
  try {
    localStorage.setItem('careManagementDemoInformationV1', JSON.stringify(records));
  } catch {
    showStorageNotice();
  }
}

function setVisibleRecordFields() {
  document.querySelectorAll('.record-fields').forEach((group) => {
    const isActive = group.dataset.fields === recordType.value;
    group.hidden = !isActive;
    const titleField = group.querySelector('input[name="organization"], input[name="medicationName"], input[name="referenceTitle"]');
    if (titleField) titleField.required = isActive;
  });
}

function resetInformationForm() {
  informationForm.reset();
  document.getElementById('record-id').value = '';
  cancelEditButton.hidden = true;
  setVisibleRecordFields();
}

function appendRecordDetail(card, label, value) {
  if (!value) return;
  const detail = document.createElement('p');
  detail.className = 'record-detail';
  const labelText = document.createElement('strong');
  labelText.textContent = `${label}: `;
  detail.append(labelText, document.createTextNode(value));
  card.appendChild(detail);
}

function getRecordFields(type) {
  const names = {
    contact: ['organization', 'person', 'phone', 'address', 'city', 'website', 'notes'],
    medication: ['medicationName', 'strength', 'form', 'schedule', 'prescriber', 'pharmacy', 'medicationNotes'],
    reference: ['referenceTitle', 'location', 'description']
  }[type];
  return Object.fromEntries(names.map((name) => [name, informationForm.elements.namedItem(name).value.trim()]));
}

function createInformationRecord(type, fields, id) {
  const config = {
    contact: {
      label: 'Care contact',
      title: fields.organization || fields.person,
      details: [['Contact person', fields.person], ['Phone', fields.phone], ['Address', [fields.address, fields.city].filter(Boolean).join(', ')], ['Website', fields.website], ['Notes', fields.notes]]
    },
    medication: {
      label: 'Medication reference',
      title: fields.medicationName,
      details: [['Strength', fields.strength], ['Form', fields.form], ['Schedule / directions', fields.schedule], ['Prescriber', fields.prescriber], ['Pharmacy', fields.pharmacy], ['Notes', fields.medicationNotes]]
    },
    reference: {
      label: 'Care reference',
      title: fields.referenceTitle,
      details: [['Location', fields.location], ['Description', fields.description]]
    }
  }[type];
  return { id: id || createId(), type, typeLabel: config.label, title: config.title, fields, details: config.details };
}

function renderInformationRecords() {
  const records = readInformationRecords();
  informationList.replaceChildren();
  document.getElementById('record-count').textContent = `${records.length} ${records.length === 1 ? 'record' : 'records'}`;

  if (!records.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-records';
    empty.textContent = 'No care information saved in this browser yet.';
    informationList.appendChild(empty);
    return;
  }

  records.forEach((record) => {
    const card = document.createElement('article');
    card.className = 'information-record-card';
    const heading = document.createElement('div');
    heading.className = 'information-record-heading';
    const titleGroup = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = record.title;
    const type = document.createElement('p');
    type.className = 'record-type-label';
    type.textContent = record.typeLabel;
    titleGroup.append(title, type);

    const actions = document.createElement('div');
    actions.className = 'record-actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => {
      informationForm.reset();
      Object.entries(record.fields).forEach(([name, value]) => {
        const field = informationForm.elements.namedItem(name);
        if (field) field.value = value;
      });
      document.getElementById('record-id').value = record.id;
      recordType.value = record.type;
      setVisibleRecordFields();
      cancelEditButton.hidden = false;
      informationForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelector(`.record-fields[data-fields="${record.type}"] input`)?.focus({ preventScroll: true });
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => {
      saveInformationRecords(readInformationRecords().filter((savedRecord) => savedRecord.id !== record.id));
      renderInformationRecords();
    });
    actions.append(edit, remove);
    heading.append(titleGroup, actions);
    card.appendChild(heading);
    record.details.forEach(([label, value]) => appendRecordDetail(card, label, value));
    informationList.appendChild(card);
  });
}

recordType.addEventListener('change', setVisibleRecordFields);
cancelEditButton.addEventListener('click', resetInformationForm);
informationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const type = recordType.value;
  const id = document.getElementById('record-id').value;
  const record = createInformationRecord(type, getRecordFields(type), id);
  if (!record.title) return;
  const records = readInformationRecords();
  const index = records.findIndex((item) => item.id === id && id);
  if (index >= 0) records[index] = record;
  else records.unshift(record);
  saveInformationRecords(records);
  resetInformationForm();
  renderInformationRecords();
});

newTrackerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const nameInput = document.getElementById('new-tracker-name');
  const name = nameInput.value.trim();
  if (!name) return;
  const trackers = readTrackers();
  trackers.push({ id: createId(), title: name, kind: 'Custom tracker', tasks: [] });
  saveTrackers(trackers);
  nameInput.value = '';
  renderTrackers();
});

resetButton.addEventListener('click', () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    showStorageNotice();
  }
  renderTrackers();
});

updateWeekLabel();
setVisibleRecordFields();
renderTrackers();
renderInformationRecords();
