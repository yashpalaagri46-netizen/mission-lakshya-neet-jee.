/* =========================================================
   MISSION LAKSHYA – NEET & JEE 2027
   Complete script.js
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL HELPERS
   ========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

const safeJSON = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const load = (key, fallback = null) => {
  const value = localStorage.getItem(key);
  return value ? safeJSON(value, fallback) : fallback;
};

const escapeHTML = (text) => {
  const div = document.createElement("div");
  div.textContent = String(text ?? "");
  return div.innerHTML;
};

/* =========================================================
   APP STATE
   ========================================================= */

const AppState = {
  theme: localStorage.getItem("ml-theme") || "midnight",
  language: localStorage.getItem("ml-language") || "HI",
  bookmarks: load("ml-bookmarks", []),
  tasks: load("ml-tasks", []),
  progress: load("ml-progress", {
    today: 42,
    streak: 6,
    hours: 123,
    chapters: 18
  })
};

/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  initializeNavigation();
  initializeMobileMenu();
  initializeSearch();
  initializeLanguage();
  initializeNotifications();
  initializePlanner();
  initializeBookmarks();
  initializeCalculator();
  initializeFilters();
  initialize3DLab();
  initializeQuickActions();
  initializeButtons();
  initializeKeyboardShortcuts();
  initializeProgress();
  initializeYouTube();
  initializeAI();

  renderTasks();
  renderBookmarks();
  updateDashboard();
});

/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {
  const navItems = $$(".nav-item");
  const sections = $$(".page-section");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.section;

      if (!target) return;

      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      sections.forEach((section) => {
        section.classList.remove("active");
      });

      const targetSection = document.getElementById(target);

      if (targetSection) {
        targetSection.classList.add("active");
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      document.body.classList.remove("sidebar-open");

      updateSearchPlaceholder(target);
    });
  });
}

function openSection(sectionId) {
  const nav = $(`.nav-item[data-section="${sectionId}"]`);

  if (nav) {
    nav.click();
    return;
  }

  const section = document.getElementById(sectionId);

  if (!section) return;

  $$(".page-section").forEach((s) =>
    s.classList.remove("active")
  );

  section.classList.add("active");
}

/* =========================================================
   MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {
  const button =
    $(".mobile-menu-btn") ||
    $("[data-mobile-menu]");

  if (!button) return;

  button.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-open");
  });

  document.addEventListener("click", (event) => {
    const sidebar = $(".sidebar");

    if (
      window.innerWidth <= 900 &&
      document.body.classList.contains("sidebar-open") &&
      sidebar &&
      !sidebar.contains(event.target) &&
      !button.contains(event.target)
    ) {
      document.body.classList.remove("sidebar-open");
    }
  });
}

/* =========================================================
   THEME SYSTEM
   ========================================================= */

function initializeTheme() {
  applyTheme(AppState.theme);

  const themeButtons = $$("[data-theme]");

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const theme = button.dataset.theme;

      if (!theme) return;

      applyTheme(theme);
    });
  });

  const quickTheme =
    $("#themeToggle") ||
    $("[data-theme-toggle]");

  if (quickTheme) {
    quickTheme.addEventListener("click", cycleTheme);
  }
}

function applyTheme(theme) {
  const normalizedTheme =
    theme === "midnight" ? "" : theme;

  if (normalizedTheme) {
    document.documentElement.dataset.theme =
      normalizedTheme;
  } else {
    document.documentElement.removeAttribute(
      "data-theme"
    );
  }

  AppState.theme = theme;
  localStorage.setItem("ml-theme", theme);

  $$("[data-theme]").forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.theme === theme
    );
  });
}

function cycleTheme() {
  const themes = [
    "midnight",
    "ocean",
    "emerald",
    "rose",
    "sunset",
    "crimson",
    "golden",
    "cyber",
    "aqua",
    "graphite",
    "light"
  ];

  const currentIndex =
    themes.indexOf(AppState.theme);

  const next =
    themes[(currentIndex + 1) % themes.length];

  applyTheme(next);

  showToast(`Theme changed: ${next}`);
}

/* =========================================================
   LANGUAGE
   ========================================================= */

function initializeLanguage() {
  const buttons =
    $$(".language-switch button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const lang =
        button.dataset.lang ||
        button.textContent.trim();

      setLanguage(lang);
    });
  });

  updateLanguageButtons();
}

function setLanguage(language) {
  const lang =
    String(language).toUpperCase() === "EN"
      ? "EN"
      : "HI";

  AppState.language = lang;

  localStorage.setItem(
    "ml-language",
    lang
  );

  updateLanguageButtons();

  showToast(
    lang === "HI"
      ? "भाषा: हिन्दी"
      : "Language: English"
  );
}

function updateLanguageButtons() {
  $$(".language-switch button").forEach(
    (button) => {
      const lang =
        button.dataset.lang ||
        button.textContent.trim();

      button.classList.toggle(
        "active",
        lang.toUpperCase() ===
          AppState.language
      );
    }
  );
}

/* =========================================================
   GLOBAL SEARCH
   ========================================================= */

function initializeSearch() {
  const search =
    $(".search-box input") ||
    $("#globalSearch");

  if (!search) return;

  search.addEventListener("input", () => {
    performSearch(search.value.trim());
  });

  search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      performSearch(search.value.trim());
    }
  });
}

function performSearch(query) {
  if (!query) return;

  const normalized = query.toLowerCase();

  const searchable = $$(
    ".card, .quick-card, .subject-card, .video-card, .book-card, .website-card, .tool-card, .test-card"
  );

  let found = 0;

  searchable.forEach((item) => {
    const text =
      item.textContent.toLowerCase();

    const match =
      text.includes(normalized);

    item.style.display =
      match ? "" : "none";

    if (match) found++;
  });

  showToast(
    found
      ? `${found} result(s) found`
      : "No result found"
  );
}

function updateSearchPlaceholder(section) {
  const input =
    $(".search-box input") ||
    $("#globalSearch");

  if (!input) return;

  const names = {
    home: "Search anything...",
    library: "Search study material...",
    books: "Search books...",
    videos: "Search lectures...",
    questionBank: "Search questions...",
    dpp: "Search DPP...",
    quiz: "Search quiz...",
    mockTest: "Search mock tests...",
    pyq: "Search PYQ...",
    khushiAI: "Ask Khushi AI...",
    planner: "Search tasks...",
    analytics: "Search analytics...",
    bookmarks: "Search bookmarks...",
    lab3d: "Search 3D models...",
    tools: "Search PCMB tools...",
    youtubeLive: "Search live classes...",
    websites: "Search study websites..."
  };

  input.placeholder =
    names[section] ||
    "Search anything...";
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function initializeNotifications() {
  const button =
    $("#notificationBtn") ||
    $("[data-notifications]");

  if (!button) return;

  button.addEventListener("click", () => {
    let panel =
      $(".notification-panel");

    if (!panel) {
      panel =
        document.createElement("div");

      panel.className =
        "notification-panel";

      panel.innerHTML = `
        <strong>Notifications</strong>

        <div class="task" style="margin-top:12px;">
          🔥 Keep your study streak alive
        </div>

        <div class="task" style="margin-top:8px;">
          📚 Continue your current chapter
        </div>

        <div class="task" style="margin-top:8px;">
          📝 Today's DPP is waiting
        </div>
      `;

      document.body.appendChild(panel);
    }

    const rect =
      button.getBoundingClientRect();

    panel.style.position = "fixed";
    panel.style.top =
      `${rect.bottom + 8}px`;
    panel.style.right = "18px";

    panel.style.display =
      panel.style.display === "none"
        ? "block"
        : "none";
  });
}

/* =========================================================
   PLANNER
   ========================================================= */

function initializePlanner() {
  const form =
    $("#plannerForm") ||
    $(".planner-form");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const input =
      form.querySelector(
        'input[name="task"]'
      ) ||
      form.querySelector("input");

    if (!input) return;

    const taskText =
      input.value.trim();

    if (!taskText) {
      showToast("Please enter a task");
      return;
    }

    const task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt:
        new Date().toISOString()
    };

    AppState.tasks.push(task);

    save(
      "ml-tasks",
      AppState.tasks
    );

    input.value = "";

    renderTasks();

    showToast("Task added ✓");
  });
}

function renderTasks() {
  const list =
    $("#taskList") ||
    $(".task-list");

  if (!list) return;

  if (!AppState.tasks.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div>
          <div class="empty-icon">📅</div>
          <h3>No tasks yet</h3>
          <p>Add your first study task.</p>
        </div>
      </div>
    `;

    return;
  }

  list.innerHTML =
    AppState.tasks
      .map(
        (task) => `
        <div class="task ${
          task.completed
            ? "completed"
            : ""
        }" data-task-id="${task.id}">
          <input
            class="task-check"
            type="checkbox"
            ${
              task.completed
                ? "checked"
                : ""
            }
            aria-label="Complete task"
          />

          <div class="task-text">
            ${escapeHTML(task.text)}
          </div>

          <button
            class="icon-btn delete-task"
            type="button"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      `
      )
      .join("");

  $$(".task-check", list).forEach(
    (checkbox) => {
      checkbox.addEventListener(
        "change",
        () => {
          const row =
            checkbox.closest(".task");

          const id =
            Number(
              row.dataset.taskId
            );

          const task =
            AppState.tasks.find(
              (item) =>
                item.id === id
            );

          if (!task) return;

          task.completed =
            checkbox.checked;

          save(
            "ml-tasks",
            AppState.tasks
          );

          renderTasks();
        }
      );
    }
  );

  $$(".delete-task", list).forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          const row =
            button.closest(".task");

          const id =
            Number(
              row.dataset.taskId
            );

          AppState.tasks =
            AppState.tasks.filter(
              (task) =>
                task.id !== id
            );

          save(
            "ml-tasks",
            AppState.tasks
          );

          renderTasks();

          showToast("Task deleted");
        }
      );
    }
  );
}

/* =========================================================
   BOOKMARKS
   ========================================================= */

function initializeBookmarks() {
  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-bookmark]"
        );

      if (!button) return;

      const id =
        button.dataset.bookmark;

      if (!id) return;

      toggleBookmark(
        id,
        button.dataset.title ||
          button.closest(".card")
            ?.textContent
            ?.trim()
            ?.slice(0, 80) ||
          "Saved item"
      );
    }
  );
}

function toggleBookmark(id, title) {
  const index =
    AppState.bookmarks.findIndex(
      (item) =>
        item.id === id
    );

  if (index >= 0) {
    AppState.bookmarks.splice(
      index,
      1
    );

    showToast("Removed from bookmarks");
  } else {
    AppState.bookmarks.push({
      id,
      title,
      createdAt:
        new Date().toISOString()
    });

    showToast("Added to bookmarks ✓");
  }

  save(
    "ml-bookmarks",
    AppState.bookmarks
  );

  renderBookmarks();
}

function renderBookmarks() {
  const container =
    $("#bookmarksList") ||
    $(".bookmarks-list");

  if (!container) return;

  if (!AppState.bookmarks.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div>
          <div class="empty-icon">🔖</div>
          <h3>No bookmarks yet</h3>
          <p>
            Save useful books, questions,
            videos and resources here.
          </p>
        </div>
      </div>
    `;

    return;
  }

  container.innerHTML =
    AppState.bookmarks
      .map(
        (item) => `
        <div class="learning-card">
          <div class="learning-icon">
            🔖
          </div>

          <div class="learning-info">
            <h3>
              ${escapeHTML(item.title)}
            </h3>

            <p>
              Saved resource
            </p>
          </div>

          <button
            class="btn"
            data-remove-bookmark="${escapeHTML(item.id)}"
          >
            Remove
          </button>
        </div>
      `
      )
      .join("");

  $$(
    "[data-remove-bookmark]",
    container
  ).forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const id =
          button.dataset
            .removeBookmark;

        AppState.bookmarks =
          AppState.bookmarks.filter(
            (item) =>
              item.id !== id
          );

        save(
          "ml-bookmarks",
          AppState.bookmarks
        );

        renderBookmarks();

        showToast(
          "Bookmark removed"
        );
      }
    );
  });
}

/* =========================================================
   PCMB CALCULATOR
   ========================================================= */

function initializeCalculator() {
  const form =
    $("#calculatorForm") ||
    $(".calculator-form");

  const display =
    $("#calculatorResult") ||
    $(".calculator-result");

  if (!form || !display) return;

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const expressionInput =
        form.querySelector(
          'input[name="expression"]'
        ) ||
        form.querySelector(
          "input"
        );

      if (!expressionInput) return;

      const expression =
        expressionInput.value.trim();

      if (!expression) {
        display.textContent =
          "Enter a calculation";
        return;
      }

      try {
        const result =
          calculateExpression(
            expression
          );

        display.textContent =
          String(result);
      } catch {
        display.textContent =
          "Invalid calculation";
      }
    }
  );
}

function calculateExpression(expression) {
  /*
    Basic calculator.
    Only mathematical characters are accepted.
  */

  const clean =
    expression.replace(
      /[^0-9+\-*/().%\s]/g,
      ""
    );

  if (!clean) {
    throw new Error("Invalid");
  }

  /*
    Percentage support:
    50% -> 0.5
  */

  const percentage =
    clean.replace(
      /(\d+(?:\.\d+)?)%/g,
      "($1/100)"
    );

  /*
    Function is created only after
    strict character filtering.
  */

  const result =
    Function(
      `"use strict"; return (${percentage})`
    )();

  if (
    typeof result !== "number" ||
    !Number.isFinite(result)
  ) {
    throw new Error("Invalid");
  }

  return Number(
    result.toFixed(10)
  );
}

/* =========================================================
   FILTER BUTTONS
   ========================================================= */

function initializeFilters() {
  $$(".filters").forEach(
    (filterGroup) => {
      const buttons =
        $(
          ".filter-btn",
          filterGroup
        );

      buttons.forEach(
        (button) => {
          button.addEventListener(
            "click",
            () => {
              buttons.forEach(
                (btn) =>
                  btn.classList.remove(
                    "active"
                  )
              );

              button.classList.add(
                "active"
              );

              const value =
                button.dataset.filter ||
                button.textContent
                  .trim()
                  .toLowerCase();

              filterCards(
                value,
                filterGroup
              );
            }
          );
        }
      );
    }
  );
}

function filterCards(
  value,
  filterGroup
) {
  const section =
    filterGroup.closest(
      ".page-section"
    );

  if (!section) return;

  const cards =
    $$(".video-card, .book-card, .card, .subject-card", section);

  if (
    value === "all" ||
    value === "all subjects" ||
    value === "all exams"
  ) {
    cards.forEach(
      (card) =>
        (card.style.display = "")
    );

    return;
  }

  cards.forEach((card) => {
    const text =
      card.textContent
        .toLowerCase();

    card.style.display =
      text.includes(
        value.toLowerCase()
      )
        ? ""
        : "none";
  });
}

/* =========================================================
   3D LEARNING LAB
   ========================================================= */

function initialize3DLab() {
  const lab =
    $(".lab-space");

  if (!lab) return;

  let rotationX = 0;
  let rotationY = 0;

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  lab.addEventListener(
    "pointerdown",
    (event) => {
      dragging = true;

      lastX = event.clientX;
      lastY = event.clientY;

      lab.setPointerCapture(
        event.pointerId
      );
    }
  );

  lab.addEventListener(
    "pointermove",
    (event) => {
      if (!dragging) return;

      const dx =
        event.clientX - lastX;

      const dy =
        event.clientY - lastY;

      rotationY += dx * 0.6;
      rotationX -= dy * 0.6;

      rotationX =
        Math.max(
          -70,
          Math.min(70, rotationX)
        );

      lab.style.transform =
        `rotateX(${rotationX}deg)
         rotateY(${rotationY}deg)`;

      lastX = event.clientX;
      lastY = event.clientY;
    }
  );

  lab.addEventListener(
    "pointerup",
    () => {
      dragging = false;
    }
  );

  lab.addEventListener(
    "pointercancel",
    () => {
      dragging = false;
    }
  );

  lab.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();

      const current =
        parseFloat(
          lab.dataset.scale || "1"
        );

      const next =
        Math.max(
          .65,
          Math.min(
            1.4,
            current -
              event.deltaY * .001
          )
        );

      lab.dataset.scale =
        String(next);

      lab.style.scale = next;
    },
    { passive: false }
  );
}

/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function initializeQuickActions() {
  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-open-section]"
        );

      if (!button) return;

      const section =
        button.dataset.openSection;

      if (section) {
        openSection(section);
      }
    }
  );
}

/* =========================================================
   GENERIC BUTTONS
   ========================================================= */

function initializeButtons() {
  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-toast]"
        );

      if (!button) return;

      showToast(
        button.dataset.toast
      );
    }
  );
}

/* =========================================================
   PROGRESS
   ========================================================= */

function initializeProgress() {
  const progressBars =
    $$(".progress-bar");

  progressBars.forEach((bar) => {
    const value =
      bar.dataset.progress;

    if (value !== undefined) {
      bar.style.width =
        `${Math.max(
          0,
          Math.min(
            100,
            Number(value)
          )
        )}%`;
    }
  });
}

function updateDashboard() {
  const values = {
    today:
      AppState.progress.today,
    streak:
      AppState.progress.streak,
    hours:
      AppState.progress.hours,
    chapters:
      AppState.progress.chapters
  };

  $$("[data-stat]").forEach(
    (element) => {
      const key =
        element.dataset.stat;

      if (
        Object.prototype.hasOwnProperty.call(
          values,
          key
        )
      ) {
        element.textContent =
          values[key];
      }
    }
  );
}

/* =========================================================
   YOUTUBE LIVE
   ========================================================= */

function initializeYouTube() {
  const searchForm =
    $("#youtubeSearchForm");

  if (!searchForm) return;

  searchForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const input =
        searchForm.querySelector(
          "input"
        );

      if (!input) return;

      const query =
        input.value.trim();

      if (!query) return;

      await searchYouTube(query);
    }
  );

  $$("[data-youtube-query]")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          searchYouTube(
            button.dataset
              .youtubeQuery
          );
        }
      );
    });
}

async function searchYouTube(query) {
  const container =
    $("#youtubeResults") ||
    $(".youtube-results");

  if (!container) {
    showToast(
      "YouTube results area not found"
    );
    return;
  }

  container.innerHTML = `
    <div class="empty-state">
      <div>
        <div class="empty-icon">⏳</div>
        <h3>Searching...</h3>
        <p>
          Finding available classes
        </p>
      </div>
    </div>
  `;

  try {
    const response =
      await fetch(
        `/api/youtube?q=${encodeURIComponent(
          query
        )}&live=true`
      );

    if (!response.ok) {
      throw new Error(
        "YouTube API unavailable"
      );
    }

    const data =
      await response.json();

    const items =
      data.items || [];

    renderYouTubeResults(
      items,
      container
    );
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <div class="empty-state">
        <div>
          <div class="empty-icon">▶️</div>

          <h3>YouTube Live setup required</h3>

          <p>
            Add your YouTube API key
            to the server environment
            before live search can work.
          </p>
        </div>
      </div>
    `;

    showToast(
      "YouTube API is not configured"
    );
  }
}

function renderYouTubeResults(
  items,
  container
) {
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div>
          <div class="empty-icon">📺</div>
          <h3>No live classes found</h3>
          <p>Try another search.</p>
        </div>
      </div>
    `;

    return;
  }

  container.innerHTML =
    items
      .map((item) => {
        const id =
          item.id?.videoId ||
          item.id;

        const title =
          item.snippet?.title ||
          "YouTube Live";

        const channel =
          item.snippet
            ?.channelTitle ||
          "Channel";

        const thumbnail =
          item.snippet?.thumbnails
            ?.medium?.url ||
          "";

        return `
          <div class="video-card">
            <div class="video-thumb">

              ${
                thumbnail
                  ? `
                    <img
                      src="${escapeHTML(
                        thumbnail
                      )}"
                      alt=""
                      style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                      "
                    />
                  `
                  : ""
              }

              <button
                class="play-btn"
                data-video-id="${escapeHTML(
                  id || ""
                )}"
                type="button"
              >
                ▶
              </button>
            </div>

            <div class="video-body">
              <h3>
                ${escapeHTML(title)}
              </h3>

              <div class="video-meta">
                <span>
                  ${escapeHTML(channel)}
                </span>

                <span>
                  🔴 LIVE
                </span>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

  $$("[data-video-id]", container)
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          openYouTubeVideo(
            button.dataset.videoId
          );
        }
      );
    });
}

function openYouTubeVideo(videoId) {
  if (!videoId) return;

  const modal =
    createModal(
      "YouTube Live",
      `
        <div class="embed-viewer">
          <iframe
            src="https://www.youtube.com/embed/${encodeURIComponent(
              videoId
            )}"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
              web-share
            "
            allowfullscreen
          ></iframe>
        </div>
      `
    );

  document.body.appendChild(modal);

  requestAnimationFrame(() => {
    modal.classList.add("show");
  });
}

/* =========================================================
   KHUSHI AI
   ========================================================= */

function initializeAI() {
  const form =
    $("#aiChatForm") ||
    $(".ai-chat form");

  if (!form) return;

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const input =
        form.querySelector(
          "input, textarea"
        );

      const messages =
        $("#chatMessages") ||
        $(".chat-messages");

      if (!input || !messages) return;

      const message =
        input.value.trim();

      if (!message) return;

      appendChatMessage(
        messages,
        message,
        "user"
      );

      input.value = "";

      const loading =
        appendChatMessage(
          messages,
          "Khushi AI is thinking...",
          "ai"
        );

      try {
        const response =
          await fetch(
            "/api/chat",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                message,
                language:
                  AppState.language
              })
            }
          );

        if (!response.ok) {
          throw new Error(
            "AI API unavailable"
          );
        }

        const data =
          await response.json();

        const answer =
          data.answer ||
          data.message ||
          data.content ||
          "I couldn't generate a response.";

        loading.textContent =
          answer;
      } catch (error) {
        console.error(error);

        loading.textContent =
          "Khushi AI अभी configure नहीं है। पहले AI API server setup करें।";
      }

      messages.scrollTop =
        messages.scrollHeight;
    }
  );
}

function appendChatMessage(
  container,
  text,
  type
) {
  const message =
    document.createElement("div");

  message.className =
    `chat-message ${type}`;

  message.textContent = text;

  container.appendChild(
    message
  );

  container.scrollTop =
    container.scrollHeight;

  return message;
}

/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function initializeKeyboardShortcuts() {
  document.addEventListener(
    "keydown",
    (event) => {
      const modifier =
        event.ctrlKey ||
        event.metaKey;

      if (
        modifier &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();

        const input =
          $(".search-box input") ||
          $("#globalSearch");

        if (input) {
          input.focus();
          input.select();
        }
      }

      if (event.key === "Escape") {
        document.body.classList.remove(
          "sidebar-open"
        );

        $$(".modal.show").forEach(
          (modal) =>
            modal.remove()
        );
      }
    }
  );
}

/* =========================================================
   MODAL
   ========================================================= */

function createModal(
  title,
  content
) {
  const modal =
    document.createElement("div");

  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-box">

      <div class="modal-header">

        <h2>
          ${escapeHTML(title)}
        </h2>

        <button
          class="icon-btn modal-close"
          type="button"
        >
          ✕
        </button>

      </div>

      ${content}

    </div>
  `;

  const close =
    $(".modal-close", modal);

  close.addEventListener(
    "click",
    () => modal.remove()
  );

  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    }
  );

  return modal;
}

/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {
  let toast =
    $("#mlToast");

  if (!toast) {
    toast =
      document.createElement("div");

    toast.id = "mlToast";

    Object.assign(
      toast.style,
      {
        position: "fixed",
        left: "50%",
        bottom: "25px",
        transform:
          "translateX(-50%) translateY(20px)",
        padding:
          "11px 16px",
        border:
          "1px solid rgba(255,255,255,.12)",
        borderRadius:
          "12px",
        background:
          "rgba(20,14,40,.96)",
        color:
          "#fff",
        fontSize:
          "11px",
        fontWeight:
          "800",
        boxShadow:
          "0 15px 40px rgba(0,0,0,.4)",
        opacity:
          "0",
        transition:
          ".25s ease",
        zIndex:
          "5000",
        pointerEvents:
          "none"
      }
    );

    document.body.appendChild(
      toast
    );
  }

  toast.textContent =
    message;

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform =
      "translateX(-50%) translateY(0)";
  });

  clearTimeout(
    toast._timer
  );

  toast._timer =
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform =
        "translateX(-50%) translateY(20px)";
    }, 2300);
}

/* =========================================================
   STUDY STREAK
   ========================================================= */

function updateStudyStreak() {
  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const lastStudy =
    localStorage.getItem(
      "ml-last-study"
    );

  if (lastStudy !== today) {
    AppState.progress.streak += 1;

    localStorage.setItem(
      "ml-last-study",
      today
    );

    save(
      "ml-progress",
      AppState.progress
    );
  }

  updateDashboard();
}

/* =========================================================
   STUDY ACTIVITY
   ========================================================= */

function recordStudyActivity(minutes = 30) {
  const hours =
    Number(
      AppState.progress.hours
    ) || 0;

  AppState.progress.hours =
    Math.round(
      (hours + minutes / 60) * 10
    ) / 10;

  AppState.progress.today =
    Math.min(
      100,
      Number(
        AppState.progress.today
      ) + 1
    );

  save(
    "ml-progress",
    AppState.progress
  );

  updateDashboard();
}

/* =========================================================
   GLOBAL API
   ========================================================= */

window.MissionLakshya = {
  openSection,
  applyTheme,
  setLanguage,
  showToast,
  toggleBookmark,
  recordStudyActivity,
  updateStudyStreak
};

/* =========================================================
   END
   ========================================================= */
