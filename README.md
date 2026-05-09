# Las Promesas de GenAI Mobile App

A simple Expo mobile app for **Las Promesas de GenAI**.

The app works as a dark editorial/newsroom reader for GenAI content. It fetches public JSON files from the Las Promesas website and displays News, Research, The Show episodes, and host information in a mobile-first interface.

## Data Sources

The app currently reads from these public JSON endpoints:

- News: `https://las-promesas-de-genai.netlify.app/data/news.json`
- Research: `https://las-promesas-de-genai.netlify.app/data/research.json`
- Episodes / The Show: `https://las-promesas-de-genai.netlify.app/data/episodes.json`
- Hosts / Sobre: `https://las-promesas-de-genai.netlify.app/data/hosts.json`

Each source is loaded independently, so one failed feed should not prevent the other sections from rendering.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm run start
```

You can also use:

```bash
npx expo start
```

## Test With Expo Go

1. Install **Expo Go** on your phone.
2. Make sure your phone and computer are on the same network.
3. Start the app with `npm run start`.
4. Scan the QR code shown in the terminal or Expo Dev Tools.
5. The app should open in Expo Go.

If the app does not refresh automatically, reload it from the Expo Go developer menu.

## Current Features

- Dark editorial Las Promesas visual style.
- Custom section tabs for `Inicio`, `News`, `Research`, `The Show`, and `Sobre`.
- `Inicio` shows:
  - Featured/latest News item
  - Latest News
  - Latest Research
  - The Show preview
- `News` displays items from `news.json`.
- `Research` displays items from `research.json`.
- News and Research cards open a detail screen.
- `The Show` displays episode cards from `episodes.json`.
- Episode cards include a video link button when available.
- `Sobre` displays fixed intro copy, a highlighted phrase, and host cards from `hosts.json`.
- Loading, error, and empty states for each JSON source.

## Known Limitations

- No login, backend, notifications, or local storage.
- Content is read-only.
- The app depends on the public JSON endpoints being available.
- Research article bodies are displayed as simplified plain text.
- Images listed in the JSON are not rendered yet.
- External links open outside the app.
- The current implementation is intentionally compact and mostly contained in one screen file.

## Next Steps

- Add image rendering for News, Research, Episodes, and Hosts.
- Add a dedicated navigation stack for detail screens.
- Improve rich text rendering for Research article bodies.
- Add pull-to-refresh.
- Add better link handling for source URLs and episode pages.
- Consider caching content for offline or poor-network use.
