import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const outDir = path.join(process.cwd(), 'diagnostics');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const logs = [];
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', (msg) => {
    try { logs.push({ type: msg.type(), text: msg.text() }); } catch (e) { logs.push({ type: 'console', text: String(e) }); }
  });
  page.on('pageerror', (err) => logs.push({ type: 'pageerror', text: String(err) }));
  page.on('requestfailed', (req) => logs.push({ type: 'requestfailed', url: req.url(), failure: req.failure() ? req.failure().errorText : undefined }));

  try {
    const resp = await page.goto('http://localhost:8081/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    const screenshotPath = path.join(outDir, 'screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const info = {
      status: resp ? resp.status() : null,
      url: resp ? resp.url() : null,
      logsCount: logs.length,
    };

    fs.writeFileSync(path.join(outDir, 'console.log'), logs.map(l => `[${l.type}] ${l.text || (l.url ? l.url + ' ' + JSON.stringify(l.failure) : '')}`).join('\n'), 'utf8');
    fs.writeFileSync(path.join(outDir, 'info.json'), JSON.stringify(info, null, 2), 'utf8');

    console.log('SUCCESS', JSON.stringify(info));
  } catch (err) {
    fs.writeFileSync(path.join(outDir, 'console.log'), 'ERROR: ' + String(err), 'utf8');
    console.error('ERROR', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();