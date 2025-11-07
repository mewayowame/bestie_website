// PostCSSの設定
// Tailwind CSSとAutoprefixerプラグインを使用
export default {
  plugins: {
    tailwindcss: {},      // Tailwind CSSを適用
    autoprefixer: {},     // ベンダープレフィックスを自動追加（ブラウザ互換性向上）
  },
}
