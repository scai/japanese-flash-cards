# japanese-flash-cards

[English](#english) | [中文](#chinese)

<a id="english"></a>
## English

### Introduction

**言葉 · Japanese flashcards** is a Japanese vocabulary practice app with a Chinese interface. It uses standard HTML5, CSS, and JavaScript, with no framework, build step, backend, or account required.

### Getting started

Open `index.html` in a modern browser, or serve this directory with any static web server. For a local preview with Node.js:

```sh
node preview-server.cjs
```

Open [the local preview](http://127.0.0.1:4173/). Select one or more lesson sets and choose ordered or random practice. Cards show a Chinese prompt; click a card to reveal the Japanese word, reading, and Chinese meaning. Previous and Next stop at the ends. Restart begins a new round and reshuffles in random mode.

### Controls and preferences

Open Menu to access lesson-set management, preferences, or practice history. Panels support keyboard navigation and Escape to close. Preferences and lesson selections are saved in this browser.

Space or Enter flips the focused card. Left/right arrows navigate when the card is focused or focus is outside other interactive controls. On touch devices, swipe left or right on the card to navigate. Other buttons retain their normal keyboard behavior; practice shortcuts are inactive while a menu or panel is open.

In landscape, navigation sits beside the card. Under Preferences, choose the landscape navigation position: left or right (right by default). Changing this preference saves it without restarting the round. In portrait, controls sit below the card. Secondary panels scroll independently when needed.

### Starred words

Use **☆ / ★** in the practice toolbar to star or unstar the current card. Stars are saved in local preferences. **Menu → Starred-word practice** includes every starred card, even from unselected lessons; **Course practice** returns to selected lessons. The star reflects the current card in either mode.

Removing a star keeps the current round and answer intact. Restarting or entering starred practice again refreshes its cards. Changing lesson selections returns to course practice. Reloading starts course practice with your saved stars.

### Pronunciation and voice answers

Japanese answers are pronounced automatically when revealed, using the browser's Web Speech API. Under Preferences, toggle automatic Japanese pronunciation (on by default). The preference is saved without restarting practice; enabling it takes effect on the next answer reveal. Usage brackets and placeholder marks are omitted from speech. The app prefers an installed Japanese voice; quality and offline playback depend on the browser and device. Flipping back, navigating, or disabling pronunciation stops playback. Unsupported browsers and playback failures show an accessible message.

Use the microphone toggle in the practice toolbar to enable Japanese voice input. The app listens while the Chinese prompt is visible. A matching Japanese word or reading shows ✅ and reveals the answer after one second. Incorrect or partial answers show retry feedback. Listening continues until you reveal the answer, leave the card, or disable the microphone. Menus and panels pause listening. Voice input starts off each time the page loads.

Voice input requires microphone permission, a supported browser, and generally HTTPS or localhost. Recognition may require a network connection and may send audio to the browser's speech service. Kana variants, whitespace, punctuation, and printed usage notes are normalized for matching; a complete answer is required to advance.

### Practice history

History starts when you reveal an answer. A card is counted once per round, even if flipped repeatedly. A round is complete when every card's answer has been revealed. Restarting, changing selected sets or practice order, or reloading starts a new round. The latest 100 rounds, including partial rounds, are saved locally. Earlier practice is not backfilled.

### Textbook vocabulary

End-user imports are not available. Vocabulary is maintained in project source. Previously imported browser data is left untouched but is no longer loaded.

The 16 supplied images provide 16 textbook sets (614 cards), named using their printed lesson numbers and titles. Vocabulary, conversation, exercise C, related-word, and reading sections follow page order wherever present. Readings, usage brackets, printed verb groups, and traditional Chinese meanings are retained; pitch-accent marks and editorial asterisks are not encoded.

Lesson 15's image contains only page 38 (19 entries); no missing-page vocabulary is inferred. Lesson 27 appears once. Lesson 2 replaces the former six-card sample with all 46 scanned entries (37 vocabulary, 2 conversation, 7 exercise C); saved selections of the old sample load the textbook set. The remaining Lesson 1 set is an illustrative sample.

| Lesson | Printed title | Cards |
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

`textbook-sets.js` contains transcribed sets and source filenames from the sibling `vocab` folder. Lesson 27 data remains in `app.js`. Images are not required to run the app.

### Installation and offline use

The app is an installable Progressive Web App (PWA):

- **Installation:** Add it to a home screen or desktop using browser installation prompts on Android, Windows, and macOS. On iOS, use Safari's Share → Add to Home Screen.
- **Screen rotation:** Portrait and landscape are supported, subject to device auto-rotate settings. Existing installations may need time to receive an updated manifest. If the app stays portrait-only, load the updated site online and reinstall it.
- **Offline practice:** `sw.js` and `manifest.webmanifest` support caching app files and vocabulary for practice without a network connection.

### Tests

The regression suite requires Node.js, Playwright (`npm install --no-save playwright`), and Microsoft Edge. Run from this directory:

```sh
node tests/run.cjs
```

The runner starts a preview server on an available local port, runs all six checks, and stops the server even if a check fails. Each check uses a fresh browser profile without changing saved practice data.

- `core.cjs`: card rendering, bounded navigation, lesson selection and empty states, random ordering, history completion and deduplication, restart/reload, history retention and validation, keyboard and touch controls, and storage failures.
- `starred.cjs`: star toggles, persistence, both practice modes, unselected lessons, removing stars, empty states, history, and storage failures.
- `pronunciation.cjs` and `voice-input.cjs`: speech playback and recognition using mocked browser speech APIs.
- `landscape.cjs`: every vocabulary answer across eight portrait/landscape viewports, both navigation positions, preference persistence, and legacy lesson migration.
- `offline.cjs`: actual service-worker installation, offline reload, cached vocabulary, and navigation.

To run one check against a running preview, use `node tests/core.cjs` (or another test filename). The default URL is `http://127.0.0.1:4173/`. Set `TEST_BASE_URL` to use another local preview. The preview server accepts `PORT` (default `4173`).

### GitHub synchronization and hosting

After configuring a remote repository, run `git pull --ff-only` before editing. Stage the files you intend to publish, commit them, and push:

```sh
git add <changed-files>
git commit -m "Update flashcards"
git push
```

Synchronization is explicit, not an automatic background service. Any static hosting provider, including GitHub Pages, can host the app.

[中文版本 ↓](#chinese) | [Back to English](#english)

---

<a id="chinese"></a>
## 中文

### 简介

**言葉 · 日语词卡**是一款使用中文界面的日语词汇练习应用，采用标准 HTML5、CSS 和 JavaScript 开发，无需框架、构建步骤、后端或账号。

### 开始使用

在现代浏览器中打开 `index.html`，或使用任意静态网页服务器运行此目录。如已安装 Node.js，可启动本地预览：

```sh
node preview-server.cjs
```

打开[本地预览](http://127.0.0.1:4173/)。选择一课或多课词卡集，再选择顺序或随机练习。卡片正面显示中文提示；点击卡片即可查看日语单词、读音和中文释义。「上一张」和「下一张」到达首尾后停止。「重新开始」会开启新一轮练习；随机模式下会重新打乱顺序。

### 操作与偏好设置

打开「菜单」可进入「词卡集管理」「偏好设置」或「练习历史」。各面板支持键盘操作，按 Escape 可关闭。偏好设置和课程选择保存在当前浏览器中。

卡片获得焦点时，按空格或 Enter 可翻面。卡片获得焦点，或焦点位于其他交互控件之外时，可用左右方向键切换卡片。触屏设备可在卡片上左右滑动。其他按钮保留正常的键盘操作；菜单或面板打开时，练习快捷键暂时停用。

横屏时，导航控件位于卡片旁边。在「偏好设置 → 横屏导航位置」中可选择左侧或右侧，默认为右侧。此设置自动保存，不会重新开始练习。竖屏时，控件位于卡片下方；其他面板在需要时可独立滚动。

### 星标词

使用练习工具栏中的 **☆ / ★** 为当前卡片添加或取消星标。星标保存在当前浏览器的本地偏好设置中。「菜单 → 星标词练习」包含所有星标卡片，包括未选中课程中的卡片；「课程练习」返回已选课程。两种模式都会显示当前卡片的实际星标状态。

取消星标不会打断当前轮次，也不会改变当前答案显示状态。「重新开始」或再次进入星标词练习时，会更新练习卡片。更改课程选择会返回课程练习。刷新页面后会开始课程练习，已保存的星标会保留。

### 发音与语音回答

翻开日语答案时，应用默认通过浏览器的 Web Speech API 自动播放发音。可在「偏好设置 → 自动播放日语发音」中开启或关闭。此设置自动保存，不会重新开始练习；开启后从下一次翻开答案起生效。朗读时会略去用法方括号和占位符号。应用优先使用已安装的日语语音；音质和离线播放能力取决于浏览器与设备。翻回正面、切换卡片或关闭自动发音会停止播放。不支持发音的浏览器或播放失败时，会显示可被辅助技术读取的提示。

点击练习工具栏中的麦克风按钮可开启日语语音输入。中文提示显示时，应用会监听回答。说出匹配的日语单词或读音后，会显示 ✅，并在一秒后揭示答案。错误或不完整的回答会收到重试提示。监听持续到揭示答案、切换卡片或关闭麦克风为止；打开菜单或面板会暂停监听。每次加载页面时，语音输入默认关闭。

语音输入需要麦克风权限、受支持的浏览器，通常还需要 HTTPS 或 localhost 环境。识别可能需要联网，并可能将音频发送到浏览器的语音服务。匹配时会统一假名形式并忽略空白、标点和教材用法注释；必须回答完整才能通过。

### 练习历史

翻开答案后才开始记录历史。每轮中，同一张卡片即使多次翻面也只计一次；所有卡片的答案都揭示后，该轮即完成。「重新开始」、更改词卡集或练习顺序、刷新页面都会开启新一轮。最近 100 轮记录保存在本地，包括未完成轮次；此前的练习不会补录。

### 教材词汇

应用不提供用户导入功能，词汇在项目源文件中维护。以前导入的浏览器数据不会被删除，但也不会再加载。

所提供的 16 张教材图片对应 16 个词卡集，共 614 张卡片，按教材印刷的课号和标题命名。图片中出现的单词、会话、练习 C、相关词汇及阅读部分，均按页面顺序收录。读音、用法方括号、印刷的动词组别和繁体中文释义予以保留；音调标记和编辑用星号未编码。

第 15 课图片仅包含第 38 页的 19 个条目，未推测缺失页面的词汇。第 27 课只收录一次。第 2 课以扫描得到的全部 46 个条目替换原先的六词示例，包括 37 个单词、2 个会话条目和 7 个练习 C 条目；旧示例的已保存选择会自动加载完整教材课。保留的第 1 课词卡集为演示示例。

| 课号 | 教材标题 | 卡片数 |
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

`textbook-sets.js` 包含转录的词卡集，以及同级 `vocab` 文件夹中的来源图片文件名；第 27 课数据仍位于 `app.js`。运行应用无需这些图片。

### 安装与离线使用

本应用是一款可安装的渐进式网页应用（PWA）：

- **安装：** Android、Windows 和 macOS 可通过浏览器安装提示添加到主屏幕或桌面。iOS 可使用 Safari 的「分享 → 添加到主屏幕」。
- **屏幕旋转：** 支持横屏和竖屏，受设备自动旋转设置影响。已安装的应用可能需要一段时间才能收到更新后的清单；若仍只能竖屏，请联网加载更新后的网站，再重新安装。
- **离线练习：** `sw.js` 和 `manifest.webmanifest` 支持缓存应用文件及词汇，无网络连接时也可练习。

### 测试

回归测试需要 Node.js、Playwright（`npm install --no-save playwright`）和 Microsoft Edge。在此目录中运行：

```sh
node tests/run.cjs
```

测试程序会在可用本地端口启动预览服务器，执行全部六项检查，并在结束时关闭服务器，即使测试失败也会清理。每项检查使用独立的新浏览器配置，不会更改已保存的练习数据。

- `core.cjs`：卡片渲染、首尾导航边界、课程选择与空状态、随机排序、历史完成与去重、重新开始与刷新、历史保留与校验、键盘与触屏操作，以及存储失败。
- `starred.cjs`：星标切换与保存、两种练习模式、未选课程、取消星标、空状态、历史和存储失败。
- `pronunciation.cjs` 和 `voice-input.cjs`：使用模拟浏览器语音 API 检查发音和语音识别。
- `landscape.cjs`：全部词汇答案在八种横竖屏尺寸和两种导航位置下的布局，以及偏好保存和旧课程迁移。
- `offline.cjs`：真实 Service Worker 安装、离线刷新、缓存词汇和卡片导航。

如预览服务器已启动，可运行 `node tests/core.cjs`（或其他测试文件名）执行单项检查。默认地址为 `http://127.0.0.1:4173/`，可设置 `TEST_BASE_URL` 指向其他本地预览。预览服务器支持 `PORT` 环境变量，默认值为 `4173`。

### GitHub 同步与托管

配置远程仓库后，编辑前运行 `git pull --ff-only`。暂存计划发布的文件，再提交并推送：

```sh
git add <changed-files>
git commit -m "Update flashcards"
git push
```

同步需要主动执行，不会在后台自动运行。应用可部署到任意静态托管服务，包括 GitHub Pages。

[English version ↑](#english) | [返回中文开头](#chinese)
