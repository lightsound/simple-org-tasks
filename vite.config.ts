import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // .env / .env.local をサーバー側 process.env に読み込む（Turso 接続・Clerk シークレット用）。
  // クライアントには VITE_ プレフィックスのみ import.meta.env 経由で露出する。
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart(),
      nitro(),
      viteReact(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
  }
})
