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

Lesson 27 contains all 44 entries transcribed from the supplied textbook image: 24 vocabulary entries, 5 conversation entries, and 15 reading entries, in page order. Readings, usage brackets, verb groups, and traditional Chinese meanings are retained; pitch-accent marks are not encoded. The two other built-in sets are illustrative samples.

## GitHub synchronization

After a remote repository is configured, use `git pull --ff-only` before editing. To sync changes, run `git add index.html style.css app.js sample-card-set.json README.md .gitignore`, then `git commit -m "Update flashcards"` and `git push`. Synchronization is explicit, not an automatic background service.

The app can be hosted by any static hosting provider, including GitHub Pages.
