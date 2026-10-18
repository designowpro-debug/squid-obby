const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const errors = [];
  const B = 'http://localhost:8765/index.html';
  const mk = async (opts={}) => { const ctx = await browser.newContext({viewport: opts.vp||{width:1280,height:720}, hasTouch:!!opts.touch, isMobile:!!opts.touch});
    const p = await ctx.newPage(); p.on('pageerror', e => errors.push('pageerror '+e.message)); p.on('console', m => { if (m.type()==='error') errors.push('console '+m.text()); }); return [ctx,p]; };
  // win flow: teleport above finish on L3
  let [c,p] = await mk(); await p.goto(B+'?level=3'); await p.waitForTimeout(1000);
  await p.evaluate(() => { __game.player.pos.set(0, 7, -79.5); __game.player.vel.set(0,0,0); });
  await p.waitForTimeout(4500);
  console.log('win', await p.evaluate(() => __game.state)); await p.screenshot({path:'/workspace/squid-obby/screenshots/04-win.png'}); await c.close();
  // L1 -> L2 transition
  [c,p] = await mk(); await p.goto(B+'?level=1'); await p.waitForTimeout(800);
  await p.evaluate(() => { __game.player.pos.set(0, 0, -91); });
  await p.waitForTimeout(3500); console.log('after L1 finish level', await p.evaluate(() => [__game.state, __game.level])); 
  // L2: stand on bridge panel row 0 both sides check
  await p.evaluate(() => { __game.player.pos.set(-1.5, 1, -6); });
  await p.waitForTimeout(2000); console.log('L2 deaths after stepping left panel', await p.evaluate(() => __game.deaths));
  await p.evaluate(() => { __game.player.pos.set(0, 1, -50); }); await p.waitForTimeout(3500);
  console.log('after L2 finish', await p.evaluate(() => [__game.state, __game.level])); await c.close();
  // touch joystick
  [c,p] = await mk({touch:true, vp:{width:1180,height:820}}); await p.goto(B+'?level=3&touch=1'); await p.waitForTimeout(1000);
  const z0 = await p.evaluate(() => __game.player.pos.z);
  const cdp = await c.newCDPSession(p);
  const bb = await (await p.$('#joy')).boundingBox(); const cx = bb.x+bb.width/2, cy = bb.y+bb.height/2;
  await cdp.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x:cx,y:cy,id:1}]});
  for (let i=1;i<=5;i++){ await cdp.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:[{x:cx,y:cy-12*i,id:1}]}); await p.waitForTimeout(30); }
  await p.waitForTimeout(500);
  const z1 = await p.evaluate(() => __game.player.pos.z);
  await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
  console.log('touch joystick moved z', z0, '->', z1);
  await c.close();
  console.log('ERRORS', errors.length, errors.join('\n')); await browser.close();
})();
