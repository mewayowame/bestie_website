# BESTIE Website - バージョン 4.2

株式会社ベスティの公式ウェブサイト（CONTACT ポップアップ実装版）

## 🎉 このバージョンの新機能

### ✨ バージョン 4.2 の追加機能

**背景 SVG レイヤー実装** ⭐NEW⭐

- 3 層の背景 SVG を重ね合わせて表示（グラデーション版）
- **最下層**: SVGcode_bgBtm.svg（#42433b → グレー → 白のグラデーション）
- **中間層**: SVGcode_bgTop.svg（グレー → 白のグラデーション）
- **最上層**: bg_sankaku.svg（ピンクベージュの三角形、x: 377.0656px、y: 450.8963px 配置）
- 固定配置（`position: fixed`）でスクロールに対応
- アニメーション対応準備完了（現在はアニメーションなし）

**CONTACT ポップアップ完全実装**

- ナビゲーションの「CONTACT」ボタンをクリックでポップアップ表示
- **入力フィールド**: 氏名、メールアドレス、件名、本文
- **メールクライアント起動**: `mailto:`リンクで自動的にメールソフトを開く
- **デザイン**: PROFILE ポップアップと同じスタイル（#42433c 背景、白文字）
- **バツボタンで閉じる**: メール作成中の誤操作を防止

### ✅ 継承機能（v4.1 から）

1. **PROFILE ポップアップ** - 代表プロフィールを表示（バツボタンで閉じる）
2. **スクロール改善** - デバウンス 800ms（勢いよくスクロールしてもガタつかない）
3. **Company セクション透明化** - 白い背景を削除
4. **赤い PROFILE ボタン** - #fc4242 の赤い円、白文字
5. **SVG ロゴ統合** - サービスセクションの円の中に 3 つの SVG ロゴを表示

---

## 📂 プロジェクト構成

```
bestie-website-v4.2/
├── public/
│   └── images(静的ファイル)
├── src/
│   ├── App.jsx            # メインReactコンポーネント（CONTACT機能追加）
│   ├── main.jsx           # エントリーポイント
│   └── index.css          # グローバルスタイル（Tailwind CSS）
├── index.html             # HTMLテンプレート
├── package.json           # 依存関係とスクリプト
├── vite.config.js         # Vite設定
├── tailwind.config.js     # Tailwind CSS設定
├── postcss.config.js      # PostCSS設定
└── README.md              # このファイル
```

---

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザが自動的に開き、`http://localhost:3000` でウェブサイトが表示されます。

### 3. 本番ビルド

```bash
npm run build
```

ビルドされたファイルは `dist` フォルダに出力されます。

---

## 🎨 主な機能

### 1. フルページスクロール

- マウスホイールでセクション間をスムーズに移動
- **デバウンス 800ms** - 勢いよくスクロールしてもガタつかない
- 各セクションにアニメーション効果

### 2. サービスセクション

- 3 つのサービスをスクロールで切り替え
- **各サービスに専用の SVG ロゴ表示**
  - 組織づくりコンサルティング → logo_02.svg
  - マネージャ育成支援 → logo_03.svg
  - 経営者の思いと戦略をつなぐ伴走 → logo_04.svg
- プログレスバーで進行状況表示

### 3. PROFILE ポップアップ

- Company セクションの「PROFILE」ボタン（赤い円 #fc4242）をクリック
- 代表者プロフィールをモーダル表示
- **バツボタンで閉じる** - メール作成中の誤操作を防止

### 4. CONTACT ポップアップ ⭐NEW⭐

- ナビゲーションの「CONTACT」ボタンをクリック
- **入力フィールド**:
  - 氏名
  - メールアドレス
  - 件名
  - 本文
- **送信ボタン**: クリックでメールクライアントを自動起動
- **バツボタンで閉じる**: 入力中の誤操作を防止
- デザイン: PROFILE と同じスタイル（#42433c 背景、白文字、左側に縦線）

### 5. レスポンシブデザイン

- モバイル、タブレット、デスクトップに対応

---

## 📝 コードの説明

### App.jsx（更新版）

メインの React コンポーネントファイル。以下の主要機能を実装：

#### 新規追加: CONTACT ポップアップ機能

```jsx
// コンタクトフォームの状態管理
const [showContact, setShowContact] = useState(false);
const [contactForm, setContactForm] = useState({
  name: "",
  email: "",
  subject: "",
  message: "",
});

// メール送信ハンドラー
const handleSendEmail = () => {
  const { name, email, subject, message } = contactForm;

  // mailto:リンクを構築
  const mailtoLink = `mailto:info@bestie.co.jp?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(
    `氏名: ${name}\nメールアドレス: ${email}\n\n${message}`
  )}`;

  // メールクライアントを開く
  window.location.href = mailtoLink;
};
```

#### ポップアップの仕様

```jsx
{
  /* CONTACTポップアップ */
}
{
  showContact && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="relative max-w-2xl w-full mx-4 p-12 rounded-lg"
        style={{ backgroundColor: "#42433c" }}
      >
        {/* バツボタン */}
        <button onClick={() => setShowContact(false)}>×</button>

        {/* フォーム */}
        <input name="name" />
        <input name="email" />
        <input name="subject" />
        <textarea name="message" />

        {/* 送信ボタン */}
        <button onClick={handleSendEmail}>メールクライアントで送信</button>
      </div>
    </div>
  );
}
```

#### PROFILE ポップアップも更新

- バツボタン追加で誤操作防止

---

## 🎯 バージョン履歴

| バージョン | 主な変更点                                               |
| ---------- | -------------------------------------------------------- |
| **v4.2**   | CONTACT ポップアップ実装、バツボタンで閉じる仕様         |
| v4.1       | SVG ロゴ統合、PROFILE ポップアップ、スクロール改善       |
| v4.0       | 基本機能実装（フルページスクロール、サービスセクション） |

---

## 🌟 技術スタック

- **React 18** - UI ライブラリ
- **Vite** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファースト CSS フレームワーク
- **SVG** - カスタムロゴ（3 種類）
- **mailto:** - メールクライアント統合

---

## 🔍 ブラウザ対応

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）

---

## 📞 お問い合わせ

- **会社名**: 株式会社ベスティ
- **代表**: 番場万有美
- **住所**: 〒 104-0061 東京都中央区銀座 6-6-1 銀座風月堂ビル 5F
- **設立**: 2023 年 7 月 6 日

---

## 📜 ライセンス

© 2023 株式会社ベスティ All Rights Reserved.
