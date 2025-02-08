import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// 環境変数の読み込み
dotenv.config();

test('test', async ({ page }) => {
  await page.goto('https://www.t-com.ne.jp/hplogin/');
  await page.getByRole('link', { name: 'マイページへログインする' }).click();
  await page.getByRole('textbox', { name: '[ユーザID入力例]A01z123456' }).fill(process.env.TCOM_USER_ID || '');
  await page.getByRole('button', { name: '次へ' }).click();
  await page.getByRole('textbox', { name: '前画面で入力したIDのパスワード' }).fill(process.env.TCOM_PASSWORD || '');
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForLoadState('networkidle'); // ネットワークがアイドル状態になるまで待機

  // 適格請求書ページに移動(直リンクするとセッション切れる)
  await page.getByRole('link', { name: '右向きの矢印 ご利用明細を確認する' }).click();
  await page.getByRole('link', { name: '右向きの矢印適格請求書一覧' }).click();
  
  const page1Promise = page.waitForEvent('popup');
  await page.locator('//*[@id="wrapper"]/div[1]/div[2]/ul[2]/li[1]/ul/li[2]/a').click();
  const page1 = await page1Promise;

  // ファイル名を取得
  const fileNameElement = await page1.locator('xpath=/html/body/section/article/div[2]/table/tbody/tr/td[1]/table/tbody/tr[1]/td[2]');
  const fileNameText = await fileNameElement.innerText();
  const finalFileName = `atTCOM_${fileNameText}.pdf`;
  
  // ページが表示されるのを待つ
  await page1.waitForLoadState('domcontentloaded');

  const pdfPath = path.join(__dirname, '../downloads', finalFileName);
  await page1.pdf({ path: pdfPath, format: 'A4', printBackground: true});
  console.log(`PDFが保存されました: ${pdfPath}`);
});