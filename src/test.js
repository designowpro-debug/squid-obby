const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const errors = []; const B = 'http://localhost:8765/index.html'; const S = '/workspace/squid-obby/screenshots/';
  const mk = async (opts={}) => { const ctx = await browser.newContext({viewport: opts.vp||{width:1280,height:720}, hasTouch:!!opts.touch, isMobile:!!opts.touch, deviceScaleFactor: opts.dsf||1});
    const p = await ctx.newPage(); p.on('pageerror', e => errors.push('pageerror '+e.message)); p.on('console', m => { if (m.type()==='error') errors.push('console '+m.text()); }); return [ctx,p]; };
  // ---- reachability analysis per level per character
  let [c,p] = await mk();
  for (let lv=1; lv<=5; lv++){
    await p.goto(B+`?level=${lv}`); await p.waitForTimeout(700);
    const res = await p.evaluate((lv) => {
      const G = __game, sol = G.solids().filter(s => s.active), dyn = G.dynamics();
      const posAt = (s, t) => { const d = dyn.find(d => d.m === s.mesh && d.mv); const p = s.mesh.position;
        if (!d) return [p.x, p.z]; const k = Math.sin(t*d.mv.spd + d.ph); return [d.base.x + (d.mv.ax||0)*k, d.base.z + (d.mv.az||0)*k]; };
      const top = s => s.mesh.position.y + (s.disc ? 0.5 : s.mesh.scale.y/2);
      const gap = (a, b, t) => { const [ax,az] = posAt(a,t), [bx,bz] = posAt(b,t);
        const ha = a.disc ? [a.r,a.r] : [a.mesh.scale.x/2, a.mesh.scale.z/2], hb = b.disc ? [b.r,b.r] : [b.mesh.scale.x/2, b.mesh.scale.z/2];
        if (a.disc && b.disc) return Math.max(0, Math.hypot(ax-bx, az-bz) - a.r - b.r);
        if (a.disc || b.disc){ const [d, q] = a.disc ? [[ax,az,a.r],[bx,bz,hb]] : [[bx,bz,b.r],[ax,az,ha]];
          const dx = Math.max(0, Math.abs(d[0]-q[0]) - q[2][0]), dz = Math.max(0, Math.abs(d[1]-q[1]) - q[2][1]); return Math.max(0, Math.hypot(dx,dz) - d[2]); }
        return Math.hypot(Math.max(0, Math.abs(ax-bx) - ha[0] - hb[0]), Math.max(0, Math.abs(az-bz) - ha[1] - hb[1])); };
      let pairs;
      if (lv === 2){ const panels = sol.filter(s => s.onLand); pairs = [[panels[0], panels[2]]]; } // row-to-row (same side)
      else pairs = sol.map((s,i) => [s, sol[i+1]]).slice(0, sol.length-1);
      const out = {};
      for (const k in G.chars){
        const ch = G.chars[k]; const sp = ch.move * (ch.sprint || 1);
        let worst = 0, worstInfo = '';
        for (const [a,b] of pairs){
          let mg = 1e9; for (let t=0; t<30; t+=0.05) mg = Math.min(mg, gap(a,b,t));
          const h = top(b) - top(a); const disc = ch.jump*ch.jump - 2*28*h; if (disc < 0){ worst = 99; continue; }
          let tAir = (ch.jump + Math.sqrt(disc))/28;
          if (ch.dbl){ // apex then 2nd jump at 0.9*jump: approximate total air time
            const t1 = ch.jump/28, h1 = ch.jump*ch.jump/56, v2 = ch.jump*0.9; tAir = t1 + (v2 + Math.sqrt(v2*v2 + 2*28*(h1 - h)))/28; }
          const reach = sp * tAir + 0.54, ratio = mg / reach;
          if (ratio > worst){ worst = ratio; worstInfo = `gap ${mg.toFixed(2)} rise ${h.toFixed(1)} reach ${reach.toFixed(2)} @z${a.mesh.position.z.toFixed(1)}`; }
        }
        const apex = ch.jump*ch.jump/56;
        out[k] = `worst gap/reach=${worst.toFixed(2)} (${worstInfo}) apex ${apex.toFixed(2)} (bar top 0.9)`;
      }
      return out;
    }, lv);
    console.log('L'+lv, JSON.stringify(res, null, 1));
  }
  // ---- empirical physics per character: speed + jump apex + double jump + sprint
  for (const k of ['noob','bacon','kara']){
    await p.goto(B+`?level=1&char=${k}`); await p.waitForTimeout(3000);
    const jump = async (twice) => {
      await p.evaluate(() => { __game.player.pos.set(0,0,2); __game.player.vel.set(0,0,0); window.__maxY = 0;
        const loop = () => { window.__maxY = Math.max(window.__maxY, __game.player.pos.y); if (window.__run) requestAnimationFrame(loop); }; window.__run = true; loop(); });
      await p.waitForTimeout(200); await p.keyboard.press('Space');
      if (twice){ await p.waitForTimeout(300); await p.keyboard.press('Space'); }
      await p.waitForTimeout(1500); return p.evaluate(() => { window.__run = false; return window.__maxY.toFixed(2); });
    };
    const a1 = await jump(false), a2 = await jump(true);
    await p.evaluate(() => { __game.player.pos.set(0,0,3.5); __game.player.vel.set(0,0,0); });
    await p.keyboard.down('KeyW'); await p.waitForTimeout(250); const z1 = await p.evaluate(() => __game.player.pos.z); await p.waitForTimeout(300); const z2 = await p.evaluate(() => __game.player.pos.z); await p.keyboard.up('KeyW');
    let sprint = '';
    if (k === 'kara'){ await p.evaluate(() => { __game.player.pos.set(0,0,3.5); __game.player.vel.set(0,0,0); });
      await p.keyboard.down('ShiftLeft'); await p.keyboard.down('KeyW'); await p.waitForTimeout(250); const s1 = await p.evaluate(() => __game.player.pos.z); await p.waitForTimeout(300); const s2 = await p.evaluate(() => __game.player.pos.z);
      await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft'); sprint = ` sprint ${((s1-s2)/0.3).toFixed(1)} u/s`; }
    console.log(k, `apex ${a1}, apex w/ 2nd press ${a2}, walk ${((z1-z2)/0.3).toFixed(1)} u/s${sprint}`, 'hud:', await p.evaluate(() => document.getElementById('charName').textContent));
  }
  await c.close();
  // ---- full flow + screenshots
  [c,p] = await mk(); await p.goto(B); await p.waitForTimeout(1200);
  await p.click('#startBtn'); await p.waitForTimeout(800); await p.screenshot({path:S+'08-character-select.png'});
  await p.click('.card[data-char="kara"]'); await p.waitForTimeout(800);
  console.log('after pick', await p.evaluate(() => [__game.state, __game.level, __game.char]));
  for (let lv=1; lv<=5; lv++){ // jump to each finish to test chain
    await p.evaluate(() => { const f = __game.solids().find(s => s.tag === 'finish'); __game.player.pos.set(f.mesh.position.x, f.mesh.position.y + 2, f.mesh.position.z); __game.player.vel.set(0,0,0); });
    await p.waitForTimeout(lv < 5 ? 3400 : 4500);
    console.log('after finishing L'+lv, await p.evaluate(() => [__game.state, __game.level]));
  }
  await p.screenshot({path:S+'04-win.png'});
  await p.click('#againBtn'); await p.waitForTimeout(500); console.log('again ->', await p.evaluate(() => [__game.state, !document.getElementById('charScreen').classList.contains('hidden')]));
  await c.close();
  for (const [lv, name, zz] of [[4,'09-level4',0],[4,'09b-level4-sweepers',-38],[5,'10-level5',0],[5,'10b-level5-cross',-31]]){
    [c,p] = await mk(); await p.goto(B+`?level=${lv}&char=bacon`); await p.waitForTimeout(1500);
    if (zz){ await p.evaluate((zz) => { const s = __game.solids().find(s => s.tag==='check'); __game.player.pos.set(s.mesh.position.x, s.mesh.position.y+1, zz); }, zz); await p.waitForTimeout(3000); }
    else { await p.keyboard.down('KeyW'); await p.waitForTimeout(300); await p.keyboard.up('KeyW'); await p.waitForTimeout(400); }
    await p.screenshot({path:S+name+'.png'}); await c.close();
  }
  [c,p] = await mk({touch:true, vp:{width:820,height:1180}, dsf:2}); await p.goto(B+'?touch=1'); await p.waitForTimeout(1000);
  await p.tap('#startBtn'); await p.waitForTimeout(800); await p.screenshot({path:S+'08b-character-select-ipad-portrait.png'});
  await p.tap('.card[data-char="kara"]'); await p.waitForTimeout(1200);
  const cdp = await c.newCDPSession(p); const bb = await (await p.$('#dashBtn')).boundingBox();
  await p.screenshot({path:S+'11-ipad-kara-dash-button.png'});
  const z0 = await p.evaluate(() => __game.player.pos.z);
  const jb = await (await p.$('#joy')).boundingBox(); const cx = jb.x+jb.width/2, cy = jb.y+jb.height/2;
  await cdp.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x:cx,y:cy,id:1},{x:bb.x+40,y:bb.y+40,id:2}]});
  for (let i=1;i<=5;i++){ await cdp.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:[{x:cx,y:cy-14*i,id:1},{x:bb.x+40,y:bb.y+40,id:2}]}); await p.waitForTimeout(20); }
  await p.waitForTimeout(250); console.log('touch joystick+衝 z', z0, '->', await p.evaluate(() => __game.player.pos.z), 'stamina bar', await p.evaluate(() => document.getElementById('stamFill').style.width));
  await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]}); await c.close();
  console.log('ERRORS', errors.length, errors.join('\n')); await browser.close();
})();
