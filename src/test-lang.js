const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const errors = []; const S = '/workspace/squid-obby/screenshots/'; const B = 'http://localhost:8765/index.html';
  const ctx = await b.newContext({viewport:{width:1280,height:720}}); const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  const cjk = () => p.evaluate(() => { const txt = [...document.querySelectorAll('body *:not(script)')].filter(e => e.offsetParent !== null && e.id !== 'langBtn' && e.children.length === 0).map(e => e.textContent).join(' ');
    return (txt.match(/[\u4e00-\u9fff]+/g) || []).slice(0, 8); });
  await p.goto(B); await p.waitForTimeout(1500);
  console.log('first visit lang:', await p.evaluate(() => [document.documentElement.lang, document.title, document.querySelector('#startBtn').textContent, document.querySelector('#langBtn').textContent]), 'visible CJK:', await cjk());
  await p.screenshot({path:S+'15-en-start.png'});
  await p.click('#startBtn'); await p.waitForTimeout(800);
  console.log('EN cards:', await p.$$eval('.card h2', e => e.map(x => x.textContent)), await p.$$eval('.card .tag', e => e.map(x => x.textContent)), 'CJK:', await cjk());
  await p.screenshot({path:S+'16-en-character-select.png'});
  await p.click('.card[data-char="kara"]'); await p.waitForTimeout(3200);
  console.log('EN HUD:', await p.evaluate(() => document.getElementById('hudL').innerText.replace(/\n/g,' | ')), 'CJK:', await cjk());
  await p.evaluate(() => { __game.player.invuln = 0; __game.damage(20); }); await p.waitForTimeout(200);
  await p.screenshot({path:S+'17-en-hud-ingame.png'});
  // toggle to Chinese in-game
  await p.click('#langBtn'); await p.waitForTimeout(400);
  console.log('after toggle:', await p.evaluate(() => [document.documentElement.lang, document.getElementById('lvName').textContent, document.getElementById('charName').textContent, document.getElementById('restartTop').textContent, localStorage.getItem('squidObbyLang')]));
  await p.screenshot({path:S+'18-zh-hud-ingame.png'});
  await p.goto(B); await p.waitForTimeout(1200);
  console.log('reload remembers:', await p.evaluate(() => [document.documentElement.lang, document.querySelector('#startBtn').textContent]));
  await p.screenshot({path:S+'19-zh-start.png'});
  await p.goto(B+'?lang=en'); await p.waitForTimeout(800); console.log('?lang=en:', await p.evaluate(() => document.querySelector('h1').textContent));
  await p.goto(B+'?lang=zh'); await p.waitForTimeout(800); console.log('?lang=zh:', await p.evaluate(() => document.querySelector('h1').textContent));
  // win screen in EN
  await p.goto(B+'?lang=en&level=5'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const f = __game.solids().find(s => s.tag === 'finish'); __game.player.pos.set(f.mesh.position.x, f.mesh.position.y + 2, f.mesh.position.z); });
  await p.waitForTimeout(4500); console.log('EN win:', await p.evaluate(() => document.getElementById('winScreen').innerText.replace(/\n/g,' | ')));
  await p.screenshot({path:S+'20-en-win.png'});
  // iPad touch EN labels
  const c2 = await b.newContext({viewport:{width:1180,height:820}, hasTouch:true, isMobile:true}); const q = await c2.newPage();
  q.on('pageerror', e => errors.push(e.message));
  await q.goto(B+'?level=1&char=kara&touch=1'); await q.waitForTimeout(1500);
  console.log('touch labels:', await q.evaluate(() => [jumpBtn.textContent, dashBtn.textContent, camHint.textContent]));
  console.log('meta:', await q.evaluate(() => [...document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"],link[rel*="icon"]')].map(m => (m.getAttribute('property')||m.getAttribute('name')||m.rel)+'='+(m.content||m.href)).join('\n')));
  console.log('ERRORS', errors.length, errors.join('\n')); await b.close();
})();
