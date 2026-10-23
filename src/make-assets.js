const { chromium } = require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const svg = fs.readFileSync('/workspace/squid-obby/favicon.svg','utf8');
  for (const [n, sz] of [['favicon-32.png',32],['apple-touch-icon.png',180]]){
    const p = await b.newPage({viewport:{width:sz,height:sz}}); await p.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${sz}" height="${sz}" `)}</body></html>`);
    await p.screenshot({path:'/workspace/squid-obby/'+n, omitBackground:true}); await p.close();
  }
  // OG image 1200x630: real gameplay + title overlay
  const p = await b.newPage({viewport:{width:1200,height:630}});
  await p.goto('http://localhost:8765/index.html?level=3&char=bacon&lang=en'); await p.waitForTimeout(3500);
  await p.evaluate(() => { const c = __game.solids().find(s => s.tag==='check'); __game.player.pos.set(c.mesh.position.x, c.mesh.position.y, c.mesh.position.z + 1.5); __game.player.vel.set(0,0,0); });
  await p.waitForTimeout(2800);
  await p.evaluate(() => {
    ['hudL','restartTop','langBtn','msg','pop','touch'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    const o = document.createElement('div');
    o.style.cssText = 'position:fixed;left:0;top:0;bottom:0;width:600px;z-index:50;background:linear-gradient(90deg,rgba(50,20,120,.92),rgba(70,30,150,.72) 70%,rgba(70,30,150,0));color:#fff;font-family:system-ui,sans-serif;padding:40px 50px;box-sizing:border-box';
    o.innerHTML = '<div style="font-size:54px">🍭☁️🍩</div><div style="font-size:72px;font-weight:900;line-height:1;margin:6px 0;text-shadow:0 6px 0 #2a1060">CANDY<br>CLOUD DASH</div><div style="font-size:30px;font-weight:700;color:#ffd23f">3D Jump &amp; Run Obstacle Course</div><div style="font-size:22px;margin-top:22px;line-height:1.5">5 sweet levels · 3 characters<br>Crystal paths · lollipop spinners<br>Play free in your browser · iPad ready</div><div style="display:inline-block;margin-top:20px;font-size:28px;font-weight:900;background:#1ec95a;border:4px solid #fff;border-radius:16px;padding:8px 26px">▶ PLAY NOW</div>';
    document.body.appendChild(o);
  });
  await p.waitForTimeout(300); await p.screenshot({path:'/workspace/squid-obby/og-image.png'}); await p.close();
  // hero GIF frames: auto-run on level 1
  const g = await b.newPage({viewport:{width:640,height:360}});
  await g.goto('http://localhost:8765/index.html?level=1&char=bacon&lang=en'); await g.waitForTimeout(3200);
  fs.mkdirSync('/tmp/frames', {recursive:true}); fs.readdirSync('/tmp/frames').forEach(f => fs.unlinkSync('/tmp/frames/'+f));
  await g.keyboard.down('KeyW');
  let i = 0; const t0 = Date.now();
  while (Date.now() - t0 < 6500){
    if (i % 6 === 2) await g.keyboard.press('Space');
    await g.screenshot({path:`/tmp/frames/f${String(i).padStart(3,'0')}.png`}); i++;
  }
  await g.keyboard.up('KeyW'); console.log('frames', i, 'state', await g.evaluate(() => JSON.stringify([__game.level, __game.deaths, __game.player.pos.z.toFixed(1)])));
  await b.close();
})();
