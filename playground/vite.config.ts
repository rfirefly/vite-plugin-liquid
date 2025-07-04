import { vitePluginLiquid } from '@firefly/vite-plugin-liquid'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    Vue(),
    Inspect(),
    vitePluginLiquid(),
    UnoCSS(),
  ],
})
