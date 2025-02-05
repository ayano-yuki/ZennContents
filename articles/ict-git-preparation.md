---
title: "沖縄高専ICT委員会技術継承　Git/GitHub編　01-事前準備"
emoji: "🔥"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["git", "github"]
published: true
---
# はじめに
Hey Guys!
この度、委員長令で沖縄高専ICT委員会技術継承としてGit/GitHubを教えるアヤノです。

第1章では、この講座を受けるための事前準備を行います。
講座開始前に出来なかった人の対応はしますが、何もせずに来た人の対応は致しません。
講座を受ける方は必ずやってください。

# GitHubの用意
この章では、GitHubの登録について説明します。
講座をする上での最低限の登録しかしないため、学生の間は無料で使える有料プランの設定や、二段階認証等は個人の力でお願いします。

## GitHubとは
![](/images/articles/ict-git-preparation/GitHub-Logo.png)
GitHubは、インターネット上で「コード（プログラム）」を管理する場所です。簡単に言うと、GitHubは「コードを保存したり、他の人と共有したり、みんなで一緒に作業したりするための場所」と考えるとわかりやすいです。

例えば、友達と一緒に宿題をしているときに、みんなで書いたノートを一つのファイルにまとめて共有したい時がありますよね。GitHubはまさにそのような役割を果たします。コードという「ノート」をオンラインで保管し、みんなで使ったり、修正したり、改善したりできる場所です。

## GitHubの登録
1. [GitHub公式ページ](https://github.com/)に行き、「Sign up」をクリックします。
    ![](/images/articles/ict-git-preparation/192.png)
1. メールアドレス（Email）、パスワード（Password）、ユーザー名（Username）を入力し、「Continue」をクリックします。
   ![](/images/articles/ict-git-preparation/193.png)
1. 3ステップの登録認証があるので、対応する。
   - 検証ボタンを押す
   - ロボット認証をする
   - 認証コードを入力する（登録したメールアドレスにGitHubから認証コードが来る）
1. ログイン画面に飛んだり、アンケート画面等に飛ぶので、対応する。
1. 登録完了！

:::details 参考になりそうなサイト
上記の説明でよくわからない場合は、以下を見ながら登録してください。
- [【2025年最新】GitHub無料でアカウント作成する方法を解説！](https://working-class-hero.net/blog/1946/)
- [GitHub でのアカウントの作成](https://docs.github.com/ja/get-started/start-your-journey/creating-an-account-on-github)
- [【GitHub入門】初心者向け！GitHubでチーム開発するための基本操作を解説！](https://www.youtube.com/watch?v=Dz95iUNt-fg)
- 登録の部分だけでOK、
:::

::: details (やらなくても良いやつ)
1. 学生の間は無料で使える有料プランの設定
   - [学生のための GitHub Education について](https://docs.github.com/ja/education/explore-the-benefits-of-teaching-and-learning-with-github-education/github-education-for-students/about-github-education-for-students)
   - [Github Education の申請方法](https://zenn.dev/iizuka0000/articles/how-to-apply-for-github-education)

2. 二段階認証
   - [2 要素認証を設定する](https://docs.github.com/ja/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication)
   - [【大事！】GitHubアカウントで2段階認証を有効化する](https://qiita.com/kanamekun/items/c307c942508e9d64c35b)
:::

# Gitの用意
この章では、Gitのインストール方法について説明します。

## Gitとは
![](/images/articles/ict-git-preparation/git-blog-header.png)
Gitは、ファイルの変更履歴を記録し、過去の状態に戻せるようにするツールです。簡単に言うと、「作業のやり直しができるタイムマシン」のようなものです。

例えば、学校のレポートを書いているときに「間違えた！」「前のバージョンに戻したい！」と思ったことはありませんか？普通なら「report1.docx」「report2.docx」「final.docx」などと名前を変えて保存するかもしれません。でも、どれが最新かわからなくなったり、間違えて上書きしてしまったりすることもありますよね。

Gitを使えば、ファイルの変更履歴を自動で管理してくれるので、いつでも好きなタイミングの状態に戻すことができます！

## Gitのインストール方法（Windows）
### インストーラーを使う方法（おすすめ）
1. [Git公式ページ](https://gitforwindows.org/)に行き、「Download」で最新のインストーラーをダウンンロードする。
   ![](/images/articles/ict-git-preparation/194.png)
1. ダウンンロードしたインストーラーをダブルクリックして、インストーラーを実行する。
1. 英語のインストール画面が出るので、英語を読みながら対応する。英語が分からなければ、以下のサイトをみながら自分の環境に合わせて対応する。
   - [Windows環境でローカルのGitをセットアップしてVSCodeから使う](https://qiita.com/nmosfet556/items/5c306380ddf46a58e6a2)

### Scoopでインストール（自己責任です）
ScoopというWindows非公式のパッケージ管理ツールを使ってコマンド一つでインストールする方法を説明します。
学内で行う場合はproxyを設定してください。

1. Scoopをインストールしている場合
    PowerShellで実行
    ```sh
    scoop install git
    ```
2. Scoopをインストールしていない場合
    PowerShellで実行
    ```sh
    Set-ExecutionPolicy RemoteSigned -scope CurrentUser
    invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')
    scoop install git
    ```

## Gitのインストール方法（Mac/Linux）
学校が指定しているOS以外なので、以下の記事を見てインストールしてください。コマンド1つでインストールできるので、頑張って下さい。また、インストールの部分だけでかまいません。

- Mac
  - [Gitのインストール](https://git-scm.com/book/ja/v2/%E4%BD%BF%E3%81%84%E5%A7%8B%E3%82%81%E3%82%8B-Git%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB)
  - [最新の Git を Mac にインストールする方法](https://qiita.com/normalsalt/items/f200ba50363ebfd46df0)
  - [MacにGitをインストールする](https://qiita.com/kuri_kuri/items/b828567df0793cae0349)
  - [【Mac】Gitのインストール方法【超わかりやすく解説】](https://tetoblog.org/2021/06/git-install-mac/)
- Linux
  - [Gitのインストール](https://git-scm.com/book/ja/v2/%E4%BD%BF%E3%81%84%E5%A7%8B%E3%82%81%E3%82%8B-Git%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB)
  - [【Linux】gitコマンドのインストール方法を解説!Linuxでgitを使おう](https://engineer-ninaritai.com/linux-git/)
  - [gitについて / Ubuntuでgitをインストール](https://qiita.com/nananari/items/ac9e9ff09c1e437fbabb)

## インストール出来たかの確認
インストールできたら、以下のコマンド（Gitのバージョンを確認するコマンド）を実行して下さい。コマンドを実行して、インストールしたGitのバージョンが確認出来たら。インストール成功です。

```sh
git --version
```

# 初期設定
最後にGitとGitHubの基礎設定を行います。

この章を勧めるにあたってのお願いです。
学内で講座を受ける方は、「学内のProxyとそのポート番号」を調べてください。
調べられなかった人は、当日教えるので、そこの設定以外を終わらせて下さい。

## 基本的な設定
GitHubのユーザー名とメールアドレスを設定します。ここの設定がおかしいと、GitHubを使った作業に支障が出ます。必ずやってください。
```sh
git config --global user.name "GitHubのユーザー名"
git config --global user.email "GitHubで登録したメールアドレス"
```

設定が出来たかを確認するコマンドも試して、正しく設定出来たかを確認してください。
```sh
git config --global user.name
git config --global user.email
```

## （対象者のみ）proxyの設定
学内（Proxy環境下）でGitHubを使いたい人向けの設定です。proxyというのは危ない通信を制限する仕組みで、この設定をすること、Proxyに「この通信は安全ですよ！」と伝えることができ、Proxy環境下でGitHubと通信が出来るようになります。（設定しないとProxy環境下でGitHubと通信できない..）

Proxyが無い環境下でこの設定をすると、Gitが存在しないProxyを探してタイムアウトになるので、学内（Proxy環境下）以外から使う場合は設定を解除してください。

proxyの設定は以下のコマンドで行います。
```sh
git config --global http.proxy "proxyのアドレス":"ポート番号"
git config --global https.proxy "proxyのアドレス":"ポート番号"

# 例
# git config --global http.proxy http://proxy.example.com:8080
# git config --global https.proxy http://proxy.example.com:8080
```

また、proxyを解除する時のコマンドは以下の通りです。学内で講座を受けている間は解除しないでください。
```sh
git config --global --unset http.proxy
git config --global --unset https.proxy
```
# おわりに
事前準備、お疲れさまでした。
沖縄高専ICT委員会技術継承Git/GitHub編の次章でまた会いましょう。
サラダバ～

# おまけ（全ての講座を終えた時にしたほうが良い設定）
ここでは、講座では取り扱わないSSHでGitとGitHubを通信するための設定について触れます。
SSHの設定をするメリットは以下の通りです。

- HTTPSだとプッシュ (git push) するたびにGitHubの認証が必要になるが、SSHなら一度設定すればパスワードやトークンを入力せずに操作できる。
- SSHはデフォルトで暗号化されているため、HTTPSと同じく安全に通信ができる。
- 一部のネットワークでは、HTTPSのGit通信がブロックされることがあるが、SSHは22番・443番ポートを使えるので、制限を回避しやすい。

それでは、設定方法です。

1. 公開鍵・秘密鍵を生成する。
   ```sh
   ssh-keygen -t ed25519 -f id_ed25519_github -C "GitHubで登録したメールアドレス"
   ```
2. clipコマンドを使って生成された「id_ed25519_github.pub」の中身をコピーする。（生成場所は.sshです。調べたらどこにあるか分かります。）
   ```sh
   clip < "保存場所（ココは調べて下さい。）"/id_ed25519_github.pub

   ```
3. 公開鍵を[GitHub](https://github.com/settings/ssh/new)にアップロードする。適当なtitleをつけて、keyのフォームにコピーした内容を貼り、「Add SSH key」で登録する。
   ![](/images/articles/ict-git-preparation/195.png)
   
4. "id_ed25519_github.pubの保存場所（ココは調べて下さい。）"/configを編集する。"id_ed25519_github.pubの保存場所（ココは調べて下さい。）"/configが無ければ、作成し、以下の内容を追記する。
    ```sh
    Host github.com
        HostName github.com
        IdentityFile ~/.ssh/id_ed25519_github
        User git
    ```

:::details 参考になりそうなサイト
上記の説明でよくわからない場合は、以下を見ながら登録してください。
- [GitHubでssh接続する手順~公開鍵・秘密鍵の生成から~](https://qiita.com/shizuma/items/2b2f873a0034839e47ce)
- [【Git】Windows環境でGitHubにSSH接続してコミットするまでの手順](https://qiita.com/hollyhock0518/items/a3fee20951cd92c87ed9)
- [WindowsでGitとSSHキーを使ってGitHubを安全に使う方法](https://zenn.dev/aoikoala/articles/388eb861249780)
:::