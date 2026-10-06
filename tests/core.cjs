const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ serviceWorkers: 'block' });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto((process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/'));
    const panel = async id => {
      await page.locator('#menu-button').click();
      await page.locator(`#app-menu [data-panel="${id}"]`).click();
    };
    const close = async id => page.locator(`#${id} .close-panel`).click();
    const snapshot = () => page.evaluate(() => ({ position, revealed, session, history }));
    const select = id => page.locator('#sets .set').filter({ hasText: id }).locator('input');

    assert.equal(await page.locator('#counter').textContent(), '1 / 44');
    assert.equal(await page.locator('#previous').isDisabled(), true);
    assert.equal((await snapshot()).history.length, 0);
    await panel('sets-panel');
    await select('第 27 课').uncheck();
    await close('sets-panel');
    for (const id of ['card', 'previous', 'next', 'restart']) {
      assert.equal(await page.locator(`#${id}`).isDisabled(), true, `${id} in empty state`);
    }
    assert.equal(await page.locator('#counter').textContent(), '0 / 0');
    await page.locator('#choose-sets').click();
    await select('第 1 课').check();
    await close('sets-panel');
    await panel('preferences-panel');
    await page.locator('#auto-pronounce').uncheck();
    await close('preferences-panel');

    assert.equal(await page.locator('#word').textContent(), '我');
    assert.equal(await page.locator('#word').getAttribute('lang'), 'zh-CN');
    assert.equal(await page.locator('#reading').textContent(), '');
    await page.locator('#card').click();
    assert.equal(await page.locator('#word').textContent(), '私');
    assert.equal(await page.locator('#reading').textContent(), 'わたし');
    assert.equal(await page.locator('#meaning').textContent(), '我');
    assert.equal(await page.locator('#word').getAttribute('lang'), 'ja');
    assert.match(await page.locator('#card').getAttribute('aria-label'), /私.*わたし.*我/);
    const firstId = (await snapshot()).session.id;
    await page.locator('#card').click();
    await page.locator('#card').click();
    assert.equal((await snapshot()).session.reviewed, 1, 'Repeated reveals count once');
    await page.locator('#next').click();
    assert.equal((await snapshot()).revealed, false);
    assert.equal(await page.locator('#counter').textContent(), '2 / 6');
    assert.equal(await page.locator('#progress').getAttribute('value'), '2');
    for (let i = 1; i < 6; i++) {
      await page.locator('#card').click();
      if (i < 5) await page.locator('#next').click();
    }
    assert.equal(await page.locator('#next').isDisabled(), true);
    assert.equal((await snapshot()).session.reviewed, 6);
    await panel('history-panel');
    assert.equal(await page.locator('#history-empty').isVisible(), false);
    assert.match(await page.locator('#history-list').textContent(), /6 \/ 6.*已完成/);
    await close('history-panel');
    await page.locator('#restart').click();
    assert.equal((await snapshot()).session, null);
    assert.equal((await snapshot()).history.length, 1);
    await page.locator('#card').click();
    assert.notEqual((await snapshot()).session.id, firstId);
    await page.reload();
    assert.equal(await page.locator('#counter').textContent(), '1 / 6');
    assert.equal((await snapshot()).session, null);
    assert.deepEqual((await snapshot()).history.map(item => item.reviewed), [1, 6]);

    // Card keys work; other controls, modifiers and open panels suppress shortcuts.
    await page.locator('#card').focus();
    await page.keyboard.press('Enter');
    assert.equal((await snapshot()).revealed, true);
    await page.keyboard.press('Space');
    assert.equal((await snapshot()).revealed, false);
    await page.keyboard.press('ArrowRight');
    assert.equal((await snapshot()).position, 1);
    await page.keyboard.press('Control+ArrowRight');
    assert.equal((await snapshot()).position, 1);
    await page.locator('#next').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal((await snapshot()).position, 1);
    await page.locator('#menu-button').click();
    await page.keyboard.press('ArrowRight');
    assert.equal((await snapshot()).position, 1);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#menu-button').evaluate(el => el === document.activeElement), true);
    await panel('preferences-panel');
    await page.keyboard.press('ArrowRight');
    assert.equal((await snapshot()).position, 1);
    await page.keyboard.press('Escape');
    await page.locator('#card').focus();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    assert.equal((await snapshot()).position, 0, 'No wrap at first card');

    // Real touch events exercise swipe thresholds and synthetic-click suppression.
    const swipe = (dx, dy = 0) => page.evaluate(({ dx, dy }) => {
      const card = document.getElementById('card');
      const touch = (x, y) => new Touch({ identifier: 1, target: card, clientX: x, clientY: y });
      card.dispatchEvent(new TouchEvent('touchstart', { touches: [touch(200, 100)] }));
      card.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch(200 + dx, 100 + dy)] }));
    }, { dx, dy });
    await swipe(-20);
    await swipe(-60, 100);
    assert.equal((await snapshot()).position, 0);
    await swipe(-100);
    assert.equal((await snapshot()).position, 1);
    await page.locator('#card').click();
    assert.equal((await snapshot()).revealed, false, 'Click following swipe must not flip');
    await page.waitForTimeout(410);
    await swipe(100);
    assert.equal((await snapshot()).position, 0);
    await page.waitForTimeout(410);

    // Deterministic randomness verifies a permutation without flaky order expectations.
    const original = await page.evaluate(() => deck.map(card => card.japanese));
    await page.evaluate(() => { Math.random = () => 0; });
    await panel('preferences-panel');
    await page.selectOption('#order', 'random');
    await close('preferences-panel');
    const shuffled = await page.evaluate(() => deck.map(card => card.japanese));
    assert.notDeepEqual(shuffled, original);
    assert.deepEqual([...shuffled].sort(), [...original].sort());
    await page.locator('#card').click();
    assert.equal((await snapshot()).session.order, 'random');
    await panel('sets-panel');
    await select('第 2 课').check();
    await close('sets-panel');
    assert.equal(await page.locator('#counter').textContent(), '1 / 52');
    assert.equal((await snapshot()).session, null);
    await page.reload();
    assert.equal(await page.locator('#order').inputValue(), 'random');
    assert.deepEqual(await page.evaluate(() => [...selected].sort()), ['lesson-2', 'sample-1']);

    // Bound history and discard invalid records on startup.
    await page.evaluate(() => {
      const item = { id: 'saved', startedAt: '2026-01-01T00:00:00Z', lessons: ['<b>lesson</b>'], reviewed: 1, total: 6, order: 'ordered', direction: 'zh' };
      localStorage.setItem('kotoba-history', JSON.stringify([null, { ...item, reviewed: 7 }, ...Array.from({ length: 105 }, (_, i) => ({ ...item, id: `saved-${i}` }))]));
    });
    await page.reload();
    assert.equal((await snapshot()).history.length, 100);
    await page.locator('#card').click();
    assert.equal((await snapshot()).history.length, 100);
    assert.equal((await snapshot()).history.at(-1).id, 'saved-98');
    await panel('history-panel');
    assert.equal(await page.locator('#history-list b').count(), 0, 'Stored lesson names render as text');
    await close('history-panel');
    await page.evaluate(() => localStorage.setItem('kotoba-preferences', '{broken'));
    await page.reload();
    assert.equal(await page.locator('#counter').textContent(), '1 / 44');
    assert.match(await page.locator('#storage-status').textContent(), /无法读取/);
    await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('quota'); }; });
    await page.locator('#card').click();
    assert.equal((await snapshot()).session.reviewed, 1);
    assert.match(await page.locator('#storage-status').textContent(), /无法保存/);
    assert.deepEqual(errors, []);
    console.log('PASS: practice, sets, history, persistence, random order, keyboard, swipes and storage failures.');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
