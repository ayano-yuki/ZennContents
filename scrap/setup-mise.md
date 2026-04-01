# miseのセットアップ

- Created at: 2026-04-01
- Closed: false
- Archived: false

---

## 環境の有効化

PowerShellには、起動時に必ず読み込まれる設定ファイル（プロファイル）があります。ここに miseの`activate` コマンドを記述します。

1. プロファイルが存在するか確認
    ```powershell
    # PowerShellで以下を実行して、プロファイルファイルの有無を確認します。
    Test-Path $PROFILE

    # `False` と表示された場合は、まだファイルが存在しないため、以下のコマンドで新規作成します。
    New-Item -Type File -Path $PROFILE -Force
    ```
2. プロファイルに書き込む内容
    ```powershell
    # `$PROFILE`（通常は `Documents\PowerShell\Microsoft.PowerShell_profile.ps1`）をテキストエディタで開き、以下のコードを追記します。

    # miseの有効化
    # Get-Command で mise がインストールされているかチェックしてから実行する（エラー防止）
    if (Get-Command "mise" -ErrorAction SilentlyContinue) {
        mise activate powershell | Out-String | Invoke-Expression
    }
    ```

> **【技術的な補足】**
> `mise activate powershell` は、実行すると「PowerShell用の関数や環境設定コード」を文字列として画面に出力します。それを `Invoke-Expression`（略称 `iex`）に渡して実行させることで、現在のシェルセッションに `mise` の全機能を動的に組み込んでいます。

---

## 使い方（ディレクトリ別に環境を変える）

`mise activate` を設定することで、プロジェクトごとに最適な開発環境が自動的に構築されます。

1. 自動切り替えの仕組み
    - プロジェクトのルートディレクトリに `.mise.toml` を配置すると、そのディレクトリに入った瞬間、指定したバージョンに切り替わります。

    ```toml
    # .mise.toml の例
    [tools]
    node = "20.10.0"
    python = "3.12"
    ```
2. 導入のメリット
   - **ディレクトリ移動で即座に反映:** `cd` でプロジェクトに入った瞬間にツールが切り替わります。
   - **シェル補完:** `mise install [TAB]` などの補完が効くようになります。
   - **環境変数の管理:** プロジェクト固有の環境変数（`DB_PASSWORD`など）も `.mise.toml` で管理可能です。

