const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      window.speechCalls=[]; window.cancelCalls=0; window.testVoices=[];
      Object.defineProperty(window,'speechSynthesis',{value:{
        getVoices:()=>testVoices, speak:u=>speechCalls.push(u), cancel:()=>cancelCalls++
      }});
      window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
    });
    await page.goto('http://127.0.0.1:4173/');
    assert.equal(await page.locator('#pronounce').count(),0);
    assert.equal(await page.locator('#auto-pronounce').isChecked(),true);
    assert.equal(await page.evaluate(()=>speechCalls.length),0);
    await page.locator('#card').click();
    assert.deepEqual(await page.evaluate(()=>[speechCalls[0].text,speechCalls[0].lang,revealed,session.reviewed]),['かいます','ja-JP',true,1]);
    await page.locator('#card').focus();
    await page.keyboard.press('Space');
    assert.deepEqual(await page.evaluate(()=>[speechCalls.length,cancelCalls,revealed]),[1,1,false]);
    await page.evaluate(()=>{testVoices=[{lang:'en-US'},{lang:'ja-JP',name:'Japanese'}];});
    await page.keyboard.press('Enter');
    assert.deepEqual(await page.evaluate(()=>[speechCalls.length,speechCalls.at(-1).voice.name,session.reviewed]),[2,'Japanese',1]);
    await page.locator('#next').click();
    assert.equal(await page.evaluate(()=>activeSpeech),null);
    await page.locator('#flip').click();
    assert.equal(await page.evaluate(()=>speechCalls.at(-1).text),'はしります');
    await page.evaluate(()=>speechCalls.at(-1).onerror());
    assert.match(await page.locator('#speech-status').textContent(),/无法播放/);
    await page.locator('#menu-button').click();
    await page.locator('[data-panel="preferences-panel"]').click();
    const before=await page.evaluate(()=>[position,revealed,session.id,speechCalls.length]);
    await page.locator('#auto-pronounce').uncheck();
    assert.deepEqual(await page.evaluate(()=>[position,revealed,session.id,speechCalls.length]),before);
    await page.locator('#preferences-panel .close-panel').click();
    await page.locator('#flip').click(); await page.locator('#flip').click();
    assert.equal(await page.evaluate(()=>speechCalls.length),before[3]);
    await page.reload();
    assert.equal(await page.locator('#auto-pronounce').isChecked(),false);
    await page.locator('#flip').click();
    assert.equal(await page.evaluate(()=>speechCalls.length),0);
    await page.locator('#menu-button').click();
    await page.locator('[data-panel="preferences-panel"]').click();
    await page.locator('#auto-pronounce').check();
    assert.equal(await page.evaluate(()=>speechCalls.length),0);
    await page.selectOption('#direction','zh');
    await page.locator('#preferences-panel .close-panel').click();
    await page.locator('#flip').click();
    assert.equal(await page.evaluate(()=>speechCalls.at(-1).text),'かいます');
    await page.locator('#menu-button').click();
    await page.locator('[data-panel="preferences-panel"]').click();
    await page.locator('#auto-pronounce').uncheck();
    assert.equal(await page.evaluate(()=>activeSpeech),null);
    await page.locator('#preferences-panel .close-panel').click();
    await page.evaluate(()=>{selected.clear(); rebuild(); flip();});
    assert.equal(await page.evaluate(()=>speechCalls.length),1);
    const unsupported=await browser.newPage();
    await unsupported.addInitScript(()=>{delete window.speechSynthesis;delete window.SpeechSynthesisUtterance;});
    await unsupported.goto('http://127.0.0.1:4173/');
    await unsupported.locator('#flip').click();
    assert.match(await unsupported.locator('#speech-status').textContent(),/不支持/);
    console.log('PASS: automatic answer pronunciation, default on, preference persistence, keyboard, both directions, cancellation and errors.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
