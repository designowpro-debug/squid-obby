const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const errors = []; const S = '/workspace/squid-obby/screenshots/';
  const ctx = await b.newContext({viewport:{width:1280,height:720}}); const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  const st = () => p.evaluate(() => { const P = __game.player; return {hp:P.hp, dead:P.dead, y:+P.pos.y.toFixed(2), z:+P.pos.z.toFixed(2), grounded:P.grounded, deaths:__game.deaths, hud:document.getElementById('hpNum').textContent}; });
  await p.goto('http://localhost:8765/index.html?level=3&char=noob'); await p.waitForTimeout(3000);
  // stand on walkway in sweeper path (z=-43), wait for bar to pass
  await p.evaluate(() => { __game.player.pos.set(1.0, 1.6, -43); __game.player.vel.set(0,0,0); });
  let hit = null; for (let i=0;i<40;i++){ await p.waitForTimeout(250); const s = await st(); if (s.hp < 100){ hit = s; break; } }
  console.log('after bar hit:', JSON.stringify(hit));
  await p.waitForTimeout(150); await p.screenshot({path:S+'12-hp-hit-hud.png'});
  await p.waitForTimeout(2000); console.log('2.0s later (still on walkway, not knocked off, hit once per pass):', JSON.stringify(await st()));
  // pickup heals: go to checkpoint 2 pickup
  await p.evaluate(() => { __game.player.pos.set(0, 1.6, -37.5); __game.player.vel.set(0,0,0); });
  await p.waitForTimeout(500);
  const pk = await p.evaluate(() => { const k = __game.pickups().find(q => Math.abs(q.z + 37.5) < 0.1); return {x:k.x, z:k.z, taken:k.taken}; });
  await p.screenshot({path:S+'13-heart-pickup.png'});
  const before = (await st()).hp;
  await p.evaluate(([x,z]) => { __game.player.pos.set(x, 1.5, z); }, [pk.x, pk.z]); await p.waitForTimeout(400);
  console.log('pickup: hp', before, '->', (await st()).hp, 'taken', await p.evaluate(() => __game.pickups().find(q => Math.abs(q.z + 37.5) < 0.1).taken));
  // 0 HP -> respawn at checkpoint with full HP and pickups reset
  for (let i=0;i<5;i++){ await p.evaluate(() => { __game.player.invuln = 0; __game.damage(20); }); }
  const z0 = await st(); console.log('after 5x20 dmg:', JSON.stringify(z0));
  await p.waitForTimeout(1600);
  console.log('after respawn:', JSON.stringify(await st()), 'pickup reset:', await p.evaluate(() => __game.pickups().every(q => !q.taken)));
  // falling also restores HP
  await p.evaluate(() => { __game.player.invuln = 0; __game.damage(20); __game.player.pos.set(10, 1, -40); }); await p.waitForTimeout(2200);
  console.log('after fall:', JSON.stringify(await st()));
  // menu screenshot HUD for each level with pickups
  for (const lv of [1,4,5]){ await p.goto(`http://localhost:8765/index.html?level=${lv}&char=bacon`); await p.waitForTimeout(3200);
    await p.evaluate(() => { const c = __game.solids().find(s => s.tag==='check'); __game.player.pos.set(c.mesh.position.x, c.mesh.position.y+1, c.mesh.position.z + 2); __game.player.vel.set(0,0,0); });
    await p.waitForTimeout(1500); await p.screenshot({path:S+`14-level${lv}-checkpoint-heart.png`}); }
  console.log('ERRORS', errors.length, errors.join('\n')); await b.close();
})();
