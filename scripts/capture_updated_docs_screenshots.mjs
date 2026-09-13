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

async function captureUpdatedDocs() {
  console.log('Launching browser for airtight privacy blur capture...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
    defaultViewport: { width: 1400, height: 900, deviceScaleFactor: 1.5 },
  });

  const baseUrl = 'http://localhost:5173';

  // Airtight privacy blur helper
  const applyPrivacyBlur = async (page) => {
    await page.evaluate(() => {
      // 1. Remove or hide any Sonner toast popups
      const toasts = document.querySelectorAll('[data-sonner-toast], [data-sonner-toaster], section[aria-label="Notifications"]');
      toasts.forEach(t => {
        t.style.display = 'none';
        t.style.opacity = '0';
      });

      // 2. Add style sheet for blurring all identity elements
      let style = document.getElementById('privacy-blur-style');
      if (!style) {
        style = document.createElement('style');
        style.id = 'privacy-blur-style';
        document.head.appendChild(style);
      }
      style.innerHTML = `
        /* Blur User Avatar & Names in Header */
        header button:has([class*="avatar"]),
        header [class*="avatar"],
        header .text-xs.font-bold.text-foreground.truncate,
        header .text-\\[10px\\].text-muted-foreground.font-bold.uppercase,
        /* Blur User Avatar & Names in Sidebar Footer */
        [data-sidebar="footer"],
        aside > div:last-child,
        /* Target blur class */
        .identity-blur-box {
          filter: blur(8px) !important;
          opacity: 0.7 !important;
          user-select: none !important;
        }
      `;

      // 3. Scan and blur any element containing identifiable teacher/student names or NIP/NISN
      const elements = document.querySelectorAll('h1, h2, h3, h4, p, span, strong, div');
      const sensitiveWords = ['SOBIYATI', 'ALI MANSUR', 'ALIYA QIARA', 'ABDULLAH', 'AFINDA', 'Penyusun:', 'S.Pd', 'M.Pd'];
      
      elements.forEach(el => {
        // If it's a leaf node or direct text
        if (el.children.length === 0 && el.innerText) {
          const t = el.innerText.trim();
          const isMatch = sensitiveWords.some(w => t.includes(w)) || t.match(/\b\d{10,18}\b/);
          if (isMatch) {
            el.classList.add('identity-blur-box');
          }
        }
      });

      // Also blur top-right button directly
      const headerBtns = document.querySelectorAll('header button');
      headerBtns.forEach(b => {
        if (b.querySelector('[class*="avatar"]') || b.querySelector('img') || b.innerText.includes('GURU') || b.innerText.includes('SISWA')) {
          b.classList.add('identity-blur-box');
        }
      });

      // Also blur sidebar footer directly
      const footers = document.querySelectorAll('[data-sidebar="footer"], aside > div:last-child');
      footers.forEach(f => f.classList.add('identity-blur-box'));
    });
  };

  try {
    // ====================================================
    // 1. GURU CONTEXT: BAHAN AJAR (List & Upload Form)
    // ====================================================
    console.log('--- 1. GURU SESSION ---');
    const guruContext = await browser.createBrowserContext();
    const pageGuru = await guruContext.newPage();

    console.log('Logging in as Guru...');
    await pageGuru.goto(`${baseUrl}/auth`, { waitUntil: 'networkidle2' });
    const idGuru = await pageGuru.waitForSelector('input[placeholder*="Email"], input[name="identifier"], input[type="text"]');
    await idGuru.type('guru@mtsn2cilacap.sch.id');

    const passGuru = await pageGuru.$('input[type="password"]');
    await passGuru.type('asd123');

    const btnSubmitGuru = await pageGuru.$('button[type="submit"]');
    await btnSubmitGuru.click();
    await pageGuru.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    // Buka Ruang Mengajar
    console.log('Opening Ruang Mengajar...');
    await pageGuru.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, a'));
      const rmBtn = items.find(el => el.textContent.includes('Ruang Mengajar'));
      if (rmBtn) rmBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Klik Tab 'Materi'
    console.log('Switching to Tab Materi...');
    await pageGuru.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
      const matTab = tabs.find(t => t.textContent.includes('Materi'));
      if (matTab) matTab.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await applyPrivacyBlur(pageGuru);

    const guruBahanAjarPath = path.join(outDir, 'guru_bahan_ajar.png');
    await pageGuru.screenshot({ path: guruBahanAjarPath });
    console.log(`Saved ${guruBahanAjarPath}`);

    // Buka Modal "+ Tambah Modul / Bahan Ajar"
    console.log('Opening Upload Bahan Ajar Dialog...');
    const openedUpload = await pageGuru.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.textContent.includes('Tambah Modul') || b.textContent.includes('Bahan Ajar') || b.textContent.includes('Unggah'));
      if (addBtn) {
        addBtn.click();
        return true;
      }
      return false;
    });

    if (openedUpload) {
      await new Promise(r => setTimeout(r, 1200));
      await applyPrivacyBlur(pageGuru);
      const guruUploadFormPath = path.join(outDir, 'guru_bahan_ajar_form.png');
      await pageGuru.screenshot({ path: guruUploadFormPath });
      console.log(`Saved ${guruUploadFormPath}`);
    }

    // ----------------------------------------------------
    // CAPTURE UPDATED GURU LKPD EDITOR
    // ----------------------------------------------------
    console.log('Navigating to Ruang Mengajar -> Tugas & LKPD...');
    await pageGuru.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 800));

    // Click Tab 'Tugas & LKPD'
    await pageGuru.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
      const lkpdTab = tabs.find(t => t.textContent.includes('Tugas & LKPD'));
      if (lkpdTab) lkpdTab.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Click 'Buat LKPD Baru'
    await pageGuru.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const createBtn = btns.find(b => b.textContent.includes('Buat LKPD') || b.textContent.includes('Buat Tugas') || b.textContent.includes('Aktivitas Baru'));
      if (createBtn) createBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await applyPrivacyBlur(pageGuru);

    const guruLkpdPath = path.join(outDir, 'guru_lkpd.png');
    await pageGuru.screenshot({ path: guruLkpdPath });
    console.log(`Saved updated ${guruLkpdPath}`);

    await guruContext.close();

    // ====================================================
    // 2. SISWA CONTEXT: BAHAN AJAR (List & Step Gating)
    // ====================================================
    console.log('--- 2. SISWA SESSION ---');
    const siswaContext = await browser.createBrowserContext();
    const pageSiswa = await siswaContext.newPage();

    console.log('Logging in as Siswa...');
    await pageSiswa.goto(`${baseUrl}/auth`, { waitUntil: 'networkidle2' });
    const idSiswa = await pageSiswa.waitForSelector('input[placeholder*="Email"], input[name="identifier"], input[type="text"]');
    await idSiswa.type('siswa@mtsn2cilacap.sch.id');

    const passSiswa = await pageSiswa.$('input[type="password"]');
    await passSiswa.type('asd123');

    const btnSubmitSiswa = await pageSiswa.$('button[type="submit"]');
    await btnSubmitSiswa.click();
    await pageSiswa.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    // Buka menu Bahan Ajar di sidebar siswa
    console.log('Opening Bahan Ajar & Materi on Siswa sidebar...');
    await pageSiswa.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, a'));
      const matBtn = items.find(el => el.textContent.includes('Bahan Ajar') || el.textContent.includes('Materi'));
      if (matBtn) matBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await applyPrivacyBlur(pageSiswa);

    const siswaBahanAjarPath = path.join(outDir, 'siswa_bahan_ajar.png');
    await pageSiswa.screenshot({ path: siswaBahanAjarPath });
    console.log(`Saved ${siswaBahanAjarPath}`);

    await siswaContext.close();

  } catch (err) {
    console.error('Error in captureUpdatedDocs:', err);
  } finally {
    await browser.close();
    console.log('Done capturing updated documentation screenshots.');
  }
}

captureUpdatedDocs();
