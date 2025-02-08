import { test, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
import yargs from 'yargs';

dotenv.config(); // 環境変数を読み込む

// コマンドライン引数を解析
const argv = yargs(process.argv.slice(2))
  .option('profile', {
    alias: 'p',
    description: 'User profile (profile1 or profile2)',
    type: 'string',
    demandOption: true,
  })
  .argv;

// ユーザー情報を取得する関数
const getUserCredentials = (profile: string) => {
  return {
    email: process.env[`CHOCOZAP_ID_${profile.toUpperCase()}`] || '',
    password: process.env[`CHOCOZAP_PASS_${profile.toUpperCase()}`] || '',
  };
};

test('test', async ({ page }) => {
  test.setTimeout(60_000);
  
  // コマンドライン引数からプロファイルを取得
  const profile = argv.profile;
  const { email, password } = getUserCredentials(profile);

  await page.goto('https://zap-id.jp/login');
  await page.getByRole('textbox', { name: 'メールアドレスを入力してください' }).click();
  await page.getByRole('textbox', { name: 'メールアドレスを入力してください' }).fill(email);
  await page.getByRole('textbox', { name: '文字以上' }).click();
  await page.getByRole('textbox', { name: '文字以上' }).fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL('https://web.my-zap.jp/');

  await page.goto('https://my.chocozap.jp/plans');
  await page.waitForLoadState();

  await page.goto('https://my.chocozap.jp/purchases');
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
    const downloadPath = path.join(__dirname, '../downloads/chocozap_receipt.pdf'); // downloadsフォルダに変更
    await download.saveAs(downloadPath); // PDFを保存
  } else {
    console.error('PDFのURLが取得できませんでした。');
  }
});