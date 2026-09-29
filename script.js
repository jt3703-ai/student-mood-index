const storageKey = "studentMoodIndex.responses";
const moodLabels = ["Sad", "Bad", "Okay", "Cool", "Happy"];
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const nameInput = document.querySelector("#student-name");
const animation = document.querySelector("#mood-animation");
let animationTimer;
const form = document.querySelector("#mood-form");
const message = document.querySelector("#message");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

// Accept the first version's anonymous scores as well as named check-ins.
function readResponses() {
  const saved = localStorage.getItem(storageKey);
  const responses = saved === null ? [] : JSON.parse(saved);
  if (!Array.isArray(responses)) throw new Error("Invalid saved check-ins");
  return responses.map(response => {
    if (typeof response === "number") response = { name: "Anonymous (earlier version)", score: response };
    if (!response || typeof response.name !== "string" || !response.name.trim() ||
        !Number.isInteger(response.score) || response.score < 1 || response.score > 5) {
      throw new Error("Invalid saved check-in");
    }
    return { name: response.name, score: response.score, recordedAt: response.recordedAt || null, localDate: response.localDate || null };
  });
}

// Recreate the small animation so it also replays for consecutive identical moods.
function playMoodAnimation(score) {
  clearTimeout(animationTimer);
  animation.replaceChildren();
  animation.className = `mood-animation ${moodLabels[score - 1].toLowerCase()}`;
  animation.hidden = false;
  const doodle = form.querySelectorAll(".doodle")[score - 1].cloneNode(true);
  doodle.classList.add("animation-doodle");
  animation.append(doodle);
  animationTimer = setTimeout(() => { animation.hidden = true; }, 3000);
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

// Only the entered name’s records are rendered. Legacy anonymous data stays stored.
function renderTrend(responses) {
  const chart = document.querySelector("#trend-chart");
  const records = document.querySelector("#trend-records");
  const summary = document.querySelector("#trend-summary");
  const interpretation = document.querySelector("#trend-interpretation");
  interpretation.textContent = "";
  interpretation.hidden = true;
  chart.replaceChildren();
  records.replaceChildren();
  const name = normalizeName(nameInput.value);
  if (!name) {
    summary.textContent = "Enter your name above to see your mood history.";
    return;
  }
  // Records are appended in check-in order, including older entries without dates.
  const recent = responses.filter(response =>
    response.name !== "Anonymous (earlier version)" && normalizeName(response.name) === name
  ).slice(-10);
  if (!recent.length) {
    summary.textContent = "No check-ins for this name yet. Your first one starts your trend!";
    return;
  }
  const change = recent[recent.length - 1].score - recent[0].score;
  const direction = change > 0 ? "Going up ↑" : change < 0 ? "Going down ↓" : "Staying similar →";
  summary.textContent = recent.length === 1
    ? "Your first dot! Check in again to start seeing a trend."
    : `${direction} · Latest score compared with the oldest shown: ${recent[0].score} → ${recent[recent.length - 1].score}. Feelings can change along the way.`;
  if (recent.length > 1) {
    interpretation.textContent = change > 0
      ? "Your recent check-ins are trending upward."
      : change < 0
        ? "Your recent check-ins are trending downward."
        : "Your latest mood is similar to your first recent check-in.";
    interpretation.hidden = false;
  }

  // A small SVG line chart needs no chart library.
  const svgNS = "http://www.w3.org/2000/svg";
  function svgElement(tag, attributes, text) {
    const element = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if (text !== undefined) element.textContent = text;
    return element;
  }
  const svg = svgElement("svg", { viewBox: "0 0 560 230", role: "img", "aria-label": `Your mood scores in check-in order: ${recent.map(record => record.score).join(", ")}. Scale 1 to 5.` });
  for (let score = 1; score <= 5; score++) {
    const y = 190 - (score - 1) * 40;
    svg.append(svgElement("line", { x1: 36, x2: 534, y1: y, y2: y, class: "trend-grid" }));
    svg.append(svgElement("text", { x: 16, y: y + 5, class: "trend-label" }, score));
  }
  const points = recent.map((record, index) => ({
    x: recent.length === 1 ? 285 : 46 + index * 478 / (recent.length - 1),
    y: 190 - (record.score - 1) * 40
  }));
  svg.append(svgElement("polyline", { points: points.map(point => `${point.x},${point.y}`).join(" "), class: "trend-line" }));
  recent.forEach((record, index) => {
    const point = points[index];
    svg.append(svgElement("circle", { cx: point.x, cy: point.y, r: 6, class: "trend-dot" }));
    svg.append(svgElement("text", { x: point.x, y: 218, "text-anchor": "middle", class: "trend-label" }, index + 1));
    const date = record.recordedAt ? new Date(record.recordedAt) : null;
    const when = date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : "Earlier check-in · date unavailable";
    const item = document.createElement("li");
    item.textContent = `${when} — ${record.score}/5 ${moodLabels[record.score - 1]}`;
    records.append(item);
  });
  chart.append(svg);
}

function personalRecords(responses) {
  const name = normalizeName(nameInput.value);
  return name ? responses.filter(response => response.name !== "Anonymous (earlier version)" && normalizeName(response.name) === name) : [];
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function recordDay(record) {
  // Preserve the calendar day where a new check-in was made, even after travel.
  if (record.localDate && /^\d{4}-\d{2}-\d{2}$/.test(record.localDate)) return record.localDate;
  const date = record.recordedAt ? new Date(record.recordedAt) : null;
  return date && !Number.isNaN(date.getTime()) ? localDateKey(date) : null;
}

function renderCalendar(responses) {
  const days = document.querySelector("#calendar-days");
  const content = document.querySelector("#calendar-content");
  const note = document.querySelector("#calendar-note");
  days.replaceChildren();
  content.hidden = !normalizeName(nameInput.value);
  if (content.hidden) {
    note.textContent = "Enter your name to see your checked-in days.";
    return;
  }
  const records = personalRecords(responses);
  const byDay = new Map();
  records.forEach(record => { if (recordDay(record)) byDay.set(recordDay(record), record); });
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const monthLabel = calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  document.querySelector("#calendar-month").textContent = monthLabel;
  days.setAttribute("aria-label", `Your check-ins for ${monthLabel}`);
  note.textContent = records.length ? "A little picture of your check-in days." : "Your first check-in will put a mark on your calendar.";
  if (records.some(record => !recordDay(record))) note.textContent += " Older entries without dates are kept in your trend, but cannot be placed on the calendar.";
  for (let i = 0; i < calendarMonth.getDay(); i++) {
    const spacer = document.createElement("li");
    spacer.setAttribute("aria-hidden", "true");
    days.append(spacer);
  }
  const today = localDateKey(new Date());
  for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
    const date = new Date(year, month, day);
    const key = localDateKey(date);
    const record = byDay.get(key);
    const cell = document.createElement("li");
    cell.className = "calendar-day";
    const number = document.createElement("span");
    number.textContent = day;
    cell.append(number);
    let label = date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    if (key === today) { cell.classList.add("today"); label += ", today"; }
    if (record) {
      cell.classList.add(`mood-${record.score}`);
      if (key === today) {
        const check = document.createElement("span");
        check.className = "today-check";
        check.textContent = "✓";
        check.setAttribute("aria-hidden", "true");
        cell.append(check);
      }
      const mark = document.createElement("span");
      mark.className = "day-mark";
      mark.textContent = `${record.score}/5`;
      cell.append(mark);
      label += `, checked in, latest mood: ${moodLabels[record.score - 1]}, ${record.score} out of 5`;
    } else label += ", no saved check-in";
    cell.setAttribute("aria-label", label);
    days.append(cell);
  }
}

function updatePersonalView() {
  // Clear both views before reading so another student's information cannot linger.
  renderTrend([]);
  renderCalendar([]);
  try {
    const responses = readResponses();
    renderTrend(responses);
    renderCalendar(responses);
  } catch {
    document.querySelector("#trend-summary").textContent = "Your history couldn’t be loaded from this browser.";
    document.querySelector("#calendar-note").textContent = "Your calendar couldn’t be loaded from this browser.";
    document.querySelector("#calendar-content").hidden = true;
  }
}

for (const [id, offset] of [["previous-month", -1], ["next-month", 1]]) {
  document.querySelector(`#${id}`).addEventListener("click", () => {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
    updatePersonalView();
  });
}

nameInput.addEventListener("input", () => {
  showMessage("");
  animation.hidden = true;
  form.querySelectorAll('input[name="mood"]').forEach(input => { input.checked = false; });
  calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  updatePersonalView();
});

document.querySelector("#finish").addEventListener("click", () => {
  form.reset();
  showMessage("");
  clearTimeout(animationTimer);
  animation.hidden = true;
  renderTrend([]);
  renderCalendar([]);
  nameInput.focus();
});

form.addEventListener("submit", event => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    showMessage("Please enter your name to check in.", true);
    nameInput.focus();
    return;
  }
  const selected = form.querySelector('input[name="mood"]:checked');
  if (!selected) {
    showMessage("Choose a mood before submitting.", true);
    return;
  }

  try {
    // Read again so another tab's saved responses are included.
    const responses = readResponses();
    const score = Number(selected.value);
    const now = new Date();
    responses.push({ name, score, recordedAt: now.toISOString(), localDate: localDateKey(now) });
    localStorage.setItem(storageKey, JSON.stringify(responses));
    form.reset();
    nameInput.value = name;
    calendarMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    renderTrend(responses);
    renderCalendar(responses);
    showMessage(`Thanks, ${name}! Your check-in has been recorded.`);
    playMoodAnimation(score);
  } catch {
    showMessage("Your mood couldn’t be saved. Check that browser storage is available and try again.", true);
  }
});

updatePersonalView();
