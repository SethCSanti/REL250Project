// content/sidebar.js
// Injects the Still Small Voice sidebar into every page.

(async () => {
  // ── Prevent double-injection ──
  if (document.getElementById("ssv-root")) return;

  // ── Emotion definitions ──
  const EMOTIONS = [
    { key: "anxious",     label: "Anxious",     emoji: "😰" },
    { key: "exhausted",   label: "Exhausted",   emoji: "😴" },
    { key: "distracted",  label: "Distracted",  emoji: "😵‍💫" },
    { key: "sad",         label: "Sad",         emoji: "😢" },
    { key: "frustrated",  label: "Frustrated",  emoji: "😤" },
    { key: "overwhelmed", label: "Overwhelmed", emoji: "😓" },
    { key: "numb",        label: "Numb",        emoji: "😶" },
    { key: "happy",       label: "Happy",       emoji: "😊" },
    { key: "hopeful",     label: "Hopeful",     emoji: "🌅" },
    { key: "grateful",    label: "Grateful",    emoji: "🙏" },
  ];

  // ── State ──
  let isOpen         = false;
  let selectedEmotion = null;
  let currentContent  = null;
  let favorites       = [];

  // ── Load favorites from storage ──
  try {
    const stored = await chrome.storage.local.get("ssv_favorites");
    favorites = stored.ssv_favorites || [];
  } catch (_) {}

  // ── Build HTML ──
  const root = document.createElement("div");
  root.id = "ssv-root";
  root.innerHTML = `
    <!-- Tab -->
    <div id="ssv-tab" role="button" aria-label="Open Still Small Voice" tabindex="0">
      <span id="ssv-tab-icon">Peace</span>
    </div>

    <!-- Panel -->
    <div id="ssv-panel" role="dialog" aria-label="Still Small Voice" aria-hidden="true">

      <!-- Header -->
      <div id="ssv-header">
        <div id="ssv-header-title">Still Small Voice</div>
        <div id="ssv-header-subtitle">A moment of peace</div>
        <button id="ssv-close" aria-label="Close panel">✕</button>
      </div>

      <div class="ssv-divider"></div>

      <!-- Emotion Picker -->
      <div id="ssv-emotion-section">
        <div id="ssv-emotion-label">How are you feeling?</div>
        <div id="ssv-emotions-grid">
          ${EMOTIONS.map(
            (e) => `
            <button class="ssv-emotion-btn" data-emotion="${e.key}" aria-label="${e.label}">
              <span class="ssv-emotion-emoji">${e.emoji}</span>
              <span class="ssv-emotion-label-text">${e.label}</span>
            </button>`
          ).join("")}
        </div>
      </div>

      <div class="ssv-divider"></div>

      <!-- Content -->
      <div id="ssv-content-section">
        <div id="ssv-placeholder">
          <div id="ssv-placeholder-icon">🕊️</div>
          <div id="ssv-placeholder-text">
            Select how you're feeling and receive a word of peace.
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div id="ssv-footer">
        <span id="ssv-footer-text">Still Small Voice · LDS Edition</span>
      </div>

    </div>
  `;

  document.body.appendChild(root);

  // ── Element refs ──
  const tab            = root.querySelector("#ssv-tab");
  const panel          = root.querySelector("#ssv-panel");
  const closeBtn       = root.querySelector("#ssv-close");
  const contentSection = root.querySelector("#ssv-content-section");
  const emotionBtns    = root.querySelectorAll(".ssv-emotion-btn");

  // ── Open / Close ──
  function openPanel() {
    isOpen = true;
    root.classList.add("ssv-open");
    panel.setAttribute("aria-hidden", "false");
    tab.setAttribute("aria-expanded", "true");
  }

  function closePanel() {
    isOpen = false;
    root.classList.remove("ssv-open");
    panel.setAttribute("aria-hidden", "true");
    tab.setAttribute("aria-expanded", "false");
  }

  tab.addEventListener("click", () => (isOpen ? closePanel() : openPanel()));
  tab.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      isOpen ? closePanel() : openPanel();
    }
  });
  closeBtn.addEventListener("click", closePanel);

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closePanel();
  });

  // ── Fetch helpers ──
  const BASE = chrome.runtime.getURL("");
  let scripturesCache = null;
  let quotesCache     = null;

  async function loadData() {
    if (!scripturesCache) {
      const r = await fetch(`${BASE}data/scriptures.json`);
      scripturesCache = await r.json();
    }
    if (!quotesCache) {
      const r = await fetch(`${BASE}data/quotes.json`);
      quotesCache = await r.json();
    }
  }

  function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async function getContent(emotion, avoid = null) {
    await loadData();
    const key       = emotion.toLowerCase();
    const scriptures = (scripturesCache[key] || []).map((s) => ({ type: "scripture", content: s }));
    const quotes     = (quotesCache[key]     || []).map((q) => ({ type: "quote",     content: q }));
    let pool         = [...scriptures, ...quotes];

    if (avoid && pool.length > 1) {
      const avoidId = avoid.type === "scripture" ? avoid.content.reference : avoid.content.talk;
      pool = pool.filter((item) => {
        const id = item.type === "scripture" ? item.content.reference : item.content.talk;
        return id !== avoidId;
      });
    }

    return pool.length
      ? getRandom(pool)
      : {
          type: "scripture",
          content: {
            reference: "Doctrine & Covenants 6:36",
            text: "Look unto me in every thought; doubt not, fear not.",
            source: "D&C",
          },
        };
  }

  // ── Render helpers ──
  function showLoading() {
    contentSection.innerHTML = `
      <div id="ssv-loading">
        <div class="ssv-dot"></div>
        <div class="ssv-dot"></div>
        <div class="ssv-dot"></div>
      </div>`;
  }

  function isFavorited(item) {
    const id = item.type === "scripture" ? item.content.reference : item.content.talk;
    return favorites.some((f) => {
      const fid = f.type === "scripture" ? f.content.reference : f.content.talk;
      return fid === id;
    });
  }

  async function saveFavorites() {
    try {
      await chrome.storage.local.set({ ssv_favorites: favorites });
    } catch (_) {}
  }

  function renderCard(item) {
    const { type, content } = item;
    const favorited         = isFavorited(item);

    let cardHTML = "";

    if (type === "scripture") {
      cardHTML = `
        <div id="ssv-card">
          <span id="ssv-card-type-badge">Scripture</span>
          <div id="ssv-card-text">${content.text}</div>
          <div id="ssv-card-attribution">
            <div id="ssv-card-reference">${content.reference}</div>
            <span id="ssv-card-source-tag">${content.source}</span>
          </div>
        </div>`;
    } else {
      cardHTML = `
        <div id="ssv-card">
          <span id="ssv-card-type-badge">Quote</span>
          <div id="ssv-card-text">${content.text}</div>
          <div id="ssv-card-attribution">
            <div id="ssv-card-reference">${content.speaker}</div>
            <span id="ssv-card-source-tag">${content.event}</span>
          </div>
        </div>`;
    }

    const actionsHTML = `
      <div id="ssv-actions">
        <button class="ssv-action-btn ${favorited ? "ssv-favorited" : ""}" id="ssv-fav-btn">
          ${favorited ? "★ Saved" : "☆ Save"}
        </button>
        <button class="ssv-action-btn" id="ssv-refresh-btn">
          ↺ Another
        </button>
      </div>`;

    contentSection.innerHTML = cardHTML + actionsHTML;

    // Favorite button
    const favBtn = contentSection.querySelector("#ssv-fav-btn");
    favBtn.addEventListener("click", async () => {
      if (isFavorited(item)) {
        const id = type === "scripture" ? content.reference : content.talk;
        favorites = favorites.filter((f) => {
          const fid = f.type === "scripture" ? f.content.reference : f.content.talk;
          return fid !== id;
        });
        favBtn.textContent = "☆ Save";
        favBtn.classList.remove("ssv-favorited");
      } else {
        favorites.push(item);
        favBtn.textContent = "★ Saved";
        favBtn.classList.add("ssv-favorited");
      }
      await saveFavorites();
    });

    // Refresh button
    const refreshBtn = contentSection.querySelector("#ssv-refresh-btn");
    refreshBtn.addEventListener("click", async () => {
      showLoading();
      const next = await getContent(selectedEmotion, currentContent);
      currentContent = next;
      renderCard(next);
    });
  }

  // ── Emotion button clicks ──
  emotionBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const emotion = btn.dataset.emotion;

      // Update selected state
      emotionBtns.forEach((b) => b.classList.remove("ssv-selected"));
      btn.classList.add("ssv-selected");
      selectedEmotion = emotion;

      // Fetch and render
      showLoading();
      const item     = await getContent(emotion);
      currentContent = item;
      renderCard(item);
    });
  });

})();