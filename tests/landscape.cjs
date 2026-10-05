// Run with Playwright available: node tests/landscape.cjs (preview server on 4173).
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:4173/');
    for (const [width,height] of [[667,375],[812,375],[568,320],[844,390],[1024,768],[518,750],[390,844],[320,568]]) {
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
          const cardStyle=getComputedStyle(document.getElementById('card'));
          const icon=document.getElementById('face-label').getBoundingClientRect();
          const hint=document.getElementById('flip-hint').getBoundingClientRect();
          const controls=document.querySelector('.controls').getBoundingClientRect();
          const footer=document.querySelector('.practice-footer').getBoundingClientRect();
          const next=document.getElementById('next').getBoundingClientRect();
          return {failures,scroll:document.documentElement.scrollHeight>innerHeight,
            iconOffset:icon.top-card.top-parseFloat(cardStyle.paddingTop)-parseFloat(cardStyle.borderTopWidth),
            hintOffset:card.bottom-hint.bottom-parseFloat(cardStyle.paddingBottom)-parseFloat(cardStyle.borderBottomWidth),
            footerBottom:footer.bottom,viewportHeight:innerHeight,controlsBottom:next.bottom,footerTop:footer.top,
            horizontal:document.documentElement.scrollWidth>innerWidth,left:controls.right<=card.left,right:controls.left>=card.right};
        });
        assert.deepEqual(result.failures,[],`${width}x${height}: card overflow`);
        assert.equal(result.scroll,false,`${width}x${height}: page overflow`);
        assert.equal(result.horizontal,false);
        assert.ok(Math.abs(result.iconOffset)<1,'Icon anchored at card top');
        assert.ok(Math.abs(result.hintOffset)<1,'Hint anchored at card bottom');
        if(width>height) assert.equal(result[side],true);
        assert.ok(Math.abs(result.footerBottom-result.viewportHeight)<1,'Footer anchored to viewport');
        assert.ok(result.controlsBottom<=result.footerTop && result.footerTop-result.controlsBottom<=12,'Controls directly above footer');
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
    await page.locator('#menu-button').click();
    await page.locator('[data-panel="preferences-panel"]').click();
    assert.equal(await page.locator('#preferences-panel select').count(),3);
    await page.selectOption('#order','random');
    await page.selectOption('#direction','zh');
    await page.reload();
    assert.equal(await page.locator('#order').inputValue(),'random');
    assert.equal(await page.locator('#direction').inputValue(),'zh');
    await page.evaluate(() => {selected = new Set(['sample-1']); rebuild(); flip();});
    assert.equal(await page.evaluate(() => session.order),'random');
    await page.selectOption('#order','ordered',{force:true});
    assert.deepEqual(await page.evaluate(() => [position,revealed,session]),[0,false,null]);
    assert.equal(await page.locator('#sets-panel > p.muted').count(),0);
    assert.equal(await page.locator('#sets-panel').getAttribute('title'),'选择一课，或把多课一起练习。');
    await page.evaluate(() => localStorage.setItem('kotoba-preferences',JSON.stringify({selected:['sample-2'],order:'ordered',direction:'ja'})));
    await page.reload();
    assert.deepEqual(await page.evaluate(() => [...selected]),['lesson-2']);
    assert.equal(await page.locator('#lesson').textContent(),'第 2 课 · これから お世話に なります');
    assert.equal(await page.locator('#counter').textContent(),'1 / 46');
    assert.deepEqual(await page.evaluate(() => ({
      lessons:textbookLessons.length,total:textbookLessons.reduce((sum,set)=>sum+set.cards.length,0),
      oldSample:sets.some(set=>set.id==='sample-2'),
      retained:['ほん','じしょ','とけい','かさ','かばん','えんぴつ'].every(reading=>deck.some(card=>card.reading===reading))
    })),{lessons:16,total:614,oldSample:false,retained:true});
    console.log('PASS: vocabulary fits eight portrait/landscape viewports; footer and controls anchored; side preference persists; progress and empty state work.');
  } finally {await browser.close();}
})().catch(error => {console.error(error); process.exitCode=1;});
