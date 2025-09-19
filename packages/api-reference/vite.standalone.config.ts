import { URL, fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { webpackStats } from 'rollup-plugin-webpack-stats'
import { defineConfig } from 'vite'
import banner from 'vite-plugin-banner'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

import tailwindcss from '@tailwindcss/vite'
import licenseBannerTemplate from './license-banner-template.txt'
import { name, version } from './package.json'

const apiClientDist = fileURLToPath(new URL('../api-client/dist', import.meta.url))
const apiClientSrc = fileURLToPath(new URL('../api-client/src', import.meta.url))

function replaceVariables(template: string, variables: Record<string, string>) {
  return Object.entries(variables).reduce((content, [key, value]) => {
    return content.replace(new RegExp(`\\{\\{ ${key} \\}\\}`, 'g'), value)
  }, template)
}

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.SCALAR_API_REFERENCE_VERSION': `"${version}"`,
  },
  resolve: {
    alias: [
      {
        find: '@scalar/api-reference',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
      {
        find: '@scalar/api-reference-test',
        replacement: fileURLToPath(new URL('./test', import.meta.url)),
      },
      { find: '@scalar/api-client', replacement: apiClientDist },
      {
        find: /^@scalar\/api-client\/components\/(.*)$/,
        replacement: `${apiClientSrc}/components/$1`,
      },
      {
        find: /^@scalar\/api-client\/(.*)$/,
        replacement: `${apiClientDist}/$1`,
      },
    ],
    dedupe: ['vue'],
  },
  plugins: [
    vue(),
    tailwindcss(),
    cssInjectedByJsPlugin(),
    webpackStats(),
    banner({
      outDir: 'dist/browser',
      content: replaceVariables(licenseBannerTemplate, {
        packageName: name,
        version: version,
      }),
    }),
  ],
  build: {
    emptyOutDir: false,
    outDir: 'dist/browser',
    commonjsOptions: {
      include: [/node_modules/],
    },
    cssCodeSplit: false,
    minify: 'terser',
    // With the default terserOptions, highlight.js breaks the build.
    // * They're using terser, too.
    // * Copying their options fixes the build.
    // * `max_line_len: 80` is the one setting that makes the difference.
    //
    // Source: https://github.com/highlightjs/highlight.js/blob/b9ae5fea90514b864f2c9b2889d7d3302d6156dc/tools/build_config.js#L58-L73
    terserOptions: {
      format: {
        max_line_len: 80,
      },
    },
    lib: {
      entry: ['src/standalone.ts'],
      name: '@scalar/api-reference',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
})
