const storageKey = "studentMoodIndex.responses";
const moodLabels = ["Sad", "Bad", "Okay", "Cool", "Happy"];
const moodEmojis = ["😢", "😣", "😐", "😎", "😄"];
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
    return { name: response.name, score: response.score };
  });
}

// Recreate the small animation so it also replays for consecutive identical moods.
function playMoodAnimation(score) {
  clearTimeout(animationTimer);
  animation.replaceChildren();
  animation.className = `mood-animation ${moodLabels[score - 1].toLowerCase()}`;
  animation.hidden = false;
  const face = document.createElement("span");
  face.className = "animation-face";
  face.textContent = score === 1 ? "☁️" : moodEmojis[score - 1];
  animation.append(face);
  if (score === 1 || score === 5) {
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement("span");
      particle.className = "particle";
      particle.textContent = score === 1 ? "💧" : "✦";
      particle.style.setProperty("--x", `${10 + i * 18}%`);
      particle.style.setProperty("--delay", `${i * 0.1}s`);
      animation.append(particle);
    }
  }
  animationTimer = setTimeout(() => { animation.hidden = true; }, 3000);
}

function renderResults(responses) {
  const total = responses.length;
  const sum = responses.reduce((sum, response) => sum + response.score, 0);
  document.querySelector("#average").textContent = total ? (sum / total).toFixed(1) : "—";
  document.querySelector("#total").textContent = total;
  document.querySelector("#empty-state").hidden = total > 0;

  const attendance = document.querySelector("#attendance");
  attendance.replaceChildren();
  document.querySelector("#attendance-empty").hidden = total > 0;
  // Newest check-ins appear first. textContent displays names safely as text.
  [...responses].reverse().forEach(response => {
    const row = document.createElement("li");
    const name = document.createElement("span");
    name.className = "student-name";
    name.textContent = response.name;
    const mood = document.createElement("span");
    mood.className = "mood-badge";
    mood.textContent = `${moodEmojis[response.score - 1]} ${moodLabels[response.score - 1]}`;
    row.append(name, mood);
    attendance.append(row);
  });

  const breakdown = document.querySelector("#breakdown");
  breakdown.replaceChildren();
  moodLabels.forEach((label, index) => {
    const count = responses.filter(response => response.score === index + 1).length;
    const row = document.createElement("li");
    const labelRow = document.createElement("div");
    labelRow.className = "bar-label";
    const title = document.createElement("span");
    title.textContent = `${moodEmojis[index]} ${index + 1} · ${label}`;
    const value = document.createElement("span");
    value.textContent = `${count} ${count === 1 ? "response" : "responses"}`;
    labelRow.append(title, value);

    const track = document.createElement("div");
    track.className = "bar-track";
    track.setAttribute("aria-hidden", "true");
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${total ? (count / total) * 100 : 0}%`;
    track.append(fill);
    row.append(labelRow, track);
    breakdown.append(row);
  });
}

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
    responses.push({ name, score });
    localStorage.setItem(storageKey, JSON.stringify(responses));
    renderResults(responses);
    form.reset();
    showMessage(`Thanks, ${name}! Your check-in has been recorded.`);
    playMoodAnimation(score);
  } catch {
    showMessage("Your mood couldn’t be saved. Check that browser storage is available and try again.", true);
  }
});

try {
  renderResults(readResponses());
} catch {
  showMessage("Saved responses couldn’t be loaded. Check that browser storage is available and reload the page.", true);
}
