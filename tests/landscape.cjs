// Run with Playwright available: node tests/landscape.cjs (preview server on 4173).
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:4173/');
    for (const [width,height] of [[667,375],[812,375],[568,320],[844,390],[1024,768]]) {
      await page.setViewportSize({width,height});
      for (const side of ['left','right']) {
        await page.selectOption('#navigation-side',side,{force:true});
        const result = await page.evaluate(() => {
          selected = new Set(sets.map(set => set.id)); rebuild();
          const failures = [];
          for (let i=0;i<deck.length;i++) {
            position=i; revealed=true; render();
            const card=document.getElementById('card');
            if(card.scrollHeight>card.clientHeight+2) failures.push(i);
          }
          const card=document.getElementById('card').getBoundingClientRect();
          const controls=document.querySelector('.controls').getBoundingClientRect();
          return {failures,scroll:document.documentElement.scrollHeight>innerHeight,
            horizontal:document.documentElement.scrollWidth>innerWidth,left:controls.right<=card.left,right:controls.left>=card.right};
        });
        assert.deepEqual(result.failures,[],`${width}x${height}: card overflow`);
        assert.equal(result.scroll,false,`${width}x${height}: page overflow`);
        assert.equal(result.horizontal,false);
        assert.equal(result[side],true);
      }
    }
    await page.evaluate(() => {position=2; revealed=true; render();});
    await page.selectOption('#navigation-side','left',{force:true});
    assert.deepEqual(await page.evaluate(() => [position,revealed]),[2,true]);
    await page.reload();
    assert.equal(await page.locator('body').getAttribute('data-navigation-side'),'left');
    await page.evaluate(() => {selected.clear(); rebuild();});
    assert.equal(await page.locator('#choose-sets').isVisible(),true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollHeight>innerHeight),false);
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.locator('#navigation-side').inputValue(),'left');
    console.log('PASS: all vocabulary answers fit five landscape viewports on both sides; preference persists; changing sides preserves progress; empty state works.');
  } finally {await browser.close();}
})().catch(error => {console.error(error); process.exitCode=1;});
