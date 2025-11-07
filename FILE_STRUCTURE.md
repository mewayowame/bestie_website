# 📐 BESTIEウェブサイト ファイル構造図

## 🗂️ プロジェクト全体像

```
bestie-website-v4.2/
│
├── 📄 index.html                    # HTMLテンプレート（エントリーポイント）
│                                     └─→ <div id="root"></div> にReactをマウント
│
├── 📁 src/                          # ソースコードフォルダ
│   │
│   ├── 📄 main.jsx                  # Reactエントリーポイント
│   │                                 └─→ App.jsxをimportしてrootにマウント
│   │
│   ├── 📄 App.jsx ⭐                # メインコンポーネント（ここが最重要！）
│   │                                 ├─→ Heroセクション
│   │                                 ├─→ Aboutセクション
│   │                                 ├─→ Serviceセクション
│   │                                 ├─→ Companyセクション
│   │                                 ├─→ PROFILEポップアップ
│   │                                 └─→ CONTACTポップアップ ⭐NEW⭐
│   │
│   └── 📄 index.css                 # グローバルCSS
│                                     └─→ Tailwind CSSのインポート
│
├── 📁 設定ファイル群
│   ├── 📄 package.json              # プロジェクト情報・依存関係
│   ├── 📄 vite.config.js            # Vite（ビルドツール）設定
│   ├── 📄 tailwind.config.js        # Tailwind CSS設定
│   └── 📄 postcss.config.js         # PostCSS設定
│
├── 📁 ドキュメント
│   ├── 📄 README.md                 # プロジェクト説明書
│   ├── 📄 SETUP_GUIDE.md            # セットアップガイド
│   └── 📄 PROJECT_COMPLETE.md       # 完成レポート
│
└── 📄 .gitignore                    # Git管理除外ファイル
```

---

## 🔍 各ファイルの詳細

### 🎯 最も重要なファイル：`src/App.jsx`

このファイルがウェブサイトの全コンテンツを管理しています。

```
App.jsx の構造
│
├── 📦 Import（ライブラリ読み込み）
│   └── React, useState, useEffect, useRef
│
├── 🎛️ State（状態管理）
│   ├── showProfile（PROFILEポップアップ表示/非表示）
│   ├── showContact（CONTACTポップアップ表示/非表示）⭐NEW⭐
│   ├── contactForm（フォームデータ）⭐NEW⭐
│   └── その他のアニメーション状態
│
├── 🔧 Functions（関数）
│   ├── handleContactChange（フォーム入力処理）⭐NEW⭐
│   ├── handleSendEmail（メール送信）⭐NEW⭐
│   ├── scrollToSection（セクションへスクロール）
│   └── その他のイベントハンドラー
│
└── 🎨 JSX（UIレンダリング）
    ├── Navigation（ナビゲーションバー）
    ├── Hero Section（ヒーローセクション）
    ├── About Section（アバウトセクション）
    ├── Service Section（サービスセクション）
    ├── Company Section（会社情報セクション）
    ├── PROFILE Popup（プロフィールポップアップ）
    ├── CONTACT Popup（コンタクトポップアップ）⭐NEW⭐
    └── Footer（フッター）
```

---

## 🎨 CONTACTポップアップの構造

```
CONTACT Popup（CONTACTポップアップ）
│
├── 📦 Container（外側の暗い背景）
│   └── onClick → ポップアップを閉じない（バツボタンのみ）
│
└── 📦 Modal（ポップアップ本体）
    │
    ├── 🔘 Close Button（バツボタン）
    │   └── onClick → setShowContact(false)
    │
    ├── 📝 Form Fields（入力フィールド）
    │   ├── 氏名（name）
    │   ├── メールアドレス（email）
    │   ├── 件名（subject）
    │   └── 本文（message）
    │
    └── 🟢 Submit Button（送信ボタン）
        └── onClick → handleSendEmail()
            └── mailto:リンクでメールクライアント起動
```

---

## 🔄 データフローと処理の流れ

### 1. ユーザーがCONTACTボタンをクリック
```
User Click
    ↓
Navigation CONTACT button
    ↓
onClick={() => setShowContact(true)}
    ↓
showContact = true
    ↓
CONTACT Popup 表示
```

### 2. フォームに入力
```
User Input
    ↓
<input name="name" onChange={handleContactChange} />
    ↓
handleContactChange(e)
    ↓
setContactForm({ ...contactForm, [e.target.name]: e.target.value })
    ↓
contactFormの状態が更新
```

### 3. 送信ボタンをクリック
```
User Click
    ↓
Submit Button
    ↓
onClick={handleSendEmail}
    ↓
mailto:リンク生成
    ↓
window.location.href = mailtoLink
    ↓
メールクライアント起動
```

### 4. ポップアップを閉じる
```
User Click
    ↓
Close Button (×)
    ↓
onClick={() => setShowContact(false)}
    ↓
showContact = false
    ↓
CONTACT Popup 非表示
```

---

## 🎛️ 設定ファイルの役割

### `package.json`
```json
{
  "scripts": {
    "dev": "vite",           // 開発サーバー起動
    "build": "vite build",   // 本番ビルド
    "preview": "vite preview" // ビルドプレビュー
  },
  "dependencies": {
    "react": "^18.2.0",      // Reactライブラリ
    "react-dom": "^18.2.0"   // React DOM
  }
}
```

### `vite.config.js`
```javascript
{
  plugins: [react()],        // Reactプラグイン
  server: {
    port: 3000,              // ポート番号
    open: true               // 自動ブラウザ起動
  }
}
```

### `tailwind.config.js`
```javascript
{
  content: ["./src/**/*.{js,jsx}"],  // Tailwind対象ファイル
  theme: {
    extend: {
      colors: {
        'bestie-green': '#00af33',   // カスタムカラー
        'bestie-dark': '#42433c'     // ポップアップ背景色
      }
    }
  }
}
```

---

## 🚀 ビルドプロセス

### 開発環境
```
npm run dev
    ↓
Vite起動
    ↓
ファイル監視開始
    ↓
http://localhost:3000 でサーバー起動
    ↓
ブラウザ自動起動
    ↓
ホットリロード有効化
```

### 本番ビルド
```
npm run build
    ↓
Viteビルド開始
    ↓
React → JavaScript変換
    ↓
Tailwind CSS → CSS生成
    ↓
ファイル最適化・圧縮
    ↓
dist/フォルダに出力
    ↓
Webサーバーにアップロード可能
```

---

## 📊 依存関係グラフ

```
index.html
    │
    └─→ src/main.jsx
            │
            ├─→ src/App.jsx
            │       │
            │       ├─→ React Hooks
            │       │   ├─→ useState
            │       │   ├─→ useEffect
            │       │   └─→ useRef
            │       │
            │       └─→ Components
            │           ├─→ Navigation
            │           ├─→ Hero Section
            │           ├─→ About Section
            │           ├─→ Service Section
            │           ├─→ Company Section
            │           ├─→ PROFILE Popup
            │           ├─→ CONTACT Popup ⭐NEW⭐
            │           └─→ Footer
            │
            └─→ src/index.css
                    │
                    └─→ Tailwind CSS
                            │
                            └─→ tailwind.config.js
```

---

## 🔐 セキュリティとベストプラクティス

### フォーム入力のサニタイズ
```javascript
// encodeURIComponentで特殊文字をエスケープ
const mailtoLink = `mailto:...?subject=${encodeURIComponent(subject)}`
```

### XSS対策
- Reactが自動的にHTMLエスケープを実行
- `dangerouslySetInnerHTML`は使用していない

### CSRF対策
- 現在はmailto:リンクのみなので不要
- バックエンドAPI実装時には対策必須

---

## 🎓 カスタマイズポイント

### 簡単（初心者向け）
1. **テキスト変更**: `App.jsx`内の文字列を検索・置換
2. **色変更**: `tailwind.config.js`のcolorsセクション
3. **メールアドレス変更**: `App.jsx`の`handleSendEmail`関数

### 中級
1. **入力フィールド追加**: contactFormにプロパティ追加
2. **バリデーション実装**: 送信前のチェック処理追加
3. **アニメーション追加**: CSS transitions/animations

### 上級
1. **バックエンドAPI統合**: Express + SendGrid実装
2. **データベース連携**: お問い合わせ履歴の保存
3. **管理画面追加**: お問い合わせ管理システム

---

**このファイル構造図を参考に、効率的な開発を進めてください！** 🚀
