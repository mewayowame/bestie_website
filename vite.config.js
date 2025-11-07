import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Viteの設定
// https://vitejs.dev/config/
export default defineConfig({
  // Reactプラグインを使用
  plugins: [react()],
  
  // 開発サーバーの設定
  server: {
    port: 3000,        // ポート番号を3000に設定
    open: true         // サーバー起動時に自動的にブラウザを開く
  },
  
  // ビルドの設定
  build: {
    outDir: 'dist',    // ビルド出力先ディレクトリ
    sourcemap: true    // ソースマップを生成（デバッグ用）
  }
})
