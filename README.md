# 🕊️ Still Small Voice — Emotion-Based Scripture & Quote Extension

> A browser extension for students and busy people that offers a moment of peace — a scripture or inspired quote tailored to how you're feeling right now.

---

## What It Does

**Still Small Voice** lives quietly on the edge of your browser. When life gets overwhelming, you hover over the tab, tell it how you're feeling, and it responds with a verse or quote from LDS scripture and General Conference — just for that moment.

### Supported Emotions
- 😰 Anxious
- 😴 Exhausted
- 😵‍💫 Distracted
- 😊 Happy
- 🌅 Hopeful
- 😢 Sad
- 😤 Frustrated
- 😶 Numb / Empty
- 😓 Overwhelmed
- 🙏 Grateful

### Scripture Sources
- Old Testament
- New Testament
- Book of Mormon
- Doctrine & Covenants
- Pearl of Great Price

### Quote Sources
- General Conference talks (all dispensations)
- BYU Devotional addresses

---

## Features

- **Hover-to-reveal sidebar** — completely hidden until you need it; no visual clutter
- **Emotion input** — tap or type how you're feeling
- **Curated response** — one scripture verse *or* quote matched to your emotion
- **Refresh option** — get another one if you want a different perspective
- **Favorite/save** — bookmark verses that hit hard
- **Daily reminder** (optional) — a gentle nudge to check in with yourself

---

## Project Structure

```
still-small-voice/
├── manifest.json          # Extension config (Manifest V3)
├── background/
│   └── service-worker.js  # Background logic
├── content/
│   ├── sidebar.js         # Sidebar inject & hover logic
│   └── sidebar.css        # Sidebar styles
├── popup/
│   ├── popup.html         # (optional) toolbar popup
│   ├── popup.js
│   └── popup.css
├── data/
│   ├── scriptures.json    # Verses indexed by emotion tag
│   └── quotes.json        # GC & BYU quotes indexed by emotion tag
├── assets/
│   └── icons/             # Extension icons (16, 48, 128px)
├── utils/
│   └── matcher.js         # Emotion → content matching logic
└── README.md
```

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Extension API | Chrome Manifest V3 | Modern standard; also works in Edge |
| UI | Vanilla JS + CSS | No build step; lightweight |
| Data | Local JSON files | Offline-first; no API needed |
| Storage | `chrome.storage.local` | Save favorites, preferences |
| Future | Firefox WebExtensions API | Near-identical codebase |

---

## Getting Started (Development)

### Prerequisites
- Google Chrome or Chromium-based browser
- VS Code (recommended)
- Node.js (optional, for linting/build tooling later)

### Load the Extension Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/still-small-voice.git
   cd still-small-voice
   ```

2. Open Chrome and go to:
   ```
   chrome://extensions
   ```

3. Enable **Developer Mode** (toggle, top right)

4. Click **"Load unpacked"** and select your project folder

5. The extension appears in your toolbar — pin it for easy access

### Making Changes
Every time you edit files, click the **refresh icon** on `chrome://extensions` next to your extension to reload it. For content script changes, also refresh the page you're testing on.

---

## Data Format

### `scriptures.json`
```json
{
  "anxious": [
    {
      "reference": "Doctrine & Covenants 6:36",
      "text": "Look unto me in every thought; doubt not, fear not.",
      "source": "D&C"
    }
  ]
}
```

### `quotes.json`
```json
{
  "exhausted": [
    {
      "speaker": "Jeffrey R. Holland",
      "talk": "Like a Broken Vessel",
      "event": "General Conference, October 2013",
      "text": "Don't you quit. You keep walking. You keep trying.",
      "url": "https://www.churchofjesuschrist.org/study/general-conference/2013/10/like-a-broken-vessel"
    }
  ]
}
```

---

## Roadmap

- [x] Project scaffolding & README
- [ ] `manifest.json` setup (Manifest V3)
- [ ] Hover sidebar UI (inject into any page)
- [ ] Emotion picker component
- [ ] Scripture & quote JSON data (initial set, ~10 per emotion)
- [ ] Matching logic (`utils/matcher.js`)
- [ ] Favorites / save feature
- [ ] Settings panel (font size, theme, daily reminder toggle)
- [ ] Firefox compatibility pass
- [ ] Chrome Web Store submission

---

## Contributing

This is a faith-based, student-focused project. Contributions welcome — especially help expanding the quote and scripture data sets. Please keep all content consistent with LDS/Come Follow Me standards.

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add: your feature"`
4. Push and open a Pull Request

---

## License

MIT — free to use, modify, and share. Attribution appreciated.

---

## A Note on Purpose

> *"Be still, and know that I am God."* — Psalm 46:10

This extension isn't meant to be a distraction — it's meant to be a 30-second anchor. A reminder that you're not alone in whatever you're carrying today.

---

*Built with love for students, by someone who needed this too.*