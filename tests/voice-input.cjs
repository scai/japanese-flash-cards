const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      window.listeners=[];
      window.SpeechRecognition=class {
        constructor(){listeners.push(this);}
        start(){this.started=true;this.onstart();}
        stop(){this.onend();}
        abort(){this.aborted=true;this.onend();}
      };
    });
    await page.goto('http://127.0.0.1:4173/');
    await page.locator('#microphone').click();
    assert.equal(await page.evaluate(()=>listeners.length),1);
    assert.equal(await page.locator('#direction').count(),0);
    assert.equal(await page.locator('#word').textContent(),'飼養（動詞 I）');
    assert.equal(await page.evaluate(()=>listeners.at(-1).lang),'ja-JP');
    assert.match(await page.locator('#voice-status').textContent(),/正在监听/);
    const result = text => page.evaluate(text => {
      const listener=listeners.at(-1);
      listener.onresult({resultIndex:0,results:[[{transcript:text}]]});
    },text);
    await result('かい');
    assert.match(await page.locator('#voice-status').textContent(),/接近/);
    await result('違います');
    assert.match(await page.locator('#voice-status').textContent(),/不正确/);
    await result('カイマス。');
    assert.equal(await page.locator('#face-label').textContent(),'✅');
    assert.equal(await page.evaluate(()=>revealed),false);
    await page.waitForTimeout(1100);
    assert.equal(await page.evaluate(()=>revealed),true);
    assert.equal(await page.evaluate(()=>session.reviewed),1);
    await page.locator('#next').click();
    await result('走ります');
    await page.locator('#next').click();
    await page.waitForTimeout(1100);
    assert.equal(await page.evaluate(()=>revealed),false);
    await page.locator('#menu-button').click();
    assert.equal(await page.evaluate(()=>recognition),null);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>!!recognition),true);
    await page.evaluate(()=>listeners.at(-1).onerror({error:'not-allowed'}));
    assert.equal(await page.locator('#microphone').getAttribute('aria-pressed'),'false');
    assert.match(await page.locator('#voice-status').textContent(),/权限/);
    await page.evaluate(()=>listeners.at(-1).onend());
    await page.locator('#microphone').click();
    await page.evaluate(()=>listeners.at(-1).onend());
    await page.waitForTimeout(600);
    assert.equal(await page.evaluate(()=>!!recognition),true);
    await page.locator('#microphone').click();
    assert.equal(await page.evaluate(()=>recognition),null);
    await page.evaluate(() => {
      window.SpeechRecognition.prototype.start=function(){};
      const schedule=window.setTimeout;
      window.setTimeout=(callback,delay,...args)=>schedule(callback,delay===15000 ? 20 : delay,...args);
    });
    await page.locator('#microphone').click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#microphone').getAttribute('aria-pressed'),'false');
    assert.match(await page.locator('#voice-status').textContent(),/未能启动/);
    const unsupported=await browser.newPage();
    await unsupported.addInitScript(()=>{delete window.SpeechRecognition;delete window.webkitSpeechRecognition;});
    await unsupported.goto('http://127.0.0.1:4173/');
    await unsupported.locator('#microphone').click();
    assert.match(await unsupported.locator('#voice-status').textContent(),/不支持/);
    console.log('PASS: voice matching, close answers, retries, delayed reveal, navigation cancellation, menu pause, permissions, unsupported browser.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
