// ============================================================
// JobFind frontend — vanilla JS, no build step required.
// Talks to the Spring Boot backend at API_BASE_URL (see config.js)
// ============================================================

const state = {
  token: null,
  email: null,
  role: null,
  name: null,
};

// ---------------- utilities ----------------

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function showToast(message, type = "") {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.className = "toast show " + type;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (el.className = "toast " + type), 2800);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function titleCase(s) {
  if (!s) return "";
  return s
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function initials(name, email) {
  const src = (name || email || "?").trim();
  const parts = src.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

const JOB_TYPES = ["INTERNSHIP", "EXPERIENCE", "FULLTIME", "CONTRACTUAL", "PARTTIME", "FREELANCING"];

// ---------------- session ----------------

function persistSession(token) {
  localStorage.setItem("jf_token", token);
  const payload = decodeJwt(token);
  state.token = token;
  state.email = payload?.sub || null;
  state.role = payload?.role || null;
}

function loadSession() {
  const token = localStorage.getItem("jf_token");
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    localStorage.removeItem("jf_token");
    return false;
  }
  state.token = token;
  state.email = payload.sub;
  state.role = payload.role;
  return true;
}

function logout() {
  localStorage.removeItem("jf_token");
  state.token = null;
  state.email = null;
  state.role = null;
  state.name = null;
  document.getElementById("view-shell").classList.remove("active");
  document.getElementById("view-auth").classList.add("active");
}

// ---------------- navigation ----------------

const NAV = {
  JOBSEEKER: [
    { key: "browse", label: "Browse jobs", icon: "🔎" },
    { key: "applications", label: "My applications", icon: "📄" },
    { key: "profile", label: "My profile", icon: "🙍" },
  ],
  RECRUITER: [
    { key: "post-job", label: "Post a job", icon: "➕" },
    { key: "my-jobs", label: "My job posts", icon: "🗂" },
    { key: "applicants", label: "Applicants", icon: "👥" },
    { key: "profile", label: "Company profile", icon: "🏢" },
  ],
  ADMIN: [{ key: "dashboard", label: "Dashboard", icon: "📊" }],
};

const PAGE_TITLES = {
  browse: "Browse jobs",
  applications: "My applications",
  profile: "My profile",
  "post-job": "Post a job",
  "my-jobs": "My job posts",
  applicants: "Applicants",
  dashboard: "Dashboard",
};

let currentView = null;

function renderNav() {
  const items = NAV[state.role] || [];
  const nav = document.getElementById("side-nav");
  nav.innerHTML = items
    .map(
      (item) => `
    <button class="nav-item" data-view="${item.key}">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </button>`
    )
    .join("");

  nav.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.view));
  });

  document.getElementById("user-avatar").textContent = initials(state.name, state.email);
  document.getElementById("user-name").textContent = state.name || state.email || "—";
  document.getElementById("user-role").textContent = titleCase(state.role || "");
}

async function navigateTo(key) {
  currentView = key;
  document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === key));
  document.getElementById("page-title").textContent = PAGE_TITLES[key] || "";
  const content = document.getElementById("content");
  content.innerHTML = `<div class="empty-state">Loading…</div>`;

  try {
    const renderer = VIEWS[key];
    if (renderer) await renderer();
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div>${escapeHtml(err.message)}</div>`;
  }
}

// ---------------- auth screen wiring ----------------

function setupAuthScreen() {
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".auth-form").forEach((f) => f.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("form-" + tab.dataset.tab).classList.add("active");
    });
  });

  document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("login-msg");
    msg.textContent = "";
    msg.className = "form-msg";
    try {
      const token = await Api.post("/api/auth/login", {
        userEmail: document.getElementById("login-email").value.trim(),
        password: document.getElementById("login-password").value,
      });
      persistSession(token);
      await enterApp();
    } catch (err) {
      msg.textContent = err.message;
      msg.className = "form-msg error";
    }
  });

  document.getElementById("form-register").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("register-msg");
    msg.textContent = "";
    msg.className = "form-msg";
    try {
      const res = await Api.post("/api/auth/register", {
        userName: document.getElementById("reg-name").value.trim(),
        userEmail: document.getElementById("reg-email").value.trim(),
        password: document.getElementById("reg-password").value,
        role: document.getElementById("reg-role").value,
      });
      persistSession(res.token);
      state.name = document.getElementById("reg-name").value.trim();
      await enterApp();
    } catch (err) {
      msg.textContent = err.message;
      msg.className = "form-msg error";
    }
  });

  document.getElementById("btn-logout").addEventListener("click", logout);
}

async function enterApp() {
  document.getElementById("view-auth").classList.remove("active");
  document.getElementById("view-shell").classList.add("active");

  // Try to fill in a display name from the role-specific profile, if one exists.
  if (!state.name) {
    try {
      if (state.role === "JOBSEEKER") {
        const profile = await Api.get(`/api/job_Seekers/email/${encodeURIComponent(state.email)}`);
        if (profile) state.name = profile.fullName;
      } else if (state.role === "RECRUITER") {
        const profile = await Api.get(`/api/recruiters/email/${encodeURIComponent(state.email)}`);
        if (profile) state.name = profile.recruiterName;
      }
    } catch (e) {
      /* no profile yet — fine */
    }
  }

  renderNav();
  const first = (NAV[state.role] && NAV[state.role][0].key) || "browse";
  await navigateTo(first);
}

// ---------------- views ----------------

const VIEWS = {};

// --- Job seeker: browse jobs ---
VIEWS.browse = async function () {
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="search-bar">
      <input type="text" id="search-q" placeholder="Search by job title, company, or location…">
      <select id="search-type">
        <option value="">All job types</option>
        ${JOB_TYPES.map((t) => `<option value="${t}">${titleCase(t)}</option>`).join("")}
      </select>
      <button class="btn btn-ghost" id="search-go">Search</button>
      <button class="btn btn-ghost" id="search-clear">Clear</button>
    </div>
    <div id="job-grid" class="grid grid-cards"></div>
  `;

  async function loadAll() {
    const jobs = await Api.get("/api/jobPost/all");
    renderJobs(jobs);
  }

  function renderJobs(jobs) {
    const grid = document.getElementById("job-grid");
    const active = (jobs || []).filter((j) => j.active !== false);
    if (!active.length) {
      grid.innerHTML = `<div class="empty-state"><div class="emoji">🗒️</div>No jobs match yet. Try a different search.</div>`;
      return;
    }
    grid.innerHTML = active.map(jobCardHtml).join("");
    grid.querySelectorAll("[data-apply]").forEach((btn) => {
      btn.addEventListener("click", () => applyToJob(JSON.parse(btn.dataset.apply)));
    });
  }

  function jobCardHtml(j) {
    const canApply = state.role === "JOBSEEKER";
    return `
      <div class="job-card type-${j.jobType || ""}">
        <h3>${escapeHtml(j.jobTitle)}</h3>
        <div class="company">${escapeHtml(j.companyName)}</div>
        <div class="meta">
          <span class="badge">${titleCase(j.jobType)}</span>
          <span class="badge">${escapeHtml(j.jobLocation || "—")}</span>
          ${j.remote ? `<span class="badge">${escapeHtml(j.remote)}</span>` : ""}
        </div>
        <div class="desc">${escapeHtml(j.jobDescription || "")}</div>
        <div class="card-actions">
          ${
            canApply
              ? `<button class="btn btn-primary btn-sm" data-apply='${escapeHtml(JSON.stringify(j))}'>Apply now</button>`
              : ""
          }
        </div>
      </div>`;
  }

  document.getElementById("search-go").addEventListener("click", async () => {
    const q = document.getElementById("search-q").value.trim();
    const type = document.getElementById("search-type").value;
    try {
      let results = [];
      if (type) {
        results = await Api.get(`/api/jobPost/search/type/${encodeURIComponent(type)}`);
      } else if (q) {
        // Try title, then company, then location — merge unique results.
        const [byTitle, byCompany, byLocation] = await Promise.allSettled([
          Api.get(`/api/jobPost/search/title/${encodeURIComponent(q)}`),
          Api.get(`/api/jobPost/search/company/${encodeURIComponent(q)}`),
          Api.get(`/api/jobPost/search/location/${encodeURIComponent(q)}`),
        ]);
        const merged = new Map();
        [byTitle, byCompany, byLocation].forEach((r) => {
          if (r.status === "fulfilled") (r.value || []).forEach((j) => merged.set(j.id, j));
        });
        results = Array.from(merged.values());
      } else {
        results = await Api.get("/api/jobPost/all");
      }
      renderJobs(results);
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  document.getElementById("search-clear").addEventListener("click", () => {
    document.getElementById("search-q").value = "";
    document.getElementById("search-type").value = "";
    loadAll();
  });

  await loadAll();
};

async function applyToJob(job) {
  if (!confirm(`Apply to ${job.jobTitle} at ${job.companyName}?`)) return;
  try {
    await Api.post("/api/applications/apply", {
      jobseekerName: state.name || state.email,
      jobSeekerEmail: state.email,
      recruiterEmail: job.postedBy,
      jobId: job.id,
      jobTitle: job.jobTitle,
      jobType: job.jobType,
      status: "APPLIED",
      appliedAt: new Date().toISOString(),
    });
    showToast("Application submitted!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// --- Job seeker: my applications ---
VIEWS.applications = async function () {
  const content = document.getElementById("content");
  const apps = await Api.get(`/api/applications/jobSeeker?jobSeekerEmail=${encodeURIComponent(state.email)}`);

  if (!apps || !apps.length) {
    content.innerHTML = `<div class="empty-state"><div class="emoji">📭</div>You haven't applied to anything yet. Browse jobs to get started.</div>`;
    return;
  }

  const STEPS = ["APPLIED", "SHORTLISTED"]; // REJECTED branches off from APPLIED
  content.innerHTML = `
    <div class="grid grid-cards">
      ${apps
        .map((a) => {
          const status = a.status || "APPLIED";
          const rejected = status === "REJECTED";
          return `
        <div class="job-card type-${a.jobType || ""}">
          <h3>${escapeHtml(a.jobTitle)}</h3>
          <div class="company">Applied ${fmtDate(a.appliedAt)}</div>
          <div class="pipeline status-${status}">
            <div class="pipeline-step done">
              <div class="pipeline-dot"></div>
            </div>
            <div class="pipeline-line ${status !== "APPLIED" ? "done" : ""}"></div>
            <div class="pipeline-step ${status !== "APPLIED" ? "done" : ""}">
              <div class="pipeline-dot"></div>
            </div>
          </div>
          <span class="badge badge-${status.toLowerCase()}">${titleCase(status)}</span>
        </div>`;
        })
        .join("")}
    </div>
  `;
};

// --- Job seeker: profile ---
VIEWS.profile = async function () {
  const content = document.getElementById("content");

  if (state.role === "JOBSEEKER") {
    let profile = null;
    try {
      profile = await Api.get(`/api/job_Seekers/email/${encodeURIComponent(state.email)}`);
    } catch (e) {}

    content.innerHTML = `
      <div class="panel" style="max-width:640px">
        ${profile ? `<p class="form-msg success">Profile on file. Fields below can be resubmitted to update your resume link.</p>` : ""}
        <form id="form-profile" class="form-grid">
          <label class="full">Full name
            <input type="text" id="p-name" required value="${escapeHtml(profile?.fullName || state.name || "")}">
          </label>
          <label>Phone
            <input type="text" id="p-phone" value="${escapeHtml(profile?.phone || "")}">
          </label>
          <label>College name
            <input type="text" id="p-college" value="${escapeHtml(profile?.colleageName || "")}">
          </label>
          <label>University name
            <input type="text" id="p-university" value="${escapeHtml(profile?.universityName || "")}">
          </label>
          <label>Degree
            <input type="text" id="p-degree" value="${escapeHtml(profile?.degree || "")}">
          </label>
          <label>Passing year
            <input type="date" id="p-passing" value="${escapeHtml(profile?.passingYear || "")}">
          </label>
          <label class="full">Resume URL
            <input type="text" id="p-resume" placeholder="Paste a link to your resume" value="${escapeHtml(profile?.resumeURL || "")}">
          </label>
          <div class="full">
            <button class="btn btn-primary" type="submit">${profile ? "Update" : "Create"} profile</button>
          </div>
          <p class="form-msg full" id="profile-msg"></p>
        </form>
      </div>
    `;

    document.getElementById("form-profile").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = document.getElementById("profile-msg");
      try {
        await Api.post("/api/job_Seekers", {
          fullName: document.getElementById("p-name").value.trim(),
          email: state.email,
          phone: document.getElementById("p-phone").value.trim(),
          colleageName: document.getElementById("p-college").value.trim(),
          universityName: document.getElementById("p-university").value.trim(),
          degree: document.getElementById("p-degree").value.trim(),
          passingYear: document.getElementById("p-passing").value || null,
          resumeURL: document.getElementById("p-resume").value.trim(),
          active: true,
        });
        state.name = document.getElementById("p-name").value.trim();
        renderNav();
        msg.textContent = "Saved!";
        msg.className = "form-msg success";
        showToast("Profile saved", "success");
      } catch (err) {
        msg.textContent = err.message;
        msg.className = "form-msg error";
      }
    });
  } else if (state.role === "RECRUITER") {
    await renderRecruiterProfile(content);
  }
};

async function renderRecruiterProfile(content) {
  let profile = null;
  try {
    profile = await Api.get(`/api/recruiters/email/${encodeURIComponent(state.email)}`);
  } catch (e) {}

  content.innerHTML = `
    <div class="panel" style="max-width:640px">
      ${profile ? `<p class="form-msg success">Company profile on file.</p>` : ""}
      <form id="form-rec-profile" class="form-grid">
        <label class="full">Recruiter name
          <input type="text" id="r-name" required value="${escapeHtml(profile?.recruiterName || state.name || "")}">
        </label>
        <label>Phone
          <input type="text" id="r-phone" value="${escapeHtml(profile?.phone || "")}">
        </label>
        <label>Designation
          <input type="text" id="r-designation" value="${escapeHtml(profile?.designation || "")}">
        </label>
        <label class="full">Company name
          <input type="text" id="r-company" required value="${escapeHtml(profile?.companyName || "")}">
        </label>
        <div class="full">
          <button class="btn btn-primary" type="submit">${profile ? "Update" : "Create"} profile</button>
        </div>
        <p class="form-msg full" id="rec-profile-msg"></p>
      </form>
    </div>
  `;

  document.getElementById("form-rec-profile").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("rec-profile-msg");
    try {
      await Api.post("/api/recruiters", {
        recruiterName: document.getElementById("r-name").value.trim(),
        recruiterEmail: state.email,
        phone: document.getElementById("r-phone").value.trim(),
        companyName: document.getElementById("r-company").value.trim(),
        designation: document.getElementById("r-designation").value.trim(),
      });
      state.name = document.getElementById("r-name").value.trim();
      renderNav();
      msg.textContent = "Saved!";
      msg.className = "form-msg success";
      showToast("Profile saved", "success");
    } catch (err) {
      msg.textContent = err.message;
      msg.className = "form-msg error";
    }
  });
}

// --- Recruiter: post a job ---
VIEWS["post-job"] = async function () {
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="panel" style="max-width:680px">
      <form id="form-post-job" class="form-grid">
        <label class="full">Job title
          <input type="text" id="j-title" required placeholder="e.g. Frontend Engineer">
        </label>
        <label>Job type
          <select id="j-type">
            ${JOB_TYPES.map((t) => `<option value="${t}">${titleCase(t)}</option>`).join("")}
          </select>
        </label>
        <label>Remote / onsite
          <select id="j-remote">
            <option value="Remote">Remote</option>
            <option value="Onsite">Onsite</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </label>
        <label>Company name
          <input type="text" id="j-company" required>
        </label>
        <label>Location
          <input type="text" id="j-location" placeholder="e.g. Chennai, India">
        </label>
        <label class="full">Category
          <input type="text" id="j-category" placeholder="e.g. Engineering">
        </label>
        <label class="full">Description
          <textarea id="j-desc" placeholder="Role responsibilities, requirements…"></textarea>
        </label>
        <div class="full">
          <button class="btn btn-primary" type="submit">Post job</button>
        </div>
        <p class="form-msg full" id="post-job-msg"></p>
      </form>
    </div>
  `;

  document.getElementById("form-post-job").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("post-job-msg");
    try {
      await Api.post("/api/jobPost", {
        jobTitle: document.getElementById("j-title").value.trim(),
        jobType: document.getElementById("j-type").value,
        jobLocation: document.getElementById("j-location").value.trim(),
        remote: document.getElementById("j-remote").value,
        companyName: document.getElementById("j-company").value.trim(),
        jobCategory: document.getElementById("j-category").value.trim(),
        jobDescription: document.getElementById("j-desc").value.trim(),
        postedBy: state.email,
      });
      showToast("Job posted!", "success");
      document.getElementById("form-post-job").reset();
    } catch (err) {
      msg.textContent = err.message;
      msg.className = "form-msg error";
    }
  });
};

// --- Recruiter: my job posts ---
VIEWS["my-jobs"] = async function () {
  const content = document.getElementById("content");
  const jobs = await Api.get(`/api/jobPost/postedBy?postedBy=${encodeURIComponent(state.email)}`);

  if (!jobs || !jobs.length) {
    content.innerHTML = `<div class="empty-state"><div class="emoji">🗂</div>You haven't posted any jobs yet.</div>`;
    return;
  }

  content.innerHTML = `
    <div class="grid grid-cards">
      ${jobs
        .map(
          (j) => `
        <div class="job-card type-${j.jobType || ""}">
          <h3>${escapeHtml(j.jobTitle)}</h3>
          <div class="company">${escapeHtml(j.companyName)}</div>
          <div class="meta">
            <span class="badge">${titleCase(j.jobType)}</span>
            <span class="badge">${j.active === false ? "Closed" : "Active"}</span>
          </div>
          <div class="card-actions">
            ${
              j.active === false
                ? ""
                : `<button class="btn btn-danger btn-sm" data-close="${j.id}">Close listing</button>`
            }
          </div>
        </div>`
        )
        .join("")}
    </div>
  `;

  content.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Close this job listing?")) return;
      try {
        await Api.post(`/api/jobPost/close/${btn.dataset.close}`);
        showToast("Job closed", "success");
        VIEWS["my-jobs"]();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });
};

// --- Recruiter: applicants ---
VIEWS.applicants = async function () {
  const content = document.getElementById("content");
  const apps = await Api.get(`/api/applications/recruiter?recruiterEmail=${encodeURIComponent(state.email)}`);

  if (!apps || !apps.length) {
    content.innerHTML = `<div class="empty-state"><div class="emoji">👥</div>No applicants yet.</div>`;
    return;
  }

  content.innerHTML = `
    <div class="panel">
      <table>
        <thead>
          <tr><th>Candidate</th><th>Job</th><th>Applied</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          ${apps
            .map(
              (a) => `
            <tr data-row="${a.id}">
              <td>${escapeHtml(a.jobseekerName || a.jobSeekerEmail)}</td>
              <td>${escapeHtml(a.jobTitle)}</td>
              <td>${fmtDate(a.appliedAt)}</td>
              <td><span class="badge badge-${(a.status || "applied").toLowerCase()}">${titleCase(a.status)}</span></td>
              <td>
                <select data-status-select style="width:auto;display:inline-block;padding:6px 8px;">
                  <option value="APPLIED" ${a.status === "APPLIED" ? "selected" : ""}>Applied</option>
                  <option value="SHORTLISTED" ${a.status === "SHORTLISTED" ? "selected" : ""}>Shortlisted</option>
                  <option value="REJECTED" ${a.status === "REJECTED" ? "selected" : ""}>Rejected</option>
                </select>
                <button class="btn btn-ghost btn-sm" data-save="${a.id}">Save</button>
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  content.querySelectorAll("[data-save]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest("tr");
      const status = row.querySelector("[data-status-select]").value;
      try {
        await Api.post(`/api/applications/update-status?id=${btn.dataset.save}&status=${status}`);
        showToast("Status updated", "success");
        VIEWS.applicants();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  });
};

// --- Admin: dashboard ---
VIEWS.dashboard = async function () {
  const content = document.getElementById("content");
  const [jobs, applications, users, courses, subscription] = await Promise.allSettled([
    Api.get("/api/dashboard/jobs"),
    Api.get("/api/dashboard/applications"),
    Api.get("/api/dashboard/users"),
    Api.get("/api/dashboard/courses"),
    Api.get("/api/dashboard/subscription"),
  ]);

  const j = jobs.status === "fulfilled" ? jobs.value || {} : {};
  const a = applications.status === "fulfilled" ? applications.value || {} : {};
  const u = users.status === "fulfilled" ? users.value || {} : {};
  const c = courses.status === "fulfilled" ? courses.value || {} : {};
  const s = subscription.status === "fulfilled" ? subscription.value || {} : {};

  content.innerHTML = `
    <div class="grid grid-stats">
      <div class="stat-card"><div class="stat-num">${j.totalJobs ?? "—"}</div><div class="stat-label">Total jobs</div></div>
      <div class="stat-card"><div class="stat-num">${a.totalApplications ?? "—"}</div><div class="stat-label">Applications</div></div>
      <div class="stat-card"><div class="stat-num">${(u.totalJobseekers ?? 0) + (u.totalRecruiters ?? 0)}</div><div class="stat-label">Users</div></div>
      <div class="stat-card"><div class="stat-num">${c.totalCourse ?? "—"}</div><div class="stat-label">Courses</div></div>
      <div class="stat-card"><div class="stat-num">$${(s.totalRevenue ?? 0).toLocaleString?.() ?? s.totalRevenue ?? 0}</div><div class="stat-label">Revenue</div></div>
    </div>

    <div class="grid grid-cards">
      <div class="panel">
        <h3 style="margin-bottom:14px;font-size:15px;">Jobs by type</h3>
        <table>
          <tbody>
            <tr><td>Internships</td><td>${j.totalInternships ?? 0}</td></tr>
            <tr><td>Full-time</td><td>${j.totalFullTimeJobs ?? 0}</td></tr>
            <tr><td>Part-time</td><td>${j.totalPartTimeJobs ?? 0}</td></tr>
            <tr><td>Contractual</td><td>${j.totalContractualJobs ?? 0}</td></tr>
            <tr><td>Freelance</td><td>${j.totalFreelanceJobs ?? 0}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="panel">
        <h3 style="margin-bottom:14px;font-size:15px;">Applications</h3>
        <table>
          <tbody>
            <tr><td>Pending</td><td>${a.totalPending ?? 0}</td></tr>
            <tr><td>Shortlisted</td><td>${a.totalShortlisted ?? 0}</td></tr>
            <tr><td>Rejected</td><td>${a.totalRejected ?? 0}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="panel">
        <h3 style="margin-bottom:14px;font-size:15px;">Users</h3>
        <table>
          <tbody>
            <tr><td>Job seekers</td><td>${u.totalJobseekers ?? 0}</td></tr>
            <tr><td>Recruiters</td><td>${u.totalRecruiters ?? 0}</td></tr>
            <tr><td>Blocked</td><td>${u.totalBlockUsers ?? 0}</td></tr>
            <tr><td>Paid</td><td>${u.totalPaidUsers ?? 0}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="panel">
        <h3 style="margin-bottom:14px;font-size:15px;">Subscriptions</h3>
        <table>
          <tbody>
            <tr><td>Active plans</td><td>${s.activePlans ?? 0}</td></tr>
            <tr><td>Paid users</td><td>${s.paidUsers ?? 0}</td></tr>
            <tr><td>Avg. revenue / user</td><td>$${s.averageRevenuePerUser ?? 0}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
};

// ---------------- init ----------------

function init() {
  setupAuthScreen();
  if (loadSession()) {
    enterApp();
  } else {
    document.getElementById("view-auth").classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", init);
