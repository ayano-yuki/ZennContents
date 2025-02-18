---
title: "Fuwariのカスタマイズ：Astroでポートフォリオサイトを作る"
emoji: "🎁"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [Astro, portfolio]
published: true
---
# はじめに
こんにちは、アヤノです。
最近7年間お世話になった寮から出所し、4月から新社会人として働くことになりました。
出所した時にふと、「学生エンジニアとして7年間、何をしてきたかな～？」と気になり、振り返ってみたんです。
すると、衝撃的な事実が発覚しました。
それは...「**沢山しすぎて全部思い出せない!!!、今でこれなら数年後はどうなるん???**」ということ!!!

そこで、今のうちに覚えていることだけでも残そうと思い、ポートフォリオサイトを開設する流れになりました。
~~（就活の時に作れはと言う意見はNG）~~

# ポートフォリオサイトを作る条件
ポートフォリオサイトを作るに辺り、以下の条件で開設することになりました。
ちなみに、今回作るのはエンジニアのポートフォリオサイトなので「技術を使う」をテーマにして、はてなブログとか、WordPress等を使わない縛りを設けてます。

- サーバー代等のお金を0円に抑えたい
- 記録が目的なので、開設時間を最小限にしたい

# 技術の選定
## サーバー代等のお金を0円に抑えたい
この条件を達成するために、「**Verselや、Render等の無料でプロジェクト（Webアプリ）のデプロイができる環境を使う**」ことにしました。今回作るのは、ポートフォリオサイトだったので、Web系の技術で作ったプロジェクトをデプロイしやすく、いつでもすぐにアクセスできるのはどれかと考えた結果、Verselを使うことにしました。

:::details この決断をするに当たって参考にしたサイト
- [Render vs Vercel](https://render.com/docs/render-vs-vercel-comparison)
- [Cloudflare Pages・Vercel ・Netlify の違いや使い分けをまとめる](https://zenn.dev/catnose99/scraps/6780379210136f)
:::

## 記録が目的なので、開設時間を最小限にしたい
この条件を達成するために、ある程度のデザインが既に完成されている技術・フレームワークを選ぶ必要があります。そのため、デザインテーマが無料で公開されている技術・フレームワークを使うことにしした。色々調べていると、Astroや、Hugo等のデザインテーマがあるフレームワークを見つけることが出来ました。見つけたフレームワークはどれも、Markdown対応で、ブログ・サイトの開設に使われるフレームワークだったので、好みのデザインがあるかで選びました。

その結果、Astroのテーマである「[Fuwari](https://astro.build/themes/details/fuwari/)」をつかうことにしました。このテーマはゆるかわのデザインで、ブログ・サイトとしての機能面も高水準な実装がされており、テーマの開発が活発なところが刺さりました。（いつか、これを作れるようなエンジニアになりたい!!!）

https://astro.build/themes/details/fuwari/

このテーマを使う方法は、FuwariのREADMEに纏められているので、そちらを参照してください。また、このテーマを使うには、npm（Node）を使える環境を用意する必要があります。
https://github.com/saicaca/fuwari/blob/main/README.ja-JP.md#-%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95

# Fuwariをポートフォリオサイトにするためのカスタマイズ
ここからは、Fuwariを使ったポートフォリオサイトにするために行った変更を備忘録として纏めます。
（~~これさえ残せば、Fuwariのアップデートに対応する際のメモとして使える~~）

## faviconの設定
faviconのファイル名を確認したら、以下のようになっていました。
プログラムを確認したことろ、Fuwariを開いている端末や、ブラウザの画面モードに応じて使用するfaviconが変化するようになっていました。

```sh
<project name>\public\favicon\favicon-dark-32.png
<project name>\public\favicon\favicon-dark-128.png
<project name>\public\favicon\favicon-dark-180.png
<project name>\public\favicon\favicon-dark-192.png
<project name>\public\favicon\favicon-light-32.png
<project name>\public\favicon\favicon-light-128.png
<project name>\public\favicon\favicon-light-180.png
<project name>\public\favicon\favicon-light-192.png
```

私は、この機能の重要性が分からなかったので、この機能を取り外すための設定をしました。
編集内容は、faviconの変更をするために使われている「size, theme」の設定をコメントアウトしました。
編集した/確認したファイルは、以下のファイルです。
```sh
# VScodeの検索欄で「favicon」と検索し、ヒットしたファイルのみを編集
<project name>\src\config.ts                # faviconの設定が既にコメントアウトされていたので、編集なし
<project name>\src\constants\icon.ts        # json形式でfaviconの設定をしていたので、形式をマネして任意の画像を設定し、既存のものをコメントアウト
<project name>\src\layouts\Layout.astro     # 107, 108行目がsize, themeの設定だったので、コメントアウト
<project name>\src\types\config.ts          # 33, 34行目がsize, themeの設定だったので、コメントアウト
```

## アバター画像の変更
:::message
同じフォルダー内にバーナー画像もありましたが、何に使われているかが分からないので、今回は無視します。
:::

次は、Fuwariに表示されているアバター画像を変更します。
ここも画像のファイルパスを変更して、任意の画像を表示させます。
編集したファイルは、以下のファイルです。
```sh
<project name>\src\config.ts    # 55行目のファイルパスを任意な画像のファイルパスにする
```

## プロフィールの変更
アバター画像も変更できたので、プロフィールも変更します。
プロフィールは、jsonで管理しているかと思いましたが、ぷっろグラムに直書きだったのでそのまま編集しした。
（いつか、jsonで管理できるようにしたい）

プロフィールは、以下の項目を設定できます。
- 名前（name）
- 自己紹介(bio)
- LINK
  - リンク先の名前（name）
  - アイコン（icon）
  - URL（url）

:::message
アイコンは、「`https://icones.js.org/`」の物を使う必要があります。
現在は、「fa6-brands」というアイコン集しか使えませんが、追加のアイコン集を使いたい場合は、「`pnpm add @iconify-json/<icon-set-name>`」でプロジェクトにアイコン集を追加してください。

アイコンのパス形式？は、以下のような感じです。
例）fa6-brands:cc-mastercard
  （https://icones.js.org/collection/fa6-brands?icon=fa6-brands:cc-mastercard）
:::


編集するファイルは、以下のファイルです。
```sh
<project name>\src\config.ts    # 54行目からはじめるprofileConfig内を変更する
```

## 画面上部のタブにあるGithubの削除
画面上部のタブにあるGithubのリンクを削除します。
このGithubのリンクは、Fuwariのgithubへ行くためのリンクになっていますが、ポートフォリオサイトには必要がない情報なので、削除します。

編集したファイルは、以下のファイルです。
```sh
<project name>\src\config.ts    # 46~50行目をコメントアウト
```

## フッターの内容を変更
フッター（画面の最下部）の変更をします。
現状は、以下のようになっています。
```sh
© 2025 Ayano. All Rights Reserved. / RSS / Sitemap
Powered by Astro & Fuwari
```

私の場合は、RSSやSitemapの情報は必要ないので削除します。
編集したファイルは、以下のファイルです。
```sh
<project name>\src\components\Footer.astro  # 14, 15行目をコメントアウトし、<br>をコメントアウトした行の後ろに追加
```

## ヘッダーの編集
ヘッダー情報を編集します。
この情報を編集しないと、ページ内容に反したヘッダーになるので恥ずかしいです。

編集する内容は、以下の2つです。
- title
  - 全てのヘッダに表示される情報
- subtitle
  - 「/」時にだけ表示される情報
- lang
  - サイト・ブログとして使用する言語

編集するファイルは、以下のファイルです。
```sh
<project name>\src\config.ts    # siteConfigを編集
```

## ライセンスの非表示
現状では、記事の最下部にライセンスが表示されます。
ライセンスが表示されていてもポートフォリオサイトには影響ありませんが、ポートフォリオサイトに必要な情報ではないので非表示にします。

編集するファイルは、以下のファイルです。
```sh
<project name>\src\pages\posts\[...slug].astro  # 107行目をコメントアウト
```

## Aboutの編集
Aboutページをポートフォリオサイトの「私について」にするために編集します。
Aboutページはmarkdownなので、markdownの記法にしたがって編集します。

ポートフォリオサイトの「私について」に書く内容がいまいち分からないので、履歴書のノリで以下の内容を書きます。
- 自己紹介
- スキルセット
- 経歴や経験
- ポートフォリオ

編集したファイルは、以下のファイルです。
```sh
<project name>\src\content\spec\about.md    # 良い感じに編集
```

## 記事の整理
Fuwariのデフォルトである記事を削除し、新しい記事を書きます。
Fuwariのデフォルトである記事は、`<project name>\src\content\posts`に保存されています。
このフォルダ内にあるファイル・フォルダを全て削除することで、デフォルトの記事はすべて消えます。

新規で記事を書く場合は、「`pnpm new-post <filename(slug)>`」で記事を生成します。
このコマンドのfilename(slug)は、記事のURLに使われるので、英語で書きましょう。
（Zennのsulgと同じ形式ならOKでした）

このコマンドで生成される記事には、以下の情報が初めから入っています。
この情報は記事の表示に必要なので、削除しないようにしてください。
これらの情報に書く内容の書き方については、「[FuwariのREADME](https://github.com/saicaca/fuwari/blob/main/README.ja-JP.md#%EF%B8%8F-%E8%A8%98%E4%BA%8B%E3%81%AE%E3%83%95%E3%83%AD%E3%83%B3%E3%83%88%E3%83%9E%E3%82%BF%E3%83%BC)」を参照してください。
また、imageは、`<project name>\src\content\posts`に画像フォルダを作成し、「./<画像フォルダ>/<画像ファイル>」の形式で入力すると、記事のカバーに指定した写真が使われます。
```sh
title: 
published: 2025-02-15
description: ''
image: ''
tags: []
category: ''
draft: false 
lang: jp
```

# 完成したポートフォリオサイト
![](/images/articles/customizing-fuwari-portfolio/204.png)

こちらが完成した[ポートフォリオサイト](https://ayano-yuki-s-page.vercel.app/)です。
完成して、「ポートフォリオサイトとしても使えるけど、個人ブログでも使えるんじゃね？」と気づきました。
また、短時間で開設出来たので良き良きです。

# おわりに
今回は、学生エンジニアとしての7年間をまとめたポートフォリオサイトの技術選定と編集内容の備忘録を纏めました。
ポートフォリオサイトの運用についてですが、今後も適当なタイミング（実績・ポートフォリオ・コンテストの追加など）で更新していこうかと思います。