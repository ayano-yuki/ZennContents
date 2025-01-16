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

今回は、ConoHa VPSを使用してSoftEther VPNの環境を作成し、VPNの構築方法を記事にまとめました。初めてVPSの設定とVPNの構築を行ったため、間違っている点や足りない点があると思います。何かに気づいた方がいましたら、気軽にコメント蘭で質問・指摘をしてください。

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
- Ubuntuの更新と、パッケージのインストール

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
それでは、誰でもVPSにアクセスできる今の状況から脱するために、秘密鍵・公開鍵の設定を行います。手順としては、「クライアント側で鍵の生成、VPSに公開鍵をアップロード」となります。

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
作成した鍵の内、公開鍵をVPSにアップロードします。
```bash
# .ssh上で実行する
scp [key_name].pub [user_name]@[your_vps_ip]:~/.ssh/authorized_keys
```

作成した公開鍵がアップロード出来たら、以下のコマンドでログインしてください。
```bash
ssh [user_name]@[your_vps_ip] -i 'conoha.pub'
```
:::details 「ssh [user_name]@[your_vps_ip] -i 'conoha.pub」と打つのが面倒くさいと感じた人へ
Windows系のOSを使っている人は、以下のサイトを参考にして、
.sshフォルダ内にあるconfigを設定すると、「ssh 任意の名前」でSSH接続ができるようになります。
[Windows10のOpenSSHでconfig使ってSSH接続](https://meshikui.com/2018/09/11/949/)
:::

## SSH接続に関するセキュリティ設定
前節で、SSHの設定を変更したため、セキュリティ面を強化するために設定を変更します。

ここでは、以下の設定を行います。
- 公開鍵認証方式によるログインができるようにしたから、パスワードによるログインの禁止
- rootログインの禁止

本来は、SSHのポート番号も変えたほうが良いですが、ここではその方法には振れません。
```bash
# root権限で、「 /etc/ssh/sshd_config」を編集する
# 「PermitRootLogin yes」のyesをnoにする
# #PasswordAuthentication yes」のyesをnoにして、コメントを外す
sudo vim /etc/ssh/sshd_config
:
PermitRootLogin no
:
PasswordAuthentication no
:
```

上記の編集後、設定を反映させるために以下のコマンドを実行させる
```bash
sudo systemctl restart sshd.service
```

## Ubuntuの更新と、パッケージのインストール
ここまで出来たら、VPSの準備のさいごとして、OSの更新と、VPNの構築に使用するパッケージのインストールを行います。
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y gcc make build-essential libssl-dev g++ openssl libpthread-stubs0-dev gcc-multilib dnsmasq net-tools
```

:::message
**ココが不安**
- インストールする必要があるパッケージがこんなにあるかが不安
- 多分間違えているので、有識者からの指摘が欲しい
:::

# VPNの構築

# ダイナミックDNSの設定

# まとめ
## 出来ていないこと
- VPSを再起動すると、ufwの自動起動＋ルールの自動有効化がされない点

## 総括


# 参考文献
## 私が参考にしたサイト
- [SecureNATを無効化したSoftetherVPN server構築](https://qiita.com/honahuku/items/7be170ffe36405fc5c88)
- [softether VPNをCentos7で構築する。](https://qiita.com/honahuku/items/1fdc8c6b6ad49816f1a0)
- [WindowsからサーバへのSSH接続とポート開放](https://qiita.com/kakao1839/items/85c86fed55f523735df3)
- [ConoHaのVPSを借りてSoftEtherでVPN接続したときの備忘録](https://kakao.hateblo.jp/entry/2019/06/27/235946)
## 関連文献（何かの参考になりそう）
- [ConoHa VPS のSSH接続設定をしよう！](https://qiita.com/sf-12/items/3298cb37c032d5356035)
- [[SoftEther VPN] VPN 接続するユーザーアカウントを追加 / 変更する方法](https://www.gadgets-today.net/?p=4286)
- [[ConoHa VPS] WireGuardでVPNサーバー構築 [Ubuntu 22.04 LTS]](https://www.mulong.me/tech/linux/wireguard-vpn-ubuntu-conoha-vps/)