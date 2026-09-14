# japanese-flash-cards

日语学习单词助记卡

## 言葉 · Japanese flashcards

A Chinese-language Japanese vocabulary practice app built with standard HTML5, CSS and JavaScript. No framework, build step, backend, or account required.

## Use

Open `index.html` in a modern browser, or serve this directory using any static web server. Select one or multiple lesson sets, choose ordered or random practice, and click a card to reveal the reading and Chinese meaning. You can also practice with Chinese on the front. Previous/next navigation stops at the ends; Restart starts a new pass and reshuffles in random mode.

Space flips a card; left/right arrows navigate when focus is outside interactive controls. Buttons also support their normal keyboard behavior.

## Add textbook vocabulary

Download or copy `sample-card-set.json`. Each set has a `name` and a nonempty `cards` array. Each card requires `japanese` and `chinese`; `reading` is optional. Import one or multiple JSON files; a file can contain either one set object or an array of set objects. Imported content is displayed as plain text.

Imports are saved locally in the current browser where storage is available; they are not uploaded to GitHub or synced across devices. Keep your original JSON files as backups. Importing the same file twice adds a second copy.

The 14 supplied images are included as 14 textbook sets (514 cards), named using their printed lesson numbers and titles. Vocabulary, conversation, exercise C, related-word, and reading sections are included in page order wherever present. Readings, usage brackets, printed verb groups, and traditional Chinese meanings are retained; pitch-accent marks and editorial asterisks are not encoded. Lesson 15's supplied image contains only page 38 (19 entries); no missing-page vocabulary is inferred. Lesson 27 is included once. The two other built-in sets are illustrative samples.

| Lesson | Title | Cards |
| --- | --- | ---: |
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

`textbook-sets.js` contains the newly transcribed sets and their source filenames from the sibling `vocab` folder; the existing Lesson 27 data remains in `app.js`. Images are not required to run the app. For a local preview with Node.js, run `node preview-server.cjs` and open `http://127.0.0.1:4173/`.

## GitHub synchronization

After a remote repository is configured, use `git pull --ff-only` before editing. To sync changes, run `git add index.html style.css app.js textbook-sets.js preview-server.cjs sample-card-set.json README.md .gitignore`, then `git commit -m "Update flashcards"` and `git push`. Synchronization is explicit, not an automatic background service.

The app can be hosted by any static hosting provider, including GitHub Pages.
