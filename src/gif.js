const { chromium } = require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const g = await b.newPage({viewport:{width:640,height:360}});
  await g.goto('http://localhost:8765/index.html?level=1&char=bacon&lang=en'); await g.waitForTimeout(3200);
  fs.mkdirSync('/tmp/frames', {recursive:true}); fs.readdirSync('/tmp/frames').forEach(f => fs.unlinkSync('/tmp/frames/'+f));
  await g.evaluate(() => { document.getElementById('msg').style.visibility='hidden';
    window.__boxes = __game.solids().filter(s => s.mesh).map(s => { const bb = new s.mesh.position.constructor(); const B = {min:null}; return s; });
  });
  await g.keyboard.down('KeyW');
  let i = 0; const t0 = Date.now();
  while (Date.now() - t0 < 9000 && i < 120){
    const act = await g.evaluate(() => {
      const P = __game.player; const box = new (__game.player.pos.constructor)();
      const list = __game.solids().filter(s => s.mesh && s.tag !== 'post').map(s => { s.mesh.updateMatrixWorld(); const h = s.mesh.geometry.boundingBox || (s.mesh.geometry.computeBoundingBox(), s.mesh.geometry.boundingBox); const bb = h.clone().applyMatrix4(s.mesh.matrixWorld); return bb; });
      const under = (x,z) => list.some(bb => x>bb.min.x-0.1 && x<bb.max.x+0.1 && z>bb.min.z-0.1 && z<bb.max.z+0.1 && bb.max.y < P.pos.y+0.6);
      const ahead = list.filter(bb => bb.max.z < P.pos.z - 0.3 && bb.min.z > P.pos.z - 5 && bb.max.y < P.pos.y + 1.6).sort((a,b)=> (b.max.z - a.max.z))[0];
      if (ahead){ const cx=(ahead.min.x+ahead.max.x)/2; P.pos.x += (cx-P.pos.x)*0.25; }
      P.facing = Math.PI;
      return {d:__game.deaths, jump: P.grounded && !under(P.pos.x, P.pos.z-1.3), z:P.pos.z};
    });
    if (act.jump) await g.keyboard.press('Space'); if (act.d && !globalThis.dd){ globalThis.dd=1; console.log('death at frame', i, act.z); }
    await g.screenshot({path:`/tmp/frames/f${String(i++).padStart(3,'0')}.png`});
  }
  await g.keyboard.up('KeyW');
  console.log('frames', i, await g.evaluate(() => JSON.stringify([__game.level, __game.deaths, __game.player.pos.z.toFixed(1)])));
  await b.close();
})();
