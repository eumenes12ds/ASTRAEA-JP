# tavern_helper_template

酒場アシスタントでフロントエンドUIやスクリプトを作成するためのテンプレートです。

## 使用方法

ページ右上の緑色の `Code` ボタン → `Download ZIP` をクリックして本テンプレートの圧縮パッケージをダウンロードし、ローカルでのみ使用することもできますし、緑色の `Use this template` ボタンからこのテンプレートをベースにした新しいリポジトリを作成することもできます。

どちらの方法でも、[チュートリアルドキュメント](https://stagedog.github.io/青空莉/工具经验/实时编写前端界面或脚本/)をお読みいただき、使用方法をご確認ください。

### ローカルのみで使用する場合

つまり、以下のことができなくなります：

- jsdelivr を利用したフロントエンドUIやスクリプトの自動更新ができなくなります
- 本テンプレートが提供する自動パッケージング、テンプレートの自動更新、サードパーティ製ライブラリの依存関係、酒場アシスタントの `@types` フォルダの機能も利用できなくなります

ただし、ローカルでもこのテンプレートを引き続き簡単に使用できます。

リポジトリとして使用したい場合は、まず [Learn Git Branching](https://learngitbranching.js.org/?locale=zh_CN) で git のブランチとマージを学習してください。

### 新しいリポジトリとして作成する場合

#### `.vscode/launch.json` ファイル

`.vscode/launch.json` ファイルにはあなたの酒場のアドレスが記入されているため、クラウド酒場の IP アドレスが公開されるのを防ぐために、この変更を無視するコマンドを実行する必要があるかもしれません：

```bash
git update-index --skip-worktree .vscode/launch.json
```

#### jsdelivr を利用したフロントエンドUIやスクリプトの自動更新

作成したフロントエンドUIやスクリプトは GitHub リポジトリにパッケージングされるため、jsdelivr のリンクでアクセスできるようになります。このリンクはフロントエンドUIやスクリプト内で直接使用できます。

これにより、ユーザー向けに以下のような自動更新されるフロントエンドUIを作成できます：

```html
<body>
  <script>
    $('body').load('https://testingcf.jsdelivr.net/gh/lolo-desu/lolocard/dist/日记络络/界面/介绍页/index.html')
  </script>
</body>
```

または自動更新されるスクリプト：

```typescript
import 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/酒馆助手/场景感/index.js'
```

詳細は[ドキュメント](https://stagedog.github.io/青空莉/工具经验/实时编写前端界面或脚本/进阶技巧)をご参照ください。

#### 自動パッケージング、テンプレートの自動更新、サードパーティ製ライブラリの依存関係、酒場アシスタントの `@types` フォルダ

本リポジトリは `.github/workflows` フォルダにいくつかの CI ワークフローを設定しており、自動パッケージング、依存関係の自動更新、酒場アシスタントの `@types` フォルダの機能を提供します。ページ上部の `Actions` から手動で実行することもできます：

- `bundle.yaml`: `src` フォルダ内のコードを `dist` フォルダに自動パッケージングし、バージョン番号を自動的にインクリメントすることで、jsdelivr のキャッシュをより早く更新できるようにします。
- `bump_deps.yaml`: サードパーティ製ライブラリの依存関係と酒場アシスタントの `@types` フォルダを自動更新します。
- `sync_template.yaml`: テンプレートリポジトリをベースに新しいリポジトリを作成すると、その新しいリポジトリはテンプレートリポジトリとの関連を持たなくなります。そのため、テンプレートリポジトリの更新（プログラミングアシスタントの作成ルール、MCP、slash_command.txt ファイルなど）を同期するためのワークフローを用意しました。テンプレートリポジトリ内で同期を継続したくないファイルがある場合は、`.github/.templatesyncignore` に追加してください。

これらを正常に動作させるには、リポジトリの `Settings -> Actions -> General` で `Workflow permissions` を `Read and write permissions` に設定し、`Allow GitHub Actions to create and approve pull requests` にチェックを入れる必要があります。

#### パッケージングの競合問題

自動更新とパッケージングのため、本プロジェクトはソースコードを `dist/` フォルダに直接パッケージングしてリポジトリと一緒にアップロードします。そのため、開発中にブランチの競合が頻繁に発生することがあります。

これを解決するため、リポジトリは `.gitattribute` で、`dist/` フォルダ内の競合では常に現在のバージョンを使用するよう設定しています。これで問題はありません。アップロード後、CI が `dist/` フォルダを最新バージョンに再パッケージングするため、アップロードした `dist/` フォルダの内容は重要ではありません。

この機能を有効にするには、以下のコマンドを一度実行してください：

```bash
git config --global merge.ours.driver true
```

## ライセンス

[Aladdin](LICENSE)
