import { test, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
import { saveAndLogDownload } from './utils/downloads';

// 環境変数を読み込む
dotenv.config();

test('test', async ({ page }) => {
  test.setTimeout(60_000);

  // 環境変数からログイン情報を取得
  const email = process.env.DMM_VIRTUALOFFICE_ID || '';
  const password = process.env.DMM_VIRTUALOFFICE_PASS || '';

  await page.goto('https://virtualoffice.dmm.com/member/login');
  await page.getByRole('textbox', { name: 'メールアドレス' }).fill(email);
  await page.getByRole('textbox', { name: 'パスワード' }).fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL('https://virtualoffice.dmm.com/member/letter');

  await page.goto('https://virtualoffice.dmm.com/member/payment');
  
  // 請求書の日付を取得（例：'決済済 2025年2月 880円'から'2025年2月'を抽出）
  const receiptLink = await page.getByRole('link', { name: /決済済.*円/ }).first();
  const receiptText = await receiptLink.textContent() || '';
  const dateMatch = receiptText.match(/(\d{4}年\d{1,2}月)/);
  const dateStr = dateMatch ? dateMatch[1] : '不明な日付';
  
  await receiptLink.click();
  const page1Promise = page.waitForEvent('popup');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: '領収書ダウンロード' }).click();
  const page1 = await page1Promise;
  const download = await downloadPromise;

  // ダウンロードしたファイル名を取得
  const fileName = download.suggestedFilename() || 'DMM_VO_receipt_yyyymm.pdf'; // デフォルト名を設定
  const downloadPath = path.join(__dirname, `../downloads/${fileName}`);
  await saveAndLogDownload(download, downloadPath);
});
