# japanese-flash-cards

日语学习单词助记卡

## 言葉 · Japanese flashcards

A Chinese-language Japanese vocabulary practice app built with standard HTML5, CSS and JavaScript. No framework, build step, backend, or account required.

## Use

The main screen focuses on daily practice. Open **菜单** for **词卡集管理** (select lesson sets), **偏好设置** (practice order, pronunciation, and navigation position), or **练习历史**. Panels support keyboard navigation and Escape to close. Preferences and lesson selections are saved in this browser.

Practice history starts when you reveal an answer. A card is counted once per round, even if flipped repeatedly; a round is complete when every card's answer has been revealed. Restarting, changing selected sets or practice order, or reloading starts a new round. The most recent 100 rounds are saved locally, including partial rounds; no earlier practice history is backfilled.

In landscape, the practice screen fits the viewport with navigation beside the card. Choose **偏好设置 → 横屏导航位置** to place controls on the left or right (right by default). This preference is saved without restarting the round. Portrait retains controls below the card; secondary panels scroll independently when needed.

Layout regression check: with Playwright and Microsoft Edge available, start the preview server and run `node tests/landscape.cjs`. It checks every vocabulary answer at five landscape sizes, both control positions, persistence, and the empty selection state.

Open `index.html` in a modern browser, or serve this directory using any static web server. Select one or multiple lesson sets, choose ordered or random practice, and practice with Chinese questions, and click a card to reveal the Japanese word, reading, and Chinese meaning. Previous/next navigation stops at the ends; Restart starts a new pass and reshuffles in random mode.

Space flips a card; left/right arrows navigate when the card is focused or focus is outside other interactive controls. The card also supports Enter to flip. On touch devices, swiping left or right on the card navigates between cards. Other buttons retain their normal keyboard behavior, and practice shortcuts are inactive while a menu or panel is open.

Japanese answers are pronounced automatically when revealed, using the browser's Web Speech API. Toggle **偏好设置 → 自动播放日语发音** to enable or disable this feature (on by default, saved locally without restarting practice). Turning it on takes effect on the next answer reveal. Usage brackets and placeholder marks are omitted from speech. The app prefers an installed Japanese voice; voice quality and offline playback depend on the browser and device. Flipping back, navigating or turning pronunciation off stops playback. Unsupported browsers and playback failures show an accessible message. With Playwright available and the preview server running, `node tests/pronunciation.cjs` checks speech behavior using a mocked speech API.

## Tests

The regression suite requires Node.js, Playwright (`npm install --no-save playwright`), and Microsoft Edge. From this directory, run:

```sh
node tests/run.cjs
```

The runner starts a preview server on an available local port, runs all five checks, and stops the server even if a check fails. Each check uses a fresh browser profile without changing your saved practice data.

- `core.cjs`: question/answer rendering, bounded navigation, lesson selection and empty state, random-order permutations, history completion and deduplication, restart/reload behavior, history retention and validation, keyboard and touch controls, and storage failures.
- `pronunciation.cjs` and `voice-input.cjs`: speech playback and recognition flows with mocked browser speech APIs.
- `landscape.cjs`: all vocabulary across eight viewport sizes and both navigation positions, including preference persistence and legacy lesson migration.
- `offline.cjs`: actual service worker installation, offline reload, cached vocabulary, and card navigation.

To run one check against an already running preview, use `node tests/core.cjs` (or another filename). The default URL is `http://127.0.0.1:4173/`; set `TEST_BASE_URL` to test another local preview. The preview server also accepts `PORT` (default `4173`).

## Textbook vocabulary

End-user imports are not available. Vocabulary is maintained in the project source. Previously imported browser data is left untouched but is no longer loaded.

The 16 supplied images are included as 16 textbook sets (614 cards), named using their printed lesson numbers and titles. Vocabulary, conversation, exercise C, related-word, and reading sections are included in page order wherever present. Readings, usage brackets, printed verb groups, and traditional Chinese meanings are retained; pitch-accent marks and editorial asterisks are not encoded. Lesson 15's supplied image contains only page 38 (19 entries); no missing-page vocabulary is inferred. Lesson 27 is included once. Lesson 2 replaces the former six-card sample with all 46 scanned entries (37 vocabulary, 2 conversation, 7 exercise C); saved selections of the old sample load the textbook set. The remaining Lesson 1 set is an illustrative sample.

| Lesson | Title | Cards |
| --- | --- | ---: |
| 2 | これから お世話に なります | 46 |
| 3 | これを ください | 49 |
| 5 | この 電車は 甲子園へ 行きますか | 61 |
| 15 | ご家族は？ | 19 |
| 16 | 使い方を 教えて ください | 58 |
| 17 | どう しましたか | 35 |
| 18 | 趣味は 何ですか | 30 |
| 19 | ダイエットは あしたから します | 26 |
| 21 | わたしも そう 思います | 51 |
| 22 | どんな 部屋を お探しですか | 31 |
| 23 | どうやって 行きますか | 28 |
| 24 | 手伝いに 行きましょうか | 18 |
| 25 | いろいろ お世話に なりました | 17 |
| 26 | ごみは どこに 出したら いいですか | 47 |
| 27 | 何でも 作れるんですね | 44 |
| 28 | 出張も 多いし、試験も あるし…… | 54 |

`textbook-sets.js` contains the newly transcribed sets and their source filenames from the sibling `vocab` folder; the existing Lesson 27 data remains in `app.js`. Images are not required to run the app. For a local preview with Node.js, run `node preview-server.cjs` and open `http://127.0.0.1:4173/`.

## Progressive Web App (PWA)

The app is an installable Progressive Web App (PWA) with offline support:
- **Installation**: Can be installed directly to home screens or desktops via browser install prompts on Android, iOS (Safari Share → "Add to Home Screen"), Windows, and macOS.
- **Screen rotation**: Supports both portrait and landscape, subject to the device's auto-rotate settings. Existing installations may need time to receive the updated manifest; if the app stays portrait-only, reinstall it after loading the updated site online.
- **Offline Practice**: Powered by `sw.js` and `manifest.webmanifest`. Application shell files and vocabulary datasets are cached for offline availability, enabling vocabulary study without an active internet connection.

## GitHub synchronization

After a remote repository is configured, use `git pull --ff-only` before editing. To sync changes, run `git add index.html style.css app.js textbook-sets.js preview-server.cjs manifest.webmanifest sw.js icon.svg icon-192.png icon-512.png README.md .gitignore`, then `git commit -m "Update flashcards"` and `git push`. Synchronization is explicit, not an automatic background service.

The app can be hosted by any static hosting provider, including GitHub Pages.

## Voice answers

Use the microphone toggle between **上一张** and **下一张** to enable Japanese voice input. The app listens while the Chinese prompt is visible. A matching Japanese word or reading shows ✅, then reveals the answer after one second. Incorrect or partially matching answers show retry feedback; listening continues until you reveal the answer, leave the card, or disable the microphone. Menus and panels pause listening. The toggle starts off each time the page loads.

Voice input uses the browser Web Speech recognition API and requires microphone permission, a supported browser, and generally HTTPS or localhost. Recognition may require a network connection and may send audio to the browser's speech service. Kana variants, whitespace, punctuation, and printed usage notes are normalized for matching; a complete answer is required to advance. Run `node tests/voice-input.cjs` with Playwright and Microsoft Edge available and the preview server running to check the flow with mocked recognition.
