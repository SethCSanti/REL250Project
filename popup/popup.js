// popup/popup.js

document.addEventListener("DOMContentLoaded", async () => {

  // ── Tab switching ──
  const tabs    = document.querySelectorAll(".popup-tab");
  const panels  = document.querySelectorAll(".popup-tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t)   => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    });
  });

  // ── Load favorites ──
  await renderSaved();

  // ── Clear all ──
  document.getElementById("clear-all-btn").addEventListener("click", async () => {
    const confirmed = confirm("Remove all saved verses and quotes?");
    if (!confirmed) return;
    await chrome.storage.local.set({ ssv_favorites: [] });
    await renderSaved();
  });

});

// ── Render the saved list ──
async function renderSaved() {
  const stored   = await chrome.storage.local.get("ssv_favorites");
  const favorites = stored.ssv_favorites || [];

  const list    = document.getElementById("saved-list");
  const empty   = document.getElementById("saved-empty");
  const footer  = document.getElementById("saved-footer");

  list.innerHTML = "";

  if (favorites.length === 0) {
    empty.style.display  = "block";
    footer.style.display = "none";
    return;
  }

  empty.style.display  = "none";
  footer.style.display = "block";

  favorites.forEach((item, index) => {
    const card = buildCard(item, index);
    list.appendChild(card);
  });
}

// ── Build a single saved card ──
function buildCard(item, index) {
  const { type, content } = item;

  const card = document.createElement("div");
  card.className = "saved-card";
  card.style.animationDelay = `${index * 0.05}s`;

  let badgeLabel, bodyText, refLine, tagLine;

  if (type === "scripture") {
    badgeLabel = "Scripture";
    bodyText   = content.text;
    refLine    = content.reference;
    tagLine    = content.source;
  } else {
    badgeLabel = "Quote";
    bodyText   = content.text;
    refLine    = `${content.speaker}`;
    tagLine    = content.event;
  }

  card.innerHTML = `
    <div class="saved-card-badge">
      <span>${badgeLabel}</span>
      <button class="saved-card-remove" data-index="${index}" aria-label="Remove">✕</button>
    </div>
    <div class="saved-card-text">${bodyText}</div>
    <div class="saved-card-attribution">
      <div class="saved-card-reference">${refLine}</div>
      <span class="saved-card-tag">${tagLine}</span>
    </div>
  `;

  // Remove button
  card.querySelector(".saved-card-remove").addEventListener("click", async (e) => {
    const i = parseInt(e.currentTarget.dataset.index);
    const stored = await chrome.storage.local.get("ssv_favorites");
    const favorites = stored.ssv_favorites || [];
    favorites.splice(i, 1);
    await chrome.storage.local.set({ ssv_favorites: favorites });
    await renderSaved();
  });

  return card;
}