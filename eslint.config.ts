import antfu from '@antfu/eslint-config'

export default antfu({

  vue: true,
  typescript: true,
  formatters: true,

  rules: {
    'node/prefer-global/process': 'off',
    'node/prefer-global/buffer': 'off',
  },

  ignores: ['bun.lock', 'dist', 'node_modules'],
})
