---
title: "【Gitの備忘録】基本コマンドとその解説"
emoji: "📓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["github"]
published: false
---
# はじめに


# 前提知識
この章では、この記事を読むうえで必要となる用語を説明します。

# gitの初期設定
この章では、Gitをインストールした時に行う初期設定について説明します。

## 基本情報の登録


```cmd
git config --global user.name [your-name]
git config --global user.email [your-email]
git config --list
```
## proxy設定の登録


```cmd
git config --global http.proxy [http-proxy]
git config --global https.proxy [https-proxy]
```

## proxy設定の削除


```cmd
git config --global --unset http.proxy
git config --global --unset https.proxy
```

# git pushの解説
この章では、ローカルリポジトリのコミットをリモートリポジトリに反映させるためのpushコマンドについて説明します。

## 初めてのpush


```cmd
git init 
git add [file]
git commit -m [message]
git branch -M main
git remote add origin [repository-address]
git push -u origin main
```

## 通常時のpush


```cmd
git switch -c [git-flow]/[branch-name]
git add [file]
git commit -m [message]
git push --set-upstream origin [git-flow]/[branch-name]
```