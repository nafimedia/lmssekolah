import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../public/docs/screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  console.log('Launching Puppeteer with system Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();
  const baseUrl = 'http://localhost:5173';

  try {
    // 1. Capture Login Portal
    console.log('Capturing Auth Portal...');
    await page.goto(`${baseUrl}/auth`, { waitUntil: 'networkidle2', timeout: 20000 });
    await page.waitForSelector('button[type="submit"], input[type="text"], input[type="email"]', { timeout: 10000 });
    await page.screenshot({ path: path.join(outDir, 'auth_portal.png') });
    console.log('Saved auth_portal.png');

    // 2. Login as Siswa
    console.log('Logging in as Siswa...');
    const identifierInput = await page.$('input[placeholder*="Email"], input[name="identifier"], input[type="text"]');
    if (identifierInput) {
      await identifierInput.click({ clickCount: 3 });
      await identifierInput.type('siswa@mtsn2cilacap.sch.id');
    }
    const passInput = await page.$('input[type="password"]');
    if (passInput) {
      await passInput.click({ clickCount: 3 });
      await passInput.type('asd123');
    }
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    }

    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, 'siswa_dashboard.png') });
    console.log('Saved siswa_dashboard.png');

    const clickTab = async (tabText, filename) => {
      try {
        const elements = await page.$$('button, a, [role="tab"]');
        for (const el of elements) {
          const text = await page.evaluate(e => e.textContent || '', el);
          if (text.toLowerCase().includes(tabText.toLowerCase())) {
            await el.click();
            await new Promise(r => setTimeout(r, 1500));
            await page.screenshot({ path: path.join(outDir, filename) });
            console.log(`Saved ${filename}`);
            return true;
          }
        }
      } catch (err) {
        console.log(`Failed tab ${tabText}: ${err.message}`);
      }
      return false;
    };

    await clickTab('Materi', 'siswa_materi.png');
    await clickTab('CBT', 'siswa_cbt.png');
    await clickTab('Tahfidz', 'siswa_tahfidz.png');
    await clickTab('Rapor', 'siswa_rapor.png');

    // 3. Login as Guru
    console.log('Switching to Guru...');
    await page.goto(`${baseUrl}/auth`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${baseUrl}/auth`, { waitUntil: 'networkidle2' });
    const idGuru = await page.$('input[placeholder*="Email"], input[name="identifier"], input[type="text"]');
    if (idGuru) {
      await idGuru.click({ clickCount: 3 });
      await idGuru.type('guru@mtsn2cilacap.sch.id');
    }
    const passGuru = await page.$('input[type="password"]');
    if (passGuru) {
      await passGuru.click({ clickCount: 3 });
      await passGuru.type('asd123');
    }
    const btnGuru = await page.$('button[type="submit"]');
    if (btnGuru) {
      await btnGuru.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    }
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, 'guru_dashboard.png') });
    console.log('Saved guru_dashboard.png');

    await clickTab('Ruang Mengajar', 'guru_ruang_mengajar.png');
    await clickTab('Bank Soal', 'guru_bank_soal.png');

    // 4. Login as Kamad
    console.log('Switching to Kamad...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${baseUrl}/auth`, { waitUntil: 'networkidle2' });
    const idKamad = await page.$('input[placeholder*="Email"], input[name="identifier"], input[type="text"]');
    if (idKamad) {
      await idKamad.click({ clickCount: 3 });
      await idKamad.type('kamad@mtsn2cilacap.sch.id');
    }
    const passKamad = await page.$('input[type="password"]');
    if (passKamad) {
      await passKamad.click({ clickCount: 3 });
      await passKamad.type('asd123');
    }
    const btnKamad = await page.$('button[type="submit"]');
    if (btnKamad) {
      await btnKamad.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    }
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, 'kamad_dashboard.png') });
    console.log('Saved kamad_dashboard.png');

  } catch (e) {
    console.error('Error during capture:', e);
  } finally {
    await browser.close();
    console.log('Capture completed.');
  }
}

capture();
