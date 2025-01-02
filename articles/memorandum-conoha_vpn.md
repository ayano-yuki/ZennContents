---
title: "【ConoHaの備忘録】ConoHa VPSを使ったVPN構築"
emoji: "📓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["conoha", "ubuntu", "softeher", "vpn"]
published: false
---
# はじめに
こんにちは！
VPNの構築に苦戦したアヤノです。

今回は、ConoHa VPSを使用してSoftEther VPNの環境を作成し、VPNの構築方法を記事にまとめました。

# 使用する環境
今回のVPN構築に使用する環境は、以下の通りです。
- VPS
  - ConoHa VPS 2GB/CPU 3Core
  - Ubuntu 24.04TLS
- クライアント
  - Windows11 Home
  - cmd

# VPSの初期設定
SoftEther VPNの環境する前に、VPSの初期設定を行います。
この章では、以下を設定するので、既に設定している方は読み飛ばしてください。
- VPSへのSSH接続
- 作業用ユーザーの追加と、root権限の付与
- 作業用ユーザーへのSSH接続と、root権限の制限
- 秘密鍵・公開鍵の設定
- SSH接続に関するセキュリティ設定
- Ubuntuの更新

## VPSへのSSH接続
VPSの初期設定をするために、VPSへのSSH接続をします。
VPSの初期状態では、ユーザーがrootしか無いため、rootへ接続します。
```bash
ssh root@[your_vps_ip] -p 22
```
## 作業用ユーザーの追加と、root権限の付与
rootは権限が強すぎるため、作業用のユーザーを作成します。また、作成したユーザーにroot権限を与えるためwheelグループに追加します。

```bash
# 管理者権限
adduser [user_name]
gpasswd -a [user_name] sudo
```

作成したユーザーがwheelグループに追加されたか確認したい場合は、以下のコマンドで確認してください。
```bash
id [user_name]
groups [user_name]
```
ここまで出来たら、一度VPSへのアクセスから抜けましょう。
```bash
exit
```

## 作業用ユーザーへのSSH接続と、root権限の制限
先程、作成した作業用ユーザーにアクセスして見ましょう。
```bash
ssh [user_name]@[your_vps_ip] -p 22
```

作業用ユーザーにSSH接続できたら、wheelグループ以外のユーザーがsudoコマンドを使えないようにしましょう。

```bash
# root権限で、「/etc/pam.d/su」を編集する
# 「auth required pam_wheel.so use_uid」のコメントを外す
$ sudo vim /etc/pam.d/su
:
:
auth required pam_wheel.so #を外す
:
```

## 秘密鍵・公開鍵の設定
それでは、誰でもVPSにアクセスできる今の状況から脱するために、秘密鍵・公開鍵の設定を行います。手順としては、「クライアント側で鍵の生成、VPSに公開鍵をアップロード、VPS側で設定」となります。

### クライアント側で鍵の生成
クライアント側で鍵を生成するために、「C:\Users\[laptop user]\.ssh」に移動してください。SSHに使用する鍵を作成・使用した事が無い場合は、.sshフォルダが無いこともあるので、無い場合は作成してください。

.sshフォルダに入れたら、以下のコマンドを使用して鍵を作成します。
```bash
# 鍵の名前を聞かれるので、適当な名前をつけてください。
# 例）conoha
#
# 生成されるファイル名（例の場合）：conoha  conoha.pub
ssh-keygen -t ed25519
```
### VPSに公開鍵をアップロード

## SSH接続に関するセキュリティ設定
## Ubuntuの更新

# VPNの構築

# ダイナミックDNSの設定

# まとめ

# 参考文献
- [SecureNATを無効化したSoftetherVPN server構築](https://qiita.com/honahuku/items/7be170ffe36405fc5c88)
- [softether VPNをCentos7で構築する。](https://qiita.com/honahuku/items/1fdc8c6b6ad49816f1a0)
- [WindowsからサーバへのSSH接続とポート開放](https://qiita.com/kakao1839/items/85c86fed55f523735df3)
- [ConoHaのVPSを借りてSoftEtherでVPN接続したときの備忘録](https://kakao.hateblo.jp/entry/2019/06/27/235946)