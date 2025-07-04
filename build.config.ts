import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: 'node16',
  clean: true,
  hooks: {
    'rollup:dts:options': (_, options) => {
      // @ts-expect-error - remove commonjs plugin
      options.plugins = options.plugins.filter(i => i?.name !== 'commonjs')
    },
  },
})
