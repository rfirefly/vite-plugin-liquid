import { colors } from '@unocss/preset-mini/colors'
import { defineConfig, presetAttributify, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
  ],
  theme: {
    colors: {
      primary: colors.blue,
      secondary: colors.orange,
    },
  },
})
