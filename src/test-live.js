const { chromium } = require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const U = 'https://designowpro-debug.github.io/candy-cloud-dash/';
  const S = '/workspace/squid-obby/screenshots/';
  const p = await b.newPage({viewport:{width:1024,height:640}}); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()));
  await p.goto(U); await p.waitForTimeout(4000);
  console.log('start:', await p.evaluate(() => [document.documentElement.lang, document.title, getComputedStyle(document.getElementById('shopBtn')).display, __game.shop.portal]));
  await p.screenshot({path:S+'07-live-pages.png'});
  await p.click('#shopBtn'); await p.waitForTimeout(1500);
  console.log('shop buttons:', await p.evaluate(() => [...document.querySelectorAll('#packs button')].map(x => x.textContent + (x.disabled?' (disabled)':''))));
  await p.screenshot({path:S+'27-live-shop.png'});
  const f = await b.newPage(); await f.setContent(`<iframe src="${U}" width="800" height="500"></iframe>`); await f.waitForTimeout(5000);
  const fr = f.frames()[1];
  console.log('iframe portal:', await fr.evaluate(() => [__game.shop.portal, getComputedStyle(document.getElementById('shopBtn')).display, document.body.innerHTML.includes('lemonsqueezy.com/buy')]));
  console.log('ERRORS', errs.length, errs.join(' | '));
  await b.close();
})();
