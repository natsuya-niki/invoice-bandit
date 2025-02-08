# セットアップ手順

このリポジトリを使用するためのセットアップ手順は以下の通りです。

## 1. リポジトリのクローン

まず、リポジトリをクローンします。


## 2. 依存関係のインストール

次に、必要な依存関係をインストールします。

```
yarn install
```

## 3. 環境変数の設定

`.env`ファイルを作成します。（`.env.sample`を参考に）

## 4. テストの実行

テストを実行するには、以下のコマンドを使用します。`--profile`オプションで使用するプロファイルを指定します。

```
yarn playwright test tests/chocozap.spec.ts -- --profile profile1
yarn playwright test tests/chocozap.spec.ts -- --profile profile2
```

## 5. その他のコマンド

以下のコマンドも利用可能です。

- `yarn playwright test`  
  Runs the end-to-end tests.

- `yarn playwright test --ui`  
  Starts the interactive UI mode.

- `yarn playwright test --project=chromium`  
  Runs the tests only on Desktop Chrome.

- `yarn playwright test example`  
  Runs the tests in a specific file.

- `yarn playwright test --debug`  
  Runs the tests in debug mode.

- `yarn playwright codegen`  
  Auto generate tests with Codegen.

We suggest that you begin by typing:

```
yarn playwright test
```

And check out the following files:
- `./tests/example.spec.ts` - Example end-to-end test
- `./tests-examples/demo-todo-app.spec.ts` - Demo Todo App end-to-end tests
- `./playwright.config.ts` - Playwright Test configuration

Visit https://playwright.dev/docs/intro for more information. ✨
