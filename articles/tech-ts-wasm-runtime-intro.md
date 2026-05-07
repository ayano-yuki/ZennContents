---
title: "TypeScriptエンジニアのためのWASMランタイム入門 - AssemblyScriptから理解するメモリの実態"
emoji: "📚"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [typescript, wasm, assemblyscript]
published: false
---

# はじめに

普段TypeScriptを書いていると、「オブジェクトがメモリ上でどう表現されるか」を意識することはほとんどありません。

下記のコードを見たとき、多くの場合は「`p.x` は `10`」「`p.y` は `20`」と考えれば十分です。`Point` のインスタンスがメモリ上のどこに置かれているのか、`x` と `y` が何バイト目にあるのか、`p` が実体なのか参照なのか、といったことを気にする必要はありません。
JavaScriptエンジンが、それらをよしなに管理してくれます。

```ts
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

const p = new Point(10, 20);
````

しかし、WebAssemblyを触り始めると、それらを意識する必要が出てきます。
AssemblyScriptで `new Point(10, 20)` を生成するとき、実際には線形メモリと呼ばれる巨大なバイト列のどこかにオブジェクトが配置されます。`x` と `y` はメモリ上の決まった位置に書き込まれ、変数はその先頭アドレスを指す値として扱われます。つまり、TypeScriptでは単なる `p.x` だったものが、WASMの世界では「メモリ上の何バイト目を読むか」という話になります。

ここまで読むと、WASMのメモリ構造の話じゃんと思うかもしれません。
しかし、`ArrayBuffer` と `TypedArray` の違い、`Array<T>` がなぜ重いのか、GCが何を管理しているのか、といった話は、すべて「メモリ上でどう表現されるか」に繋がっています。

この記事では、TypeScriptに近い構文でWebAssemblyを生成できるAssemblyScriptを題材にして、WASMのメモリモデルを実際に観察しながら、オブジェクトがどのように配置されるのかを見ていきます。

- WASMの線形メモリモデルとは何か
- AssemblyScriptのオブジェクトはメモリ上でどう表現されるのか
- `class` インスタンスのフィールドはどのように配置されるのか
- `ArrayBuffer`、`TypedArray`、`Array<T>` は何が違うのか

---

# AssemblyScriptとは？

AssemblyScriptは「TypeScriptっぽく書けるWASM言語」ですが、実行モデルまでTypeScriptと同じではありません。むしろその違いを見ることで、普段隠れている「値」「参照」「メモリ」の関係がかなり掴みやすくなります。

:::message
この記事ではAssemblyScriptの公式ドキュメントに記載されているランタイムのメモリレイアウトをベースに説明します。細かいレイアウトはAssemblyScriptのバージョンやランタイム設定によって変わる可能性があります。実装に強く依存するコードを書く場合は、必ず利用しているバージョンのドキュメントと生成されたWASMを確認してください。
:::

## この記事で使った実験

この記事は、手元で用意した小さなAssemblyScriptプログラムをもとに書いています。

条件は次の通りです。

| 項目 | 内容 |
| --- | --- |
| AssemblyScript | 0.28.14 |
| 最適化 | `-O0` |
| runtime | `stub` / `incremental` |
| 実行環境 | Node.js |
| 観測方法 | `WebAssembly.Memory` を `Uint8Array` / `DataView` で読む |
| WAT出力 | `asc --textFile` |

実験コードでは、AssemblyScript側でオブジェクトを作り、その参照を `usize` として返す関数を用意しました。

```ts
export function makeVec2Ptr(x: i32, y: i32): usize {
  return changetype<usize>(new Vec2(x, y));
}
```

JavaScript側では、返ってきた値を線形メモリ上のオフセットとして扱い、周辺のバイト列をダンプしています。

```js
const ptr = Number(instance.exports.makeVec2Ptr(0x11223344, 0x55667788));
const dv = new DataView(instance.exports.memory.buffer);

console.log(dv.getUint32(ptr + 0, true).toString(16));
console.log(dv.getUint32(ptr + 4, true).toString(16));
```

以降の「こう見えた」という話は、基本的にこの条件での観測結果です。WebAssemblyそのものの仕様、AssemblyScriptの公開ドキュメント、今回の実装依存の観測を混ぜないように注意しながら進めます。

## WASMのメモリは「線形メモリ」

WebAssemblyにはlinear memory、つまり線形メモリという概念があります。

これはざっくり言うと、`0` 番地から始まる連続したバイト列です。

```txt
address
0        1        2        3        4        5        ...
+--------+--------+--------+--------+--------+--------+
|  byte  |  byte  |  byte  |  byte  |  byte  |  byte  |
+--------+--------+--------+--------+--------+--------+
```

WASMの命令は、このメモリに対して値を読み書きできます。

たとえばイメージとしては、次のような操作です。

```wat
i32.load   ;; あるアドレスから4バイト読んで i32 として扱う
i32.store  ;; あるアドレスに i32 を4バイト書き込む
```

JavaScript側から見ると、WASMのメモリは `WebAssembly.Memory` として扱えます。そして、その中身は `ArrayBuffer` として参照できます。

```ts
const memory = instance.exports.memory as WebAssembly.Memory;
const bytes = new Uint8Array(memory.buffer);
```

TypeScriptエンジニア向けに言うなら、WASMのメモリは「巨大な `ArrayBuffer` を `Uint8Array` や `DataView` で覗いている」ようなものです。

もちろん実際のWASM実行環境はそれだけではありません。関数呼び出し、値スタック、ローカル変数、テーブル、インポート・エクスポートなどもあります。ただ、`class` や配列のようなデータ構造を理解するうえでは、まず「線形メモリ上のどこかにバイト列として置かれる」という見方が重要です。

## AssemblyScriptはTypeScriptではない

AssemblyScriptはTypeScriptに似た構文で書けます。

```ts
export function add(a: i32, b: i32): i32 {
  return a + b;
}
```

しかし、これはTypeScriptそのものではありません。

TypeScriptの `number` はJavaScriptの数値、つまり基本的には64-bit浮動小数点数として扱われます。一方、AssemblyScriptではWASMの型に近い形で、`i32`、`u32`、`f32`、`f64` などを明示します。

```ts
let a: i32 = 10;
let b: f64 = 3.14;
let c: u8 = 255;
```

この時点で、TypeScriptよりも低レイヤーの世界に一歩近づいています。

また、AssemblyScriptではオブジェクトや配列を扱えますが、それらはJavaScriptエンジンのオブジェクトとして存在するわけではありません。WASMの線形メモリ上に、AssemblyScriptのランタイムが管理する形式で配置されます。

つまり、見た目はこうでも、

```ts
class User {
  id: i32;
  score: f64;
}
```

実際には、

```txt
線形メモリ上に確保された領域
そこへの参照
ランタイムが使う管理情報
フィールドごとのオフセット
```

という構造が裏側にあります。

この「TypeScriptっぽい見た目」と「WASMらしい実体」のギャップが、AssemblyScriptを教材として面白くしているところです。

## メモリの大まかな区画

AssemblyScriptの公式ドキュメントでは、線形メモリは大まかに次のような領域に分かれると説明されています。

```txt
0
| static data
| managed stack
| heap
v
memory.size() << 16
```

それぞれの役割は次のようなものです。

| 領域 | 役割 |
| --- | --- |
| static data | 静的な文字列や配列など |
| managed stack | インクリメンタルランタイムで使われる管理用スタック |
| heap | `new` されたオブジェクトなど、動的に確保される領域 |

私たちが `new Point()` のようにオブジェクトを作ると、多くの場合はヒープ上に領域が確保されます。

```ts
const p = new Point();
```

このとき、`p` が持つのはオブジェクトの中身そのものではなく、線形メモリ上のある場所を指す参照です。WASMの世界では、それは数値のアドレスとして扱えます。

```txt
p
|
v
address 1024
+------------------+
| Point object ... |
+------------------+
```

ここで大事なのは、「参照」は魔法ではなく、最終的にはメモリ上の位置を表す値だということです。

## マネージドオブジェクトにはヘッダがある

AssemblyScriptの管理対象オブジェクトには、ランタイムが使うヘッダがあります。

たとえば `new Point()` で作られたオブジェクトには、`x` や `y` のようなフィールドだけでなく、GCや型情報のためのメタデータも一緒に存在します。

AssemblyScriptのドキュメントでは、管理対象オブジェクトのヘッダはペイロードの直前に置かれると説明されています。

```txt
            object reference
                  |
                  v
+--------+--------+--------+--------+--------+----------------+
| mmInfo | gcInfo | gcInfo2| rtId   | rtSize | payload ...    |
+--------+--------+--------+--------+--------+----------------+
 -20      -16      -12      -8       -4       0
```

ここで面白いのは、オブジェクトへの参照が「ヘッダの先頭」ではなく「ペイロードの先頭」を指すことです。

つまり、あるオブジェクト参照を `ptr` とすると、

```txt
ptr - 20  管理情報
ptr - 16  GC情報
ptr - 12  GC情報
ptr - 8   ランタイム型ID
ptr - 4   ペイロードサイズ
ptr       ペイロード開始位置
```

という見方になります。

TypeScriptの感覚だと、オブジェクトは「プロパティを持った何か」として見えます。しかしAssemblyScriptのランタイムから見ると、オブジェクトは「管理用ヘッダ + ペイロード」です。

このペイロード部分に、`class` のフィールドや、配列の管理情報、バッファの生データなどが置かれます。

## classインスタンスの実体

では、`class` はどう配置されるのでしょうか。

次のようなクラスを考えます。

```ts
class Vec2 {
  x: i32;
  y: i32;

  constructor(x: i32, y: i32) {
    this.x = x;
    this.y = y;
  }
}

export function makeVec2Ptr(x: i32, y: i32): usize {
  return changetype<usize>(new Vec2(x, y));
}
```

AssemblyScriptでは、クラスのフィールドはCの構造体に近い形で、基本的には順番に配置されます。ただし、型のアラインメントに従ってパディングが入ることがあります。

今回の実験では、`makeVec2Ptr(0x11223344, 0x55667788)` の戻り値を `ptr` として読むと、payloadの `+0` と `+4` にそのまま値が並んでいました。

```txt
ptr
|
v
+----------------+----------------+
| 0x11223344     | 0x55667788     |
+----------------+----------------+
 +0               +4
```

`Vec2` の `x` と `y` はどちらも `i32` なので、それぞれ4バイトです。今回の条件では、`x` が `ptr + 0`、`y` が `ptr + 4` に配置されたと読めます。

```txt
vec.x  => i32.load(ptr + 0)
vec.y  => i32.load(ptr + 4)
```

もちろん、実際のコンパイラ出力は最適化や周辺処理によって変わります。ただ、オブジェクトのフィールドアクセスを「参照 + オフセット」として理解できると、WASMのメモリモデルが一気に見えやすくなります。

## フィールド順とパディング

もう少しだけ現実的な例を見てみます。

```ts
class PadDemo {
  tag: u8;
  value: i32;

  constructor(tag: u8, value: i32) {
    this.tag = tag;
    this.value = value;
  }
}
```

`u8` は1バイト、`i32` は4バイトです。もし単純に詰めて置くなら、`tag` の直後に `value` が来そうです。

```txt
tag:   1 byte
value: 4 bytes
```

しかし、多くの低レイヤーのメモリレイアウトでは、型ごとに自然な境界に揃えるためのアラインメントがあります。AssemblyScriptのクラスフィールドも、型のアラインメントに従って配置されます。

今回の実験では、`PadDemo(0x7f, 0x11223344)` は次のように見えました。

```txt
+----------+------------------+----------------+
| tag: u8  | padding          | value: i32     |
+----------+------------------+----------------+
 +0         +1..+3             +4
```

ここで重要なのは、「ソースコード上のフィールド数」と「実際の使用バイト数」は必ずしも一致しないということです。

TypeScriptではこのようなことを気にする場面はほぼありません。しかしWASMやネイティブ寄りの世界では、データ構造の並び順や型サイズが、メモリ使用量やアクセス効率に影響します。

生成されたWATでも、同じ対応を確認できます。

```wat
(func $assembly/index/PadDemo#set:tag
  local.get $0
  local.get $1
  i32.store8
)

(func $assembly/index/PadDemo#set:value
  local.get $0
  local.get $1
  i32.store offset=4
)
```

`tag` は1バイト書き込みなので `i32.store8`、`value` は4バイトの `i32.store offset=4` になっています。ソースコードのフィールドが、WASM命令では「何バイトを、どのオフセットに書くか」へ落ちていることが見えます。

## `@unmanaged` なクラス

AssemblyScriptには `@unmanaged` というデコレータがあります。

```ts
@unmanaged
class Vec2 {
  x: f32;
  y: f32;
}
```

通常の管理対象クラスは、GCのためのヘッダを持ちます。一方、`@unmanaged` なクラスは管理対象オブジェクトではなく、より生の構造体に近いものとして扱われます。

つまり、次のような違いがあります。

| 種類 | ヘッダ | GC管理 | 用途のイメージ |
| --- | --- | --- | --- |
| 通常のclass | ある | される | 普通のオブジェクト |
| `@unmanaged` class | ない | されない | C structに近いメモリ表現 |

これは低レイヤーの表現を明示的に扱いたいときには便利です。ただし、GCに管理されないということは、扱いを間違えるとメモリ管理の責任が自分側に寄ってきます。

「TypeScriptっぽいクラス」から「構造体としてのメモリ表現」へ近づく機能だと思うと理解しやすいです。

## ArrayBufferは生のバイト列

次に配列系のデータ構造を見ていきます。

まず `ArrayBuffer` です。

```ts
const buffer = new ArrayBuffer(16);
```

`ArrayBuffer` は、生のバイト列を表す固定長バッファです。この感覚はJavaScriptの `ArrayBuffer` とかなり近いです。

AssemblyScriptのランタイムレイアウトでは、`ArrayBuffer` のペイロードはそのまま未型付けのデータ領域として扱われます。

```txt
ptr
|
v
+--------+--------+--------+--------+--------+--------+---+
| byte 0 | byte 1 | byte 2 | byte 3 | byte 4 | byte 5 |...|
+--------+--------+--------+--------+--------+--------+---+
```

`ArrayBuffer` 自体は「このバイト列を持つ」という低レベルな入れ物です。ここには `i32` として読むべき値が入っているかもしれないし、`f64` として読むべき値が入っているかもしれません。

実験では、次のように `ArrayBuffer(12)` に3つの32-bit値を書き込みました。

```ts
export function makeArrayBufferPtr(): usize {
  const buf = new ArrayBuffer(12);
  const ptr = changetype<usize>(buf);

  store<u32>(ptr + 0, 0x01020304);
  store<u32>(ptr + 4, 0x11121314);
  store<u32>(ptr + 8, 0x21222324);

  return ptr;
}
```

メモリダンプでは、payloadに次のバイト列がそのまま現れました。

```txt
04 03 02 01 14 13 12 11 24 23 22 21
```

`0x01020304` が `04 03 02 01` と見えているのは、WASMの数値ロード・ストアがlittle-endianで行われるためです。

ただし `ArrayBuffer` だけでは、そこに入っている値の型はわかりません。そこで登場するのが `TypedArray` です。

## TypedArrayはバッファに被せるビュー

`TypedArray` は、`ArrayBuffer` を特定の型の連続データとして見るためのビューです。

```ts
const view = new Int32Array(3);
view[0] = 0x11223344;
view[1] = 0x55667788;
view[2] = 0x01020304;
```

この場合、12バイトのデータ領域を、4バイトの `i32` が3個並んだ領域として見ます。

```txt
ArrayBuffer payload
+-------------+-------------+-------------+
| i32         | i32         | i32         |
+-------------+-------------+-------------+
 0             4             8
```

AssemblyScriptの `TypedArray` は、ドキュメント上では次のようなフィールドを持つオブジェクトとして説明されています。

| フィールド | 意味 |
| --- | --- |
| `buffer` | 参照している `ArrayBuffer` |
| `dataStart` | バッファ内のデータ開始位置 |
| `byteLength` | ビューのバイト長 |

つまり、`TypedArray` の本体はデータそのものではありません。データは `ArrayBuffer` 側にあり、`TypedArray` は「どのバッファの、どこから、何バイトを、どの型として見るか」を持っています。

今回の `Int32Array(3)` は、payload上で次のように読めました。

```txt
Int32Array object payload
+0   buffer     = 0x00008a60
+4   dataStart  = 0x00008a60
+8   byteLength = 12
```

そして `dataStart` から `byteLength` 分を `i32` として読むと、書き込んだ値が得られます。

```txt
values = [
  0x11223344,
  0x55667788,
  0x01020304,
]
```

```txt
TypedArray object
+----------------+----------------+----------------+
| buffer ref     | dataStart      | byteLength     |
+----------------+----------------+----------------+
        |
        v
ArrayBuffer payload
+--------+--------+--------+--------+--------+---+
| raw bytes ...
+--------+--------+--------+--------+--------+---+
```

この構造はJavaScriptの `ArrayBuffer` と `TypedArray` の関係を知っている人にはかなり馴染みやすいはずです。

`ArrayBuffer` は生のメモリ、`TypedArray` はその見方です。

## Array<T>はTypedArrayより少しリッチ

AssemblyScriptには通常の配列 `Array<T>` もあります。

```ts
const values = new Array<i32>(3);
values[0] = 10;
values[1] = 20;
values[2] = 30;
```

JavaScriptの `Array` に近いAPIを持つため、TypeScriptエンジニアには一番自然に見えるかもしれません。

ただし、メモリレイアウトとしては「ただ値が3つ連続しているだけ」ではありません。

AssemblyScriptのドキュメントでは、`Array<T>` はTypedArrayと同じようなレイアウトに加えて、可変の `length` フィールドを持つと説明されています。

| フィールド | 意味 |
| --- | --- |
| `buffer` | 実データを持つ `ArrayBuffer` |
| `dataStart` | データ開始位置 |
| `byteLength` | バイト長 |
| `length` | 要素数 |

イメージとしてはこうです。

```txt
Array<T> object
+----------------+----------------+----------------+----------------+
| buffer ref     | dataStart      | byteLength     | length         |
+----------------+----------------+----------------+----------------+
        |
        v
ArrayBuffer payload
+-------------+-------------+-------------+
| values[0]   | values[1]   | values[2]   |
+-------------+-------------+-------------+
```

ここで大事なのは、`Array<T>` の変数が指しているオブジェクトと、要素データが入っているバッファは別に考える必要があるということです。

今回の `Array<i32>(3)` は、payload上で次のように見えました。

```txt
Array<i32> object payload
+0   buffer     = 0x00008ab0
+4   dataStart  = 0x00008ab0
+8   byteLength = 32
+12  length     = 3
```

注目したいのは、`length` が `3` なのに `byteLength` が `32` だった点です。

`i32` が3個なら、実データとして最低限必要なのは12バイトです。しかし今回のAssemblyScript 0.28.14 / `-O0` / incremental runtimeの観測では、`Array<i32>` は長さぴったりの連続メモリではなく、余裕を持ったバッファを参照するオブジェクトとして見えました。

これは「配列は値がただ並んでいるだけではない」という話をするのに、とてもわかりやすい結果です。

ソースコードでは、

```ts
values[1]
```

と書くだけですが、実際には概念的に次のような情報が関係します。

```txt
values が指す Array オブジェクト
values.buffer が指す ArrayBuffer
dataStart
index
要素型のサイズ
```

`values[1]` を読むには、`dataStart + 1 * sizeof<i32>()` のような位置から値を読む必要があります。

もちろん、コンパイラが適切なWASM命令に落としてくれるので、普段はこれを手で書く必要はありません。ただ、「配列アクセス = メモリアドレス計算 + load」と考えられるようになると、WASMの実行モデルがずっと具体的になります。

## StaticArray<T>という選択肢

AssemblyScriptには `StaticArray<T>` もあります。

```ts
const values = new StaticArray<i32>(3);
```

`StaticArray<T>` はサイズ変更が不要な固定長配列です。ドキュメントでは、リサイズのための間接参照を必要とせず、データがペイロード内に直接置かれるものとして説明されています。

```txt
StaticArray<T> payload
+-------------+-------------+-------------+
| values[0]   | values[1]   | values[2]   |
+-------------+-------------+-------------+
```

通常の `Array<T>` よりも表現がシンプルで、「固定長の連続した値」というイメージに近くなります。

可変長の便利さが必要なら `Array<T>`、固定長でメモリ表現を素直にしたいなら `StaticArray<T>`、生のバイト列を扱いたいなら `ArrayBuffer`、型付きビューが欲しいなら `TypedArray`、という見方をすると整理しやすいです。

## stringはUTF-16として見えた

今回の実験では、文字列も少しだけ観測しました。

```ts
export function makeStringPtr(): usize {
  return changetype<usize>("Aあ");
}
```

incremental runtimeでこの文字列のpayloadを見ると、次のバイト列が入っていました。

```txt
41 00 42 30
```

これはlittle-endianのUTF-16 code unitとして読むと、次の2文字に対応します。

```txt
0x0041 = A
0x3042 = あ
```

実験ログ上でも、ヘッダの `rtSize` は `4`、UTF-16 code unitは `[65, 12354]` と読めました。

```txt
rtId = 2
rtSize = 4
utf16 code units = [65, 12354]
```

ここから、少なくとも今回観測した文字列リテラル `"Aあ"` は、UTF-8のバイト列ではなくUTF-16 code unit列として配置されている、と説明できます。

ただし、この例は文字列リテラルです。静的領域に置かれる文字列と、実行時に動的生成される文字列では、配置場所やGCとの関係が変わる可能性があります。ここも「文字列は常にこう」と一般化しすぎない方が安全です。

## GCヘッダも少しだけ覗ける

AssemblyScriptの `incremental` runtimeでは、`__pin`、`__unpin`、`__collect` を使ってGCと関係する状態変化も観測できます。

実験では、`"PIN"` という文字列を `__pin` して、ヘッダ内の `gcInfo` の下位ビットを読みました。

```txt
before collect: colorBits = 3
after collect:  colorBits = 3
after unpin:    colorBits = 1
```

`__pin` 中はGCから回収されないように扱われ、`__unpin` 後に状態が変わっていることが、今回の実装ではビットの変化として見えました。

ただし、これは特に実装依存が強い部分です。記事やLTで扱うなら、「AssemblyScript 0.28.14のincremental runtimeでは、今回こう観測できた」という言い方に留めるのがよいです。

## JS側からメモリを覗く

WASMの面白いところは、線形メモリをJavaScript側から覗けることです。

たとえばAssemblyScript側で、バッファのpayload先頭を `usize` として返す関数を用意したとします。

```ts
export function allocBufferPtr(): usize {
  const buffer = new ArrayBuffer(16);
  const ptr = changetype<usize>(buffer);

  store<u32>(ptr + 0, 0x11223344);
  store<u32>(ptr + 4, 0x55667788);
  store<u32>(ptr + 8, 0x99aabbcc);
  store<u32>(ptr + 12, 0xddeeff00);

  return ptr;
}
```

JavaScript側では、戻り値を線形メモリ上のオフセットとして扱えます。

```ts
const ptr = instance.exports.allocBufferPtr() as number;
const memory = instance.exports.memory as WebAssembly.Memory;
const bytes = new Uint8Array(memory.buffer);
const dv = new DataView(memory.buffer);

console.log(bytes[ptr + 0].toString(16)); // 44
console.log(bytes[ptr + 1].toString(16)); // 33
console.log(dv.getUint32(ptr + 0, true).toString(16)); // 11223344
```

実際のホスト連携では、GCによる回収を避けるためのpin/unpinや、AssemblyScriptローダーの利用などを考える必要があります。ここではメモリモデルの理解を優先して、単純化した例として見てください。

この例からわかるのは、`ArrayBuffer` の参照が指している先に、実際のバイト列があるということです。今回のログでも、`allocBufferPtr()` が返したアドレスの位置に次の16バイトがそのまま見えていました。

```txt
44 33 22 11 88 77 66 55 cc bb aa 99 00 ff ee dd
```

TypeScriptでは `buffer[0]` のように直接読むことはありませんが、WASMの線形メモリとして見ると、バッファの中身は本当にバイト列として存在しています。

## 「参照」はアドレスである

ここまでの話をまとめると、AssemblyScriptの管理対象オブジェクトは次のように考えられます。

```txt
変数
 |
 v
参照値
 |
 v
線形メモリ上のペイロード
```

参照値は、実体そのものではありません。実体が置かれている場所を指す値です。

これはJavaScriptやTypeScriptでも概念的には同じです。

```ts
const a = { value: 1 };
const b = a;

b.value = 2;
console.log(a.value); // 2
```

`a` と `b` は同じオブジェクトを参照しています。ただし、JavaScriptではその参照が具体的にどのアドレスなのかを見ることはできません。

AssemblyScriptとWASMでは、その参照が線形メモリ上の数値として見える場面があります。だからこそ、普段は抽象化されている参照の正体を理解しやすいのです。

## TypeScriptエンジニアが得られる視点

AssemblyScriptのメモリレイアウトを知ったからといって、明日からTypeScriptでポインタ演算をするわけではありません。

それでも、この視点には価値があります。

たとえば、次のようなことが見えやすくなります。

- オブジェクトは実体ではなく参照として受け渡される
- 配列アクセスは最終的にはアドレス計算とメモリ読み書きに落ちる
- `ArrayBuffer` と `TypedArray` は「データ」と「見方」を分ける仕組みである
- 高水準な `class` にも、実行時にはフィールド配置や管理情報がある
- `Array<T>` のような便利な構造ほど、ランタイム都合のメタデータを持ちうる
- WASMとJSの境界では、値の変換やメモリ管理を意識する必要がある

特にWASMを使った高速化や、画像処理、音声処理、ゲーム、暗号、パーサーのような領域では、メモリの見え方がパフォーマンスや設計に直結します。

TypeScriptしか書いてこなかった人にとって、AssemblyScriptは「いきなりCやRustに飛び込む前に、見慣れた構文でメモリを観察できる」ちょうどいい入口になります。

## まとめ

TypeScriptでは、オブジェクトや配列のメモリ表現はJavaScriptエンジンに隠されています。

一方、WebAssemblyには線形メモリがあり、データはその中のバイト列として扱われます。AssemblyScriptはTypeScriptに近い構文を持ちながら、WASMの線形メモリ上にオブジェクトや配列を配置するため、その橋渡しとしてとても良い題材です。

この記事では、次のことを見てきました。

- WASMのメモリは連続したバイト列として理解できる
- AssemblyScriptの管理対象オブジェクトにはヘッダがある
- `class` のフィールドはペイロード内にオフセット付きで配置される
- `u8` と `i32` のような並びでは、paddingが実際に観測できる
- `ArrayBuffer` は生のバイト列である
- `TypedArray` は `ArrayBuffer` に被せる型付きビューである
- `Array<T>` はバッファ参照や長さを持つ、よりリッチな配列オブジェクトである
- 今回の `Array<i32>(3)` では、`length = 3` に対して `byteLength = 32` と観測された
- 文字列リテラル `"Aあ"` は、今回の条件ではUTF-16 little-endianとして読めた

`new Point(10, 20)` という何気ないコードも、WASMの視点で見ると「ヒープに領域を確保し、管理ヘッダを持つオブジェクトを作り、フィールドを特定のオフセットに書き込む」処理として見えてきます。

高水準なコードは、最終的にはどこかでバイト列になります。

その変換の途中を少しだけ覗けるようになると、TypeScriptで書いている普段のコードも、WASMとの境界にあるコードも、前より立体的に見えるようになります。

## 参考

- [AssemblyScript Runtime](https://www.assemblyscript.org/runtime.html)
- [AssemblyScript Array](https://www.assemblyscript.org/stdlib/array.html)
- [AssemblyScript ArrayBuffer](https://www.assemblyscript.org/stdlib/arraybuffer.html)
- [AssemblyScript StaticArray](https://www.assemblyscript.org/stdlib/staticarray.html)
- [AssemblyScript String](https://www.assemblyscript.org/stdlib/string.html)
- [AssemblyScript TypedArray](https://www.assemblyscript.org/stdlib/typedarray.html)
