# セットアップ手順

このリポジトリを使用するためのセットアップ手順は以下の通りです。

## 1. リポジトリのクローン

まず、リポジトリをクローンします。


## 2. 依存関係のインストール

次に、必要な依存関係をインストールします。

```
pnpm install
pnpm exec playwright install
```

## 3. 環境変数の設定

`.env`ファイルを作成します。（`.env.sample`を参考に）

## 4. 領収書取得の実行

以下のコマンドを使用します。
ブラウザでの動作を確認するために`--debug`オプション、
また、Chromeしか動作確認してないので`--project=chromium`オプションで使用するプロファイルを指定します。
```
# `--profile`オプションで使用するプロファイルを指定します。
TEST_PROFILE=profile1 pnpm playwright test tests/chocozap.spec.ts --project=chromium --headed
TEST_PROFILE=profile2 pnpm playwright test tests/chocozap.spec.ts --project=chromium --headed

pnpm playwright test tests/freee.spec.ts --project=chromium --headed
pnpm playwright test tests/attcom.spec.ts --project=chromium --headed
pnpm playwright test tests/d_virtual_office.spec.ts --project=chromium --headed
```

## 4.1 PDFファイル名の規則

Playwright実行で生成されるPDFは `downloads` フォルダに保存されます。ファイル名はテストごとに以下の規則です。

- atTCOM: `atTCOM_${fileNameText}.pdf`（画面の表セル文字列を取得して付与）
- atTCOM（PlayLite実行例）: `fileNameText = 2026年02月請求分` → `atTCOM_2026年02月請求分.pdf`
- DMM Virtual Office: `download.suggestedFilename()` をそのまま使用。取得できない場合は `DMM_VO_receipt_yyyymm.pdf`
- DMM Virtual Office（実行例）: `DMMVO_202601.pdf`
- freee: 領収書PDFのインボイス番号付きファイル名を使用（例: `領収書_INV12345678.pdf`）
- chocozap: `chocozap_receipt_${YYYYMM}_${profile}.pdf`（`TEST_PROFILE` 環境変数。未設定は `profile1`）

出力先: `./downloads`

## 5. その他のコマンド

以下のコマンドも利用可能です。

- `pnpm playwright test`  
  Runs the end-to-end tests.

- `pnpm playwright test --ui`  
  Starts the interactive UI mode.

- `pnpm playwright test --project=chromium`  
  Runs the tests only on Desktop Chrome.

- `pnpm playwright test example`  
  Runs the tests in a specific file.

- `pnpm playwright test --debug`  
  Runs the tests in debug mode.

- `pnpm playwright codegen`  
  Auto generate tests with Codegen.

We suggest that you begin by typing:

```
pnpm playwright test
```

And check out the following files:
- `./tests/example.spec.ts` - Example end-to-end test
- `./tests-examples/demo-todo-app.spec.ts` - Demo Todo App end-to-end tests
- `./playwright.config.ts` - Playwright Test configuration

Visit https://playwright.dev/docs/intro for more information. ✨
