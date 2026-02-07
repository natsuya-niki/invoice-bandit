import { test, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // 環境変数を読み込む

// ユーザー情報を取得する関数
const getUserCredentials = (profile: string) => {
  return {
    email: process.env[`CHOCOZAP_ID_${profile.toUpperCase()}`] || '',
    password: process.env[`CHOCOZAP_PASS_${profile.toUpperCase()}`] || '',
  };
};

test('test', async ({ page }) => {
  test.setTimeout(60_000);
  
  // 環境変数からプロファイルを取得
  const profile = process.env.TEST_PROFILE || 'profile1';
  const { email, password } = getUserCredentials(profile);

  await page.goto('https://zap-id.jp/login');
  await page.getByRole('textbox', { name: 'メールアドレスを入力してください' }).click();
  await page.getByRole('textbox', { name: 'メールアドレスを入力してください' }).fill(email);
  await page.getByRole('textbox', { name: '文字以上' }).click();
  await page.getByRole('textbox', { name: '文字以上' }).fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL('https://my.zap-id.jp/');

  await page.goto('https://my.chocozap.jp/plans');
  await page.waitForLoadState();

  await page.goto('https://my.chocozap.jp/purchases');
  const purchaseItem = page.locator('xpath=/html/body/main/div/section/ul/li[1]');
  const purchaseText = (await purchaseItem.textContent())?.trim() || '';
  const ymMatch = purchaseText.match(/(20\d{2})\s*[年\/\.-]\s*(\d{1,2})/);
  const now = new Date();
  const yyyymm = ymMatch
    ? `${ymMatch[1]}${ymMatch[2].padStart(2, '0')}`
    : `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  await page.locator('xpath=/html/body/main/div/section/ul/li[1]/a/p').click();

  // '領収書(PDF)を表示する'を右クリックしてリンクを保存
  const pdfLink = await page.getByRole('link', { name: '領収書(PDF)を表示する' });
  const pdfUrl = await pdfLink.getAttribute('href'); // PDFのURLを取得

  if (pdfUrl) { // pdfUrlがnullでないことを確認
    const downloadPromise = page.waitForEvent('download');
    await page.evaluate((url) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'receipt.pdf'; // 保存するファイル名
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, pdfUrl);

    const download = await downloadPromise;

    // ダウンロード先のパスを指定
    const downloadPath = path.join(__dirname, `../downloads/chocozap_receipt_${yyyymm}_${profile}.pdf`);
    await download.saveAs(downloadPath); // PDFを保存
  } else {
    console.error('PDFのURLが取得できませんでした。');
  }
});
