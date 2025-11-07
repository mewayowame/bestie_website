/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind CSSを適用するファイルのパス
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // テーマのカスタマイズ
  theme: {
    extend: {
      // カスタムカラーの追加
      colors: {
        'bestie-green': '#00af33',    // BESTIEのメインカラー（緑）
        'bestie-beige': '#eed1c9',    // BESTIEのアクセントカラー（ベージュ）
        'bestie-dark': '#42433c',     // ポップアップ背景色（ダークグレー）
        'bestie-red': '#fc4242',      // プロフィールボタン色（赤）
      },
      // カスタムフォントファミリー
      fontFamily: {
        'mincho': ['"MS Mincho"', '"ＭＳ 明朝"', '"MS PMincho"', '"ＭＳ Ｐ明朝"', 'serif'],
        'serif-jp': ['"Source Han Serif JP"', '"Noto Serif JP"', '"思源宋體"', 'serif'],
        'times': ['"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  
  // プラグイン
  plugins: [],
}
