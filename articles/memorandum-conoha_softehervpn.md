---
title: "【ConoHaの備忘録】ConoHa VPSを使ったSoftether VPN構築"
emoji: "📓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["conoha", "ubuntu", "softethervpn", "vpn"]
published: true
---
# はじめに
こんにちは！
VPNの構築に苦戦したアヤノです。

今回は、ConoHa VPSを使用してSoftEther VPNの環境を作成し、VPNの構築方法を記事にまとめました。基本的には、「[SecureNATを無効化したSoftetherVPN server構築](https://qiita.com/honahuku/items/7be170ffe36405fc5c88)」を参考にしながら構築しましたが、初めてVPSの設定とVPNの構築を行ったため、間違っている点や足りない点があると思います。何かに気づいた方がいましたら、気軽にコメント蘭で質問・指摘をしてください。

# 使用する環境
今回のVPN構築に使用する環境は、以下の通りです。
- VPS
  - ConoHa VPS 2GB/CPU 3Core
  - Ubuntu 22.04.3 LTS
- クライアント
  - Windows11 Home
  - cmd

# VPSの初期設定
SoftEther VPNの環境する前に、VPSの初期設定を行います。
この章では、以下を設定するので、既に設定している方は読み飛ばしてください。
（やらなくても良い設定ですが、セキュリティ的にはやったほうが良いです。）
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
ssh [user_name]@[your_vps_ip] -i conoha.pub
```
:::details 「`ssh [user_name]@[your_vps_ip] -i conoha.pub`」と打つのが面倒くさいと感じた人へ
Windows系のOSを使っている人は、以下のサイトを参考にして、
.sshフォルダ内にあるconfigを設定すると、「ssh 任意の名前」でSSH接続ができるようになります。
[Windows10のOpenSSHでconfig使ってSSH接続](https://meshikui.com/2018/09/11/949/)
:::

## SSH接続に関するセキュリティ設定
前節で、SSHの設定を変更したため、セキュリティ面を強化するために設定を変更します。

ここでは、以下の設定を行います。
- 公開鍵認証方式によるログインができるようにしたから、パスワードによるログインの禁止
- rootログインの禁止

本来は、SSHのポート番号も変えたほうが良いですが、ここではその方法にはふれません。
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
OSの更新と、VPNの構築に使用するパッケージのインストールを行います。
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y gcc make dnsmasq net-tools
```

# VPNの構築
SoftEther VPNの構築を行います。
構築の手順は、以下の通りです。
1. softetherのインストール
2. softetherの設定
   1. softetherの起動
   2. パスワードの設定
   3. 仮想HUBの作成と設定
   4. softetherの自動起動設定
   5. VPN構築に必要な情報の収集（NIC名、IPアドレス）
   6. softetherのiptablesの設定
3. dnsmasqの設定
4. NATの設定
5. ファイヤーウォールの設定
6. VPNとDNSの起動


## softetherのインストール
下記のコマンドでsoftether v4.42-9798をインストールします。
最新のものをインストールしたい場合は、URLを書き換えてください。
```sh
wget https://jp.softether-download.com/files/softether/v4.42-9798-rtm-2023.06.30-tree/Linux/SoftEther_VPN_Server/64bit_-_Intel_x64_or_AMD64/softether-vpnserver-v4.42-9798-rtm-2023.06.30-linux-x64-64bit.tar.gz
tar xvf softether-vpnserver*
cd vpnserver
make
chmod 600 *
chmod 700 vpncmd
chmod 700 vpnserver
cd
sudo \cp -r -f ./vpnserver/ /usr/local/
sudo \rm -rf ./vpnserver
ls -lra /usr/local/vpnserver
rm -rf softether-vpnserver*
```

## softetherの設定
### softetherの起動
sofetherのインストールが出来たので、VPNの環境を構築するためにソフトを起動させます。
```sh
sudo /usr/local/vpnserver/vpnserver start
sudo /usr/local/vpnserver/vpncmd /server localhost
```

### パスワードの設定
ソフトの起動が出来たら、サーバー管理画面にアクセスするためのパスワードを設定します。
```sh
ServerPasswordSet [password]
```

### 仮想HUBの作成と設定
VPNで使用する仮想HUBを作成します。
また、ローカルブリッジ接続も作成しておきます。
```sh
HubCreate [hub_name] /PASSWORD:[password]
BridgeCreate [hub_name] /DEVICE:soft /TAP:yes
```

それでは、VPNの接続するために必要なアカウントを作成します。
```sh
Hub [hub_name]
GroupCreate Admin /REALNAME:none /NOTE:none
UserCreate [account_name] /GROUP:Admin /NOTE:none /REALNAME:none
UserPasswordSet [account_name] /PASSWORD:[account_password]
exit
```

### softetherの自動起動設定
Softetherをサービスとして自動起動させるための設定を行います。
`sudo vim /lib/systemd/system/vpnserver.service`で設定ファイルを作成し、以下の内容を入力してください。
```sh
[Unit]
Description=SoftEther VPN Server
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/vpnserver/vpnserver start
ExecStop=/usr/local/vpnserver/vpnserver stop
ExecStartPost=/bin/sleep 05
ExecStartPost=/bin/bash /root/softether-iptables.sh
ExecStartPost=/bin/sleep 03
ExecStartPost=/bin/systemctl start dnsmasq.service
ExecReload=/bin/sleep 05
ExecReload=/bin/bash /root/softether-iptables.sh
ExecReload=/bin/sleep 03
ExecReload=/bin/systemctl restart dnsmasq.service
ExecStopPost=/bin/systemctl stop dnsmasq.service
Restart=always

[Install]
WantedBy=multi-user.target
```

### VPN構築に必要な情報の収集（NIC名、IPアドレス）
VPNの構築に必要なNIC名と、VPSのIPアドレスを調べます。
```bash
# NIC名(eth0、enp1s0みたいな名前がそれです)
ifconfig

# VPSのIPアドレス
curl globalip.me
```

### softetherのiptablesの設定
VPNに接続されたデバイスにIPアドレスを配布するための設定を行います。
ここの設定には、**NIC名**と**VPSのIPアドレス**が必要になります。
`sudo vim /root/softether-iptables.sh`で設定ファイルを作成し、以下の内容を入力してください。
```sh
#!/bin/bash
TAP_ADDR=192.168.30.1
TAP_INTERFACE=tap_soft
VPN_SUBNET=192.168.30.0/24
NET_INTERFACE=[NIC]
VPNEXTERNALIP=[ip_address]

iptables -F && iptables -X
/sbin/ifconfig $TAP_INTERFACE $TAP_ADDR

iptables -t nat -A POSTROUTING -s $VPN_SUBNET -j SNAT --to-source $VPNEXTERNALIP

iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT

iptables -A INPUT -s $VPN_SUBNET -m state --state NEW -j ACCEPT
iptables -A OUTPUT -s $VPN_SUBNET -m state --state NEW -j ACCEPT
iptables -A FORWARD -s $VPN_SUBNET -m state --state NEW -j ACCEPT

ufw enable
```

ファイルの作成が出来たら、スクリプトに実行権限を付与します。
```sh
sudo chmod +x /root/softether-iptables.sh
```

## dnsmasqの設定
VPNとの接続が出来たら、VPNを経由して通信をします。
その時に使用するプライベートIPアドレスを配布するためDNSサーバーを設定します。
`sudo vim /etc/dnsmasq.conf`で設定ファイルを開き、以下で上書きしてください。
ここの設定には、**NIC名**が必要になります。
上書きが怖いなら、既存のファイルを`sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf-backup`でバックアップを取ってください。
```sh
# In this case it is the Softether bridge
interface=tap_soft

# Don't ever listen to anything on eth0, you wouldn't want that.
except-interface=[NIC]

listen-address=192.168.30.1
bind-interfaces

# Let's give the connecting clients an internal IP
dhcp-range=tap_soft,192.168.30.10,192.168.30.200,720h

# Default route and dns
dhcp-option=tap_soft,3,192.168.30.1

# enable dhcp
dhcp-authoritative

# enable IPv6 Route Advertisements
enable-ra

#  have your simple hosts expanded to domain
expand-hosts

# Let dnsmasq use the dns servers in the order you chose.
strict-order

# Let's try not giving the same IP to all, right?
dhcp-no-override

# The following directives prevent dnsmasq from forwarding plain names (without any dots)
# or addresses in the non-routed address space to the parent nameservers.
domain-needed

# Never forward addresses in the non-routed address spaces
bogus-priv


# blocks probe-machines attack
stop-dns-rebind
rebind-localhost-ok

# Set the maximum number of concurrent DNS queries. The default value is 150. Adjust to your needs.
dns-forward-max=300

# stops dnsmasq from getting DNS server addresses from /etc/resolv.conf
# but from below
no-resolv
no-poll

# Prevent Windows 7 DHCPDISCOVER floods
dhcp-option=252,"\n"

# Use this DNS servers for incoming DNS requests
server=1.1.1.1
server=8.8.4.4

# Use these IPv6 DNS Servers for lookups/ Google and OpenDNS
server=2620:0:ccd::2
server=2001:4860:4860::8888
server=2001:4860:4860::8844

# Set IPv4 DNS server for client machines # option:6
dhcp-option=option:dns-server,192.168.30.1,176.103.130.130

# Set IPv6 DNS server for clients
dhcp-option=option6:dns-server,[2a00:5a60::ad2:0ff],[2a00:5a60::ad1:0ff]

# How many DNS queries should we cache? By defaults this is 150
# Can go up to 10k.
cache-size=10000

neg-ttl=80000
local-ttl=3600

# TTL
dhcp-option=23,64

# value as a four-byte integer - that's what microsoft wants. See
dhcp-option=vendor:MSFT,2,1i

dhcp-option=44,192.168.30.1 # set netbios-over-TCP/IP nameserver(s) aka WINS server(s)
dhcp-option=45,192.168.30.1 # netbios datagram distribution server
dhcp-option=46,8         # netbios node type
dhcp-option=47

read-ethers

log-facility=/var/log/dnsmasq.log
log-async=5

log-dhcp
quiet-dhcp6

# Gateway
dhcp-option=3,192.168.30.1
```

## NATの設定
サーバーのNICとVPN内の通信を結ぶためにNATでルーティングを設定する必要があるみたいです。
（勉強不足で何故するのかがあまりわかっていません。）
`vim /etc/sysctl.conf`で設定ファイルを開き、以下の内容を入力してください。
この時、ファイルの中身が既にある場合は、バックアップをとるか、上書きをしてください。
```sh
net.core.somaxconn=4096
net.ipv4.ip_forward=1
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 1 
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.send_redirects = 1
net.ipv4.conf.default.proxy_arp = 0

net.ipv6.conf.all.forwarding=1
net.ipv6.conf.default.forwarding = 1
net.ipv6.conf.tap_softether.accept_ra=2
net.ipv6.conf.all.accept_ra = 1
net.ipv6.conf.all.accept_source_route=1
net.ipv6.conf.all.accept_redirects = 1
net.ipv6.conf.all.proxy_ndp = 1
```

設定が出来たら、今行った設定を反映させます。
```sh
sudo sysctl -f
```

ここまで出来たら、一度システムの再起動させます。
（何故するのかは分からない）
```sh
systemctl daemon-reload
```

## ファイヤーウォールの設定
現状では、VPNで使うポートがファイアウォールで開いていないため、解放させます。
```sh
sudo -s
ufw enable
ufw allow 22/tcp
ufw allow 443/tcp
ufw allow 80/tcp
ufw allow 67/udp
exit
```

ここまで出来たら、サーバーを再起動させてください。
```sh
reboot
```
ここで解放したポートは、conohaのサーバーの管理者画面にある「ネットワーク情報>セキュリティグループ」でも設定する必要があります。
設定は、[セキュリティグループ機能を使う](https://support.conoha.jp/v/v3-security-securitygroup/)を参照して行ってください。

## VPNとDNSの起動
VPNとDNSの起動を行います。
それぞれステータスが`active`となっていれば設定に不備はありません。
`field`がある場合は設定に不備があるので、頑張って修正してください。
```sh
#VPN
systemctl enable vpnserver
systemctl enable dnsmasq
systemctl start vpnserver
systemctl status vpnserver

#DNS
systemctl start dnsmasq
systemctl status dnsmasq
systemctl restart dnsmasq
```

# VPNを接続するために必要な設定（デバイス側）
## クライアント用のソフトのインストール
softetherのクライアント用のソフトをダウンロードします。
以下のリンクから、ソフトをダウンンロードしたら、インストールをしてください。

https://www.softether-download.com/ja.aspx

## VPNに接続するための設定
インストールしたクライアント用のソフトを開いたら、「新しい接続設定の作成」をクリックし、VPNの情報を入力します。
![](/images/articles/memorandum-conoha_softehervpn/a.png)

VPN共通の設定は、下の写真のように設定します。
VPNによって変わる設定は以下の項目です。
- ホスト名（必須）
  - VPSのIPアドレス or ドメインを入力
- 仮想ハブ（必須）
  - 作成した仮想ハブ名を入力
- ユーザー認証（必須）
  - VPNの仮想HUBで設定したアカウント名とパスワードを入力
- プロキシ（プロキシ環境下で使用する場合は必須）

![](/images/articles/memorandum-conoha_softehervpn/b.png)

## VPNへ接続
VPNに接続するための設定が出来たら、今設定した接続設定をクリックして、VPNへの接続をしましょう。
何も問題なければ、以下のような画面が出ます。（デバイスにふられているIPアドレスの変化でも確認できる）
エラー画面が出たり、使用してるIPアドレスが変化しない場合は、どこかしらに問題があるので、頑張って修正してください。
![](/images/articles/memorandum-conoha_softehervpn/c.png)

# おまけ：ダイナミックDNSの設定
現状は、クライアント用のソフトのホスト名の設定にIPアドレスを使用している場合、proxy環境下では弾かれる可能性があります。
そのため、proxy環境下では追加でダイナミックDNSを設定しましょう。
これを設定することで、IPアドレスにドメインを紐づけることができ、proxy環境下でもVPNが使える可能性が生まれます。

ダイナミックDNSを設定できるサービスは、以下のようなものがあります。
私は、MyDNSを使っています。（時間があれば使い方を記事にまとめるかも）
- MyDNS
- No-IP
- さくらインターネットのネームサーバー
- お名前.comのネームサーバー

# おわりに
ConoHa VPSを使用したSoftEther VPNの環境を作成し、VPNの構築方法を纏めました。


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