/* ClinicalToolsDEV – Half Marathon Plan Logger
   - Offline-first PWA + localStorage persistence
   - No DOM inside pure logic helpers where feasible
*/

const STORAGE_KEY = "hm_plan_logger_v1";

/** ---------------------------
 *  PURE DATA (plan structure)
 *  ---------------------------
 * Source: user-provided PDF text.
 * Notes:
 * - Each "workout" is a checkable item.
 * - Labels emphasize zone + duration and mirror plan.
 */

const PLAN = [
  {
    phaseTitle: "PHASE 1: Impact Reintroduction (Weeks 1–4)",
    phaseMeta:
      "Surface: Treadmill Weeks 1–3, transition outdoors Week 4. Goal: rebuild aerobic fitness while reintroducing impact safely.",
    weeks: [
      {
        weekNum: 1,
        summary: "2 runs (20–25 min) + 4 rides (mostly Z2) + 1 recovery",
        focus: "Reintroduce impact, finish every session feeling better than you started.",
        workouts: [
          { id: "w1_run1", name: "Run (Zone 2)", meta: "20–25 min • 120–138 bpm" },
          { id: "w1_bike1", name: "Peloton Endurance (Zone 2)", meta: "40–50 min" },
          { id: "w1_run2", name: "Run (Zone 2)", meta: "20–25 min • 120–138 bpm" },
          { id: "w1_bike2", name: "Peloton Endurance (Zone 2)", meta: "40–50 min" },
          { id: "w1_bike3", name: "Peloton Endurance (Zone 2)", meta: "30–40 min" },
          { id: "w1_bike4", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
        ],
      },
      {
        weekNum: 2,
        summary: "2–3 runs + 4 rides (Z2/Z1)",
        focus: "Slight increase in total run time (≤15%). Optional 3rd run only if Week 1 felt great.",
        workouts: [
          { id: "w2_run1", name: "Run (Zone 2)", meta: "25 min" },
          { id: "w2_bike1", name: "Peloton Endurance (Zone 2)", meta: "45–60 min" },
          { id: "w2_run2", name: "Run (Zone 2)", meta: "25 min" },
          { id: "w2_bike2", name: "Peloton Endurance (Zone 2)", meta: "45–60 min" },
          { id: "w2_bike3", name: "Peloton Endurance (Zone 2)", meta: "30–45 min" },
          { id: "w2_bike4", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
          { id: "w2_run3opt", name: "Optional Run (Zone 2)", meta: "15–20 min (only if Week 1 felt great)" },
        ],
      },
      {
        weekNum: 3,
        summary: "3 runs (incl long 35–40) + 2 rides + 1 recovery",
        focus: "First clearly defined long run; still very easy.",
        workouts: [
          { id: "w3_run1", name: "Run (Zone 2)", meta: "25–30 min" },
          { id: "w3_bike1", name: "Peloton Endurance (Zone 2)", meta: "45–60 min" },
          { id: "w3_run2", name: "Run (Zone 2)", meta: "20–25 min" },
          { id: "w3_bike2", name: "Peloton Endurance (Zone 2)", meta: "45–60 min" },
          { id: "w3_run3long", name: "Long Run (Zone 2)", meta: "35–40 min" },
          { id: "w3_bike3", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
        ],
      },
      {
        weekNum: 4,
        summary: "3 runs (long 40–45) + 2 rides + 1 recovery",
        focus: "Introduce outdoor variability cautiously; slow down more than expected.",
        workouts: [
          { id: "w4_run1", name: "Run (Zone 2)", meta: "30 min" },
          { id: "w4_bike1", name: "Peloton Endurance (Zone 2)", meta: "45–60 min" },
          { id: "w4_run2", name: "Run (Zone 2)", meta: "20–25 min" },
          { id: "w4_bike2", name: "Peloton Endurance (Zone 2)", meta: "45–60 min" },
          { id: "w4_run3long", name: "Long Run (Zone 2)", meta: "40–45 min (treadmill or first outdoor run)" },
          { id: "w4_bike3", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
        ],
      },
    ],
  },

  {
    phaseTitle: "PHASE 2: Continuous Running Capacity (Weeks 5–8)",
    phaseMeta:
      "Surface: Mostly outdoors (treadmill as needed). Goal: build confidence running continuously for longer durations.",
    weeks: [
      {
        weekNum: 5,
        summary: "3 runs (30/35/50) + 2 rides + 1 recovery",
        focus: "Build steady consistency. Keep Zone 2 honest and easy.",
        workouts: [
          { id: "w5_run1", name: "Run (Zone 2)", meta: "30 min" },
          { id: "w5_bike1", name: "Peloton Endurance (Zone 2)", meta: "45–60 min" },
          { id: "w5_run2", name: "Run (Zone 2)", meta: "35 min" },
          { id: "w5_bike2", name: "Peloton Endurance (Zone 2)", meta: "45–60 min" },
          { id: "w5_run3long", name: "Long Run (Zone 2)", meta: "50 min" },
          { id: "w5_bike3", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
        ],
      },
      {
        weekNum: 6,
        summary: "3 runs (30–35/40/60) + 2 rides + 1 recovery",
        focus: "Gradually extend long run. Avoid intensity creep.",
        workouts: [
          { id: "w6_run1", name: "Run (Zone 2)", meta: "30–35 min" },
          { id: "w6_bike1", name: "Peloton Endurance (Zone 2)", meta: "45–60 min" },
          { id: "w6_run2", name: "Run (Zone 2)", meta: "40 min" },
          { id: "w6_bike2", name: "Peloton Endurance (Zone 2)", meta: "45–60 min" },
          { id: "w6_run3long", name: "Long Run (Zone 2)", meta: "60 min" },
          { id: "w6_bike3", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
        ],
      },
      {
        weekNum: 7,
        summary: "3 runs (35/45/70) + rides + optional Z3 bike block",
        focus: "Optional: 5–8 min Zone 3 block on bike only if recovery is excellent.",
        workouts: [
          { id: "w7_run1", name: "Run (Zone 2)", meta: "35 min" },
          { id: "w7_bike1", name: "Peloton Endurance (Zone 2)", meta: "40–55 min" },
          { id: "w7_run2", name: "Run (Zone 2)", meta: "45 min" },
          { id: "w7_bike2opt", name: "Optional Bike Block", meta: "5–8 min Zone 3 (only if recovery excellent)" },
          { id: "w7_run3long", name: "Long Run (Zone 2)", meta: "70 min" },
          { id: "w7_bike3", name: "Peloton Endurance (Zone 2)", meta: "40–55 min (or recovery if needed)" },
        ],
      },
      {
        weekNum: 8,
        summary: "3 runs (35–40/45–50/75) + 1–2 rides + 1 recovery",
        focus: "Longest continuous running so far; confidence-building week.",
        workouts: [
          { id: "w8_run1", name: "Run (Zone 2)", meta: "35–40 min" },
          { id: "w8_bike1", name: "Peloton Endurance (Zone 2)", meta: "40–50 min" },
          { id: "w8_run2", name: "Run (Zone 2)", meta: "45–50 min" },
          { id: "w8_bike2opt", name: "Optional Peloton Endurance (Zone 2)", meta: "40–50 min (if desired)" },
          { id: "w8_run3long", name: "Long Run (Zone 2)", meta: "75 min" },
          { id: "w8_bike3", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
        ],
      },
    ],
  },

  {
    phaseTitle: "PHASE 3: Peak Endurance + Taper (Weeks 9–13)",
    phaseMeta: "Goal: arrive at race day healthy, confident, and aerobically prepared.",
    weeks: [
      {
        weekNum: 9,
        summary: "3 runs (40/50/85) + 1–2 rides + 1 recovery",
        focus: "Keep the long run easy and controlled; prioritize consistency.",
        workouts: [
          { id: "w9_run1", name: "Run (Zone 2)", meta: "40 min" },
          { id: "w9_bike1", name: "Peloton Endurance (Zone 2)", meta: "35–45 min" },
          { id: "w9_run2", name: "Run (Zone 2)", meta: "50 min" },
          { id: "w9_bike2opt", name: "Optional Peloton Endurance (Zone 2)", meta: "35–45 min" },
          { id: "w9_run3long", name: "Long Run (Zone 2)", meta: "85 min" },
          { id: "w9_bike3", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
        ],
      },
      {
        weekNum: 10,
        summary: "Peak: 3–4 runs (no back-to-back) + 2 rides",
        focus: "Peak long run week. Extra short run is optional; protect recovery.",
        workouts: [
          { id: "w10_run1", name: "Run (Zone 2)", meta: "40 min" },
          { id: "w10_bike1", name: "Peloton Endurance (Zone 2)", meta: "30–40 min" },
          { id: "w10_run2", name: "Run (Zone 2)", meta: "50 min" },
          { id: "w10_run3opt", name: "Optional Short Run (Zone 2)", meta: "30 min (not back-to-back with runs)" },
          { id: "w10_run4long", name: "Long Run (Zone 2)", meta: "95–105 min (~9–10 mi equivalent)" },
          { id: "w10_bike2", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
        ],
      },
      {
        weekNum: 11,
        summary: "Step-back: 3 runs + 3 rides",
        focus: "Absorb training. Keep everything easy and restorative.",
        workouts: [
          { id: "w11_run1", name: "Run (Zone 2)", meta: "35–40 min" },
          { id: "w11_bike1", name: "Peloton Endurance (Zone 2)", meta: "35–45 min" },
          { id: "w11_run2", name: "Run (Zone 2)", meta: "45 min" },
          { id: "w11_bike2", name: "Peloton Endurance (Zone 2)", meta: "35–45 min" },
          { id: "w11_run3long", name: "Long Run (Zone 2)", meta: "75–80 min" },
          { id: "w11_bike3", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
        ],
      },
      {
        weekNum: 12,
        summary: "Taper 1: 3 runs + 1–2 rides + 1 recovery",
        focus: "Reduce volume. Keep routine; avoid intensity.",
        workouts: [
          { id: "w12_run1", name: "Run (Zone 2)", meta: "30–35 min" },
          { id: "w12_bike1", name: "Peloton Endurance (Zone 2)", meta: "30–40 min" },
          { id: "w12_run2", name: "Run (Zone 2)", meta: "40 min" },
          { id: "w12_bike2opt", name: "Optional Peloton Endurance (Zone 2)", meta: "30–40 min" },
          { id: "w12_run3long", name: "Long Run (Zone 2)", meta: "60 min" },
          { id: "w12_bike3", name: "Peloton Recovery (Zone 1)", meta: "15–20 min" },
        ],
      },
      {
        weekNum: 13,
        summary: "Race week: 2 short runs + optional shakeout + easy rides + race",
        focus: "Fresh legs, calm confidence, trust the process.",
        workouts: [
          { id: "w13_run1", name: "Short Run (Zone 2)", meta: "20–30 min" },
          { id: "w13_bike1opt", name: "Optional Very Easy Ride (Z1–low Z2)", meta: "20–30 min" },
          { id: "w13_run2", name: "Short Run (Zone 2)", meta: "20–30 min" },
          { id: "w13_run3opt", name: "Optional Shakeout (Zone 1)", meta: "15 min" },
          { id: "w13_bike2opt", name: "Optional Very Easy Ride (Z1–low Z2)", meta: "20–30 min" },
          { id: "w13_race", name: "RACE: Flying Pig Half Marathon", meta: "Run entirely Zone 2 (125–138 bpm)" },
        ],
      },
    ],
  },
];

/** ---------------------------
 *  Storage helpers (pure-ish)
 *  ---------------------------
 */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { logs: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { logs: {} };
    if (!parsed.logs || typeof parsed.logs !== "object") parsed.logs = {};
    return parsed;
  } catch {
    return { logs: {} };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

/** ---------------------------
 *  UI rendering
 *  ---------------------------
 */
const planRoot = document.getElementById("planRoot");
const infoModal = document.getElementById("infoModal");
const infoModalTitle = document.getElementById("infoModalTitle");
const infoModalBody = document.getElementById("infoModalBody");

const logModal = document.getElementById("logModal");
const logForm = document.getElementById("logForm");
const logTitle = document.getElementById("logTitle");
const logSubtitle = document.getElementById("logSubtitle");
const logTime = document.getElementById("logTime");
const logMiles = document.getElementById("logMiles");
const logHR = document.getElementById("logHR");
const logComments = document.getElementById("logComments");
const starsWrap = document.getElementById("stars");

let appState = loadState();

// Active context for logging modal
let activeWorkoutKey = null;
let activeWorkoutLabel = null;
let activeWorkoutMeta = null;

// star value
let activeStars = 0;

function workoutKey(weekNum, workoutId) {
  return `week${weekNum}__${workoutId}`;
}

function formatLog(log) {
  if (!log) return "";
  const stars = "★".repeat(log.quality || 0) + "☆".repeat(5 - (log.quality || 0));
  return `<div class="logline">
    <div><b>Logged:</b> ${escapeHtml(log.time)} • ${escapeHtml(String(log.miles))} mi • ${escapeHtml(String(log.avgHR))} bpm</div>
    <div><b>Quality:</b> ${stars}</div>
    ${log.comments ? `<div><b>Notes:</b> ${escapeHtml(log.comments)}</div>` : ""}
  </div>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

function getAllLogs() {
  return Object.values(appState.logs || {});
}

function getWorkoutTypeFromKey(workoutKey) {
  const key = workoutKey.toLowerCase();

  if (key.includes("run") || key.includes("race")) return "run";
  if (key.includes("bike") || key.includes("peloton")) return "bike";

  return "other";
}

function calcDashboardStats() {
  const logs = getAllLogs();
  if (logs.length === 0) {
    return {
      workouts: 0,
      milesRun: 0,
      milesBike: 0,
      avgHR: null,
      avgQuality: null,
      longestRun: null
    };
  }

  let totalHR = 0;
  let totalQuality = 0;
  let milesRun = 0;
  let milesBike = 0;
  let longestRun = 0;

  entries.forEach(([key, log]) => {
    totalHR += log.avgHR;
    totalQuality += log.quality;

    const type = getWorkoutTypeFromKey(key);

    if (type === "run") {
      milesRun += log.miles;
      if (log.miles > longestRun) longestRun = log.miles;
    }

    if (type === "bike") {
      milesBike += log.miles;
    }
  });

  return {
    workouts: entries.length,
    milesRun,
    milesBike,
    avgHR: Math.round(totalHR / entries.length),
    avgQuality: (totalQuality / entries.length).toFixed(1),
    longestRun
  };
}

function renderDashboard() {
  const stats = calcDashboardStats();

  document.getElementById("dashWorkouts").textContent = stats.workouts;
  document.getElementById("dashMiles").textContent = stats.milesRun.toFixed(1);
  document.getElementById("dashMilesBike").textContent = stats.milesBike.toFixed(1);
  document.getElementById("dashHR").textContent = stats.avgHR ?? "—";
  document.getElementById("dashQuality").textContent =
    stats.avgQuality ? `★ ${stats.avgQuality}` : "—";
  document.getElementById("dashLongest").textContent =
    stats.longest ? `${stats.longest.toFixed(1)} mi` : "—";
}

function calcWeekProgress(week) {
  const total = week.workouts.length;
  let completed = 0;

  week.workouts.forEach(w => {
    const key = workoutKey(week.weekNum, w.id);
    if (appState.logs[key]) completed++;
  });

  return { completed, total };
}

function renderPlan() {
  planRoot.innerHTML = "";

  PLAN.forEach((phase) => {
    const phaseTitle = document.createElement("h3");
    phaseTitle.className = "phase-title";
    phaseTitle.textContent = phase.phaseTitle;

    const phaseMeta = document.createElement("p");
    phaseMeta.className = "phase-meta";
    phaseMeta.textContent = phase.phaseMeta;

    planRoot.appendChild(phaseTitle);
    planRoot.appendChild(phaseMeta);

    phase.weeks.forEach((week) => {
      const details = document.createElement("details");
      details.className = "week";

      const summary = document.createElement("summary");
      summary.innerHTML = `
        <div class="week-title">
          <b>Week ${week.weekNum}</b>
          <span>${escapeHtml(week.summary)}</span>
        </div>
        <div class="chev">▾</div>
      `;

      const body = document.createElement("div");
      body.className = "week-body";

      const focus = document.createElement("p");
      focus.className = "week-focus";
      focus.textContent = week.focus || "";

      const progress = calcWeekProgress(week);
      const pct = Math.round((progress.completed / progress.total) * 100);

      const progressWrap = document.createElement("div");
      progressWrap.className = "week-progress";
      progressWrap.innerHTML = `
        <div class="week-progress-bar">
          <div class="week-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="week-progress-text">
          ${progress.completed} / ${progress.total} workouts completed
        </div>
      `;

      body.appendChild(progressWrap);

      const workouts = document.createElement("div");
      workouts.className = "workouts";

      week.workouts.forEach((w) => {
        const key = workoutKey(week.weekNum, w.id);
        const log = appState.logs[key];

        const item = document.createElement("div");
        item.className = "workout" + (log ? " completed" : "");
        item.dataset.key = key;

        const checkboxId = `cb_${key}`;

        item.innerHTML = `
          <div class="workout-row">
            <input type="checkbox" id="${checkboxId}" ${log ? "checked" : ""} />
            <label class="workout-label" for="${checkboxId}">
              <div class="name">${escapeHtml(w.name)}</div>
              <div class="meta">${escapeHtml(w.meta || "")}</div>
            </label>
          </div>
          ${log ? formatLog(log) : ""}
        `;

        const cb = item.querySelector("input[type='checkbox']");
        cb.addEventListener("click", (e) => {
          // If already logged, don’t allow uncheck by tapping checkbox.
          // To "undo", user can reset plan (simple + safer).
          if (appState.logs[key]) {
            e.preventDefault();
            e.stopPropagation();
            toast("Already logged. Use Reset to clear all data.");
            return;
          }
          // Prevent immediate check; we only check after successful log save
          e.preventDefault();
          e.stopPropagation();
          openLogModal(week.weekNum, w);
        });

        workouts.appendChild(item);
      });

      body.appendChild(focus);
      body.appendChild(workouts);

      details.appendChild(summary);
      details.appendChild(body);
      planRoot.appendChild(details);
    });
  });
}

/** ---------------------------
 *  Modals: Info
 *  ---------------------------
 */
function openInfo(title, html) {
  infoModalTitle.textContent = title;
  infoModalBody.innerHTML = html;
  infoModal.showModal();
}

function closeInfo() {
  infoModal.close();
}

/** ---------------------------
 *  Modals: Log workout
 *  ---------------------------
 */
function renderStars(initial = 0) {
  starsWrap.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "star-btn";
    btn.textContent = "★";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", i === initial ? "true" : "false");
    btn.dataset.value = String(i);
    btn.addEventListener("click", () => {
      activeStars = i;
      // update aria-checked
      [...starsWrap.querySelectorAll(".star-btn")].forEach((b) => {
        b.setAttribute("aria-checked", b.dataset.value === String(i) ? "true" : "false");
      });
    });
    starsWrap.appendChild(btn);
  }
}

function openLogModal(weekNum, workout) {
  activeWorkoutKey = workoutKey(weekNum, workout.id);
  activeWorkoutLabel = workout.name;
  activeWorkoutMeta = workout.meta || "";

  // reset fields
  logTime.value = "";
  logMiles.value = "";
  logHR.value = "";
  logComments.value = "";
  activeStars = 0;
  renderStars(0);

  logTitle.textContent = `Log: ${activeWorkoutLabel}`;
  logSubtitle.textContent = `Week ${weekNum} • ${activeWorkoutMeta}`;

  logModal.showModal();
  // focus first field for mobile
  setTimeout(() => logTime.focus(), 50);
}

function closeLogModal() {
  logModal.close();
  activeWorkoutKey = null;
}

/** ---------------------------
 *  Save log
 *  ---------------------------
 */
function validateLogInputs() {
  const time = logTime.value.trim();
  const miles = Number(logMiles.value);
  const hr = Number(logHR.value);

  if (!time) return { ok: false, message: "Please enter workout time." };
  if (!Number.isFinite(miles) || miles <= 0) return { ok: false, message: "Please enter a valid distance (miles)." };
  if (!Number.isFinite(hr) || hr < 40 || hr > 250) return { ok: false, message: "Please enter a valid avg HR (40–250 bpm)." };
  if (!(activeStars >= 1 && activeStars <= 5)) return { ok: false, message: "Please select workout quality (1–5 stars)." };

  return { ok: true };
}

function saveWorkoutLog() {
  const check = validateLogInputs();
  if (!check.ok) {
    toast(check.message);
    return;
  }

  const log = {
    time: logTime.value.trim(),
    miles: Number(logMiles.value),
    avgHR: Number(logHR.value),
    quality: activeStars,
    comments: logComments.value.trim(),
    savedAt: new Date().toISOString(),
  };

  appState.logs[activeWorkoutKey] = log;
  saveState(appState);
  closeLogModal();
  renderPlan();
  toast("Saved ✅");
}

/** ---------------------------
 *  Simple toast
 *  ---------------------------
 */
let toastTimer = null;
function toast(msg) {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.id = "toast";
  el.textContent = msg;
  el.style.position = "fixed";
  el.style.left = "50%";
  el.style.bottom = "18px";
  el.style.transform = "translateX(-50%)";
  el.style.padding = "10px 12px";
  el.style.borderRadius = "999px";
  el.style.border = "1px solid rgba(47,59,92,0.9)";
  el.style.background = "rgba(16,21,34,0.92)";
  el.style.color = "white";
  el.style.zIndex = "99";
  el.style.maxWidth = "min(520px, calc(100vw - 24px))";
  el.style.textAlign = "center";
  el.style.fontSize = "0.9rem";
  document.body.appendChild(el);

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.remove();
  }, 1800);
}

/** ---------------------------
 *  Info content
 *  ---------------------------
 */
function getRunnerInfoHtml() {
  return `
    <ul>
      <li><b>Age:</b> 36</li>
      <li><b>Estimated Max HR:</b> 184 bpm</li>
      <li><b>Primary goal:</b> Run the entire half marathon continuously</li>
      <li><b>Secondary goal:</b> Build a durable aerobic base for future marathon training</li>
      <li><b>Constraints:</b> Prior overuse injuries, higher current body weight, prefers cross-training (Peloton), treadmill → outdoor transition</li>
    </ul>
    <p class="muted small">Edit these later if you want personalization fields.</p>
  `;
}

function getHRZonesHtml() {
  return `
    <p><b>Heart Rate Zones (based on estimated max HR 184 bpm)</b></p>
    <ul>
      <li><b>Zone 1 (Recovery, 55–65%):</b> 101–120 bpm — very easy, restorative</li>
      <li><b>Zone 2 (Aerobic, 65–75%):</b> 120–138 bpm — easy conversational pace (primary training zone)</li>
      <li><b>Zone 3 (Tempo, 75–85%):</b> 138–156 bpm — controlled hard (used very sparingly here)</li>
      <li><b>Zone 4 (Threshold, 85–92%):</b> 156–169 bpm — hard/sustained (not used in this plan)</li>
      <li><b>Zone 5 (VO₂, 92–100%):</b> 169–184 bpm — very hard (not used in this plan)</li>
    </ul>
    <p class="muted small">If you want, I can add a settings screen to change Max HR and auto-recalculate zones.</p>
  `;
}

function getWeeklyStructureHtml() {
  return `
    <p><b>Weekly Training Structure (applies to entire plan)</b></p>
    <ul>
      <li>No fixed weekdays required</li>
      <li>Each week includes: 2–3 Zone 2 runs, 3–4 Peloton rides (mostly Zone 2), plus a short Zone 1 recovery session</li>
      <li>Cardio most days; impact carefully controlled</li>
    </ul>
    <p><b>General Weekly Order (flexible)</b></p>
    <ol>
      <li>Short run (Zone 2)</li>
      <li>Bike endurance (Zone 2)</li>
      <li>Medium run (Zone 2)</li>
      <li>Bike endurance or recovery</li>
      <li>Long run (Zone 2)</li>
      <li>Bike recovery or endurance</li>
      <li>Optional rest / mobility</li>
    </ol>
  `;
}

/** ---------------------------
 *  Reset confirmation
 *  ---------------------------
 */
const confirmModal = document.getElementById("confirmModal");

function openConfirmReset() {
  confirmModal.showModal();
}
function closeConfirmReset() {
  confirmModal.close();
}

function doReset() {
  clearState();
  appState = loadState();
  closeConfirmReset();
  renderPlan();
  toast("All data cleared.");
}

/** ---------------------------
 *  Wire up UI events
 *  ---------------------------
 */
document.getElementById("btnRunnerInfo").addEventListener("click", () => {
  openInfo("Runner Info", getRunnerInfoHtml());
});
document.getElementById("btnHRZones").addEventListener("click", () => {
  openInfo("HR Zones", getHRZonesHtml());
});
document.getElementById("btnWeeklyStructure").addEventListener("click", () => {
  openInfo("Weekly Training Structure", getWeeklyStructureHtml());
});

document.getElementById("btnCloseInfo").addEventListener("click", closeInfo);
document.getElementById("btnInfoOk").addEventListener("click", closeInfo);

document.getElementById("btnCloseLog").addEventListener("click", closeLogModal);
document.getElementById("btnCancelLog").addEventListener("click", closeLogModal);

logForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveWorkoutLog();
});

document.getElementById("btnReset").addEventListener("click", openConfirmReset);
document.getElementById("btnCloseConfirm").addEventListener("click", closeConfirmReset);
document.getElementById("btnCancelReset").addEventListener("click", closeConfirmReset);
document.getElementById("btnConfirmReset").addEventListener("click", doReset);

/** ---------------------------
 *  PWA service worker
 *  ---------------------------
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch (err) {
      // Non-fatal
      console.warn("SW registration failed", err);
    }
  });
}

// Initial render
renderPlan(),
renderDashboard();

