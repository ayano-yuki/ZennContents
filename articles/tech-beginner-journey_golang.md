---
title: "Golang初心者がゼロから学ぶ学習記録"
emoji: "🐬"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [Golang]
published: false
---
# はじめに
ハロハロ～、Golangを諸事情で勉強することになったアヤノです。
この記事は、ゼロからGolangを勉強し、そのアウトプットとして作成しました。
つまり、アヤノのGolangの学習記録です。

ちなみに、フロントエンド編、Android編、ios編を書くかもです。

# 勉強に使ったサイト
今回の勉強で使ったサイトは以下にあるものです。基本的には、A Tour of Goで勉強し、その他のサイトで補足していくように勉強しました。

- [A Tour of Go](https://go-tour-jp.appspot.com/welcome/1)

# 文法
## Imports
プログラム内で使用するパッケージ（ライブラリ）を読み込むために書く。何も使わない場合は書かなくてもOK！
```go
package main

import (
	"fmt"
	"math"
)

func main() {
	fmt.Printf("Now you have %g problems.\n", math.Sqrt(7))
}
```

## Exported names
Goは、読み込んだパッケージの最初の文字が大文字で始まるもの（関数・変数・構造体等の全部）に全てアクセスできる。私のイメージだと、オブジェクト指向のpublicになる条件が「最初が大文字か否か」となる。
```golang
package main

import (
	"fmt"
	"math"
)

func main() {
	fmt.Println(math.Pi) //大文字なので参照できる
}
```

## Functions
関数は、pythonみたいに引数の型と戻り値の型を最後に書く。また、連続で同じ型の引数を書く場合は省略出来たりする。Go特有の文法としては、戻り値に名前をつけることができ、returnの後に書く戻り値を省略できる点がある。業務レベルだと、add関数みたいなデフォルトの書き方が好まれそう。
```go
package main

import "fmt"

func add(x int, y int) int {
	return x + y
}

func swap(x, y string) (string, string) {
	return y, x
}

func split(sum int) (x, y int) {
	x = sum * 4 / 9
	y = sum - x
	return
}

func main() {
	fmt.Println(add(42, 13))
    a, b := swap("hello", "world")
	fmt.Println(a, b)
    fmt.Println(split(17))
}
```
## Variables
変数宣言は、JavaScriptみたいな書き方をする。Goの特有の文法としては、var宣言の省略として`:=`があるが、これは関数内でしか使えないので注意がいる。また、この書き方をすることで、型も省略できる。
```go
package main

import "fmt"

func main() {
	var i, j int = 1, 2
	k := 3
	c, python, java := true, false, "no!"

	fmt.Println(i, j, k, c, python, java)
}
```
goで使える基本型の一覧は以下のようになっている。また、表で使われているゼロ値と言うのは、変数に初期値を与えずに宣言した場合に代入される値のことである。
| 型名         | 説明                                      | ゼロ値 |
|:-----------:|-----------------------------------------|:------:|
| `bool`      | 真偽値（`true` または `false`）         | `false` |
| `string`    | 文字列型                               | `""` （空文字列） |
| `int`       | 符号付き整数（実装依存のサイズ）        | `0` |
| `int8`      | 8ビットの符号付き整数                  | `0` |
| `int16`     | 16ビットの符号付き整数                 | `0` |
| `int32`     | 32ビットの符号付き整数                 | `0` |
| `int64`     | 64ビットの符号付き整数                 | `0` |
| `uint`      | 符号なし整数（実装依存のサイズ）        | `0` |
| `uint8`     | 8ビットの符号なし整数                  | `0` |
| `uint16`    | 16ビットの符号なし整数                 | `0` |
| `uint32`    | 32ビットの符号なし整数                 | `0` |
| `uint64`    | 64ビットの符号なし整数                 | `0` |
| `uintptr`   | ポインタを格納するための整数型          | `0` |
| `byte`      | `uint8` の別名                         | `0` |
| `rune`      | `int32` の別名（Unicode コードポイント） | `0` |
| `float32`   | 32ビットの浮動小数点数                 | `0.0` |
| `float64`   | 64ビットの浮動小数点数                 | `0.0` |
| `complex64` | 実数部と虚数部が `float32` の複素数     | `0 + 0i` |
| `complex128`| 実数部と虚数部が `float64` の複素数     | `0 + 0i` |

## Type conversions
型変換は他の言語と同じように「型（値）」で行う。
```go
package main

import (
	"fmt"
	"math"
)

func main() {
	var x, y int = 3, 4
	var f float64 = math.Sqrt(float64(x*x + y*y))
	var z uint = uint(f)
	fmt.Println(x, y, z)
}
```

## Type inference
型を指定せずに変数を宣言する場合( `:=` や `var =` )は、変数の型は右側の変数から型推論される。
```go
package main

import "fmt"

func main() {
	v := 42
	fmt.Printf("v is of type %T\n", v) #%Tで型が確認できる
}
```

## Constants
定数宣言は、他の言語と同じような書き方をする。定数は、文字、文字列、真偽値、数値のみで使え、`:=`での宣言はできない。
```go
package main

import "fmt"

const Pi = 3.14

func main() {
	const World = "世界"
	fmt.Println("Hello", World)
	fmt.Println("Happy", Pi, "Day")

	const Truth = true
	fmt.Println("Go rules?", Truth)
}
```

## For
Goは、ループ文がFor文だけで、文法自体はCやJavaに近い。Forはセミコロンで3つの部分に区切られており、各区切りが無くても動作する。つまり、区切りなしでも無限ループとして動作します。注意する点は、Go特有の「（）が少ない」がForには適応される点です。
- **初期化ステートメント**: 最初のイテレーション(繰り返し)の前に初期化が実行されます
- **条件式**: イテレーション毎に評価されます。
- **後処理ステートメント**: イテレーション毎の最後に実行されます
```go
package main

import "fmt"

func main() {
	sum := 0
	for i := 0; i < 10; i++ {
		sum += i
	}
	fmt.Println(sum)
}
```

## If
他の言語とほぼ同じように行う。他の言語との違い？は、for のように条件の前に評価するための簡単なステートメントを書くことができる点である。このステートメントは、`if`のスコープでのみ有効となる。
```go
package main

import (
	"fmt"
	"math"
)

func pow(x, n, lim float64) float64 {
	if v := math.Pow(x, n); v < lim {
		return v
	} else {
		fmt.Printf("%g >= %g\n", v, lim)
	}
	// can't use v here, though
	return lim
}

func main() {
	fmt.Println(
		pow(3, 2, 10),
		pow(3, 3, 20),
	)
}
```

## Switch
