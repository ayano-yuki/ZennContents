---
title: "【Gitの備忘録】基本コマンドとその解説"
emoji: "📓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["git", "github"]
published: true
---
# はじめに
こんにちは！
初めて記事を執筆するアヤノです。

この記事は、git/githubを扱う上で学んだコトをアウトプットするために書きました。間違っている個所や、「git/githubを使うなら、ココも学んだ方がいいよ」等の意見がありましたら、教えてくださると幸いです。

# gitの初期設定
この章では、Gitをインストールした時に行う初期設定について説明します。
基本的には、windowsでgitを使うために行う設定をまとめています。

## 基本情報の登録
git/git hubにデータをプッシュ（アップロード）した際に、自身が行ったコミット（変更履歴）を明確にするために行います。

```bash
git config --global user.name [your-name]       # コミット時に表示する名前の設定
git config --global user.email [your-email]     # コミット時に表示するメールアドレスの設定
git config --list                               # 現在設定されているgitの設定の表示
```
## proxy設定の登録
学内や会社でgithubにあるリポジトリにプッシュをする際に、proxyが原因でプッシュができない場合があります。その時に行う設定がこの設定です。

この設定をすると、githubにプッシュをする際に必ずproxyが必要になるので、proxyが無い環境でもgithubにプッシュをする場合は、注意してください。

```bash
git config --global http.proxy [http-proxy]
git config --global https.proxy [https-proxy]
```

## proxy設定の削除
gitに設定したproxyの情報を削除する場合は、以下のコマンドを使います。

ちなみに、gitに設定した情報を削除する場合は、「git config --global --unset [項目]」を叩きます。

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

# git pushの解説
この章では、ローカルリポジトリのコミットをgithubにあるリモートリポジトリに反映させるためのpushコマンドについて説明します。

## 初めてのpush
githubにリポジトリを作成した時に行う最初のプッシュです。通常時に行うときと似ていますが、所々違うので、区別して使えるようにしてください。

```bash
git init                                     # ローカルリポジトリの作成
git add [file]                               # 指定したファイルを変更履歴に追加（「.」の場合は全てのファイル）
git commit -m [message]                      # git addで指定したファイルにコミットを記入
git branch -M main                           # 現在のブランチをmainに変更
git remote add origin [repository-address]   # リモートリポジトリの設定
git push -u origin main                      # ローカルリポジトリのコミットをリモートリポジトリにプッシュ
```

## 通常時のpush
初回以外で行うプッシュです。git flowを使うかどうかは、個人/チーム次第です。

```bash
git switch -C [git-flow]/[branch-name]        # Git Flowのワークフロー内で、指定されたブランチに切り替える（存在しない場合は、新しいブランチを作成）
git add [file]　　　　　　　　　　　　　　　  　 # 指定したファイルを変更履歴に追加（「.」の場合は全てのファイル）
git commit -m [message]                       # git addで指定したファイルにコミットを記入
git push -u origin [git-flow]/[branch-name]   # ローカルリポジトリのコミットをリモートリポジトリにプッシュ
```

# git flow
Git Flowは、Gitを用いた開発において、ブランチの管理を体系的に行うための一連のワークフローのことです。使い方は、ブランチ名を「[git-flow]/[branch-name]」にするだけです。

これを使うと、「このブランチは、何のブランチ？」や、「機能開発とバグ処理がごちゃ混ぜだ～」等の問題を減らすことができます。しかし、「ブランチ数が多くなりすぎる」や、「学習コストが...」等のデメリットもあるので、使う際は、どのワークフローを使うかを事前に話し合ったほうが良いかもです。

|  種類   | 説明                                                       |
|:---:|---|
|  main   | マージを行うだけのブランチ                                 |
| develop | 開発の中心となるブランチ                                   |
| feature | 機能の追加や変更、バグ修正などを行うブランチ               |
| release | 製品をリリースするために使うブランチ                       |
| hotfix  | 製品のリリース時に重大な不具合が見つかった際に使うブランチ |

# プレフィックス
Gitのプレフィックスとは、コミットメッセージの先頭に付ける短い文字列のことです。これをつける事によって、コミットの内容を一目で把握しやすくなり、チームでの開発やコードレビューを円滑に進めることができます。

使い方は、コミットメッセージを「[prefix]: [message]」にするだけです。以下のプレフィックスは、例です。

| 種類 | 説明                                                                |
|:---:|---|
| feat        | 新機能の追加                                                            |
| fix         | バグ修正                                                                |
| docs        | ドキュメントの更新                                                           |
| test        | テストコードの追加                                                           |
| refactor    | コードのリファクタリング（コードの構造やロジックの改善）                     |
| style       | コードのスタイル調整（インデント、スペース、命名規則など）               |
| chore       | ビルドプロセス、依存関係の変更など、コード自体には直接関係のない変更 |