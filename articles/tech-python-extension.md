---
title: "SwiftのextensionをPythonで安全に実装するには？"
emoji: "🎉"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [python, swift]
published: true
---
# はじめに
最近初めてSwiftを使ったアヤノです。

Swiftには他の言語ではあまり見られない独特な文法や機能が多く、触っていてとても新鮮でした。中でも特に印象に残ったのが「`extension`」でした。これを使うことで自作のクラスや構造体に対して、継承せずに機能を拡張できる点がとても便利で、関心の分離もしやすく、コードの見通しも良くなります。

この`extension`の概念をよく使うPythonでも取り入れたいと思い、色々と試してみました。その過程と結果を、この記事にまとめていきます。

# Swiftのextensionとは？
Swiftの`extension`とは、**クラスや構造体、列挙型、プロトコルなどに既存の型を拡張して機能を追加する構文**です。一見するとオブジェクト指向の「継承」と似ていますが、決定的な違いは、`extension`は既存の型そのものに対して直接関数やプロパティを追加できる点です。そのため、継承のように新しいサブクラスを作る必要がなく、軽量に機能拡張を実現できます。

`extension`を使うことのメリットは以下のようになります。
- コードの関心の分離がしやすくなる
- 既存の型を拡張できるため、可読性・保守性の向上につながる
- 外部ライブラリの型に対しても拡張が可能となる（同名の関数を追加できない等の制約あり）

```swift
// extensionの書き方

extension 型 {
  // 追加したい機能の記述
}
```

# Pythonでextensionを再現する方法
そもそもPythonにはSwiftのような`extension`構文はありません。ですが、柔軟な言語仕様を活かして後からクラスに機能を追加する方法はいくつか存在します。そのため、ここからは、PythonでSwiftの`extension`の概念を再現するためのアプローチを紹介します。

## １．モンキーパッチ：定義済みクラスに直接追加
最初に思いつく方法としては、定義済みのクラスに後から関数を追加する方法です。これは、「モンキーパッチ（Monkey Patch）」と呼ばれるテクニックで、Pythonでは簡単に実現できます。

| 利点 / 欠点 | 説明 |
|------|----------------------------------------------------------------------|
| ✅ 長所 | ● 実装がシンプル、即席で使える |
| ⚠️ 短所 | ● 上書きのリスクがある（既存関数と衝突）<br>● 意図しない副作用を生む可能性がある（保守性低）<br>➡  ライブラリコードや他人のコードを予期せず壊す可能性があるため、実運用では非推奨 |

```python
class User:
    def __init__(self, name):
        self.name = name

def greet(self):
    return f"Hello, {self.name}!"

User.greet = greet

user = User("Alice")
print(user.greet())  # Hello, Alice!
```
## ２．ユーティリティ関数：外側から関数で拡張
次に思いつく方法としては、クラスを変更せずに、関数として外側から機能を追加する方法です。これは、「ユーティリティ関数」と呼ばれるテクニックで、よく使う処理を簡単に呼び出せるように作成する関数です。この方法は「Swiftのextensionのようなクラスの拡張」ではなく、「関数として外部から操作する」別のアプローチとなります。

| 利点 / 欠点 | 説明 |
|------|----------------------------------------------------------------------|
| ✅ 長所 | ● クラス本体をいじらないので、安全に実装できる<br>● 明示的な関数呼び出しなのでトラブルが少ない |
| ⚠️ 短所 | ● 関数のように `user.greet()` とは書けない<br>● Swiftのextension感は薄い |

```python
class User:
    def __init__(self, name):
        self.name = name

def greet(user: "User") -> str:
    return f"Hello, {user.name}!"

user = User("Alice")
print(greet(user))  # Hello, Alice!
```

## ３．Mixin継承：再利用可能な拡張パーツ
Pythonでは昔からMixinという設計手法が使われており、複数継承を活用して再利用可能な機能をクラスに追加することができます。他にも typing.Protocol を使う方法もありますが、これはインターフェイスを作るものなので、 `extension` の概念の再現には使えません。

| 利点 / 欠点 | 説明 |
|------|----------------------------------------------------------------------|
| ✅ 長所 | ● クラス設計として明示的、安全で保守しやすい<br>● 再利用可能なモジュールとして他のクラスにも組み込める |
| ⚠️ 短所 | ● 最初から設計しておく必要がある（既存クラスへの後付けには向かない） |

```python
class GreetMixin:
    def greet(self):
        return f"Hello, {self.name}!"

class User(GreetMixin):
    def __init__(self, name):
        self.name = name

user = User("Alice")
print(user.greet())  # Hello, Alice!

```

## ４．デコレーター：後から安全に関数追加
最後に紹介する方法は、デコレーターを使う方法です。デコレータは関数やクラスの前後に特定の処理を追加できる機能で、pythonでは、`@<decorator name>`の形式で使用します。

| 利点 / 欠点 | 説明 |
|------|----------------------------------------------------------------------|
| ✅ 長所 | ● 拡張対象と関数の関係が明確にできる<br>● コードの分離・整理がしやすい |
| ⚠️ 短所 | ● デコレーターの理解が前提（初心者にはやや難） |

```python
# @extend は存在しないため、自作する必要があります
@extend(User)
def greet(self):
    return f"Hello, {self.name}!"

user = User("Alice")
print(user.greet())  # 👉 Hello, Alice!
```

## どれを使うか考える
ここまで、PythonでSwiftのextensionに近いことを実現するための4つのアプローチを見てきました。これまでの内容から、それぞれの適しているケースと向いていないケースを以下に整理します。

| 方法名           | 適しているケース                     | 向いていないケース                          |
| ------------- | ---------------------------- | ---------------------------------- |
| **モンキーパッチ**   | 手早く追加したい／検証中など一時的な用途         | 本番コードや共有ライブラリなど安全性が重要な場面           |
| **ユーティリティ関数** | 関数的に処理を分離したい／状態を持たない処理       | クラスのような「関数呼び出し」の見た目を保ちたいとき       |
| **Mixin継承**   | 拡張機能を再利用したい／型安全に設計したい場合      | 既存クラスを変更せずに後付け拡張したいとき              |
| **デコレーター**    | 拡張を明示的・安全に行いたい／関心の分離を重視したいとき | Pythonのデコレーターに慣れていない人／複雑な構文を避けたい場合 |

Swiftの`extension`は、既存の型に安全かつ分離された形で機能を追加できる点が特徴的でした。そのため、その考え方に最も近く、かつPythonらしい記述で実現できるの「デコレーターを使った拡張」を今回は採用します。

# 自作デコレーターで再現してみた
ここからは、Swiftの`extension`と似た、Python独自の拡張構文をデコレーターで作っていきます。完成形は、次のような使い方ができる形です。
```python
@extend(SomeClass)
def new_method(self):
    ...
```

また、今回は以下の3点を意識して実装をしていきます。
- **安全性重視**：既存関数を誤って上書きしないように防止機能を搭載する
- **組み込み型を保護**：Pythonのstrやintなどへの誤用を防ぐ
- **拡張の記録**：どの関数が拡張されたか確認できるよう、__pyxtend_extensions__に記録

## Step 1 - デコレータの作成
まず最小構成のextendデコレーターを定義します。

この関数は、対象のクラスclsに対して、新しい関数funcを関数として追加します。この段階では機能拡張だけを目的としており、安全性チェックや制限は実装していません。また、Swiftのextensionの基本的な振る舞いは、一応、この段階で再現できます。

```python
def extend(cls):
    def decorator(func):
        setattr(cls, func.__name__, func)
        return func
    return decorator
```

## Step 2 - 組み込み型の保護
ここでは、`int`や`str`などの組み込み型（builtins）への拡張を禁止する実装をします。ここの実装により、Pythonの組み込み型を破壊出来ないようになり、`@extend(str)` のような使い方はエラーになります。

```diff python
def extend(cls):
+    if not isinstance(cls, type):
+        raise TypeError(f"extend() の引数は型である必要があります。: {cls}")
+
+    if cls.__module__ == "builtins":
+        raise TypeError(
+            f"{cls.__name__} は組み込み型であり、拡張できません。"
+            "ユーザー定義クラスを拡張してください。"
+        )

    def decorator(func):
        setattr(cls, func.__name__, func)
        return func
    return decorator
```

:::message
C拡張型や特殊な型等でも完全に防げるかは分かりません。そのため、現状では、100%組み込み型を保護できるとは限りません。これらのケースでも完全に防ぐ方法が分かり次第修正します。
:::

## Step 3 - 安全性重視の実現
Swiftのextensionでは、既存の関数を上書きすることはできません。そのため、このデコレータでもすでに同名関数がある場合はエラーとします。

今回の実装の場合、 `hasattr()` による衝突チェックを採用しています。`hasattr()`は、関数だけでなく、@property や classmethod、クラス変数なども衝突対象としているため、同じ名前の何らかの属性がすでに存在していればエラーになります。そのため、安全のためには望ましい動作になりますが、「厳密に関数だけを判定したい場合」は追加の型チェックが必要となります。

※ 関数だけを許可したい場合は `getattr(cls, func.__name__)` で取り出して `callable(...)` かどうか、または `inspect.isfunction(...)` などで判定可能です。

```diff python
def extend(cls):
    if not isinstance(cls, type):
        raise TypeError(f"extend() の引数は型である必要があります。: {cls}")

    if cls.__module__ == "builtins":
        raise TypeError(
            f"{cls.__name__} は組み込み型であり、拡張できません。"
            "ユーザー定義クラスを拡張してください。"
        )

    def decorator(func):
+        if hasattr(cls, func.__name__):
+            raise AttributeError(
+                f"{cls.__name__} にはすでに '{func.__name__}' が存在します。上書きは許可されていません。"
+            )
        setattr(cls, func.__name__, func)

        return func
    return decorator
```

## Step 3 - 拡張の記録
最後に、どの関数がextendによって追加されたかを記録しておく機能を加えます。基本的には使わない機能になりますが、あるとデバックの際にべんりなので実装します。この実装により、`<class name>.__pyxtend_extensions__` のようにすることで、拡張された関数一覧を確認できます。

この実装では、任意のクラスに `__pyxtend_extensions__` というクラス属性を追加して、拡張された関数一覧を管理しています。そのため、既にクラス属性に `__pyxtend_extensions__`を持っている場合に上書きされるため、絶対に被らないように工夫が必要です。そのため、バグの要因を生みたくない場合や、関数型志向や副作用を避けたい設計の場合、状態を持つこと自体を避けたい場合はここの記述はしない方が良いです。

```diff python
def extend(cls):
    if not isinstance(cls, type):
        raise TypeError(f"extend() の引数は型である必要があります。: {cls}")

    if cls.__module__ == "builtins":
        raise TypeError(
            f"{cls.__name__} は組み込み型であり、拡張できません。"
            "ユーザー定義クラスを拡張してください。"
        )

    def decorator(func):
        if hasattr(cls, func.__name__):
            raise AttributeError(
                f"{cls.__name__} にはすでに '{func.__name__}' が存在します。上書きは許可されていません。"
            )
        setattr(cls, func.__name__, func)

+        if not hasattr(cls, '__pyxtend_extensions__'):
+            cls.__pyxtend_extensions__ = []
+        cls.__pyxtend_extensions__.append(func.__name__)
        
        return func
    return decorator
```

## プログラム全体
完成したプログラムの全体を貼ります。これをプログラムで使用することにより、Swiftの `extension` のように、既存クラスに対して安全かつ構造的に関数を追加する仕組みをPythonで再現できます。

```python
"""
Swift-style class extension decorator.
Usage:
    @extend(SomeClass)
    def new_method(self):
        ...
"""

def extend(cls):
    if not isinstance(cls, type):
        raise TypeError(f"extend() の引数は型である必要があります。: {cls}")

    if cls.__module__ == "builtins":
        raise TypeError(
            f"{cls.__name__} は組み込み型であり、拡張できません。"
            "ユーザー定義クラスを拡張してください。"
        )

    def decorator(func):
        if hasattr(cls, func.__name__):
            raise AttributeError(
                f"{cls.__name__} にはすでに '{func.__name__}' が存在します。上書きは許可されていません。"
            )
        setattr(cls, func.__name__, func)

        if not hasattr(cls, '__pyxtend_extensions__'):
            cls.__pyxtend_extensions__ = []
        cls.__pyxtend_extensions__.append(func.__name__)
        
        return func
    return decorator
```

# 結果（使用例）
それでは、使用例です。この使用例は、下記のGithubのリポジトリの環境で試しました。私の環境では意図した動作が確認できたので、参考までに確認して下さい。

https://github.com/ayano-yuki/Pyxtend/tree/main

```python: main.py
from pyxtend import extend

class User:
    def __init__(self, name):
        self.name = name

@extend(User)
def greet(self):
    return f"Hello, {self.name}!"

user = User("Alice")
print(user.greet())  # 出力: Hello, Alice!
```

# おわりに
今回はPythonでもSwiftの`extension`の概念を使うために、実装方法の模索とデコレータを用いた実装を行いました。再掲になりますが、以下に今回作成したデコレータのGithubを貼ります。現状は、importして使う予定ですが、今後も似たような取り組みをするならライブラリを作るかもです。

https://github.com/ayano-yuki/Pyxtend/tree/main
