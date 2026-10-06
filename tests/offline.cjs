const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto((process.env.TEST_BASE_URL || 'http://127.0.0.1:4173/'));
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
      }
    });
    await context.setOffline(true);
    await page.reload();
    assert.equal(await page.locator('#counter').textContent(), '1 / 44');
    await page.locator('#card').click();
    assert.equal(await page.locator('#word').textContent(), '飼います');
    await page.locator('#next').click();
    assert.equal(await page.locator('#counter').textContent(), '2 / 44');
    assert.equal(await page.evaluate(() => textbookLessons.reduce((n, lesson) => n + lesson.cards.length, 0)), 614);
    console.log('PASS: service worker installation and offline reload, vocabulary and practice.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
