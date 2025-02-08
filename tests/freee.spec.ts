import { test, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // 環境変数を読み込む

test('test', async ({ page }) => {
  test.setTimeout(60_000);

  // ログイン
  await page.goto('https://accounts.secure.freee.co.jp/');
  await page.waitForLoadState();
  await page.locator('body').click();
  await expect(page.getByTestId('login-id-form')).toBeVisible();
  await page.getByTestId('login-id-form').fill(process.env[`FREEE_ID`] || '');
  await page.getByTestId('password-form').fill(process.env[`FREEE_PASS`] || '');
  await page.getByTestId('submit').click();
  await page.waitForURL('https://accounts.secure.freee.co.jp/');
  
  // 請求管理から請求書を探す
  await page.goto('https://accounts.secure.freee.co.jp/company_settings/invoices');

  // 現在の日付を取得
  const currentDate = new Date();
  // 2ヶ月前の日付を計算
  const twoMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

  // 日付をYYYY-MM-DD形式で出力
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  console.log(`現在の日付: ${formatDate(currentDate)}`);
  console.log(`2ヶ月前の日付: ${formatDate(twoMonthsAgo)}`);

  // 請求書の行を取得
  await page.waitForSelector('.vb-listTable__table tbody');
  const rows = await page.$$('.vb-listTable__table tbody tr');

  // 行数をコンソールに出力
  console.log(`取得した行数: ${rows.length}`);

  for (const row of rows) {
    // 請求日を取得（1列目）
    const billingDateText = await row.$eval('td:nth-child(1) .vb-tableListCell__text', (el: HTMLElement) => el.innerText);
    const billingDate = new Date(billingDateText);
    console.log(`請求日: ${formatDate(billingDate)}`);

    // 決済ステータスを取得（6列目）
    const paymentStatus = await row.$eval('td:nth-child(6)', (el: HTMLElement) => el.innerText);

    // 条件をチェック
    if (billingDate >= twoMonthsAgo && paymentStatus.includes('支払い済')) {
      // 条件を満たす場合の操作をここに記述
      console.log(`請求日: ${billingDateText}, 決済ステータス: ${paymentStatus}`);

      // 要素を再取得してからクリック
      const clickableRow = await page.$(`.vb-tableListRow:has(td:nth-child(1) .vb-tableListCell__text:has-text("${billingDateText}"))`);
      if (clickableRow) {
        // 請求書画面へ移動
        await clickableRow.click();
        await page.waitForLoadState();

        // PDFダウンロードの処理
        const page1Promise = page.waitForEvent('popup');
        await page.getByRole('button', { name: '領収書' }).click();
        const page1 = await page1Promise;

        // PDFダウンロードのイベントを待機
        const downloadPromise = page1.waitForEvent('download');
        const downloadLink = await page1.getByRole('link', { name: 'download ダウンロード' });
        const fileName = (await downloadLink.evaluate((el: HTMLAnchorElement) => el.download || el.href.split('/').pop())) || 'freee_invoice.pdf';
        await downloadLink.click();
        const download = await downloadPromise;

        // ダウンロード先のパスを指定
        const downloadPath = path.join(__dirname, '../downloads', fileName); // downloadsフォルダに保存
        await download.saveAs(downloadPath); // PDFを保存

        // ダウンロードが完了した後にポップアップを閉じる
        console.log('PDFがダウンロードされました。領収書画面を閉じます。');
        await page1.close(); // ポップアップを閉じる

        // ブラウザバック
        await page.goBack(); // ブラウザバック

        // ページが完全に読み込まれるのを待つ
        await page.waitForLoadState('domcontentloaded');

        // 特定の要素が表示されるまで待機（例: 請求書のテーブルが表示されるのを待つ）
        await page.waitForSelector('.vb-listTable__table tbody', { state: 'visible' });

        // 3秒待機
        // await page.waitForTimeout(3000); // 3000ミリ秒（3秒）待機

        // 次のループに進む
      } else {
        console.error('クリック可能な行が見つかりませんでした。');
      }
    } else {
      // 条件を満たさない場合も表示
      console.log(`請求日: ${billingDateText}, 決済ステータス: ${paymentStatus} (条件未満)`);
    }
  }
});