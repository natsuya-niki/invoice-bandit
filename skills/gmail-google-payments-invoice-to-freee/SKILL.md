---
name: gmail-google-payments-invoice-to-freee
description: "GmailのGoogle Paymentsから届くGoogle Workspace請求書メールを探し、添付PDFだけをfreeeファイルボックスへ送信する。Google Paymentsの請求書をファイルボックスへ転送する依頼に使う。"
---

# Google Payments請求書をfreeeファイルボックスへ送信

Gmailコネクタを使い、Google PaymentsのGoogle Workspace請求書メールからPDFだけを取得し、freeeファイルボックスへ新規メールとして送信する。ブラウザ操作、元メールの転送、freeeの取引登録は行わない。

## 対象メールの特定

1. Gmailの認証済みアカウントを確認する。
2. 次の条件でGoogle Paymentsメールを検索する。

   `from:payments-noreply@google.com has:attachment filename:pdf -in:spam -in:trash`

3. 送信者が `Google Payments <payments-noreply@google.com>` で、件名がGoogle Workspaceの請求書であることを確認する。
4. 依頼で請求月や請求書番号の指定がない場合は、最新メールを対象にする。日時が同じ候補などで最新を一意に決められない場合は送信しない。
5. `gmail_read_email` と `gmail_read_attachment` で添付一覧を確認する。MIMEタイプが `application/pdf` で、`read_attachment_supported` がtrueのPDFだけを対象にする。
6. PDFが0件または複数件の場合は送信しない。HTML、画像、元メール本文、他形式の添付は送らない。

## freeeファイルボックスへの送信

- 既定の送信先は `ファイルボックスfreee <1485229230+yux4@mail-receiver.freee.co.jp>`。ユーザー指定があれば指定を優先する。
- `gmail_send_email` で新規メールを作成し、選別したPDF 1件だけを `multipart/mixed` の `application/pdf` 添付として送る。
- 件名は指定がなければ `freeeファイルボックス登録 <PDFファイル名>` とする。
- 本文は「freeeファイルボックス登録用の請求書PDFを送付します。」程度にする。
- ユーザーが「送信して」「転送して」などと明示するまでは送信しない。
- 送信結果が不明な場合は自動再送しない。

## 境界

- このスキルはPDFをfreeeファイルボックスに送るだけであり、freeeの取引、勘定科目、取引先、インボイス情報は登録・変更しない。
- 送信後のファイルボックス反映確認や取引登録が必要な場合は、ユーザーから別途依頼を受ける。

## 報告

完了時は、対象メールの件名、請求書番号またはPDF名、送信先、送信結果のGmailメッセージIDを簡潔に報告する。
