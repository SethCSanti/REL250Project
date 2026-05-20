// utils/matcher.js
// Fetches scripture and quote data, then returns a random match for a given emotion.

const BASE_URL = chrome.runtime.getURL("");

let scripturesData = null;
let quotesData = null;

async function loadData() {
  if (!scripturesData) {
    const res = await fetch(`${BASE_URL}data/scriptures.json`);
    scripturesData = await res.json();
  }
  if (!quotesData) {
    const res = await fetch(`${BASE_URL}data/quotes.json`);
    quotesData = await res.json();
  }
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Returns { type: "scripture"|"quote", content: {...} }
export async function getContentForEmotion(emotion) {
  await loadData();

  const key = emotion.toLowerCase().trim();

  const scriptures = scripturesData[key] || [];
  const quotes = quotesData[key] || [];
  const combined = [
    ...scriptures.map((s) => ({ type: "scripture", content: s })),
    ...quotes.map((q) => ({ type: "quote", content: q })),
  ];

  if (combined.length === 0) {
    return getFallback();
  }

  return getRandom(combined);
}

// Returns a new random entry for the same emotion, avoiding the last shown item
export async function getRefreshedContent(emotion, lastShown) {
  await loadData();

  const key = emotion.toLowerCase().trim();

  const scriptures = scripturesData[key] || [];
  const quotes = quotesData[key] || [];
  const combined = [
    ...scriptures.map((s) => ({ type: "scripture", content: s })),
    ...quotes.map((q) => ({ type: "quote", content: q })),
  ];

  if (combined.length <= 1) return getRandom(combined);

  const filtered = combined.filter((item) => {
    const id = item.type === "scripture"
      ? item.content.reference
      : item.content.talk;
    const lastId = lastShown?.type === "scripture"
      ? lastShown.content.reference
      : lastShown?.content?.talk;
    return id !== lastId;
  });

  return getRandom(filtered.length > 0 ? filtered : combined);
}

// Fallback if emotion key doesn't match anything
function getFallback() {
  return {
    type: "scripture",
    content: {
      reference: "Doctrine & Covenants 6:36",
      text: "Look unto me in every thought; doubt not, fear not.",
      source: "D&C",
    },
  };
}