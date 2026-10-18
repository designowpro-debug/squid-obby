const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const errors = [];
  const run = async (name, url, vp, fn, opts={}) => {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: !!opts.touch, isMobile: !!opts.touch, deviceScaleFactor: opts.dsf||1 });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(`[${name}] pageerror: ${e.message}`));
    page.on('console', m => { if (m.type()==='error') errors.push(`[${name}] console: ${m.text()}`); });
    await page.goto(url); await page.waitForTimeout(1500);
    if (fn) await fn(page);
    await page.screenshot({ path: `/workspace/squid-obby/screenshots/${name}.png` });
    const st = await page.evaluate(() => ({state: __game.state, level: __game.level, deaths: __game.deaths}));
    console.log(name, JSON.stringify(st));
    await ctx.close();
  };
  const B = 'http://localhost:8765/index.html';
  await run('00-start', B, {width:1280,height:720});
  await run('01-level1', B, {width:1280,height:720}, async p => {
    await p.click('#startBtn'); await p.keyboard.down('KeyW'); await p.waitForTimeout(2500); await p.keyboard.up('KeyW'); await p.waitForTimeout(300);
  });
  // stand still through cycles then move during red -> expect deaths
  await run('01b-level1-red', B, {width:1280,height:720}, async p => {
    await p.click('#startBtn'); await p.keyboard.down('KeyW'); await p.waitForTimeout(9000); await p.keyboard.up('KeyW');
  });
  await run('02-level2', B+'?level=2', {width:1280,height:720}, async p => {
    await p.waitForTimeout(800); await p.keyboard.down('KeyW'); await p.waitForTimeout(350); await p.keyboard.press('Space'); await p.waitForTimeout(600); await p.keyboard.up('KeyW'); await p.waitForTimeout(400);
  });
  await run('03-level3', B+'?level=3', {width:1280,height:720}, async p => {
    await p.waitForTimeout(800); await p.keyboard.down('KeyW'); await p.waitForTimeout(400); await p.keyboard.press('Space'); await p.waitForTimeout(500); await p.keyboard.up('KeyW');
  });
  // force-win via teleport to finish of level3
  await run('04-win', B+'?level=3', {width:1280,height:720}, async p => {
    await p.waitForTimeout(500);
    await p.evaluate(() => {}); 
    await p.keyboard.press('Space');
    await p.evaluate(() => { window.__tp = true; });
  });
  await run('05-ipad-portrait-touch', B+'?level=1&touch=1', {width:820,height:1180}, async p => {
    const j = await p.$('#joy'); const b = await j.boundingBox();
    await p.waitForTimeout(500);
  }, {touch:true, dsf:2});
  await run('06-ipad-landscape-touch', B+'?level=2&touch=1', {width:1180,height:820}, null, {touch:true, dsf:2});
  console.log('ERRORS:', errors.length); errors.forEach(e => console.log(e));
  await browser.close();
})();
