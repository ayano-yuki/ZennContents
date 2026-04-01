# WSLのセットアップ

- Created at: 2025-12-29
- Closed: false
- Archived: false

---

## WSLの初期化
1. 登録されているディストリビューションを確認
```
wsl -l -v
```

2. 初期化したいディストリビューションを削除
```
wsl --unregister Ubuntu
```

3. インストールできるディストリビューションを確認
```
wsl --list --online
```

4. Linux ディストリビューションをインストール
```
wsl --install -d Ubuntu
```

---

## WSLの有効化
1. Windows の機能の有効化
```
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

2. wslのインストール
```
wsl --set-default-version 2
wsl --install -d Ubuntu
```
<!-- https://qiita.com/ryome/items/240f36923f5cb989da27 -->

