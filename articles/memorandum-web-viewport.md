---
title: ' @mediaクエリが効かない？犯人はこいつだ！ <meta name="viewport">'
emoji: "📓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [Web, CSS]
published: true
---
# はじめに
社会人生活にも、だんだん慣れてきたアヤノです。

この前、初めて `@media` クエリを使ってレスポンシブ対応に挑戦してみたんですが、なぜか指定した画面サイズになってもスタイルが変わらないという問題に出会いました。「え？なんで効かないの？」と悩みながら、先輩やChatGPTに助けてもらってなんとか解決できたんですが、原因は「Viewport」の理解不足でした。

この技術は、Web開発におけるマルチプラットフォーム対応の要とも言えるものなので、今後しっかりと使いこなしていくために学んだことを記事としてまとめました。

# TL;DL
- Viewportはブラウザ上でウェブコンテンツが表示される「見える範囲」のこと。
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` でViewportを設定すると、端末に適したレイアウト基準が指定できる。
- Viewportを設定しないと、モバイルでデスクトップ用の広いレイアウトが縮小表示され、UI崩れやスタイルの不具合が起こる。
- デスクトップではlayout viewportとvisual viewportがほぼ同じため、Viewport設定がなくても大きな問題は少ない。
- Viewport設定はレスポンシブ対応の要であり、`@media`クエリの正しい動作に必須。

# Viewportとは？
Viewportとは、「**ユーザーがブラウザ上で実際にウェブコンテンツを表示・閲覧できる可視領域**」です。

これだけでは少しイメージが湧きにくいと思うので、身近な例えで説明してみます。たとえば、私たちは毎日、窓から空や景色を見て天気を確認しています。これをViewportとウェブコンテンツに当てはめると、以下のようなイメージになります。

- **Viewport = 窓のように、見える範囲が限られているもの**
- **ウェブコンテンツ = 空や景色のように、今から確認するとっても大きな領域**

:::message alert
Viewportには複数の種類（[Viewportの種類](#viewportの種類) で解説）があります。  
そのためこの比喩はあくまで **Viewport初学者向けのイメージ** であり、厳密に正確というわけではないことに注意してください。
:::

# Viewportの設定方法
Viewportの挙動は、以下のような `<meta>` タグを使って指定できます。これにより、ブラウザが**レイアウトの基準とするViewport**を、端末に合わせて適切に調整できるようになります。このメタタグではViewportの幅をデバイスの画面幅（CSS px単位）に合わせ、ページの初期ズーム倍率を 1.0 に設定するようになっています。

```HTML
<!-- 各ブラウザが推奨しているViewport設定 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

この `<meta name="viewport">` タグには、いくつかのプロパティを指定することができ、それぞれがページの表示やズーム挙動に影響を与えます。主なプロパティとその意味は以下の通りです。

| プロパティ名        | 説明                                                                                   | 例                                    |
|---------------------|----------------------------------------------------------------------------------------|----------------------------------------|
| `width`             | Viewportの幅を設定します。数値（px）または `device-width` を指定できます。         | `width=device-width`（端末の画面幅に合わせる） |
| `height`            | Viewportの高さを設定します。`width` と同様、数値または `device-height` を指定しますが、通常あまり使われません。 | `height=device-height`                 |
| `initial-scale`     | ページの初期ズーム倍率（スケール）を設定します。                                      | `initial-scale=1.0`（ズームなし）     |
| `minimum-scale`     | ユーザーがズームアウトできる最小倍率を設定します。                                     | `minimum-scale=0.5`（50%まで縮小可能）|
| `maximum-scale`     | ユーザーがズームインできる最大倍率を設定します。                                       | `maximum-scale=3.0`（300%まで拡大可能）|
| `user-scalable`     | ユーザーによるズームの可否を指定します。`yes` または `no` を指定します。               | `user-scalable=no`（ズーム禁止）      |

たとえば、以下のように書くと、Viewportの幅を端末の画面幅に合わせ、ズームを初期倍率のまま固定し、ユーザーがピンチ操作で拡大縮小できないようになります。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

:::message alert
`user-scalable=no` を指定すると、ユーザーがズームできなくなり、アクセシビリティが悪くなります。
アクセシビリティを重視する場合は、この指定を避けることが推奨されます。
:::

# Viewportの種類
Viewportには、用途や役割の異なる以下の3種類があります。

1. **Layout Viewport**
   - 別名：`document viewport`
   - ページのレイアウト計算や、`@media` クエリの評価基準となる。
   - ズームしても変わらず、基本的には `<meta name="viewport">` の指定がない場合に、**ブラウザが自動的に設定する広めの仮想的な幅**になる。
2. **Visual Viewport**
   - ユーザーが画面上で実際に**現在見ている領域**（スクリーンに表示されている部分）。
   - ズームやスクロールの影響を受けます。
   - JavaScript で `window.visualViewport` を使って取得可能です。
   - UIレイヤーのインタラクションや、フォーカス制御などに利用されます。
3. **Ideal Viewport**
   - 端末のベンダー（Apple, Google など）が**この幅でレイアウトされることを前提に設計してほしい**という推奨値。
   - `<meta name="viewport" content="width=device-width">` で `device-width` を指定したときに使われる「想定される端末幅」。
   - 名前としては `initial viewport` や `default viewport` と混同されることがありますが、厳密には別概念です。
   - 開発者が適切なレスポンシブ設計を行うためのガイドライン的な役割を持ちます。

:::details コラム
- layout viewport はCSSのレイアウト計算基準であり、例えば親要素が body の場合、1% はこのlayout viewportの幅の1%にあたります。
- visual viewport は実際に表示されている領域で、`vh` や `vw` の単位は基本的にはこのvisual viewport の高さ・幅の1%を表します。
:::

# Viewportのデフォルト値
Viewportのデフォルトの幅は、端末の種類やOS・ブラウザによって異なります。

モバイル端末では、デフォルトのViewportの幅はOSやブラウザごとに異なり、多くの端末で約980px前後の幅が設定されています。そのため、モバイルでは特に `<meta name="viewport">` タグを適切に設定しないと、意図しない拡大縮小やレイアウト崩れが起こりやすくなります。

一方、デスクトップでは、layout viewport、visual viewport、そしてウィンドウサイズがほぼ同じ大きさになるのが一般的です。ユーザーがズームを行うことはありますが、頻度は多くなく、これら3つのViewportの差異はほとんど無視できるレベルです。

# ViewportとWebレンダリングの関係性
Viewportは、Webページのレンダリングで非常に重要な役割を持っています。ブラウザのレンダリングエンジンは、Viewportの設定をもとにページのレイアウトや表示内容を決定します。

具体的には、レンダリングエンジンはまず layout viewport を基準にHTMLやCSSを解析し、各要素のサイズや位置を計算してレイアウトを構築します。このレイアウト情報が、画面に表示されるコンテンツの骨組みとなります。

次に、ユーザーが実際に画面上で目にするのは visual viewport に含まれる部分です。ユーザーがピンチ操作でズームしたりスクロールしたりすると、このvisual viewportが変化し、表示される領域が移動・拡大・縮小されます。ただし、ズーム操作をしてもlayout viewportのサイズやメディアクエリの評価は基本的に変わらず、レイアウトの再計算は行われません。

`<meta name="viewport">` で設定した内容は、このlayout viewportの幅やズーム倍率を端末に合わせて調整するために使われ、これによってスマートフォンやタブレット、デスクトップなどさまざまな画面サイズに対応したレスポンシブなレンダリングが可能になります。

# なぜViewportを設定しないと@mediaが適切に効かないのか？
上の２つの章（[Viewportのデフォルト値](#viewportのデフォルト値)、[ViewportとWebレンダリングの関係性](#viewportとwebレンダリングの関係性)）で触れた内容を踏まえ、Viewportを設定しないと `@media` が適切に動作しない理由を説明します。

ウェブコンテンツのレンダリングは、layout viewport のサイズを基準に行われます。もし `<meta name="viewport">` でViewportを明示的に設定していない場合、ブラウザはデフォルトのViewport幅を使ってレンダリングを行います。このデフォルトのViewport幅は多くのモバイル端末で幅が広く設定されており（例：980pxなど）、実際の端末画面の物理サイズとは異なります。そのため、画面サイズに合わせた `@media` クエリの条件（例えば max-width: 600px）と、実際にレンダリングに使われている layout viewport の幅が合わず、結果として `@media` クエリが期待通りに適用されません。

なので、**Viewport設定がないウェブコンテンツは、`@media`クエリを設定していてもスマートフォンなどでデスクトップ用の広いレイアウトが縮小表示されてしまい、UIが崩れて見えることがあります**。

:::details Viewportの設定をしないことによるlayout viewportの変化に関する実験
以下の実験結果は、デスクトップの開発者ツールの「デバイスモード」でPixel 7の表示をシミュレーションしたものです。左側はViewport設定なし、右側は設定ありの画面で、Viewport設定の有無によって layout viewport と端末画面サイズの違いが明確に確認できます。

![Viewportの設定の有無による@mediaクエリの効き](/images/articles/memorandum-web-viewport/media.png)
*Viewportの設定の有無による@mediaクエリの効き*

:::

# おまけ：Viewportの歴史
:::message alert
Viewportの歴史も調べていたので、簡単にまとめます。
ネットで色々調べて、ChatGPTに正しいか聞きながら作成したため、一部誤りがあると思います。
:::

## 2007年：iPhone登場と、仮想viewportの導入
初代iPhoneの登場により、スマートフォン向けブラウザが使われるようになりました。当時はPC向けのWebサイトをそのまま表示する必要があり、解決策として「仮想viewport幅980px」が導入されました。実際のデバイス幅は320px（初代iPhone）でも、layout viewportは980pxに設定されており、レイアウトはこの980px幅で計算されて、縮小表示されていました。この時点で「visual viewport ≠ layout viewport」というギャップが生まれました。

## 2010年前後：Android登場とマルチデバイス化
Androidの普及により画面サイズが多様化し、各ブラウザが独自に仮想viewportサイズ（例：960px、1024px）を設定した。これにより、同じWebサイトでも端末ごとに表示がバラバラになる問題が深刻化してきた。

そこで、`<meta name="viewport">`が導入され、使うことが推奨されました。これによりlayout viewportをデバイス幅に合わせることが可能となり、「ideal viewport = device width」の考え方が明確化した？

## 2010〜2012年：Responsive Web Designの登場
Ethan Marcotteが「Responsive Web Design（RWD）」の概念を提唱し、`@media`や`flexbox`、viewportのmetaタグを活用した柔軟なレイアウト設計が普及しました。

## 2016年以降：Visual Viewport APIの登場
モバイルでのズームやソフトキーボードによる表示領域変化に対応するため、`window.visualViewport` APIが導入された。これにより、JavaScriptが幅や高さ、ズーム率、スクロールオフセットなどが取得可能となり、UIの正確な表示位置制御（ソフトキーボードに隠れないフッターの調整）が出来るようになった。

## 現代
ソフトキーボードやノッチ・折りたたみ端末の安全領域対応が複雑化した。`env(safe-area-inset-*)`や`viewport-fit=cover`などの新機能が開発された。