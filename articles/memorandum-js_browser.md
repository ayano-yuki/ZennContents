---
title: "【JavaScriptの備忘録】ブックマークしておきたいJavaScript"
emoji: "📓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["JavaScript"]
published: true
---
# はじめに
こんにちは！
JavaScriptの面白さに気づいたアヤノです。

この記事では、痒い所に手が届くブックマークしておきたいJavaScriptを紹介します。
私が見つけたワケでもないため、そのJavaScriptの説明と、見つけた記事/リンクを紹介します。

# １．ブラウザをメモ帳にするJavaScript
このJavaScriptは、一時的にブラウザのタブをメモ帳のように使えるようにするモノです。これをブラウザのURLバーに入力すると、入力したタブ全体が書き込み可能な状態になります。一時的にメモを取る場合におすすめなJavaScriptです。

```js
data:text/html,<html contenteditable>
```
このJavaScriptは、データURI[^1]と呼ばれる形式で、編集可能なHTMLドキュメントを生成するモノです。「```data:```」で、これから先がデータURIであることを示し、「```text/html```」で、これがHTML形式であることを示しています。「```<html contenteditable>```」は、htmlタグにcontenteditable属性が設定されているため、この要素内のコンテンツを直接編集できるようになります。そのため、タブをメモ帳のように使うことができます。

https://twitter.com/lotz84_/status/1543915415491194880

# ２．ほしい物リストの総額を調べられるJavaScript
このJavaScriptは、amazonのリスト形式で表示されている欲しいものリスト内の総額を調べるためのモノです。これをブックマークして、総額を知りたい欲しいものリストを表示している状態でクリックすると、総額がアラートで表示されます。開発者ツールのconsoleから総額を調べるJavaScriptも以下の記事に書いているので、気になる方はぜひ読んでみてください。

```js
javascript:alert('合計:'+[...document.querySelectorAll('.a-price-whole')].map(price=>+price.textContent.replace(/,/g,'')).reduce((a,b)=>a+b).toString().replace(/(?<=\d)(?=(?:\d{3})+$)/g,',')+'円')
```

このJavaScriptコードは、Webページ上で特定のクラス名を持つ要素（.a-price-whole）のテキスト内容を数値として合計し、その結果をアラートで表示するモノです。要素の名前を変更することで、他のサイトや他の形式にも応用できそうです。

https://qiita.com/gshirato/items/17300422c78ab4a7ccd0


[^1]: ファイルシステム上のファイルへのパスではなく、データそのものをURLの中に埋め込むことができる仕組み（画像や音声ファイル以外にも、HTMLドキュメントも埋め込める！）