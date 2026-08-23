---
name: gmail-slack-receipt-pdf-to-freee
description: "Gmailで未アーカイブのSlackメールからReceipt PDFだけを取得してfreeeファイルボックスへ送信し、メール受信日を証憑日に設定する。freeeの取引登録は行わない。"
---

# Slack Receipt PDFをfreeeファイルボックスへ送信

Gmailとfreee MCPを使い、Slackから届いたReceipt PDFだけをfreeeファイルボックスへ登録する。証憑の `issue_date` はPDF記載日ではなく、元メールの受信日（日本時間）にする。freeeの取引（deal）は登録・更新しない。

## 前提

- Gmailの検索・添付取得・送信はGmailコネクタを使う。ブラウザ操作や元メールの一括転送は使わない。
- freeeのファイルボックス操作はfreee MCPを使う。直接HTTP通信は使わない。
- 既定の送信先は `ファイルボックスfreee <1485229230+yux4@mail-receiver.freee.co.jp>`。ユーザー指定があれば指定を優先する。
- このスキルでは `/api/1/deals` へのPOST・PUTを絶対に実行しない。勘定科目、取引先、決済、支払、タグも登録・更新しない。

## Gmail検索とReceipt選別

1. Gmailの認証済みアカウントを確認する。
2. `gmail_search_emails` で、未アーカイブかつPDF添付のSlackメールを検索する。基本条件は次のとおり。

   `in:inbox has:attachment filename:pdf {-in:spam -in:trash} {from:slack from:slack.com}`

3. 検索結果から送信者、件名、受信日時、添付一覧を確認し、Slack由来であることを確定する。候補が複数で依頼対象を特定できない場合は送信しない。
4. `gmail_read_email` と `gmail_read_attachment` で添付を確認する。
5. ファイル名に拡張子を除いて `Receipt` を含むPDFだけを対象にする（大文字小文字は区別しない）。`slack_fair_billing_statement`、画像、HTML、CSV、その他のPDFは送らない。
6. Receipt PDFが0件または2件以上なら送信しない。`read_attachment_supported` が false の場合も処理を止める。
7. Gmailの受信日時を日本時間の日付 `yyyy-mm-dd` に変換して保持する。これはfreeeファイルボックスの証憑日に使う。

## 送信前確認と送信

1. 送信前に、元メールの送信者・件名・受信日時、送信先、件名、Receipt PDFのファイル名・サイズを提示する。
2. ユーザーが「送信して」などと明示するまでは `gmail_send_email` を呼ばない。
3. `gmail_send_email` でReceipt PDF 1件だけを `application/pdf` の添付として送る。元メールの本文や別添付は含めない。
4. 件名は指定がなければ `freeeファイルボックス登録 <ファイル名>`、本文は短い登録案内にする。
5. 送信結果が不明な場合は自動再送しない。

## freeeファイルボックスの証憑日設定

1. 送信後、`freee_auth_status` と `freee_get_current_company` で認証と事業所を確認する。
2. 送信前に取得したファイルボックス一覧を使える場合は基準にし、`freee_api_get` の `/api/1/receipts` で送信後に追加された `origin=mail` のReceiptを探す。`created_at` が送信時刻より後で、対象PDFと1件に確定できるものだけを更新する。
3. 対象がまだ反映されていない、候補が複数ある、または対象PDFとの対応を確認できない場合はfreee更新を行わず、送信済みだが証憑日未設定と報告する。
4. 対象が一意に確定した場合だけ、`freee_api_put` の `/api/1/receipts/{receipt_id}` に `company_id` と `receipt_metadatum.issue_date`（Gmail受信日の日本時間）だけを渡す。既存の発行元・金額・インボイス情報・書類種別は変更しない。
5. 更新後に同じReceiptを `freee_api_get` で再取得し、`receipt_metadatum.issue_date` が受信日と一致することを確認する。

## 報告

完了時は、元メールの受信日、送信したPDF名、freee Receipt ID、証憑日に設定した日付を報告する。「取引登録なし」も明記する。Gmailメッセージ本文や認証情報など不要な個人情報は出力しない。
