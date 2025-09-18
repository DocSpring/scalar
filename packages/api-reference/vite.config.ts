import { URL, fileURLToPath } from 'node:url'
import { autoCSSInject, createViteBuildOptions } from '@scalar/build-tooling'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { version } from './package.json'

const apiReferenceSrc = fileURLToPath(new URL('./src', import.meta.url))
const apiReferenceTest = fileURLToPath(new URL('./test', import.meta.url))
const componentsSrc = fileURLToPath(new URL('../components/src', import.meta.url))
const iconsSrc = fileURLToPath(new URL('../icons/src', import.meta.url))
const apiClientSrc = fileURLToPath(new URL('../api-client/src', import.meta.url))

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.SCALAR_API_REFERENCE_VERSION': `"${version}"`,
  },
  resolve: {
    alias: [
      { find: '@scalar/api-reference', replacement: apiReferenceSrc },
      { find: '@scalar/api-reference-test', replacement: apiReferenceTest },
      // Resolve workspace packages from src for fast dev iteration
      { find: '@scalar/components', replacement: componentsSrc },
      { find: '@scalar/icons', replacement: iconsSrc },
      { find: '@scalar/api-client', replacement: apiClientSrc },
      {
        find: /^@scalar\/api-client\/(.*)$/,
        replacement: `${apiClientSrc}/$1`,
      },
    ],
    dedupe: ['vue'],
  },
  build: createViteBuildOptions({
    entry: ['src/index.ts'],
    options: {
      emptyOutDir: true,
      cssCodeSplit: false,
      rollupOptions: {
        plugins: [autoCSSInject('references')],
      },
    },
  }),
})
